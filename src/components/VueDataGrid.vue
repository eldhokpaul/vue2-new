<template>
  <ag-grid-vue
    style="width: 100%; flex: 1;"
    :class="$vuetify.theme.dark?'ag-theme-alpine-dark':'ag-theme-alpine'"
    v-bind="agGridProps"
    :get-row-id="getRowId"
    :suppress-multi-range-selection="true"
    :detail-cell-renderer="detailCellRenderer"
    :animate-rows="true"
    :enable-cell-change-flash="true"
    :suppress-row-click-selection="true"
    :single-click-edit="true"
    :stop-editing-when-cells-lose-focus="true"
    :suppress-row-deselection="true"
    :get-context-menu-items="getContextMenu"
    @grid-ready="gridReady"
    @selection-changed="onSelectionChanged"
    v-on="$listeners"
  />
  <!-- :get-row-height="getRowHeight" -->
</template>

<script lang="ts">
import {
  ColDef, GridReadyEvent, IRowNode, IServerSideSelectionState, SelectionChangedEvent
} from 'ag-grid-community'
import { AgGridVue } from 'ag-grid-vue'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import SimpleLinkRender from '@/components/table-components/SimpleLinkRender.vue'
import StatusRender from '@/components/table-components/StatusRender.vue'
import TableSizeSelect from '@/components/table-components/TableSizeSelect.vue'
import TooltipRender from '@/components/table-components/TooltipRender.vue'
import XeroEnabled from '@/components/table-components/XeroEnabled.vue'
import XeroPushButton from '@/components/table-components/XeroPushButton.vue'
import CheckboxRenderCost from '@/modules/costs/components/widgets/CheckboxRenderCost.vue'
import DownloadInvoice from '@/modules/costs/components/widgets/DownloadInvoice.vue'
import LinkRender from '@/modules/costs/components/widgets/LinkRender.vue'
import LinkRenderBills from '@/modules/costs/components/widgets/LinkRenderBills.vue'
import LinkRenderContact from '@/modules/costs/components/widgets/LinkRenderContact.vue'
import PayButton from '@/modules/costs/components/widgets/PayButton.vue'
import ReconciledRender from '@/modules/invoices/components/widgets/ReconciledRender.vue'
import FeeStatusRender from '@/modules/marketplace-accounts/components/Widgets/FeeStatusRender.vue'
import FeeTracker from '@/modules/marketplace-accounts/components/Widgets/FeeTrackerRender.vue'
import TagsRender from '@/modules/orders-shipment/components/TagsRender.vue'
import DatePickerEditor from '@/modules/orders-shipment/modules/orders/components/DatePickerEditor.vue'
import HsCodeEditor from '@/modules/orders-shipment/modules/orders/components/HsCodeEditor.vue'
import OrdersGroupCellRenderer from '@/modules/orders-shipment/modules/orders/components/OrdersGroupCellRenderer.vue'
import OrdersSubGrid from '@/modules/orders-shipment/modules/orders/components/OrdersSubGrid.vue'
import TariffRatesEditor from '@/modules/orders-shipment/modules/orders/components/TariffRatesEditor.vue'
import ShipmentGroupCellRenderer from '@/modules/orders-shipment/modules/shipment-plans/components/ShipmentGroupCellRenderer.vue'
import ShipmentSubGrid from '@/modules/orders-shipment/modules/shipment-plans/components/ShipmentSubGrid.vue'
import ContainsHazardousGoods from '@/modules/orders-shipment/modules/shipment-plans/components/widgets/ContainsHazardousGoods.vue'
import CheckboxRenderProduct from '@/modules/products/components/widgets/CheckboxRenderProduct.vue'
import ActiveRender from '@/modules/user-management/components/widgets/ActiveRender.vue'
import UserCellButtons from '@/modules/user-management/components/widgets/UserCellButtons.vue'
import VerifiedRender from '@/modules/user-management/components/widgets/VerifiedRender.vue'
import { getUniqueId } from '@/utils/uuid'
const namespaces = {
  invoices: 'invoices',
  app: 'app'
}
const textFilterParams = {
  filterOptions: ['contains'],
  debounceMs: 200
}
const statusBar = {
  statusPanels: [{ statusPanel: 'TableSizeSelect' }]
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class FilterModel {
  filterText: null|undefined
  constructor () {
    FilterModel.prototype.__init.call(this)
  }

  __init () {
    this.filterText = null
  }
}
@Component({
  components: {
    AgGridVue,
    StatusRender,
    TooltipRender,
    TableSizeSelect,
    PayButton,
    CheckboxRenderCost,
    LinkRender,
    DownloadInvoice,
    FeeStatusRender,
    LinkRenderBills,
    FeeTracker,
    ReconciledRender,
    CheckboxRenderProduct,
    LinkRenderContact,
    XeroEnabled,
    XeroPushButton,
    SimpleLinkRender,
    ActiveRender,
    VerifiedRender,
    UserCellButtons,
    DatePickerEditor,
    OrdersSubGrid,
    TagsRender,
    HsCodeEditor,
    TariffRatesEditor,
    OrdersGroupCellRenderer,
    ShipmentSubGrid,
    ContainsHazardousGoods,
    ShipmentGroupCellRenderer
  }
})
export default class VueDataGrid extends Vue {
@Action('getDocumentById', { namespace: namespaces.invoices })
getDocumentById!: (invoiceId: number) => any

@Prop({ required: true }) columns!: ColDef[];
@Prop({ default: 15 }) pagination!: number;
@Prop({ default: true }) floatingFilter!: boolean;
@Prop({ default: true }) sideBar!: boolean;
@Prop({ default: true }) rangeSelection!: boolean;
@Prop({ default: false }) masterDetail!: boolean;
@Prop({ default: false }) editable!: boolean;
// eslint-disable-next-line @typescript-eslint/ban-types
@Prop() readonly pageCallback!: Function
@Prop({ default: '' }) readonly detailCellRenderer!: string;
// getRowId = (params: { data: { id: number } }) => params.data.id
getRowId = () => { return getUniqueId() }
get paginationPageSize () {
  return this.pagination
}

set paginationPageSize (value) {
  this.agGridApi.api.setCacheBlockSize(value)
  this.agGridApi.api.paginationSetPageSize(value)
}

// detailCellRenderer = 'OrdersSubGrid'
paginationSize=15
paginationCacheSize=15
context: any
agGridApi!: any;
get agGridProps () {
  return {
    paginationAutoPageSize: false,
    paginationPageSize: this.paginationSize,
    cacheBlockSize: this.paginationCacheSize,
    // detailRowHeight: this.detailRowHeight,
    detailRowAutoHeight: true,
    rowModelType: 'serverSide',
    maxBlocksInCache: 1,
    serverSideInfiniteScroll: true,
    pagination: true,
    multiSortKey: 'ctrl',
    enableRangeSelection: this.rangeSelection,
    enableFillHandle: this.rangeSelection,
    enableCharts: true,
    suppressColumnVirtualisation: true,
    tooltipShowDelay: 0,
    context: this.context,
    statusBar: statusBar,
    masterDetail: !!this.masterDetail,
    rowSelection: 'multiple',
    autoGroupColumnDef: {
      flex: 1,
      minWidth: 300
    },
    columnDefs: this.getHeaders,
    defaultColDef: {
      flex: 1,
      editable: this.editable,
      sortable: false,
      minWidth: 150,
      resizable: true,
      menuTabs: ['generalMenuTab', 'columnsMenuTab'],
      maxWidth: 400,
      allowedAggFuncs: ['sum'],
      floatingFilter: this.floatingFilter,
      filter: 'agTextColumnFilter',
      filterParams: textFilterParams
    },
    sideBar: this.sideBar
      ? {
          toolPanels: [
            {
              id: 'columns',
              labelDefault: 'Columns',
              labelKey: 'columns',
              iconKey: 'columns',
              toolPanel: 'agColumnsToolPanel',
              toolPanelParams: {
                suppressRowGroups: false,
                suppressValues: false,
                suppressPivots: true,
                suppressPivotMode: true
              }
            },
            {
              id: 'filters',
              labelDefault: 'Filters',
              labelKey: 'filters',
              iconKey: 'filter',
              toolPanel: 'agFiltersToolPanel'
            }
          ]
        }
      : false
  }
}

get getHeaders () {
  return this.columns
}

// dynamically assigning detail row height
// getRowHeight = (params: RowHeightParams) => {
//   if (params.node && params.node.detail) {
//     const offset = 80
//     const allDetailRowHeight =
//           params.data.packLists.length *
//           params.api.getSizesForCurrentTheme().rowHeight
//     const gridSizes = params.api.getSizesForCurrentTheme()
//     return (
//       allDetailRowHeight +
//           ((gridSizes && gridSizes.headerHeight) || 0) +
//           offset
//     )
//   }
// }

beforeMount () {
  this.context = { componentParent: this }
}

gridReady (param: GridReadyEvent) {
  this.agGridApi = param
}

onSelectionChanged (GridApi: SelectionChangedEvent) {
  const selectedRows: IServerSideSelectionState = this.agGridApi.api.getServerSideSelectionState()
  const rowNodes: IRowNode[] = []
  GridApi.api.forEachNode((node: IRowNode) => {
    rowNodes.push(node)
  })
  if (selectedRows.selectAll) {
    const selectedItems = rowNodes.map((node: IRowNode) => { return node.data })
    this.$emit('input', selectedItems)
  } else if (selectedRows.toggledNodes.length > 0) {
    const selectedItems: any[] = []
    for (const nodeId of selectedRows.toggledNodes) {
      const rowNode = rowNodes.find((node: IRowNode) => node.id === nodeId)
      if (rowNode) {
        selectedItems.push(rowNode.data)
      }
    }
    this.$emit('input', selectedItems)
  } else {
    this.$emit('input', [])
  }
}

getContextMenu () {
  return ['copy', 'copyWithHeaders', 'separator', 'export', 'chartRange']
}

costExclude (item: any) {
  this.$emit('cost-exclude', item)
}

updatePaymentStatus (id: number, action: string) {
  this.$emit('update:payment-status', id, action)
}

xeroSyncSupplier (supplier: any) {
  this.$emit('update:xero-sync-supplier', supplier)
}

// subGrid Functions
async refreshGrid (orderId: number, nodeId: string) {
  await this.pageCallback(orderId, nodeId)
}

selectionUpdatePacklist () {
  this.$emit('selection-update-packlist')
}
}
</script>
<style lang='scss'>
.ag-row .ag-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-name {
  overflow: visible !important;
}
.cell-center {
  display: grid;
  justify-content: center;

}
.ag-center-cols-clipper {
    min-height: 30px !important;
}
</style>
