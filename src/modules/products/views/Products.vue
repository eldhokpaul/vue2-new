<template>
  <v-container
    class="page-container"
    fluid
    style="height: 100%; display: flex; flex-direction: column"
  >
    <page-header :title="$t('routes.products')">
      <template
        #buttons
      >
        <bulk-upload-dialog
          class="d-none d-sm-flex"
          @on-success="initialLoad()"
        />
        <v-btn
          v-if="!!products && !isViewer"
          v-t="'pages.products.addAProduct'"
          color="primary"
          depressed
          exact
          :to="{
            name: 'addProduct',
          }"
          class="mr-3"
        />
      </template>
      <template #search>
        <v-card
          width="250px"
          elevation="0"
          class="ms-3 mr-1 d-none d-sm-flex"
        >
          <v-text-field
            label="Search"
            outlined
            dense
            hide-details
            prepend-inner-icon="mdi-magnify"
            clearable
            @input="searchCatalog"
          />
        </v-card>
      </template>
      <template #controls>
        <app-table-controls
          class="d-none d-sm-flex"
          :selected-items="formattedProducts"
          :export-file-name="`products-export-${new Date().toLocaleDateString()}.csv`"
          :export-worksheet-name="`Products Export ${new Date().toLocaleDateString()}`"
          :headers="allHeaders"
          :show-graph="true"
          :is-chart-enabled="isChartEnabled"
          :show-filter="true"
          :show-columns="true"
          :view-saved-filter="viewSavedFilter"
          :view-saved-column="viewSavedColumn"
          @click:graph="createChart"
          @update:filter="openToolPanel"
          @update:column="openToolPanel"
          @clear:column-state="removeColState"
          @save:column-state="saveColumnState"
          @clear:filter-state="removeFilterState"
          @save:filter-state="saveFilterState"
        />
      </template>
    </page-header>
    <products-table
      v-model="selectedProducts"
      :columns="headers"
      :pagination="rowPerPage"
      @range-selection-changed="chartsSelected"
      @grid-ready="initialFunction"
      @rowClicked="
        ({ data: { sku } }) => {
          $router.push({
            name: 'productDetails',
            params: { sku, goBack: 'products' },
          });
        }
      "
    />
  </v-container>
</template>

<script lang="ts">
import { CellRange, ColumnVO, CreateRangeChartParams, GridReadyEvent, IServerSideGetRowsParams, ValueFormatterParams } from 'ag-grid-community'
import get from 'lodash.get'
import chain from 'lodash/chain'
import find from 'lodash/find'
import isEmpty from 'lodash/isEmpty'
import set from 'lodash/set'
import sumBy from 'lodash/sumBy'
import { Bind, Debounce } from 'lodash-decorators'
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'

import type { Pageable } from '@/client/products'
// import { Task } from '@/decorators/task'
import type { AccountSettingsDto } from '@/client/users'
import AppTableControls from '@/components/AppTableControls.vue'
import PageHeader from '@/components/PageHeader.vue'
import ProductsTable from '@/components/VueDataGrid.vue'
import type { IUser } from '@/modules/user/types'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

import BulkUploadDialog from '../components/BulkUploadDialog.vue'
import type { IProduct, IProducts } from '../types'

const namespaces = {
  products: 'products',
  user: 'user',
  integrations: 'integrations',
  accountSettings: 'accountSettings',
  grid: 'grid'
}
const dateFilterParams = {
  filterOptions: ['lessThanOrEqual', 'greaterThanOrEqual'],
  debounceMs: 200,
  suppressAndOrCondition: true
}
const dashDefault = (params: any) => {
  if (!params.value) return '-'
  return params.value
}
const textFilterParams = {
  filterOptions: ['contains', 'notEqual', {
    displayKey: 'in',
    displayName: 'IN',
    predicate: () => {
      return true
    }
  }],
  debounceMs: 200,
  suppressAndOrCondition: true
}
@Component({
  components: {
    AppTableControls,
    ProductsTable,
    PageHeader,
    BulkUploadDialog
  }
})
export default class Products extends Vue {
  @Getter('isViewer', { namespace: namespaces.user }) isViewer!: boolean
  @State('productState', { namespace: namespaces.grid }) productState?: any;

