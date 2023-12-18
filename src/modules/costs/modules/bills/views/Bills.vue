<template>
  <v-container
    class="pa-0"
    style="height: 100%; display: flex; flex-direction: column"
    fluid
  >
    <page-header :title="''">
      <template #controls>
        <app-table-controls
          :selected-items="formattedBills"
          :export-file-name="exportName"
          :export-worksheet-name="exportWorksheetName"
          :headers="billsHeaders"
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
    <bills-table
      key="bills-table"
      v-model="selectedBills"
      :pagination="rowPerPage"
      :columns="headersBills"
      @range-selection-changed="chartsSelected"
      @grid-ready="initialFunction"
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
import { Component, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import type { InvoicePaymentDto, PageInvoicePaymentDto } from '@/client/invoices'
import type { AccountSettingsDto } from '@/client/users'
import AppTableControls from '@/components/AppTableControls.vue'
import PageHeader from '@/components/PageHeader.vue'
import BillsTable from '@/components/VueDataGrid.vue'
// import { Task } from '@/decorators/task'
import type { IUser } from '@/modules/user/types'
import type { ObjectKeyAsAny } from '@/types/app'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

const namespaces = {
  costs: 'costs',
  invoices: 'invoices',
  products: 'products',
  accountSettings: 'accountSettings',
  grid: 'grid',
  suppliers: 'suppliers',
  user: 'user',
  integrations: 'integrations'
}

const dashDefault = (params: any) => {
  if (!params.value) return '-'
  return params.value
}

const textFilterParams = {
  filterOptions: [
    'contains'
    // 'notEqual',
    // {
    //   displayKey: 'in',
    //   displayName: 'IN',
    //   predicate: () => {
    //     return true
    //   }
    // }
  ],
  debounceMs: 200
}

const dateFilterParams = {
  filterOptions: ['lessThanOrEqual', 'greaterThanOrEqual'],
  debounceMs: 200
}

@Component({
  components: {
    AppTableControls,
    PageHeader,
    BillsTable
  },
  filters: {
    trim (value: string, limit: number) {
      if (!value || value.length < 11) return value
      return value.substring(0, limit) + '...'
    }
  }
})
export default class Bills extends Vue {
@Action('getCostTypes', { namespace: namespaces.costs })
getCostTypes!: any;

@Action('fetchInvoicePaymentsForUser', { namespace: namespaces.invoices })
fetchInvoicePaymentsForUser!: (opts: { userId: number, pageNumber?: number, pageSize?: number, sort?: Array<any> }) => Promise<void>;

@State('bills', { namespace: namespaces.invoices }) bills!: PageInvoicePaymentDto;

@State('user', { namespace: namespaces.user })
user!: IUser;

@State('costTypes', { namespace: namespaces.costs })
costTypes!: ObjectKeyAsAny;

@State('accountSettings', { namespace: namespaces.accountSettings })
accountSettings!: AccountSettingsDto;

@Action('getBillState', { namespace: namespaces.grid })
getBillState!: (billState: any) => void;

@State('billState', { namespace: namespaces.grid }) billState?: any;

headersBills = [...this.billsHeaders];
selectedBills: InvoicePaymentDto[] = [];
gridApi!: GridReadyEvent;
cellRanges: CellRange[] = [];
rowPerPage=15

async beforeMount (): Promise<void> {
  await this.getCostTypes()
}

get exportName () {
  return `bills-export-${new Date().toLocaleDateString()}.csv`
}

get exportWorksheetName () {
  return `Bills Export-${new Date().toLocaleDateString()}`
}

async saveColumnState () {
  const columnState = this.gridApi.columnApi.getColumnState()
  this.getBillState({ colState: columnState, rowPerPage: this.gridApi.api.paginationGetPageSize() })
}

async saveFilterState () {
  const filterState = this.gridApi.api.getFilterModel()
  this.getBillState({ filterModel: filterState })
}

async removeFilterState () {
  this.gridApi.api.setFilterModel({})
  this.getBillState({ filterModel: {} })
}

async removeColState () {
  this.gridApi.columnApi.resetColumnState()
  this.getBillState({ colState: [], rowPerPage: null })
  await this.initialLoadBills()
}

get viewSavedColumn () {
  return isEmpty(this.billState.colState)
}

get viewSavedFilter () {
  return isEmpty(this.billState.filterModel)
}

openToolPanel (key: string) {
  if (key === this.gridApi.api.getOpenedToolPanel()) {
    this.gridApi.api.closeToolPanel()
    return false
  }
  this.gridApi.api.openToolPanel(key)
}

// @Task('initialLoadTask')
async initialFunction (param: any) {
  this.gridApi = param
  await this.initialLoadBills()
}

async paginationFun (val: number) {
  this.rowPerPage = val
  this.gridApi.api.setCacheBlockSize(val)
  this.gridApi.api.paginationSetPageSize(val)
}

async restoreBillsView () {
  this.gridApi.columnApi.applyColumnState({
    state: this.billState.colState,
    applyOrder: true
  })
  this.gridApi.api.setFilterModel(this.billState.filterModel)
}

async initialLoadBills () {
  if (this.billState.rowPerPage) {
    this.paginationFun(this.billState.rowPerPage)
  } else {
    this.paginationFun(15)
  }
  this.gridApi.api.setServerSideDatasource(this.dataSourceBills)
  this.restoreBillsView()
}

async sizeToFitGrid () {
  this.gridApi.api.sizeColumnsToFit()
}

get formattedBills () {
  return this.selectedBills.map((bills: InvoicePaymentDto) => {
    return this.billsHeaders.reduce(
      (prev: Record<string, any>, cur: any) => {
        if (cur.field === 'unixDate') {
          prev[cur.headerName.toString()] = `${get(
            bills,
            cur.field
          )
? formatDate(get(
            bills,
            cur.field
          ).toString())
: ''}`
        } else if (cur.field !== '' && cur.headerName !== 'Download') {
          prev[cur.headerName.toString()] = `${get(
            bills,
            cur.field
          )
? get(
            bills,
            cur.field
          ).toString()
: ''}`
        }
        return prev
      },
      {}
    )
  })
}

get billsHeaders () {
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
      suppressColumnsToolPanel: true,
      maxWidth: 60,
      minWidth: 95,
      suppressMovable: true,
      checkboxSelection: true,
      chartDataType: 'excluded',
      filter: false,
      sortable: false
    },
    {
      headerName: this.$t('components.BillsTable.headers.invoiceDate'),
      field: 'invoice.unixDate',
      sortable: true,
      filter: 'agDateColumnFilter',
      filterParams: dateFilterParams,
      minWidth: 180,
      valueFormatter: this.dateFormatter
    },
    {
      headerName: this.$t('components.BillsTable.headers.download'),
      field: 'invoice.id',
      cellRenderer: 'DownloadInvoice',
      suppressFiltersToolPanel: true,
      filter: 'FilterModel',
      floatingFilterComponentParams: {
        suppressFilterButton: true
      },
      sortable: false
    },
    {
      headerName: this.$t('components.BillsTable.headers.createdBy'),
      field: 'createdByUser',
      suppressFiltersToolPanel: true,
      filter: 'FilterModel',
      floatingFilterComponentParams: {
        suppressFilterButton: true
      },
      valueGetter (params: {
          data: { createdByUser: { firstName: string, lastName: string, email: string} }
        }) {
        if (params.data.createdByUser && (params.data.createdByUser.firstName || params.data.createdByUser.lastName)) {
          return (params.data.createdByUser.firstName +
            ' ' +
            params.data.createdByUser.lastName).trim()
        } else if (params.data.createdByUser && params.data.createdByUser.email) {
          return params.data.createdByUser.email
        } else {
          return '-'
        }
      },
      valueFormatter: dashDefault,
      sortable: false
    },
    {
      headerName: this.$t('components.BillsTable.headers.invoiceNo'),
      field: 'invoice.invoiceNumber',
      cellRenderer: 'LinkRenderBills',
      cellRendererParams: {
        name: 'invoice',
        goBack: 'bills',
        field: 'invoice',
        id: 'id'
        // tab: TTab.Bills
      },
      sortable: true
    },
    {
      headerName: this.$t('components.BillsTable.headers.supplier'),
      field: 'invoice.supplier.companyName',
      cellRenderer: 'LinkRenderContact',
      cellRendererParams: {
        name: 'supplierDetails',
        goBack: 'bills',
        field1: 'invoice',
        field2: 'supplier',
        id: 'id'
        // tab: TTab.Bills
      },
      sortable: false
    },
    {
      headerName: this.$t('components.BillsTable.headers.accountCode'),
      field: 'invoice.costType',
      filter: 'agTextColumnFilter',
      filterParams: textFilterParams,
      valueFormatter: this.costTypesFormatter,
      sortable: true
    },
    {
      headerName: this.$t('components.BillsTable.headers.total'),
      field: 'total',
      valueFormatter: this.currencyFormatter,
      filter: 'agTextColumnFilter',
      filterParams: textFilterParams,
      sortable: true
    },
    {
      headerName: this.$t('components.BillsTable.headers.paid'),
      field: 'paidAdjusted',
      valueFormatter: this.currencyFormatter,
      filter: 'agTextColumnFilter',
      filterParams: textFilterParams,
      sortable: true
    },
    {
      headerName: this.$t('components.BillsTable.headers.balance'),
      field: 'balance',
      valueFormatter: this.currencyFormatter,
      filter: 'agTextColumnFilter',
      filterParams: textFilterParams,
      sortable: true
    },
    {
      headerName: this.$t('components.BillsTable.headers.status'),
      field: 'invoicePaymentStatus',
      sortable: true,
      cellRenderer: 'StatusRender',
      filter: 'FilterModel',
      floatingFilterComponentParams: {
        suppressFilterButton: true
      },
      cellRendererParams: {
        type: 'costs'
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

get dataSourceBills () {
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
        if (this.bills?.content) {
          if (Object.keys(filterModel).length || rowGroupCols.length) {
            await this.loadFilterAndGrouping(params, this.bills.content, filterModel, rowGroupCols, groupKeys, valueCols)
            return false
          }
        }
        params.api.showLoadingOverlay()
        await this.fetchInvoicePaymentsForUser({
          userId: this.user.id as number,
          pageSize: pageSize,
          pageNumber: page + 1,
          sort: sort
        })
        if (this.bills?.content?.length) {
          if (Object.keys(filterModel).length || rowGroupCols.length) {
            await this.loadFilterAndGrouping(params, this.bills.content, filterModel, rowGroupCols, groupKeys, valueCols)
            return false
          }
          params.success({
            rowData: this.bills?.content,
            rowCount: this.bills?.totalElements
          })
          params.api.hideOverlay()
          this.sizeToFitGrid()
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
    this.sizeToFitGrid()
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
