<template>
  <v-container
    class="page-container"
    fluid
    style="height: 100%; display: flex; flex-direction: column"
  >
    <page-header :title="$t('pages.invoices.title')">
      <template #search>
        <v-card
          width="250px"
          elevation="0"
          class="ms-3 mr-1"
        >
          <v-text-field
            label="Search"
            outlined
            dense
            hide-details
            prepend-inner-icon="mdi-magnify"
            clearable
            @input="searchInvoices"
          />
        </v-card>
      </template>
      <template #controls>
        <app-table-controls
          class="d-none d-sm-flex"
          :selected-items="formattedInvoices"
          :export-file-name="`invoices-export-${new Date().toLocaleDateString()}.csv`"
          :export-worksheet-name="`Invoices Export ${new Date().toLocaleDateString()}`"
          :headers="allHeaders"
          :show-filter="true"
          :show-columns="true"
          :view-saved-filter="viewSavedFilter"
          :view-saved-column="viewSavedColumn"
          :show-graph="true"
          :is-chart-enabled="isChartEnabled"
          @update:filter="openToolPanel"
          @update:column="openToolPanel"
          @clear:column-state="removeColState"
          @save:column-state="saveColumnState"
          @clear:filter-state="removeFilterState"
          @save:filter-state="saveFilterState"
          @click:graph="createChart"
        />
      </template>
      <template
        #buttons
      >
        <v-btn
          v-if="!!invoices && !isViewer"
          v-t="'pages.invoices.upload'"
          depressed
          color="primary"
          :to="{
            name: 'addInvoice',
          }"
          class="mr-3"
        />
      </template>
    </page-header>
    <invoices-table
      v-model="selectedInvoices"
      :columns="headers"
      :pagination="rowPerPage"
      @range-selection-changed="chartsSelected"
      @grid-ready="initialFunction"
      @rowClicked="
        ({ data: { id } }) => {
          $router.push({
            name: 'invoice',
            params: { id },
          });
        }
      "
    />
  </v-container>
</template>

<script lang="ts">
import { CellRange, ColumnVO, CreateRangeChartParams, GridReadyEvent, IServerSideGetRowsParams } from 'ag-grid-community'
import get from 'lodash.get'
import chain from 'lodash/chain'
import find from 'lodash/find'
import isEmpty from 'lodash/isEmpty'
import set from 'lodash/set'
import sumBy from 'lodash/sumBy'
import { Bind, Debounce } from 'lodash-decorators'
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'

import type { AccountSettingsDto } from '@/client/users'
import AppTableControls from '@/components/AppTableControls.vue'
import PageHeader from '@/components/PageHeader.vue'
import InvoicesTable from '@/components/VueDataGrid.vue'
import type {
  ICurrentPageOpts,
  ObjectKeyAsAny
} from '@/types/app'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

import type { IInvoice, IInvoices } from '../types'

const dashDefault = (params: any) => {
  if (!params.value) return '-'
  return params.value
}
const dateFilterParams = {
  filterOptions: ['lessThanOrEqual', 'greaterThanOrEqual'],
  debounceMs: 200,
  suppressAndOrCondition: true
}
const namespaces = {
  invoices: 'invoices',
  accountSettings: 'accountSettings',
  grid: 'grid',
  user: 'user'
}

@Component({
  name: 'Invoices',
  components: {
    AppTableControls,
    InvoicesTable,
    PageHeader
  }
})
export default class Invoices extends Vue {
  @Action('getInvoices', { namespace: namespaces.invoices }) getInvoices!: (params?: ICurrentPageOpts) => Promise<void>;
  @Action('getCostTypes', { namespace: namespaces.invoices }) getCostTypes!:() =>Promise<void>;
  @Action('getInvoicesState', { namespace: namespaces.grid }) getInvoicesState!: (invoicesState: any) => Promise<void>;