  @Action('getProducts', { namespace: namespaces.products })
  getProducts!: (opts: Pageable&{ sort: Array<any>, search: string }) => Promise<void>;

  @State('products', { namespace: namespaces.products }) products?: IProducts;
  @State('user', { namespace: namespaces.user }) user!: IUser;

  @Action('getBulkUploadTemplate', { namespace: namespaces.products })
  getBulkUploadTemplate!: (userId: number) => Promise<any>;

  @Action('getAmazonIntegrationDetails', { namespace: namespaces.integrations })
  getAmazonIntegrationDetails!: () => Promise<void>;

  @State('userAmazonIntegrationDetails', { namespace: namespaces.integrations })
  userAmazonIntegrationDetails!: any;

  @State('accountSettings', { namespace: namespaces.accountSettings })
  accountSettings!: AccountSettingsDto;

  @Action('getProductState', { namespace: namespaces.grid })
  getProductState!: (productState: any) => void;

  headers = [...this.allHeaders];
  selectedProducts: IProduct[] = [];
  initialProducts: IProducts | null = null;
  agApi!: GridReadyEvent;
  cellRanges: CellRange[] = [];
  rowPerPage=15
  search = '';

  @Debounce(200)
  @Bind()
  searchCatalog (value: string) {
    if (this.search !== value) {
      this.search = value
      this.agApi.api.setServerSideDatasource(this.dataSource)
    }
  }

  async initialFunction (param: GridReadyEvent) {
    this.agApi = param
    await this.getAmazonIntegrationDetails()
    await this.initialLoad()
  }

  saveColumnState () {
    const columnState = this.agApi.columnApi.getColumnState()
    this.getProductState({ colState: columnState, rowPerPage: this.agApi.api.paginationGetPageSize() })
  }

  saveFilterState () {
    const filterState = this.agApi.api.getFilterModel()
    this.getProductState({ filterModel: filterState })
  }

  removeFilterState () {
    this.agApi.api.setFilterModel({})
    this.getProductState({ filterModel: {} })
  }

  async removeColState () {
    this.agApi.columnApi.resetColumnState()
    this.getProductState({ colState: [], rowPerPage: null })
    await this.initialLoad()
  }

  get viewSavedColumn () {
    return isEmpty(this.productState.colState)
  }

  get viewSavedFilter () {
    return isEmpty(this.productState.filterModel)
  }

  openToolPanel (key: string) {
    if (key === this.agApi.api.getOpenedToolPanel()) {
      this.agApi.api.closeToolPanel()
      return false
    }
    this.agApi.api.openToolPanel(key)
  }

  async restoreView () {
    this.agApi.columnApi.applyColumnState({
      state: this.productState.colState,
      applyOrder: true
    })
    this.agApi.api.setFilterModel(this.productState.filterModel)
  }

  async paginationFun (val: number) {
    this.rowPerPage = val
    this.agApi.api.setCacheBlockSize(val)
    this.agApi.api.paginationSetPageSize(val)
    //  this.restoreView()
  }

  // @Task('initialLoadTask')
  async initialLoad () {
    this.initialProducts = this.products as IProducts

    if (this.productState.rowPerPage) {
      this.paginationFun(this.productState.rowPerPage)
    } else {
      this.paginationFun(15)
    }
    this.agApi.api.setServerSideDatasource(this.dataSource)
    this.restoreView()
  }

