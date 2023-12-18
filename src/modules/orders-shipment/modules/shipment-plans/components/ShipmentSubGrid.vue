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
        :class="$vuetify.theme.dark?'ag-theme-alpine-dark':'ag-theme-alpine'"
        v-bind="agGridProps"
        style="width: 100%; flex: 1;"
        row-selection="multiple"
        :get-row-id="getRowId"
        :suppress-row-click-selection="true"
        :animate-rows="true"
        :enable-cell-change-flash="true"
        :row-data="rowData"
        :suppress-row-deselection="true"
        :is-row-selectable="isRowSelectable"
        :get-context-menu-items="getContextMenu"
        @selection-changed="onSelectionChanged"
        @grid-ready="onGridReady"
      />
      <shipment-plan-status-card
        v-if="params && params.data"
        :shipment-plan="params.data"
      />
      <v-divider />
      <v-card-actions>
        <v-btn
          v-t="'pages.shipment.removeFrom'"
          outlined
          text
          color="error"
          :disabled="!selectedPackLists.length"
          :loading="removeFromShipmentPlanTask.isActive"
          @click="deletePackList"
        />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { CheckboxSelectionCallbackParams, DetailGridInfo, GetRowIdParams, GridApi, GridReadyEvent, ICellRenderer, ICellRendererParams, ITooltipParams, SelectionChangedEvent, ValueFormatterParams } from 'ag-grid-community'