  @State('content', { namespace: namespaces.invoices }) invoices!: IInvoices;
  @State('costTypes', { namespace: namespaces.invoices }) costTypes!: ObjectKeyAsAny;
  @State('accountSettings', { namespace: namespaces.accountSettings }) accountSettings!: AccountSettingsDto;
  @State('invoicesState', { namespace: namespaces.grid }) invoicesState?: any;

  @Getter('id', { namespace: namespaces.user }) userId!: number;
  @Getter('isViewer', { namespace: namespaces.user }) isViewer!: boolean;

  headers = [...this.allHeaders];
  selectedInvoices: IInvoice[] = [];
  agApi!: GridReadyEvent;
  search = '';
  cellRanges: CellRange[] = [];
  rowPerPage=15

  get isChartEnabled () {
    return !!this.cellRanges.length
  }

  async beforeMount () {
    await this.getCostTypes()
  }

  async initialFunction (param: GridReadyEvent) {
    this.agApi = param
    await this.initialLoad()
  }

  async restoreView () {
    this.agApi.columnApi.applyColumnState({
      state: this.invoicesState.colState,
      applyOrder: true
    })
    this.agApi.api.setFilterModel(this.invoicesState.filterModel)
  }

  async paginationFun (val: number) {
    this.rowPerPage = val
    this.agApi.api.setCacheBlockSize(val)
    this.agApi.api.paginationSetPageSize(val)
    //  this.restoreView()
  }

