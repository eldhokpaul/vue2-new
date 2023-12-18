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
            @input="searchPayables"
          />
        </v-card>
      </template>
      <template #controls>
        <app-table-controls
          :selected-items="formattedPayables"
          :export-file-name="exportName"
          :export-worksheet-name="exportWorksheetName"
          :headers="PayablesHeaders"
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
    <payables-table
      key="payablesTable"
      v-model="selectedPayable"
      :columns="headersPayables"
      :pagination="rowPerPage"
      @range-selection-changed="chartsSelected"
      @grid-ready="initialFunction"
      @update:payment-status="updatePaymentStatus"
    />
    <payment-confirmation-dialog
      v-model="confirmPaymentData"
      :should-show="showPaymentConfirmation"
      :is-active="updatePaymentStatusTask.isActive||syncAccountCodesTask.isActive"
      :pay-from-account-code="payFromAccountCode"
      @sync:account-code="syncAccountCodes"
      @confirm="confirmPaymentClick"
      @close="showPaymentConfirmation = false"
      @update:close="showPaymentConfirmation = false"
    />
    <email-confirmation-dialog
      v-if="suppliers&&suppliers.content"
      v-model="confirmPaymentData"
      :should-show="showEmailConfirmation"
      :is-active="confirmPaymentStatusTask.isActive"
      :suppliers="suppliers.content"
      @confirm="confirmPaymentStatus"
      @close="confirmPaymentClick,showEmailConfirmation = false"
      @update:close="confirmPaymentClick,showEmailConfirmation = false"
    />
    <app-confirmation-dialog
      :should-show="undoConfirmDialogOpen"
      :details="'components.PayablesTable.page.undoConfirmText'"
      :is-active="undoPaymentStatusTask.isActive"
      @confirm="undoPaymentStatus"
      @close="undoConfirmDialogOpen = false"
      @close:update="undoConfirmDialogOpen = false"
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

import type { AccountCode, PagePaymentDto, PaymentConfirmationDto, PaymentDto } from '@/client/invoices'
import type { Pageable } from '@/client/suppliers'
import type { AccountSettingsDto } from '@/client/users'
import AppTableControls from '@/components/AppTableControls.vue'
import AppConfirmationDialog from '@/components/dialogs/AppConfirmationDialog.vue'
import PageHeader from '@/components/PageHeader.vue'
import PayablesTable from '@/components/VueDataGrid.vue'
import { Task } from '@/decorators/task'
import { ISuppliers } from '@/modules/contacts/types'
import EmailConfirmationDialog from '@/modules/costs/components/dialogs/EmailConfirmationDialog.vue'
import PaymentConfirmationDialog from '@/modules/costs/components/dialogs/PaymentConfirmationDialog.vue'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