  get allHeaders () {
    return [
      {
        headerName: '',
        field: '',
        headerTooltip: 'Hold the shift key to select all the rows between two check-boxes',
        // headerComponent: 'SelectAllCheckbox',
        // headerComponentParams: { headerName: 'Export' },
        headerCheckboxSelection: true,
        resizable: false,
        maxWidth: 60,
        minWidth: 95,
        suppressColumnsToolPanel: true,
        suppressMovable: true,
        checkboxSelection: true,
        chartDataType: 'excluded',
        filter: false,
        sortable: false
      },
      {
        headerName: this.$t('components.productsTable.headers.name'),
        field: 'name',
        valueFormatter: dashDefault,
        sortable: true,
        enableRowGroup: true,
        filter: 'agTextColumnFilter',
        filterParams: textFilterParams,
        tooltipField: 'name'
        // cellRenderer: 'TooltipRender'
      },
      {
        headerName: this.$t('components.productsTable.headers.sku'),
        field: 'sku',
        valueFormatter: dashDefault,
        enableRowGroup: true,
        filter: 'agTextColumnFilter',
        filterParams: textFilterParams,
        sortable: true
      },
      {
        headerName: this.$t('components.productsTable.headers.tags'),
        field: 'tag',
        enableRowGroup: true,
        valueFormatter: dashDefault,
        filter: 'agTextColumnFilter',
        filterParams: textFilterParams,
        sortable: true
      },
      {
        headerName: this.$t('components.productsTable.headers.status'),
        field: 'status',
        // filter: 'agSetColumnFilter',
        // filterParams: {
        //   values: ['ACTIVE', 'INACTIVE']
        // },
        suppressFiltersToolPanel: true,
        enableRowGroup: true,
        filter: 'FilterModel',
        floatingFilterComponentParams: {
          suppressFilterButton: true
        },
        minWidth: 130,
        cellRenderer: 'StatusRender',
        cellRendererParams: {
          type: 'product'
        },
        valueFormatter: dashDefault,
        sortable: true
      },
      {
        headerName: this.$t('components.productsTable.headers.onOrder'),
        field: 'numberOfGoodsOnOrder',
        filter: 'agTextColumnFilter',
        valueFormatter: (params:ValueFormatterParams) => (params.value ? params.value.toLocaleString() : '-'),
        filterParams: textFilterParams
      },
      {
        headerName: this.$t('components.productsTable.headers.inTransit'),
        field: 'numberOfGoodsInTransit',
        valueFormatter: (params:ValueFormatterParams) => (params.value ? params.value.toLocaleString() : '-'),
        filter: 'agTextColumnFilter',
        filterParams: textFilterParams
      },
      {
        headerName: this.$t('components.productsTable.headers.onOrderAndInTransit'),
        field: 'totalValueOfGoodsOnOrderAndInTransit',
        valueFormatter: this.currencyFormatter,
        filter: 'agTextColumnFilter',
        filterParams: textFilterParams
      },
      {
        headerName: this.$t('components.productsTable.headers.costEntryCount'),
        field: 'costEntryCount',
        valueFormatter: dashDefault,
        filter: 'agTextColumnFilter',
        filterParams: textFilterParams,
        aggFunc: 'sum',
        enableValue: true,
        sortable: false
      },
      {
        headerName: this.$t(
          'components.productsTable.headers.totalUnitsOrdered'
        ),
        field: 'totalUnitsOrdered',
        valueFormatter: dashDefault,
        filter: 'agTextColumnFilter',
        filterParams: textFilterParams,
        sortable: false
      },
      {
        headerName: this.$t(
          'components.productsTable.headers.totalFactoryCosts'
        ),
        field: 'totalFactoryCosts',
        sortable: false,
        filter: 'agTextColumnFilter',
        filterParams: textFilterParams,
        valueFormatter: this.currencyFormatter
      },
      {
        headerName: this.$t(
          'components.productsTable.headers.totalInboundCosts'
        ),
        field: 'totalInboundCosts',
        sortable: false,
        filter: 'agTextColumnFilter',
        filterParams: textFilterParams,
        valueFormatter: this.currencyFormatter
      },
      {
        headerName: this.$t(
          'components.productsTable.headers.totalLandedCosts'
        ),
        field: 'totalLandedCosts',
        sortable: false,
        filter: 'agTextColumnFilter',
        filterParams: textFilterParams,
        valueFormatter: this.currencyFormatter
      },
      {
        headerName: this.$t(
          'components.productsTable.headers.totalFactoryUnitCosts'
        ),
        field: 'totalFactoryUnitCosts',
        sortable: false,
        filter: 'agTextColumnFilter',
        filterParams: textFilterParams,
        valueFormatter: this.currencyFormatter
      },
      {
        headerName: this.$t(
          'components.productsTable.headers.totalInboundUnitCosts'
        ),
        field: 'totalInboundUnitCosts',
        sortable: false,
        filter: 'agTextColumnFilter',
        filterParams: textFilterParams,
        valueFormatter: this.currencyFormatter
      },
      {
        headerName: this.$t(
          'components.productsTable.headers.totalLandedUnitCosts'
        ),
        field: 'totalLandedUnitCosts',
        sortable: false,
        filter: 'agTextColumnFilter',
        filterParams: textFilterParams,
        valueFormatter: this.currencyFormatter
      },
      {
        headerName: this.$t(
          'components.productsTable.headers.lastCostUpdateDate'
        ),
        field: 'unixLastCostUpdateDate',
        sortable: false,
        enableRowGroup: true,
        filter: 'agDateColumnFilter',
        filterParams: dateFilterParams,
        valueFormatter: this.dateFormatter
      }
    ]
  }