import { AgGridVue } from 'ag-grid-vue'
import { Component, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import type { PackList, PackListMultipleDeleteDto } from '@/client/orders'
import type { AccountSettingsDto } from '@/client/users'
import SimpleLinkRender from '@/components/table-components/SimpleLinkRender.vue'
import StatusRender from '@/components/table-components/StatusRender.vue'
import TooltipRender from '@/components/table-components/TooltipRender.vue'
import { Task } from '@/decorators/task'
import { formatCurrency } from '@/utils/currency'
import { dateTimeDifference, formatDate } from '@/utils/date'

import ShipmentPlanStatusCard from './ShipmentPlanStatusCard.vue'

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
    ShipmentPlanStatusCard
  }
})
export default class ShipmentSubGrid extends Vue implements ICellRenderer<PackList> {
@State('accountSettings', { namespace: namespaces.accountSettings })
accountSettings!: AccountSettingsDto;

// @Action('patchPackListForOrderAndUser', { namespace: namespaces.orders })
// patchPackListForOrderAndUser!: (params: {orderId: number, packListId: number, packListPatchPostDto?: PackListPatchPostDto}) => Promise<PackList>;

// @Action('postPackListToOrderForUser', { namespace: namespaces.orders })
// postPackListToOrderForUser!: (params: {orderId: number, packListPatchPostDto?: PackListPatchPostDto}) => Promise<PackList>;

@Action('removePackListsFromTheirShipmentPlans', { namespace: namespaces.orders })
removePackListsFromTheirShipmentPlans!: (packListMultipleDeleteDto?: PackListMultipleDeleteDto) => Promise<void>;

getRowId = (params: GetRowIdParams) => { return params.data.id }
isRowSelectable = (params: any) => { return params.data.packListStatus !== 'IN_TRANSIT' }

dateTimeDifference=dateTimeDifference
gridApi!: GridReadyEvent
rowData: PackList[]=[]
rowId!: string | undefined
masterGridApi!: GridApi
selectedPackLists: PackList[] = [];
params!: ICellRendererParams
disableAddItemFlag=true

onSelectionChanged (GridApi: SelectionChangedEvent) {
  this.selectedPackLists = GridApi.api.getSelectedRows()
  this.params.context.componentParent.selectionUpdatePacklist()
}

// get getPopupParent () {
//   return document.querySelector('#ordersGridContainer')
// }
// @Watch('rowData', { immediate: true, deep: true })
// onChanged (value: PackList[]) {
//   console.log(value)
//   if (!value.length) {
//     this.params.node.setExpanded(false)
//   }
// }

get agGridProps () {
  return {
    pagination: false,
    multiSortKey: 'ctrl',
    suppressColumnVirtualisation: true,
    tooltipShowDelay: 0,
    rowSelection: 'multiple',
    domLayout: 'autoHeight',
    popupParent: document.body,
    tooltipMouseTrack: true,
    autoGroupColumnDef: {
      flex: 1,
      minWidth: 300
    },
    columnDefs: this.columnDefs,
    defaultColDef: {
      flex: 1,
      editable: false,
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
      headerCheckboxSelection: true,
      resizable: false,
      tooltipValueGetter: (params: ITooltipParams) => { return params.data.packListStatus === 'IN_TRANSIT' ? 'This packlist is currently in IN TRANSIT status and cannot be moved to another shipment plan or removed.' : '' },
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
        return params.data.packListStatus === 'IN_TRANSIT'
      }
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
      minWidth: 180,
      valueFormatter: this.dateFormatter
    },
    {
      headerName: this.$t('pages.shipment.vendor'),
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
      headerName: this.$t('pages.shipment.quantityshipped'),
      suppressMenu: true,
      aggFunc: 'sum',
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
      minWidth: 180,
      valueFormatter: this.dateFormatter,
      field: 'unixReadyDate'
    },
    {
      headerName: this.$t('pages.shipment.status'),
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
      valueFormatter: dashDefault,
      field: 'material'
    },
    {
      headerName: this.$t('components.ordersTable.hsCodes'),
      suppressMenu: true,
      cellRenderer: 'TagsRender',
      cellEditor: 'HsCodeEditor',
      field: 'hsCodes'
    },
    {
      headerName: this.$t('components.ordersTable.tariffRates'),
      suppressMenu: true,
      cellRenderer: 'TagsRender',
      cellEditor: 'TariffRatesEditor',
      field: 'tariffRates'
    },
    {
      headerName: this.$t('components.ordersTable.packageLength'),
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
      valueFormatter: this.dateFormatter
    },
    {
      headerName: this.$t('components.ordersTable.deliveryDate'),
      field: 'unixDeliveryDate',
      cellEditor: 'DatePickerEditor',
      suppressMenu: true,
      minWidth: 180,
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
      headerName: this.$t('components.ordersTable.shipmentPlan'),
      editable: false,
      suppressMenu: true,
      valueFormatter: dashDefault,
      field: 'shipmentPlanNumber'
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
  return true
}

@Task('removeFromShipmentPlanTask')
async deletePackList () {
  const packListArray: number[] = this.selectedPackLists.map((item: PackList) => item.id ?? 0)
  const packListIds: PackListMultipleDeleteDto = { packListIds: packListArray }
  await this.removePackListsFromTheirShipmentPlans(packListIds)
  this.gridApi.api.applyTransaction({ remove: this.selectedPackLists })
  this.selectedPackLists = []
  this.refreshGrid()
}

// async updatePackList (event: CellValueChangedEvent) {
//   const updatedPackList: PackListPatchPostDto = {
//     [event.colDef.field as string]: event.newValue
//   }
//   this.patchPackListForOrderAndUser({ orderId: this.params.data.id as number, packListId: event.data.id, packListPatchPostDto: updatedPackList }).then((res) => {
//     // const packList = res.packLists?.find((item: PackList) => item.id === event.node.data.id)
//     const rowNode = event.node
//     rowNode.updateData(res)
//     this.refreshGrid()
//   }).catch(() => {
//     this.gridApi.api.undoCellEditing()
//   })
// }

async refreshGrid () {
  await this.params.context.componentParent.refreshGrid(this.params.data.id, this.params.node.parent?.id)
  this.gridApi.columnApi.autoSizeAllColumns()
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
  setTimeout(() => {
    this.gridApi.columnApi.autoSizeAllColumns()
  }, 1)
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

getContextMenu () {
  return ['copy', 'copyWithHeaders', 'separator', 'export']
}
}
</script>
<style lang="scss">
.ag-center-cols-clipper {
    min-height: unset !important;
}
</style>
