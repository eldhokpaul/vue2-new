<template>
  <v-container
    fluid
    style="display: flex; flex-direction: column;"
    class="pa-2"
  >
    <v-card
      tile
    >
      <ag-grid-vue
        v-bind="agGridProps"
        row-selection="multiple"
        :class="$vuetify.theme.dark?'ag-theme-alpine-dark':'ag-theme-alpine'"
        :get-row-id="getRowId"
        :suppress-row-click-selection="true"
        :single-click-edit="true"
        :animate-rows="true"
        :enable-cell-change-flash="true"
        :stop-editing-when-cells-lose-focus="true"
        :row-data="rowData"
        :get-row-class="getRowClass"
        :suppress-row-deselection="true"
        :is-row-selectable="isRowSelectable"
        :get-context-menu-items="getContextMenu"
        :popup-parent="getPopupParent"
        @selection-changed="onSelectionChanged"
        @rowDataUpdated="disableAddItem"
        @grid-ready="onGridReady"
        @cell-value-changed="updatePackList"
      />
      <v-card-actions>
        <v-btn
          v-t="'components.ordersTable.delete'"
          outlined
          text
          color="error"
          :disabled="!selectedPackLists.length"
          @click="deletePackList"
        />
        <v-btn
          v-t="'components.ordersTable.addItem'"
          outlined
          text
          color="primary"
          :disabled="disableAddItemFlag"
          @click="addItem"
        />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { CellValueChangedEvent, CheckboxSelectionCallbackParams, DetailGridInfo, EditableCallbackParams, GetRowIdParams, GridApi, GridReadyEvent, ICellRenderer, ICellRendererParams, ITooltipParams, RowClassParams, SelectionChangedEvent, ValueFormatterParams } from 'ag-grid-community'