const namespaces = {
  costs: 'costs',
  invoices: 'invoices',
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

const dateHighlight = (params: any) => {
  if (params.data.unixDueDate) {
    const today = Math.floor(Date.now() / 1000)
    const yesterday = Math.floor((Date.now() - 86400000) / 1000) // that is: 24 * 60 * 60 * 1000
    if (formatDate(params.data.unixDueDate) === formatDate(today) || formatDate(params.data.unixDueDate) === formatDate(yesterday)) {
      return 'row-highlight'
    }
  }
}

const textFilterParams = {
  filterOptions: [
    'contains'
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
    PayablesTable,
    PaymentConfirmationDialog,
    EmailConfirmationDialog,
    AppConfirmationDialog
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

@Action('fetchPaymentsForUser', { namespace: namespaces.invoices })
fetchPaymentsForUser!: (opts: { pageNumber?: number, pageSize?: number, search?: string, sort?: Array<any> }) => Promise<void>;

@Action('updatePaymentEntry', { namespace: namespaces.invoices })
updatePaymentEntry!: (opts: {invoicePaymentId: number, paymentConfirmationDto?: PaymentConfirmationDto}) => Promise<PaymentDto>;

@Action('undoPaymentEntry', { namespace: namespaces.invoices })
undoPaymentEntry!: (invoicePaymentId: number) => Promise<PaymentDto>;

@State('accountSettings', { namespace: namespaces.accountSettings })
accountSettings!: AccountSettingsDto;

@Action('getPayableState', { namespace: namespaces.grid })
getPayableState!: (payableState: any) => void;

@State('payableState', { namespace: namespaces.grid }) payableState?: any;

// @Action('getDocumentById', { namespace: namespaces.invoices })
// getDocumentById!: (invoiceId: number) => any;

@Action('getSuppliers', { namespace: namespaces.suppliers })
getSuppliers!: (pagination: Pageable) => Promise<void>;

@State('suppliers', { namespace: namespaces.suppliers }) suppliers?: ISuppliers | null

@State('payables', { namespace: namespaces.invoices }) payables?: PagePaymentDto | null

@Action('getPayFromAccountCode', { namespace: namespaces.invoices })
getPayFromAccountCode!: (userId: number) => any;

@State('payFromAccountCode', { namespace: namespaces.invoices })
payFromAccountCode!: AccountCode[]

@Action('syncAccountCodesFromXero', { namespace: namespaces.integrations }) syncAccountCodesFromXero!: () => Promise<void>

headersPayables = [...this.PayablesHeaders];
selectedPayable: PaymentDto[] = [];

gridApi!: GridReadyEvent;
searchPayable = '';
showPaymentConfirmation=false
showEmailConfirmation=false
undoConfirmDialogOpen=false
updatePaymentStatusId!: number
cellRanges: CellRange[] = [];
rowPerPage=15
confirmPaymentData: PaymentConfirmationDto&{ confirmation?: boolean}={
  confirmation: false,
  isConfirmed: true,
  paidFromAccount: { id: 0 },
  paymentReference: '',
  confirmationEmailToAddresses: [],
  confirmationEmailCCAddresses: []
}

async beforeMount (): Promise<void> {
  await this.getPayFromAccountCode(this.userId)
  await this.getSuppliers({ pageSize: 2000 })
}

get exportName () {
  return `payables-export-${new Date().toLocaleDateString()}.csv`
}

get exportWorksheetName () {
  return `Payables Export-${new Date().toLocaleDateString()}`
}

async saveColumnState () {
  const columnState = this.gridApi.columnApi.getColumnState()
  this.getPayableState({ colState: columnState, rowPerPage: this.gridApi.api.paginationGetPageSize() })
}

async saveFilterState () {
  const filterState = this.gridApi.api.getFilterModel()
  this.getPayableState({ filterModel: filterState })
}

async removeFilterState () {
  this.gridApi.api.setFilterModel({})
  this.getPayableState({ filterModel: {} })
}

async removeColState () {
  this.gridApi.columnApi.resetColumnState()
  this.getPayableState({ colState: [], rowPerPage: null })
  await this.initialLoadPayables()
}

get viewSavedColumn () {
  return isEmpty(this.payableState.colState)
}

get viewSavedFilter () {
  return isEmpty(this.payableState.filterModel)
}

openToolPanel (key: string) {
  if (key === this.gridApi.api.getOpenedToolPanel()) {
    this.gridApi.api.closeToolPanel()
    return false
  }
  this.gridApi.api.openToolPanel(key)
}

async initialFunction (param: GridReadyEvent) {
  this.gridApi = param
  await this.initialLoadPayables()
}

async paginationFun (val: number) {
  this.rowPerPage = val
  this.gridApi.api.setCacheBlockSize(val)
  this.gridApi.api.paginationSetPageSize(val)
}

async restorePayablesView () {
  this.gridApi.columnApi.applyColumnState({
    state: this.payableState.colState,
    applyOrder: true
  })
  this.gridApi.api.setFilterModel(this.payableState.filterModel)
}

async initialLoadPayables () {
  if (this.payableState.rowPerPage) {
    this.paginationFun(this.payableState.rowPerPage)
  } else {
    this.paginationFun(15)
  }
  this.gridApi.api.setServerSideDatasource(this.dataSourcePayables)
  this.restorePayablesView()

  this.confirmPaymentData = {
    confirmation: false,
    isConfirmed: true,
    paidFromAccount: { id: 0 },
    paymentReference: '',
    confirmationEmailToAddresses: [],
    confirmationEmailCCAddresses: []
  }
}

get dataSourcePayables () {
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
        if (this.payables?.content) {
          if (Object.keys(filterModel).length || rowGroupCols.length) {
            await this.loadFilterAndGrouping(params, this.payables.content, filterModel, rowGroupCols, groupKeys, valueCols)
            return false
          }
        }
        params.api.showLoadingOverlay()
        await this.fetchPaymentsForUser({
          pageSize: pageSize,
          pageNumber: page + 1,
          sort: sort,
          search: this.searchPayable
        })
        if (this.payables?.content?.length) {
          if (Object.keys(filterModel).length || rowGroupCols.length) {
            await this.loadFilterAndGrouping(params, this.payables.content, filterModel, rowGroupCols, groupKeys, valueCols)
            return false
          }
          params.success({
            rowData: this.payables?.content,
            rowCount: this.payables?.totalElements
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

get formattedPayables () {
  return this.selectedPayable.map((payables: PaymentDto) => {
    return this.PayablesHeaders.reduce((prev: Record<string, any>, cur: any) => {
      if (cur.field === 'unixPaymentDate') {
        prev[cur.headerName.toString()] = `${get(
            payables,
            cur.field
          )
? formatDate(get(
            payables,
            cur.field
          ).toString())
: ''}`
      } else if (cur.field !== '' && cur.headerName !== 'Download') {
        prev[cur.headerName.toString()] = `${get(
            payables,
            cur.field
          )
? get(
            payables,
            cur.field
          ).toString()
: ''}`
      }
      return prev
    }, {})
  })
}

get PayablesHeaders () {
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
      sortable: false,
      cellClass: dateHighlight
    },
    {
      headerName: this.$t('components.PayablesTable.headers.duedate'),
      field: 'unixDueDate',
      sortable: true,
      filter: 'agDateColumnFilter',
      filterParams: dateFilterParams,
      minWidth: 180,
      cellClass: dateHighlight,
      valueFormatter: this.dateFormatter
    },
    {
      headerName: this.$t('components.PayablesTable.headers.download'),
      field: 'invoiceId',
      cellRenderer: 'DownloadInvoice',
      suppressFiltersToolPanel: true,
      filter: 'FilterModel',
      floatingFilterComponentParams: {
        suppressFilterButton: true
      },
      cellClass: dateHighlight,
      sortable: false
    },
    {
      headerName: this.$t('components.PayablesTable.headers.assignedTo'),
      field: 'invoicePayment.assignedToUser.firstName',
      valueGetter (params: {
          data: {invoicePayment: { assignedToUser: { firstName: string, lastName: string } }}
        }) {
        return (
          params.data.invoicePayment.assignedToUser.firstName +
            ' ' +
            params.data.invoicePayment.assignedToUser.lastName
        )
      },
      valueFormatter: dashDefault,
      cellClass: dateHighlight,
      sortable: false
    },
    {
      headerName: this.$t('components.PayablesTable.headers.contact'),
      field: 'invoicePayment.invoice.supplier.companyName',
      cellRenderer: 'LinkRenderContact',
      cellRendererParams: {
        name: 'supplierDetails',
        goBack: 'payables',
        field1: 'invoicePayment',
        field2: 'invoice',
        field3: 'supplier',
        id: 'id'
        // tab: TTab.Payables
      },
      sortable: false,
      cellClass: dateHighlight,
      valueFormatter: dashDefault
    },
    {
      headerName: this.$t('components.PayablesTable.headers.invoiceNo'),
      field: 'invoicePayment.invoice.invoiceNumber',
      cellRenderer: 'LinkRenderContact',
      cellRendererParams: {
        name: 'invoice',
        goBack: 'payables',
        field1: 'invoicePayment',
        field2: 'invoice',
        id: 'id'
        // tab: TTab.Payables
      },
      // valueFormatter: dashDefault,
      cellClass: dateHighlight,
      sortable: true
    },
    {
      headerName: this.$t('components.PayablesTable.headers.account'),
      field: 'paidFromAccount.name',
      valueFormatter: dashDefault,
      filter: 'agTextColumnFilter',
      filterParams: textFilterParams,
      cellClass: dateHighlight,
      sortable: true
    },
    {
      headerName: this.$t('components.PayablesTable.headers.amount'),
      field: 'amount',
      sortable: true,
      cellClass: dateHighlight,
      valueFormatter: this.currencyFormatter
    },
    {
      headerName: this.$t('components.PayablesTable.headers.currency'),
      field: 'currency.code',
      sortable: true,
      cellClass: dateHighlight,
      valueFormatter: dashDefault
    },
    {
      headerName: this.$t('components.PayablesTable.headers.status'),
      field: 'paymentStatus',
      sortable: true,
      filter: 'FilterModel',
      floatingFilterComponentParams: {
        suppressFilterButton: true
      },
      cellRenderer: 'PayButton',
      cellRendererParams: {
        type: 'costs'
      },
      cellClass: dateHighlight
    },
    {
      headerName: this.$t('components.PayablesTable.headers.paymentTerms'),
      field: 'terms',
      sortable: true,
      cellClass: dateHighlight,
      valueFormatter: dashDefault
    },
    {
      headerName: this.$t(
        'components.PayablesTable.headers.transactionReferenceNumber'
      ),
      field: 'paymentReference',
      sortable: true,
      cellClass: dateHighlight,
      tooltipField: 'paymentReference',
      valueFormatter: dashDefault
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

@Debounce(200)
@Bind()
searchPayables (value: string) {
  if (this.searchPayable !== value) {
    this.searchPayable = value
    this.gridApi.api.setServerSideDatasource(this.dataSourcePayables)
  }
}

async updatePaymentStatus (id: number, action: string) {
  this.updatePaymentStatusId = id
  if (action === 'undo') {
    this.undoConfirmDialogOpen = true
    return false
  }
  const payableSelected = this.payables?.content?.find(payable => payable.id === this.updatePaymentStatusId)
  const paidFromAccount = payableSelected?.paidFromAccount
  this.confirmPaymentData.paidFromAccount = { ...paidFromAccount }
  this.showPaymentConfirmation = true
}

@Task('undoPaymentStatusTask')
async undoPaymentStatus () {
  await this.undoPaymentEntry(this.updatePaymentStatusId)
  this.undoConfirmDialogOpen = false
  await this.initialLoadPayables()
}

@Task('updatePaymentStatusTask')
async confirmPaymentClick () {
  const { confirmation, ...data } = this.confirmPaymentData
  if (confirmation) {
    const payableSelected = this.payables?.content?.find(payable => payable.id === this.updatePaymentStatusId)
    const email = payableSelected?.invoicePayment?.invoice?.supplier?.email
    this.confirmPaymentData.confirmationEmailToAddresses = []
    this.confirmPaymentData.confirmationEmailToAddresses.push((email ?? ''))
    this.confirmPaymentData.confirmationEmailCCAddresses = []
    this.confirmPaymentData.confirmationEmailCCAddresses.push('')

    this.showPaymentConfirmation = false
    this.showEmailConfirmation = true
    return false
  }
  await this.updatePaymentEntry({ invoicePaymentId: this.updatePaymentStatusId, paymentConfirmationDto: data })
  this.showPaymentConfirmation = false
  await this.initialLoadPayables()
}

@Task('confirmPaymentStatusTask')
async confirmPaymentStatus () {
  const { confirmation, ...data } = this.confirmPaymentData
  if (confirmation) {
    await this.updatePaymentEntry({ invoicePaymentId: this.updatePaymentStatusId, paymentConfirmationDto: data })
    this.showEmailConfirmation = false
    await this.initialLoadPayables()
  }
}

@Task('syncAccountCodesTask')
async syncAccountCodes () {
  await this.syncAccountCodesFromXero()
}
}
</script>

<style lang="scss">
.row-highlight {
  background-color: #2195f34e;
}
</style>
