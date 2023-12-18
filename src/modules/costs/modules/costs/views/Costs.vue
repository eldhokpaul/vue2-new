<template>
  <v-container
    class="pa-0"
    style="height: 100%; display: flex; flex-direction: column"
    fluid
  >
    <page-header :title="''">
      <template
        #search
      >
        <v-card
          width="250px"
          elevation="0"
          class="ms-3"
        >
          <v-text-field
            label="Search"
            outlined
            dense
            hide-details
            prepend-inner-icon="mdi-magnify"
            clearable
            @input="searchCosts"
          />
        </v-card>
      </template>
      <template #controls>
        <app-table-controls
          :selected-items="formattedCosts"
          :export-file-name="exportName"
          :export-worksheet-name="exportWorksheetName"
          :headers="costsHeaders"
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
    <costs-stats-card
      v-if="costs"
      :costs="costs"
    />
    <costs-table
      :key="'costs-table'"
      v-model="selectedCosts"
      :columns="headersCosts"
      :pagination="rowPerPage"
      @range-selection-changed="chartsSelected"
      @grid-ready="initialFunction"
      @cost-exclude="onCostLineExclude"
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
import CostsTable from '@/components/VueDataGrid.vue'
import CostsStatsCard from '@/modules/costs/components/CostsStatsCard.vue'
import type { ICost, ICosts } from '@/modules/costs/types'
import type { IUser } from '@/modules/user/types'
import type { ObjectKeyAsAny } from '@/types/app'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

const namespaces = {
  costs: 'costs',
  accountSettings: 'accountSettings',
  grid: 'grid',
  user: 'user'
}

const dashDefault = (params: any) => {
  if (!params.value) return '-'
  return params.value
}

const dateFilterParams = {
  filterOptions: ['lessThanOrEqual', 'greaterThanOrEqual'],
  debounceMs: 200,
  suppressAndOrCondition: true
}