import { AgGridVue } from 'ag-grid-vue'
import { Component, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import type { PackList, PackListMultipleDeleteDto, PackListPatchPostDto } from '@/client/orders'
import type { AccountSettingsDto } from '@/client/users'
import SimpleLinkRender from '@/components/table-components/SimpleLinkRender.vue'
import StatusRender from '@/components/table-components/StatusRender.vue'
import TooltipRender from '@/components/table-components/TooltipRender.vue'
import { formatCurrency } from '@/utils/currency'
import { dateTimeDifference, formatDate } from '@/utils/date'

import DatePickerEditor from './DatePickerEditor.vue'
import HsCodeEditor from './HsCodeEditor.vue'
import TariffRatesEditor from './TariffRatesEditor.vue'

const textFilterParams = {
  filterOptions: ['contains'],
  suppressAndOrCondition: true,
  debounceMs: 200
}
const dashDefault = (params: any) => {
  if (!params.value) return '-'
  return params.value
}
const namespaces = {
  accountSettings: 'accountSettings',
  orders: 'orders'
}
@Component({
  components: {
    AgGridVue,
    StatusRender,
    TooltipRender,
    SimpleLinkRender,
    DatePickerEditor,
    HsCodeEditor,
    TariffRatesEditor
  }
})
export default class OrdersSubGrid extends Vue implements ICellRenderer<PackList> {
@State('accountSettings', { namespace: namespaces.accountSettings })
accountSettings!: AccountSettingsDto;

@Action('patchPackListForOrderAndUser', { namespace: namespaces.orders })
patchPackListForOrderAndUser!: (params: {orderId: number, packListId: number, packListPatchPostDto?: PackListPatchPostDto}) => Promise<PackList>;

@Action('postPackListToOrderForUser', { namespace: namespaces.orders })
postPackListToOrderForUser!: (params: {orderId: number, packListPatchPostDto?: PackListPatchPostDto}) => Promise<PackList>;

@Action('deleteMultiplePackListsForOrderAndUser', { namespace: namespaces.orders })
deleteMultiplePackListsForOrderAndUser!: (params: {orderId: number, packListMultipleDeleteDto?: PackListMultipleDeleteDto}) => Promise<void>;

dateTimeDifference=dateTimeDifference
gridApi!: GridReadyEvent
rowData: PackList[]=[]
rowId!: string | undefined
masterGridApi!: GridApi
selectedPackLists: PackList[] = [];
params!: ICellRendererParams
disableAddItemFlag=true
overlayNoRowsTemplate = '<span style="padding: 5px; border: 2px solid #444; background: lightgoldenrodyellow;">There is \'no picklist\' to show for this order</span>';
getRowId = (params: GetRowIdParams) => { return params.data.id }
getRowClass = (params: RowClassParams) => { return params.data.shipmentPlanNumber ? 'row-highlight-shipment' : '' }
getEditableColumns = (params: EditableCallbackParams) => { return !params.data.shipmentPlanNumber }
isRowSelectable = (params: any) => { return !params.data.shipmentPlanId }
onSelectionChanged (GridApi: SelectionChangedEvent) {
  this.selectedPackLists = GridApi.api.getSelectedRows()
  this.params.context.componentParent.selectionUpdatePacklist()
}

get getPopupParent () {
  return document.querySelector('#ordersGridContainer')
}

get agGridProps () {
  return {
    pagination: false,
    multiSortKey: 'ctrl',
    suppressColumnVirtualisation: true,
    tooltipShowDelay: 0,
    rowSelection: 'multiple',
    tooltipMouseTrack: true,
    domLayout: 'autoHeight',
    popupParent: document.body,
    overlayNoRowsTemplate: this.overlayNoRowsTemplate,
    autoGroupColumnDef: {
      flex: 1,
      minWidth: 300
    },
    columnDefs: this.columnDefs,
    defaultColDef: {
      flex: 1,
      editable: true,
      sortable: true,
      minWidth: 150,
      resizable: true,
      menuTabs: ['generalMenuTab', 'columnsMenuTab'],
      maxWidth: 400,
      filter: 'agTextColumnFilter',
      filterParams: textFilterParams
    },
    sideBar: false
  }
}

get columnDefs () {
  return [
    {
      headerName: '',
      field: '',
      // headerComponent: 'SelectAllCheckbox',
      // headerComponentParams: { headerName: 'Export' },
      tooltipValueGetter: (params: ITooltipParams) => { return params.data.shipmentPlanId ? 'This packlist is part of a Shipment plan and cannot be moved or deleted, Please remove it from the Shipment plan before making any changes.' : '' },
      headerCheckboxSelection: true,
      resizable: false,
      editable: false,
      filter: false,
      chartDataType: 'excluded',
      maxWidth: 60,
      suppressColumnsToolPanel: true,
      pinned: 'left',
      lockPinned: true,
      minWidth: 95,
      suppressMovable: true,
      checkboxSelection: () => true,
      showDisabledCheckboxes: (params: CheckboxSelectionCallbackParams) => {
        if (params.data.shipmentPlanId) {
          return true
        } else return false
      }
    },
    {
      headerName: this.$t('components.ordersTable.shipmentPlan'),
      editable: false,
      pinned: 'left',
      suppressMovable: true,
      suppressMenu: true,
      valueFormatter: dashDefault,
      field: 'shipmentPlanNumber'
    },
    {
      headerName: this.$t('components.ordersTable.item'),
      valueFormatter: dashDefault,
      suppressColumnsToolPanel: true,
      editable: false,
      suppressMovable: true,
      suppressMenu: true,
      pinned: 'left',
      lockPinned: true,
      field: 'productName',
      cellRenderer: 'SimpleLinkRender',
      cellRendererParams: {
        name: 'productDetails',
        goBack: 'orders',
        field: 'productSku',
        id: 'sku'
      }

    },
    {
      headerName: this.$t('components.ordersTable.orderDate'),
      field: 'unixOrderDate',
      suppressColumnsToolPanel: true,
      cellEditor: 'DatePickerEditor',
      suppressMenu: true,
      editable: this.getEditableColumns,
      minWidth: 180,
      valueFormatter: this.dateFormatter
    },
    {
      headerName: 'Vendor',
      valueFormatter: dashDefault,
      editable: false,
      suppressMenu: true,
      tooltipField: 'supplierCompanyName',
      field: 'supplierCompanyName',
      cellRenderer: 'SimpleLinkRender',
      cellRendererParams: {
        name: 'supplierDetails',
        goBack: 'orders',
        field: 'supplierId',
        id: 'id'
      }
    },
    {
      headerName: this.$t('components.ordersTable.invoiceNumber'),
      suppressMenu: true,
      editable: false,
      valueFormatter: dashDefault,
      field: 'invoiceNumber',
      cellRenderer: 'SimpleLinkRender',
      cellRendererParams: {
        name: 'invoice',
        goBack: 'orders',
        field: 'invoiceId',
        id: 'id'
      }
    },
    {
      headerName: this.$t('components.ordersTable.poNumber'),
      suppressMenu: true,
      editable: false,
      valueFormatter: dashDefault,
      field: 'poNumber'
    },
    {
      headerName: 'Quantity Shipped',
      suppressMenu: true,
      editable: this.getEditableColumns,
      valueFormatter: (params:ValueFormatterParams) => (params.value ? params.value.toLocaleString() : '-'),
      aggFunc: 'sum',
      cellClass: this.disableAddItemFlag ? 'row-highlight-match' : 'row-highlight-mismatch',
      field: 'orderQuantity'
    },
    {
      headerName: this.$t('components.ordersTable.unitPrice'),
      suppressMenu: true,
      editable: false,
      valueFormatter: this.currencyFormatter,
      field: 'perUnitCost'
    },
    {
      headerName: this.$t('components.ordersTable.unitsPerCase'),
      valueFormatter: dashDefault,
      editable: this.getEditableColumns,
      suppressMenu: true,
      field: 'unitsPerCase'
    },
    {
      headerName: this.$t('components.ordersTable.totalCases'),
      suppressMenu: true,
      editable: false,
      valueFormatter: dashDefault,
      field: 'totalCases'
    },
    {
      headerName: this.$t('components.ordersTable.ShippedCost'),
      suppressMenu: true,
      editable: false,
      valueFormatter: this.currencyFormatter,
      field: 'factoryCost'
    },
    {
      headerName: this.$t('components.ordersTable.readyDate'),
      suppressMenu: true,
      cellEditor: 'DatePickerEditor',
      editable: this.getEditableColumns,
      minWidth: 180,
      valueFormatter: this.dateFormatter,
      field: 'unixReadyDate'
    },
    {
      headerName: this.$t('components.ordersTable.status'),
      valueFormatter: dashDefault,
      editable: false,
      sortable: true,
      field: 'packListStatus',
      cellRenderer: 'StatusRender',
      cellRendererParams: {
        type: 'shipment'
      }
    },
    {
      headerName: this.$t('components.ordersTable.payRef'),
      suppressMenu: true,
      editable: false,
      valueFormatter: dashDefault,
      field: 'paymentReference'
    },
    {
      headerName: this.$t('components.ordersTable.material'),
      suppressMenu: true,
      editable: this.getEditableColumns,
      valueFormatter: dashDefault,
      field: 'material'
    },
    {
      headerName: this.$t('components.ordersTable.hsCodes'),
      editable: this.getEditableColumns,
      suppressMenu: true,
      cellRenderer: 'TagsRender',
      cellEditor: 'HsCodeEditor',
      field: 'hsCodes'
    },
    {
      headerName: this.$t('components.ordersTable.tariffRates'),
      suppressMenu: true,
      editable: this.getEditableColumns,
      cellRenderer: 'TagsRender',
      cellEditor: 'TariffRatesEditor',
      field: 'tariffRates'
    },
    {
      headerName: this.$t('components.ordersTable.packageLength'),
      editable: this.getEditableColumns,
      suppressMenu: true,
      valueFormatter: (params: ValueFormatterParams) => {
        if (params.value) {
          return params.value + (params.data.packagingLongestSideDimensionUnit ? params.data.packagingLongestSideDimensionUnit.toLowerCase() : '')
        }
        return '-'
      },
      field: 'packagingLongestSideDimension'
    },
    {
      headerName: this.$t('components.ordersTable.packageWidth'),
      editable: this.getEditableColumns,
      suppressMenu: true,
      valueFormatter: (params: ValueFormatterParams) => {
        if (params.value) {
          return params.value + (params.data.packagingMedianSideDimensionUnit ? params.data.packagingMedianSideDimensionUnit.toLowerCase() : '')
        }
        return '-'
      },
      field: 'packagingMedianSideDimension'
    },
    {
      headerName: this.$t('components.ordersTable.packageHeight'),
      editable: this.getEditableColumns,
      suppressMenu: true,
      valueFormatter: (params: ValueFormatterParams) => {
        if (params.value) {
          return params.value + (params.data.packagingShortSideDimensionUnit ? params.data.packagingShortSideDimensionUnit.toLowerCase() : '')
        }
        return '-'
      },
      field: 'packagingShortSideDimension'
    },
    {
      headerName: this.$t('components.ordersTable.unitWeight'),
      valueFormatter: (params: ValueFormatterParams) => {
        if (params.value) {
          return params.value + (params.data.packagingUnitWeightUnit ? params.data.packagingUnitWeightUnit.toLowerCase() : '')
        }
        return '-'
      },
      suppressMenu: true,
      editable: this.getEditableColumns,
      field: 'packagingUnitWeight'
    },
    {
      headerName: this.$t('components.ordersTable.caseLength'),
      suppressMenu: true,
      valueFormatter: (params: ValueFormatterParams) => {
        if (params.value) {
          return params.value + (params.data.caseLongestSideDimensionUnit ? params.data.caseLongestSideDimensionUnit.toLowerCase() : '')
        }
        return '-'
      },
      editable: this.getEditableColumns,
      field: 'caseLongestSideDimension'
    },
    {
      headerName: this.$t('components.ordersTable.caseWidth'),
      valueFormatter: (params: ValueFormatterParams) => {
        if (params.value) {
          return params.value + (params.data.caseMedianSideDimensionUnit ? params.data.caseMedianSideDimensionUnit.toLowerCase() : '')
        }
        return '-'
      },
      suppressMenu: true,
      editable: this.getEditableColumns,
      field: 'caseMedianSideDimension'
    },
    {
      headerName: this.$t('components.ordersTable.caseHeight'),
      suppressMenu: true,
      valueFormatter: (params: ValueFormatterParams) => {
        if (params.value) {
          return params.value + (params.data.caseShortSideDimensionUnit ? params.data.caseShortSideDimensionUnit.toLowerCase() : '')
        }
        return '-'
      },
      editable: this.getEditableColumns,
      field: 'caseShortSideDimension'
    },
    {
      headerName: this.$t('components.ordersTable.gwPerCase'),
      suppressMenu: true,
      valueFormatter: (params: ValueFormatterParams) => {
        if (params.value) {
          return params.value + (params.data.caseGrossWeightUnit ? params.data.caseGrossWeightUnit.toLowerCase() : '')
        }
        return '-'
      },
      editable: this.getEditableColumns,
      field: 'caseGrossWeight'
    },
    {
      headerName: this.$t('components.ordersTable.cbm'),
      valueFormatter: dashDefault,
      editable: false,
      suppressMenu: true,
      field: 'cubicMetres'
    },
    {
      headerName: this.$t('components.ordersTable.totalGrossWeight'),
      valueFormatter: (params: ValueFormatterParams) => {
        if (params.value) {
          return params.value + (params.data.totalGrossWeightUnit ? params.data.totalGrossWeightUnit.toLowerCase() : '')
        }
        return '-'
      },
      editable: false,
      suppressMenu: true,
      field: 'totalGrossWeight'
    },
    {
      headerName: this.$t('components.ordersTable.shipDate'),
      field: 'unixShipDate',
      cellEditor: 'DatePickerEditor',
      suppressMenu: true,
      minWidth: 180,
      editable: this.getEditableColumns,
      valueFormatter: this.dateFormatter
    },
    {
      headerName: this.$t('components.ordersTable.deliveryDate'),
      field: 'unixDeliveryDate',
      cellEditor: 'DatePickerEditor',
      suppressMenu: true,
      minWidth: 180,
      editable: this.getEditableColumns,
      valueFormatter: this.dateFormatter
    },
    {
      headerName: this.$t('components.ordersTable.productionTimeline'),
      valueFormatter: dashDefault,
      editable: false,
      sortable: true,
      field: 'productionTimeline'
    },
    {
      headerName: this.$t('components.ordersTable.shipTime'),
      valueFormatter: dashDefault,
      editable: false,
      suppressMenu: true,
      field: 'shippingTimeline'
    },
    {
      headerName: this.$t('components.ordersTable.totalLeadTime'),
      valueFormatter: dashDefault,
      editable: false,
      suppressMenu: true,
      field: 'totalLeadTimeline'
    },
    {
      headerName: this.$t('components.ordersTable.lastUpdated'),
      minWidth: 180,
      editable: false,
      suppressMenu: true,
      valueFormatter: this.dateTimeDiffFormatter,
      field: 'unixLastUpdatedDate'
    }
  ]
}

dateTimeDiffFormatter (params: ValueFormatterParams) {
  if (params.value) {
    return dateTimeDifference(params.value)
  } else {
    return '-'
  }
}

// refresh (params: ICellRendererParams): boolean {
refresh (): boolean {
  // Implement the refresh logic here
  // Return true if the refresh was successful, false otherwise
  return false
}

disableAddItem () {
  if (this.gridApi) {
    const rows = this.gridApi.api.getRenderedNodes()
    const totalItemShipped = rows.reduce((sum: number, item: any) => {
      if (item.data.orderQuantity !== undefined) {
        return sum + Number(item.data.orderQuantity)
      }
      return sum
    }, 0)
    const allRowsHaveShipmentPlan = rows.every((row: any) => !!row.data.shipmentPlanNumber)
    this.disableAddItemFlag = totalItemShipped >= this.params.data.orderQuantity || allRowsHaveShipmentPlan
  }
}

async addItem () {
  const newpackList: PackList = await this.postPackListToOrderForUser({ orderId: this.params.data.id as number, packListPatchPostDto: {} })
  if (newpackList) {
    this.gridApi.api.applyTransaction({
      add: [newpackList],
      addIndex: 0
    })
    this.refreshGrid()
  }
}

async deletePackList () {
  const packListArray: number[] = this.selectedPackLists.map((item: PackList) => item.id ?? 0)
  const packListIds: PackListMultipleDeleteDto = { packListIds: packListArray }
  await this.deleteMultiplePackListsForOrderAndUser({ orderId: this.params.data.id, packListMultipleDeleteDto: packListIds })
  this.gridApi.api.applyTransaction({ remove: this.selectedPackLists })
  this.selectedPackLists = []
  this.refreshGrid()
}

async updatePackList (event: CellValueChangedEvent) {
  const updatedPackList: PackListPatchPostDto = {
    [event.colDef.field as string]: event.newValue
  }
  this.patchPackListForOrderAndUser({ orderId: this.params.data.id as number, packListId: event.data.id, packListPatchPostDto: updatedPackList }).then((res) => {
    // const packList = res.packLists?.find((item: PackList) => item.id === event.node.data.id)
    const rowNode = event.node
    rowNode.updateData(res)
    this.refreshGrid()
  }).catch(() => {
    this.gridApi.api.undoCellEditing()
  })
}

async refreshGrid () {
  await this.params.context.componentParent.refreshGrid(this.params.data.id, this.params.node.parent?.id)
  this.gridApi.columnApi.autoSizeAllColumns()
  this.disableAddItem()
}

mounted () {
  this.rowData = this.params.data.packLists
  this.rowId = this.params.data.id
  this.masterGridApi = this.params.api
}

async beforeDestroy () {
  if (this.rowId) {
    this.masterGridApi.removeDetailGridInfo(this.rowId)
    this.params.context.componentParent.selectionUpdatePacklist()
  }
}

onGridReady (params: GridReadyEvent) {
  this.gridApi = params
  const gridInfo: DetailGridInfo = {
    id: this.rowId ?? '',
    api: params.api,
    columnApi: params.columnApi
  }
  if (this.rowId) {
    this.masterGridApi.addDetailGridInfo(this.rowId, gridInfo)
  }
  this.disableAddItem()
  setTimeout(() => {
    this.gridApi.columnApi.autoSizeAllColumns()
  }, 1)
}

dateFormatter (params: any) {
  if (params.value) { return formatDate(Number(params.value)) } else {
    return '-'
  }
}

currencyFormatter (params: any) {
  if (this.accountSettings && params.value) {
    return formatCurrency(this.accountSettings?.currency?.currencySymbol, params.value)
  } else { return '-' }
}

getContextMenu () {
  return ['copy', 'copyWithHeaders', 'separator', 'export']
}
}
</script>
<style lang="scss">
.row-highlight-match {
  background-color: #41ec4a4e;
}
.row-highlight-mismatch {
  background-color: lightpink;
}
.row-highlight-shipment {
  // background-color: #F1F1F1;;
  background-color: #ffffff25;
   opacity: 0.6;
}
</style>