  async initialLoad () {
    if (this.invoicesState.rowPerPage) {
      this.paginationFun(this.invoicesState.rowPerPage)
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
        headerTooltip:
          'Hold the shift key to select all the rows between two check-boxes',
        // headerComponent: 'SelectAllCheckbox',
        // headerComponentParams: { headerName: 'Export' },
        headerCheckboxSelection: true,
        resizable: false,
        filter: false,
        chartDataType: 'excluded',
        maxWidth: 60,
        suppressColumnsToolPanel: true,
        minWidth: 95,
        suppressMovable: true,
        checkboxSelection: true
      },
      {
        headerName: 'ID',
        valueFormatter: dashDefault,
        minWidth: 105,
        hide: true,
        sortable: true,
        field: 'id'
      },
      {
        headerName: this.$t('components.invoicesTable.date'),
        field: 'unixDate',
        sortable: true,
        minWidth: 180,
        filter: 'agDateColumnFilter',
        filterParams: dateFilterParams,
        valueFormatter: this.dateFormatter
      },
      {
        headerName: this.$t('components.invoicesTable.status'),
        valueFormatter: dashDefault,
        field: 'status',
        cellRenderer: 'StatusRender',
        chartDataType: 'excluded',
        cellRendererParams: {
          type: 'invoice'
        }
      },
      {
        headerName: this.$t('components.invoicesTable.contact'),
        valueFormatter: dashDefault,
        sortable: true,
        chartDataType: 'category',
        enableRowGroup: true,
        tooltipField: 'supplier.companyName',
        field: 'supplier.companyName'
      },
      {
        headerName: this.$t('components.invoicesTable.invoiceNumber'),
        valueFormatter: dashDefault,
        sortable: true,
        field: 'invoiceNumber'
      },
      {
        headerName: this.$t('components.invoicesTable.payReferenceNumber'),
        valueFormatter: dashDefault,
        sortable: true,
        field: 'payReferenceNumber'
      },
      {
        headerName: this.$t('components.invoicesTable.costType'),
        valueFormatter: this.costTypesFormatter,
        enableRowGroup: true,
        sortable: true,
        field: 'costType'
      },
      {
        headerName: this.$t('components.invoicesTable.total'),
        valueFormatter: this.currencyFormatter,
        sortable: true,
        aggFunc: 'sum',
        enableValue: true,
        field: 'invoiceTotal'
      },
      {
        headerName: this.$t('components.invoicesTable.reconciled'),
        valueFormatter: dashDefault,
        field: 'reconciled',
        suppressFiltersToolPanel: true,
        filter: 'FilterModel',
        floatingFilterComponentParams: {
          suppressFilterButton: true
        },
        cellRenderer: 'ReconciledRender'
      }
    ]
  }

  get dataSource () {
    return {
      getRows: async (params: IServerSideGetRowsParams) => {
        const sort = params.request.sortModel || []
        const filterModel = params.request.filterModel || {}
        const pageSize = params.api.paginationGetPageSize()
        const rowGroupCols = params.request.rowGroupCols || []
        const groupKeys = params.request.groupKeys || []
        const valueCols = params.request.valueCols || []
        const page = params.api.paginationGetCurrentPage()
        // this.getInvoicesState({ sortModel: sort, filterModel: filterModel, search: this.search })
        try {
          if (this.invoices?.content) {
            if (Object.keys(filterModel).length || rowGroupCols.length) {
              await this.loadFilterAndGrouping(params, this.invoices.content, filterModel, rowGroupCols, groupKeys, valueCols)
              return
            }
          }
          params.api.showLoadingOverlay()
          await this.getInvoices({
            userId: this.userId,
            size: pageSize,
            page: page + 1,
            sort: sort,
            search: this.search
          })
          if (this.invoices?.content?.length) {
            if (Object.keys(filterModel).length || rowGroupCols.length) {
              await this.loadFilterAndGrouping(params, this.invoices.content, filterModel, rowGroupCols, groupKeys, valueCols)
              return
            }
            params.success({
              rowData: this.invoices?.content,
              rowCount: this.invoices?.totalElements
            })
            params.api.hideOverlay()
            params.api.sizeColumnsToFit()
            // params.columnApi.autoSizeAllColumns()
          } else {
            params.success({
              rowData: [],
              rowCount: 0
            })
            params.api.showNoRowsOverlay()
          }
        } catch (e) {
          params.fail()
        }
      }
    }
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
      params.api.sizeColumnsToFit()
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
  // Filter and grouping functions for ag-grid locally end

  @Debounce(200)
  @Bind()
  searchInvoices (value: string) {
    if (this.search !== value) {
      this.search = value
      this.agApi.api.setServerSideDatasource(this.dataSource)
    }
  }

  costTypesFormatter (params: any) {
    if (this.costTypes && params.value) {
      return this.costTypes[params.value]
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

  currencyFormatter (params: any) {
    if (this.accountSettings && params.value) {
      return formatCurrency(
        this.accountSettings?.currency?.currencySymbol,
        params.value
      )
    } else {
      return '-'
    }
  }

  get formattedInvoices () {
    return this.selectedInvoices.map((invoice: IInvoice) => {
      return this.headers.reduce((prev: Record<string, any>, cur: any) => {
        if (cur.field === 'reconciled') {
          prev[cur.headerName.toString()] = invoice.reconciled
            ? this.$t('pages.invoices.yes').toString()
            : this.$t('pages.invoices.no').toString()
        } else if (cur.field !== '') {
          prev[cur.headerName.toString()] = `${
            get(invoice, cur.field) ? get(invoice, cur.field).toString() : ''
          }`
        }
        return prev
      }, {})
    })
  }

  saveColumnState () {
    const columnState = this.agApi.columnApi.getColumnState()
    this.getInvoicesState({ colState: columnState, rowPerPage: this.agApi.api.paginationGetPageSize() })
  }

  saveFilterState () {
    const filterState = this.agApi.api.getFilterModel()
    this.getInvoicesState({ filterModel: filterState })
  }

  removeFilterState () {
    this.agApi.api.setFilterModel({})
    this.getInvoicesState({ filterModel: {} })
  }

  async removeColState () {
    this.agApi.columnApi.resetColumnState()
    this.getInvoicesState({ colState: [], rowPerPage: null })
    await this.initialLoad()
  }

  get viewSavedColumn () {
    return isEmpty(this.invoicesState.colState)
  }

  get viewSavedFilter () {
    return isEmpty(this.invoicesState.filterModel)
  }

  openToolPanel (key: string) {
    if (key === this.agApi.api.getOpenedToolPanel()) {
      this.agApi.api.closeToolPanel()
      return false
    }
    this.agApi.api.openToolPanel(key)
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
}
</script>