@Component({
  components: {
    AppTableControls,
    CostsStatsCard,
    PageHeader,
    CostsTable
  },
  filters: {
    trim (value: string, limit: number) {
      if (!value || value.length < 11) return value

      return value.substring(0, limit) + '...'
    }
  }
})
export default class Costs extends Vue {
@Getter('id', { namespace: namespaces.user })
userId!: number;

@Action('alterCost', { namespace: namespaces.costs })alterCost!: (opts: { line: ICost }) => Promise<void>;

@Action('getCostTypes', { namespace: namespaces.costs })getCostTypes!: any;

@Action('getCosts', { namespace: namespaces.costs })
getCosts!: (opts: { userId: number, page?: number, size?: number, search?: any, sort?: Array<any> }) => Promise<void>;

@State('costs', { namespace: namespaces.costs })
costs?: ICosts;

@State('user', { namespace: namespaces.user })
user!: IUser;

@State('costTypes', { namespace: namespaces.costs })
costTypes!: ObjectKeyAsAny;

@State('accountSettings', { namespace: namespaces.accountSettings })
accountSettings!: AccountSettingsDto;

@Action('getCostState', { namespace: namespaces.grid })
getCostState!: (costState: any) => void;

@State('costState', { namespace: namespaces.grid }) costState?: any;

headersCosts = [...this.costsHeaders];
selectedCosts: ICost[] = [];
gridApi!: GridReadyEvent;
cellRanges: CellRange[] = [];
rowPerPage=15
searchCost = '';

async beforeMount () {
  await this.getCostTypes()
}

@Debounce(200)
@Bind()
searchCosts (value: string) {
  if (this.searchCost !== value) {
    this.searchCost = value
    this.gridApi.api.setServerSideDatasource(this.dataSourceCosts)
  }
}

get exportName () {
  return `costs-export-${new Date().toLocaleDateString()}.csv`
}

get exportWorksheetName () {
  return `Costs Export-${new Date().toLocaleDateString()}`
}

async saveColumnState () {
  const columnState = this.gridApi.columnApi.getColumnState()
  this.getCostState({ colState: columnState, rowPerPage: this.gridApi.api.paginationGetPageSize() })
}

async saveFilterState () {
  const filterState = this.gridApi.api.getFilterModel()
  this.getCostState({ filterModel: filterState })
}

async removeFilterState () {
  this.gridApi.api.setFilterModel({})
  this.getCostState({ filterModel: {} })
}

async removeColState () {
  this.gridApi.columnApi.resetColumnState()
  this.getCostState({ colState: [], rowPerPage: null })
  await this.initialLoadCosts()
}

get viewSavedColumn () {
  return isEmpty(this.costState.colState)
}

get viewSavedFilter () {
  return isEmpty(this.costState.filterModel)
}

openToolPanel (key: string) {
  if (key === this.gridApi.api.getOpenedToolPanel()) {
    this.gridApi.api.closeToolPanel()
    return false
  }
  this.gridApi.api.openToolPanel(key)
}

// @Task('initialLoadTask')
async initialFunction (param: GridReadyEvent) {
  this.gridApi = param
  await this.initialLoadCosts()
}

async paginationFun (val: number) {
  this.rowPerPage = val
  this.gridApi.api.setCacheBlockSize(val)
  this.gridApi.api.paginationSetPageSize(val)
}

async restoreCostsView () {
  this.gridApi.columnApi.applyColumnState({
    state: this.costState.colState,
    applyOrder: true
  })
  this.gridApi.api.setFilterModel(this.costState.filterModel)
}

async initialLoadCosts () {
  if (this.costState.rowPerPage) {
    this.paginationFun(this.costState.rowPerPage)
  } else {
    this.paginationFun(15)
  }
  this.gridApi.api.setServerSideDatasource(this.dataSourceCosts)
  this.restoreCostsView()
}

async onCostLineExclude (item: ICost) {
  await this.alterCost({ line: item })
  this.gridApi.api.setServerSideDatasource(this.dataSourceCosts)
}

get expectedCosts () {
  return this.costs?.lineCosts
}

get dataSourceCosts () {
  return {
    getRows: async (params: IServerSideGetRowsParams) => {
      const sort = params.request.sortModel || []
      const filterModel = params.request.filterModel || {}
      const pageSize = params.api.paginationGetPageSize()
      const page = params.api.paginationGetCurrentPage()
      const rowGroupCols = params.request.rowGroupCols || []
      const groupKeys = params.request.groupKeys || []
      const valueCols = params.request.valueCols || []
      try {
        if (this.expectedCosts?.content) {
          if (Object.keys(filterModel).length || rowGroupCols.length) {
            await this.loadFilterAndGrouping(params, this.expectedCosts.content, filterModel, rowGroupCols, groupKeys, valueCols)
            return false
          }
        }
        params.api.showLoadingOverlay()
        await this.getCosts({
          userId: this.user.id as number,
          size: pageSize,
          page: page + 1,
          sort: sort,
          search: this.searchCost
        })
        if (this.expectedCosts?.content?.length) {
          if (Object.keys(filterModel).length || rowGroupCols.length) {
            await this.loadFilterAndGrouping(params, this.expectedCosts.content, filterModel, rowGroupCols, groupKeys, valueCols)
            return false
          }
          params.success({
            rowData: this.expectedCosts?.content,
            rowCount: this.expectedCosts?.totalElements
          })
          params.api.hideOverlay()
          params.columnApi.autoSizeAllColumns()
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

get formattedCosts () {
  return this.selectedCosts.map((cost: ICost) => {
    return this.costsHeaders.reduce((prev: Record<string, any>, cur: any) => {
      // if (cur.field === 'invoice.unixDate') {
      //   prev[cur.headerName.toString()] = `${get(cost, cur.field)
      //   ? formatDate(get(cost, cur.field).toString()) : ''}`
      // } else
      if (cur.field !== '') {
        prev[cur.headerName.toString()] = `${get(
            cost,
            cur.field
          )
? get(
            cost,
            cur.field
          ).toString()
: ''}`
      }
      return prev
    }, {})
  })
}

get costsHeaders () {
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
      maxWidth: 60,
      suppressColumnsToolPanel: true,
      minWidth: 95,
      suppressMovable: true,
      checkboxSelection: true,
      sortable: false,
      chartDataType: 'excluded',
      filter: false,
      cellClass: (params: {
          data: { isExcludedFromGeneralCostsData: boolean }
        }) => {
        return params.data.isExcludedFromGeneralCostsData ? 'row-color' : ''
      }
    },
    {
      headerName: this.$t('components.costsTable.headers.product'),
      field: 'product.name',
      sortable: true,
      cellClass: (params: {
          data: { isExcludedFromGeneralCostsData: boolean }
        }) => {
        return params.data.isExcludedFromGeneralCostsData
          ? 'row-crossed'
          : ''
      },
      cellRenderer: 'LinkRender',
      cellRendererParams: {
        name: 'productDetails',
        goBack: 'assignedCosts',
        field: 'product',
        id: 'sku'
        // tab: 'costs'
      }
    },
    {
      headerName: this.$t('components.costsTable.headers.orderDate'),
      field: 'invoice.unixDate',
      filter: 'agDateColumnFilter',
      filterParams: dateFilterParams,
      sortable: true,
      minWidth: 180,
      valueFormatter: this.dateFormatter,
      cellClass: (params: {
          data: { isExcludedFromGeneralCostsData: boolean }
        }) => {
        return params.data.isExcludedFromGeneralCostsData
          ? 'row-crossed'
          : ''
      }
    },
    {
      headerName: this.$t('components.costsTable.headers.payReference'),
      field: 'invoice.payReferenceNumber',
      valueFormatter: dashDefault,
      sortable: true,
      cellClass: (params: {
          data: { isExcludedFromGeneralCostsData: boolean }
        }) => {
        return params.data.isExcludedFromGeneralCostsData
          ? 'row-crossed'
          : ''
      }
    },
    {
      headerName: this.$t('components.costsTable.headers.invoice'),
      field: 'invoice.invoiceNumber',
      sortable: true,
      enableRowGroup: true,
      cellClass: (params: {
          data: { isExcludedFromGeneralCostsData: boolean }
        }) => {
        return params.data.isExcludedFromGeneralCostsData
          ? 'row-crossed'
          : ''
      },
      cellRenderer: 'LinkRender',
      cellRendererParams: {
        name: 'invoice',
        goBack: 'assignedCosts',
        field: 'invoice',
        id: 'id'
        // tab: 'costs'
      }
    },
    {
      headerName: this.$t('components.costsTable.headers.costType'),
      field: 'costType',
      valueFormatter: this.costTypesFormatter,
      enableRowGroup: true,
      sortable: true,
      cellClass: (params: {
          data: { isExcludedFromGeneralCostsData: boolean }
        }) => {
        return params.data.isExcludedFromGeneralCostsData
          ? 'row-crossed'
          : ''
      }
    },
    {
      headerName: this.$t('components.costsTable.headers.internalReference'),
      field: 'internalReference',
      valueFormatter: dashDefault,
      sortable: true,
      cellClass: (params: {
          data: { isExcludedFromGeneralCostsData: boolean }
        }) => {
        return params.data.isExcludedFromGeneralCostsData
          ? 'row-crossed'
          : ''
      }
    },
    {
      headerName: this.$t('components.costsTable.headers.unitsOrdered'),
      field: 'factoryUnits',
      valueFormatter: dashDefault,
      sortable: true,
      cellClass: (params: {
          data: { isExcludedFromGeneralCostsData: boolean }
        }) => {
        return params.data.isExcludedFromGeneralCostsData
          ? 'row-crossed'
          : ''
      }
    },
    {
      headerName: this.$t('components.costsTable.headers.factoryCosts'),
      field: 'factoryCosts',
      sortable: true,
      valueFormatter: this.currencyFormatter,
      aggFunc: 'sum',
      enableValue: true,
      cellClass: (params: {
          data: { isExcludedFromGeneralCostsData: boolean }
        }) => {
        return params.data.isExcludedFromGeneralCostsData
          ? 'row-crossed'
          : ''
      }
    },
    {
      headerName: this.$t('components.costsTable.headers.inboundCosts'),
      field: 'inboundCosts',
      sortable: true,
      valueFormatter: this.currencyFormatter,
      aggFunc: 'sum',
      enableValue: true,
      cellClass: (params: {
          data: { isExcludedFromGeneralCostsData: boolean }
        }) => {
        return params.data.isExcludedFromGeneralCostsData
          ? 'row-crossed'
          : ''
      }
    },
    {
      headerName: this.$t('components.costsTable.headers.landedCosts'),
      field: 'totalCosts',
      sortable: true,
      valueFormatter: this.currencyFormatter,
      aggFunc: 'sum',
      enableValue: true,
      cellClass: (params: {
          data: { isExcludedFromGeneralCostsData: boolean }
        }) => {
        return params.data.isExcludedFromGeneralCostsData
          ? 'row-crossed'
          : ''
      }
    },
    {
      headerName: this.$t('components.costsTable.headers.exclude'),
      field: 'isExcludedFromGeneralCostsData',
      sortable: false,
      filter: 'FilterModel',
      suppressFiltersToolPanel: true,
      floatingFilterComponentParams: {
        suppressFilterButton: true
      },
      cellRenderer: 'CheckboxRenderCost',
      cellClass: (params: {
          data: { isExcludedFromGeneralCostsData: boolean }
        }) => {
        return params.data.isExcludedFromGeneralCostsData ? 'row-color' : ''
      }
    }
  ]
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

dateFormatter (params: any) {
  if (params.value) {
    return formatDate(Number(params.value))
  } else {
    return '-'
  }
}

costTypesFormatter (params: any) {
  if (this.costTypes && params.value) {
    return this.costTypes[params.value]
  } else {
    return '-'
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
    params.columnApi.autoSizeAllColumns()
  } else {
    params.success({
      rowData: [],
      rowCount: 0
    })
    params.api.showNoRowsOverlay()
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
    this.gridApi.api.createRangeChart(params)
  })
}
}
</script>

<style lang="scss">
#sv-btn-group {
  & > button {
    border-bottom: 3px solid transparent;
  }

  .active-tab {
    border-bottom: 3px solid $primary;

    &::before,
    &:hover::before {
      opacity: 0;
    }
  }
}
.row-crossed {
  background-color: lightgrey;
  text-decoration: line-through;
}
.row-color {
  background-color: lightgrey;
}
.row-highlight {
  background-color: #2195f34e;
}
</style>