  // Filter and grouping functions for ag-grid locally Start
  async loadFilterAndGrouping (params: IServerSideGetRowsParams, loadedData: Array<any>, filterModel: any, rowGroupCols: ColumnVO[], groupKeys: string[], valueCols: ColumnVO[]): Promise<void> {
    const filteredList = await this.localFilter(loadedData, filterModel)
    const filteredListGroup = await this.localGroup(filteredList, rowGroupCols, valueCols)
    const filteredListGroupExpand = await this.localGroupExpand(filteredListGroup, groupKeys, rowGroupCols)
    if (filteredListGroupExpand.length) {
      params.success({
        rowData: filteredListGroupExpand,
        rowCount: filteredListGroupExpand.length
      })
      params.api.hideOverlay()
      params.columnApi.autoSizeAllColumns()
    } else {
      params.api.showNoRowsOverlay()
      params.success({
        rowData: [],
        rowCount: 0
      })
    }
  }

  async localFilter (filteredList: Array<any>, filterModel: any): Promise<any[] | []> {
    try {
      for (const item in filterModel) {
        let value = ''
        if (filterModel[item].filterType === 'date') {
          switch (filterModel[item].type) {
            case 'lessThanOrEqual':
              filteredList = filteredList.filter((cellValue: any) =>
                new Date(formatDate(get(cellValue, item))) <= new Date(filterModel[item].dateFrom)
              )
              break
            case 'greaterThanOrEqual':
              filteredList = filteredList.filter((cellValue: any) =>
                new Date(formatDate(get(cellValue, item))) >= new Date(filterModel[item].dateFrom)
              )
              break
          }
        } else {
          value = filterModel[item].filter.toString().toLowerCase()
          filteredList = filteredList.filter((cellValue: any) =>
            get(cellValue, item)
              ? get(cellValue, item)
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
              : ''
          )
        }
      }
      return filteredList
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async localGroup (filteredList: Array<any>, rowGroupCols: ColumnVO[], valueCols: ColumnVO[]): Promise<Array<any> | []> {
    try {
      if (rowGroupCols.length) {
        rowGroupCols.forEach(async (element: { id: any }) => {
          filteredList = chain(filteredList)
            .groupBy(element.id)
            .map((value, key) => ({ field: key, items: value }))
            .value()
        })
        rowGroupCols.forEach(async (element: { id: any }) => {
          const field = element.id.split('.')
          filteredList.forEach((newField) => {
            set(newField, field, newField.field)
          })
        })
        if (valueCols.length) {
          filteredList.forEach((data) => {
            valueCols.forEach((item) => {
              data[item.id] = sumBy(data.items, item.id)
            })
          })
        }
      }
      return filteredList
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async localGroupExpand (
    filteredList: Array<any>, groupKeys: string[], rowGroupCols: ColumnVO[]): Promise<Array<any> | []> {
    try {
      if (groupKeys.length) {
        for (const element of groupKeys) {
          for (const ele of rowGroupCols) {
            filteredList = find(filteredList, [ele.id, element])
            filteredList = get(filteredList, 'items') || []
          }
        }
      }
      return filteredList
    } catch (error) {
      console.log(error)
      return []
    }
  }
  // Filter and grouping functions for ag-grid locally endp

  get dataSource () {
    return {
      getRows: async (params: IServerSideGetRowsParams) => {
        const pageSize = params.api.paginationGetPageSize()
        const page = params.api.paginationGetCurrentPage()
        const sort = params.request.sortModel || []
        const localSearch = params.request.filterModel || []
        const rowGroupCols = params.request.rowGroupCols || []
        const groupKeys = params.request.groupKeys || []
        const valueCols = params.request.valueCols || []
        // this.getProductState({ sortModel: sort, filterModel: search })
        try {
          if (this.products?.content) {
            if (Object.keys(localSearch).length || rowGroupCols.length) {
              await this.loadFilterAndGrouping(params, this.products.content, localSearch, rowGroupCols, groupKeys, valueCols)
              return false
            }
          }
          params.api.showLoadingOverlay()
          await this.getProducts({
            pageSize: pageSize,
            pageNumber: page + 1,
            sort: sort,
            search: this.search
          })
          if (this.products?.content.length) {
            if (Object.keys(localSearch).length || rowGroupCols.length) {
              await this.loadFilterAndGrouping(params, this.products.content, localSearch, rowGroupCols, groupKeys, valueCols)
              return false
            }
            params.success({
              rowData: this.products?.content,
              rowCount: this.products?.totalElements
            })
            params.api.hideOverlay()
            params.columnApi.autoSizeAllColumns()
          } else {
            params.api.showNoRowsOverlay()
            params.success({
              rowData: [],
              rowCount: 0
            })
          }
        } catch (e) {
          params.fail()
        }
      }
    }
  }

  get formattedProducts () {
    return this.selectedProducts.map((product: IProduct) => {
      return this.allHeaders.reduce((prev: Record<string, any>, cur: any) => {
        if (cur.field === 'isBundle') {
          prev[cur.headerName.toString()] = product.isBundle
            ? this.$t('pages.products.yes').toString()
            : this.$t('pages.products.no').toString()
        } else if (cur.field !== '') {
          prev[cur.headerName.toString()] = `${
            get(product, cur.field) ? get(product, cur.field).toString() : ''
          }`
        }
        return prev
      }, {})
    })
  }

  get isChartEnabled () {
    return !!this.cellRanges.length
  }

  chartsSelected (agApi: GridReadyEvent) {
    const cellRange: CellRange[] = agApi.api.getCellRanges() || []
    this.cellRanges = cellRange
  }

  createChart () {
    const range: CellRange[] = this.cellRanges
    range.forEach((element: CellRange) => {
      const params: CreateRangeChartParams = {
        cellRange: {
          rowStartIndex: element?.startRow?.rowIndex,
          rowEndIndex: element?.endRow?.rowIndex,
          columns: element.columns
        },
        chartType: 'groupedColumn'
      }
      this.agApi.api.createRangeChart(params)
    })
  }

  currencyValue (params: any) {
    if (this.accountSettings || params.value) {
      return this.accountSettings?.currency?.currencyName || params.value
    } else {
      return '-'
    }
  }

  currencyFormatter (params: any) {
    if (this.accountSettings && params.value) {
      return formatCurrency(this.accountSettings?.currency?.currencySymbol || '$', params.value)
    } else {
      return '-'
    }
  }

  dateFormatter (params: any) {
    if (params.value) {
      return formatDate(Number(params.value))
    } else {
      return '-'
    }
  }
}
</script>
