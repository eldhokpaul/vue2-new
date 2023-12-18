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
          class="ms-3 mr-1"
        >
          <v-text-field
            label="Search"
            outlined
            dense
            hide-details
            prepend-inner-icon="mdi-magnify"
            clearable
            @input="searchFunction"
          />
        </v-card>
      </template>
      <template #controls>
        <app-table-controls
          class="d-none d-sm-flex"
          :selected-items="formattedOrders"
          :export-worksheet-name="exportWorksheetName"
          :export-file-name="exportName"
          :headers="allHeadersOrder"
          :show-filter="true"
          :show-columns="true"
          :view-saved-filter="viewSavedFilter"
          :view-saved-column="viewSavedColumn"
          :show-graph="false"
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
      <template #buttons>
        <v-chip
          label
          outlined
          class="mx-2 marketplace-indicator text-uppercase d-none d-md-flex"
        >
          Archived Orders
          <v-switch
            inset
            class="ml-3 mr-n4"
            dense
            color="primary"
            hide-details
            @change="val => filterProducts(val)"
          />
        </v-chip>
      </template>
    </page-header>
    <v-divider />
    <orders-stats-card
      v-if="orders"
      class="d-none d-sm-flex"
      :orders="orders"
    />
    <ag-grid-table
      id="ordersGridContainer"
      key="orders-table"
      v-model="selectedOrders"
      detail-cell-renderer="OrdersSubGrid"
      :columns="allHeadersOrder"
      :master-detail="true"
      :pagination="rowPerPage"
      :range-selection="false"
      :editable="true"
      :page-callback="updateOrderBasedPacklist"
      @range-selection-changed="chartsSelected"
      @grid-ready="initialFunction"
      @cell-value-changed="updateOrderReq"
      @selection-update-packlist="subItemSelection"
    />
    <move-to-shipment-plan-pop-up
      v-if="selectedPackLists && selectedPackLists.length"
      :loading="moveShipmentPlanTask.isActive"
      :packlist="selectedPackLists"
      @update:move-to-shipment="moveToShipmentPlan"
      @close:remove-packlists="removeSelectedPacklists"
    />
  </v-container>
</template>

<script lang="ts">
import {
  CellRange,
  CellValueChangedEvent,
  ColumnVO,
  CreateRangeChartParams,
  EditableCallbackParams,
  GridReadyEvent,
  IServerSideGetRowsParams,
  ValueFormatterParams
} from 'ag-grid-community'
import get from 'lodash.get'
import chain from 'lodash/chain'
import find from 'lodash/find'
import isEmpty from 'lodash/isEmpty'
import set from 'lodash/set'
import sumBy from 'lodash/sumBy'
import { Bind, Debounce } from 'lodash-decorators'
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'

import type {
  Order,
  OrderPatchPostDto,
  OrdersListDto,
  PackList,
  Pageable,
  ShipmentPlanPackListsDto
} from '@/client/orders'
import AppTableControls from '@/components/AppTableControls.vue'
import PageHeader from '@/components/PageHeader.vue'
import AgGridTable from '@/components/VueDataGrid.vue'
import { Task } from '@/decorators/task'
import type{ ObjectKeyAsAny } from '@/types/app'
import { formatCurrency } from '@/utils/currency'
import { dateTimeDifference, formatDate } from '@/utils/date'

import MoveToShipmentPlanPopUp from '../../../components/MoveToShipmentPlan.vue'
import OrdersStatsCard from '../components/OrdersStatsCard.vue'

const dashDefault = (params: any) => {
  if (!params.value) return '-'
  return params.value
}
const dateFilterParams = {
  filterOptions: ['lessThanOrEqual', 'greaterThanOrEqual'],
  debounceMs: 200,
  suppressAndOrCondition: true
}
const modelFilterParams = {
  suppressFilterButton: true
}
const namespaces = {
  orders: 'orders',
  accountSettings: 'accountSettings',
  grid: 'grid',
  products: 'products',
  user: 'user',
  toasts: 'toasts',
  suppliers: 'suppliers'

}

@Component({
  components: {
    AppTableControls,
    AgGridTable,
    PageHeader,
    OrdersStatsCard,
    MoveToShipmentPlanPopUp
  }
})
export default class Orders extends Vue {
  @Getter('currencySymbol', { namespace: namespaces.accountSettings }) currencySymbol!: string;
  // @Getter('isViewer', { namespace: namespaces.user }) isViewer!: boolean;

  @State('orders', { namespace: namespaces.orders }) orders!: OrdersListDto;
  @State('ordersState', { namespace: namespaces.grid }) ordersState?: any;
  @State('weightUnits', { namespace: namespaces.products }) weightUnits!: ObjectKeyAsAny
  @State('dimensionUnits', { namespace: namespaces.products }) dimensionUnits!: ObjectKeyAsAny

  @Action('fetchOrdersForUser', { namespace: namespaces.orders }) fetchOrdersForUser!: (opts: Pageable & { sort?: Array<any>, search?: string, orderStatuses?: string }) => Promise<void>;
  @Action('getOrdersState', { namespace: namespaces.grid }) getOrdersState!: (ordersState: any) => void;
  @Action('patchOrderForUser', { namespace: namespaces.orders }) patchOrderForUser!: (params: { orderId: number, orderPatchPostDto?: OrderPatchPostDto }) => Promise<Order>;
  @Action('fetchShipmentPlanSummaries', { namespace: namespaces.orders }) fetchShipmentPlanSummaries!: () => Promise<void>;
  @Action('fetchOrderByIdForUser', { namespace: namespaces.orders }) fetchOrderByIdForUser!: (params: { orderId: number }) => Promise<Order>;
  @Action('setShipmentPlanPackListsForUser', { namespace: namespaces.orders }) setShipmentPlanPackListsForUser!: (shipmentPlanPackLists: ShipmentPlanPackListsDto) => Promise<void>;
  @Action('addError', { namespace: namespaces.toasts }) addError!: (text: string) => Promise<any>
  @Action('getDimensionUnit', { namespace: namespaces.products }) getDimensionUnit!: () => Promise<void>;
  @Action('getWeightUnit', { namespace: namespaces.products }) getWeightUnit!: () => Promise<void>;

  formatCurrency = formatCurrency;
  dateTimeDifference = dateTimeDifference;

  search = '';
  rowPerPage = 15;

  // ordersHeaders = [...this.allHeadersOrder];
  selectedOrders: Order[] = [];
  agApi!: GridReadyEvent;
  cellRanges: CellRange[] = [];
  selectedPackLists: Array<number> = [];
  showArchivedOrders = false

  async beforeMount () {
    const calls = [
      this.dimensionUnits ? null : this.getDimensionUnit(),
      this.weightUnits ? null : this.getWeightUnit()
    ]
    await Promise.all(calls)
    await this.fetchShipmentPlanSummaries()
  }

  async filterProducts (val: boolean) {
    this.showArchivedOrders = val
    await this.initialLoadOrders()
  }

  get dimensionUnitValues () {
    if (!this.dimensionUnits) return []
    // return Object.values(this.dimensionUnits)
    return Object.keys(this.dimensionUnits).map(key => {
      return key
    })
  }

  get weightUnitValues () {
    if (!this.weightUnits) return []
    // return Object.values(this.weightUnits)
    return Object.keys(this.weightUnits).map(key => {
      return key
    })
  }

  subItemSelection () {
    this.selectedPackLists = []
    this.agApi.api.forEachDetailGridInfo(detailGridInfo => {
      if (detailGridInfo !== undefined) {
        const selectedRows = detailGridInfo?.api?.getSelectedRows() as PackList[]
        const packListIds: Array<number> = selectedRows.map(
          (item: PackList) => item.id as number
        )
        this.selectedPackLists.push(...packListIds)
      }
    })
  }

  @Task('moveShipmentPlanTask')
  async moveToShipmentPlan (shipmentPlanPackLists: ShipmentPlanPackListsDto) {
    try {
      await this.setShipmentPlanPackListsForUser(shipmentPlanPackLists as ShipmentPlanPackListsDto)
      await this.fetchShipmentPlanSummaries()
      await this.removeSelectedPacklists()
    } catch (error) {
      await this.addError(this.$t('pages.errors.422.description') as string)
    }
  }

  async removeSelectedPacklists () {
    this.selectedPackLists = []
    await this.initialLoadOrders()
    // setTimeout(() => {
    //   this.agApi.api.forEachNode(node => {
    //     node.setExpanded(false)
    //   })
    // }, 0)
  }

  async initialFunction (param: GridReadyEvent) {
    this.agApi = param
    await this.initialLoadOrders()
  }

  async initialLoadOrders () {
    if (this.ordersState.rowPerPage) {
      this.paginationFun(this.ordersState.rowPerPage)
    } else {
      this.paginationFun(15)
    }
    this.agApi.api.setServerSideDatasource(this.dataSourceOrders)
    this.restoreOrdersView()
  }

  async paginationFun (val: number) {
    this.rowPerPage = val
    this.agApi.api.setCacheBlockSize(val)
    this.agApi.api.paginationSetPageSize(val)
  }

  get allHeadersOrder () {
    return [
      {
        headerName: '',
        field: '',
        headerTooltip:
          'Hold the shift key to select all the rows between two check-boxes',
        headerCheckboxSelection: true,
        resizable: false,
        filter: false,
        editable: false,
        chartDataType: 'excluded',
        maxWidth: 60,
        pinned: 'left',
        lockPinned: true,
        suppressColumnsToolPanel: true,
        minWidth: 95,
        suppressMovable: true,
        checkboxSelection: true,
        showDisabledCheckboxes: true
      },
      {
        headerName: this.$t('components.ordersTable.item'),
        resizable: false,
        editable: false,
        pinned: 'left',
        lockPinned: true,
        suppressMovable: true,
        sortable: true,
        field: 'productName',
        cellRenderer: 'OrdersGroupCellRenderer'
      },
      {
        headerName: this.$t('components.ordersTable.orderDate'),
        field: 'unixOrderDate',
        sortable: true,
        minWidth: 180,
        filter: 'agDateColumnFilter',
        filterParams: dateFilterParams,
        cellEditor: 'DatePickerEditor',
        valueFormatter: this.dateFormatter,
        editable: this.getEditableColumns
      },
      {
        headerName: this.$t('components.ordersTable.supplier'),
        valueFormatter: dashDefault,
        sortable: true,
        chartDataType: 'category',
        editable: false,
        enableRowGroup: true,
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
        valueFormatter: dashDefault,
        editable: false,
        sortable: true,
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
        valueFormatter: dashDefault,
        sortable: true,
        editable: false,
        field: 'poNumber'
      },
      {
        headerName: this.$t('components.ordersTable.quantityTotal'),
        sortable: true,
        cellClass: (params: {
          data: { packLists: PackList[], orderQuantity: number }
        }) => {
          const totalItemShipped = params.data.packLists.reduce(
            (sum: number, item: any) => {
              return sum + Number(item.orderQuantity)
            },
            0
          )
          return totalItemShipped >= params.data.orderQuantity
            ? 'row-highlight-match'
            : 'row-highlight-mismatch'
        },
        editable: false,
        valueFormatter: (params:ValueFormatterParams) => (params.value ? params.value.toLocaleString() : '-'),
        enableValue: true,
        field: 'orderQuantity'
      },
      {
        headerName: this.$t('components.ordersTable.unitPrice'),
        editable: false,
        sortable: true,
        valueFormatter: this.currencyFormatter,
        field: 'perUnitCost'
      },
      {
        headerName: this.$t('components.ordersTable.unitsPerCase'),
        valueFormatter: dashDefault,
        sortable: true,
        field: 'unitsPerCase',
        editable: this.getEditableColumns
      },
      {
        headerName: this.$t('components.ordersTable.totalCases'),
        valueFormatter: dashDefault,
        sortable: true,
        editable: false,
        field: 'totalCases'
      },
      {
        headerName: this.$t('components.ordersTable.factoryCost'),
        editable: false,
        valueFormatter: this.currencyFormatter,
        sortable: true,
        field: 'factoryCost'
      },
      {
        headerName: this.$t('components.ordersTable.readyDate'),
        sortable: true,
        minWidth: 180,
        cellEditor: 'DatePickerEditor',
        filter: 'agDateColumnFilter',
        filterParams: dateFilterParams,
        valueFormatter: this.dateFormatter,
        field: 'unixReadyDate',
        editable: this.getEditableColumns
      },
      {
        headerName: this.$t('components.ordersTable.orderStatus'),
        valueFormatter: dashDefault,
        editable: false,
        sortable: true,
        chartDataType: 'excluded',
        field: 'orderStatus',
        cellRenderer: 'StatusRender',
        cellRendererParams: {
          type: 'invoice'
        }
      },
      {
        headerName: this.$t('components.ordersTable.payRef'),
        valueFormatter: dashDefault,
        editable: false,
        sortable: true,
        field: 'paymentReference'
      },
      {
        headerName: this.$t('components.ordersTable.material'),
        valueFormatter: dashDefault,
        sortable: true,
        field: 'material',
        editable: this.getEditableColumns
      },
      {
        headerName: this.$t('components.ordersTable.hsCodes'),
        cellRenderer: 'TagsRender',
        cellEditor: 'HsCodeEditor',
        sortable: true,
        field: 'hsCodes',
        editable: this.getEditableColumns
      },
      {
        headerName: this.$t('components.ordersTable.tariffRates'),
        cellRenderer: 'TagsRender',
        cellEditor: 'TariffRatesEditor',
        sortable: true,
        field: 'tariffRates',
        editable: this.getEditableColumns
      },
      {
        headerName: this.$t('components.ordersTable.packageLength'),
        valueFormatter: (params: ValueFormatterParams) => {
          if (params.value) {
            return (
              params.value +
              (params.data.packagingLongestSideDimensionUnit
                ? params.data.packagingLongestSideDimensionUnit.toLowerCase()
                : '')
            )
          }
          return '-'
        },
        field: 'packagingLongestSideDimension',
        editable: this.getEditableColumns
      },
      {
        headerName: this.$t('components.ordersTable.packageWidth'),
        valueFormatter: (params: ValueFormatterParams) => {
          if (params.value) {
            return (
              params.value +
              (params.data.packagingMedianSideDimensionUnit
                ? params.data.packagingMedianSideDimensionUnit.toLowerCase()
                : '')
            )
          }
          return '-'
        },
        field: 'packagingMedianSideDimension',
        editable: this.getEditableColumns
      },
      {
        headerName: this.$t('components.ordersTable.packageHeight'),
        valueFormatter: (params: ValueFormatterParams) => {
          if (params.value) {
            return (
              params.value +
              (params.data.packagingShortSideDimensionUnit
                ? params.data.packagingShortSideDimensionUnit.toLowerCase()
                : '')
            )
          }
          return '-'
        },
        field: 'packagingShortSideDimension',
        editable: this.getEditableColumns
      },
      {
        headerName: this.$t('components.ordersTable.packageLengthUnit'),
        field: 'packagingLongestSideDimensionUnit',
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: { values: this.dimensionUnitValues },
        editable: this.getEditableColumns,
        valueFormatter: (params: ValueFormatterParams) => {
          if (params.value) {
            return params.value.toLowerCase()
          }
          return 'Select Unit'
        }
      },
      {
        headerName: this.$t('components.ordersTable.unitWeight'),
        valueFormatter: (params: ValueFormatterParams) => {
          if (params.value) {
            return (
              params.value +
              (params.data.packagingUnitWeightUnit
                ? params.data.packagingUnitWeightUnit.toLowerCase()
                : '')
            )
          }
          return '-'
        },
        field: 'packagingUnitWeight',
        editable: this.getEditableColumns
      },
      {
        headerName: this.$t('components.ordersTable.packageWeightUnit'),
        field: 'packagingUnitWeightUnit',
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: { values: this.weightUnitValues },
        editable: this.getEditableColumns,
        valueFormatter: (params: ValueFormatterParams) => {
          if (params.value) {
            return params.value.toLowerCase()
          }
          return 'Select Unit'
        }
      },
      {
        headerName: this.$t('components.ordersTable.caseLength'),
        valueFormatter: (params: ValueFormatterParams) => {
          if (params.value) {
            return (
              params.value +
              (params.data.caseLongestSideDimensionUnit
                ? params.data.caseLongestSideDimensionUnit.toLowerCase()
                : '')
            )
          }
          return '-'
        },
        field: 'caseLongestSideDimension',
        editable: this.getEditableColumns
      },
      {
        headerName: this.$t('components.ordersTable.caseWidth'),
        valueFormatter: (params: ValueFormatterParams) => {
          if (params.value) {
            return (
              params.value +
              (params.data.caseMedianSideDimensionUnit
                ? params.data.caseMedianSideDimensionUnit.toLowerCase()
                : '')
            )
          }
          return '-'
        },
        field: 'caseMedianSideDimension',
        editable: this.getEditableColumns
      },
      {
        headerName: this.$t('components.ordersTable.caseHeight'),
        valueFormatter: (params: ValueFormatterParams) => {
          if (params.value) {
            return (
              params.value +
              (params.data.caseShortSideDimensionUnit
                ? params.data.caseShortSideDimensionUnit.toLowerCase()
                : '')
            )
          }
          return '-'
        },
        field: 'caseShortSideDimension',
        editable: this.getEditableColumns
      },
      {
        headerName: this.$t('components.ordersTable.caseLengthUnit'),
        field: 'caseLongestSideDimensionUnit',
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: { values: this.dimensionUnitValues },
        editable: this.getEditableColumns,
        valueFormatter: (params: ValueFormatterParams) => {
          if (params.value) {
            return params.value.toLowerCase()
          }
          return 'Select Unit'
        }
      },
      {
        headerName: this.$t('components.ordersTable.gwPerCase'),
        valueFormatter: (params: ValueFormatterParams) => {
          if (params.value) {
            return (
              params.value +
              (params.data.caseGrossWeightUnit
                ? params.data.caseGrossWeightUnit.toLowerCase()
                : '')
            )
          }
          return '-'
        },
        sortable: true,
        field: 'caseGrossWeight',
        editable: this.getEditableColumns
      },
      {
        headerName: this.$t('components.ordersTable.caseWeightUnit'),
        field: 'caseGrossWeightUnit',
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: { values: this.weightUnitValues },
        editable: this.getEditableColumns,
        valueFormatter: (params: ValueFormatterParams) => {
          if (params.value) {
            return params.value.toLowerCase()
          }
          return 'Select Unit'
        }
      },
      {
        headerName: this.$t('components.ordersTable.cbm'),
        valueFormatter: dashDefault,
        sortable: true,
        editable: false,
        field: 'cubicMetres'
      },
      {
        headerName: this.$t('components.ordersTable.totalGrossWeight'),
        valueFormatter: (params: ValueFormatterParams) => {
          if (params.value) {
            return (
              params.value +
              (params.data.totalGrossWeightUnit
                ? params.data.totalGrossWeightUnit.toLowerCase()
                : '')
            )
          }
          return '-'
        },
        editable: false,
        sortable: true,
        field: 'totalGrossWeight'
      },
      {
        headerName: this.$t('components.ordersTable.shipDate'),
        field: 'unixShipDate',
        sortable: true,
        cellEditor: 'DatePickerEditor',
        minWidth: 180,
        filter: 'agDateColumnFilter',
        filterParams: dateFilterParams,
        valueFormatter: this.dateFormatter,
        editable: this.getEditableColumns
      },
      {
        headerName: this.$t('components.ordersTable.deliveryDate'),
        field: 'unixDeliveryDate',
        sortable: true,
        cellEditor: 'DatePickerEditor',
        minWidth: 180,
        filter: 'agDateColumnFilter',
        filterParams: dateFilterParams,
        valueFormatter: this.dateFormatter,
        editable: this.getEditableColumns
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
        sortable: true,
        field: 'shippingTimeline'
      },
      {
        headerName: this.$t('components.ordersTable.totalLeadTime'),
        valueFormatter: dashDefault,
        editable: false,
        sortable: true,
        field: 'totalLeadTimeline'
      },
      {
        headerName: this.$t('components.ordersTable.lastUpdated'),
        sortable: true,
        minWidth: 180,
        suppressFiltersToolPanel: true,
        filter: 'FilterModel',
        floatingFilterComponentParams: modelFilterParams,
        editable: false,
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

  dateFormatter (params: any) {
    if (params.value) {
      return formatDate(Number(params.value))
    } else {
      return '-'
    }
  }

  get dataSourceOrders () {
    return {
      getRows: async (params: IServerSideGetRowsParams) => {
        const sort = params.request.sortModel || []
        const filterModel = params.request.filterModel || {}
        const pageSize = params.api.paginationGetPageSize()
        const rowGroupCols = params.request.rowGroupCols || []
        const groupKeys = params.request.groupKeys || []
        const valueCols = params.request.valueCols || []
        const page = params.api.paginationGetCurrentPage()
        // this.getOrdersState({ sortModel: sort, filterModel: filterModel, search: this.search })
        try {
          if (this.orders?.orders?.content) {
            if (Object.keys(filterModel).length || rowGroupCols.length) {
              await this.loadFilterAndGrouping(params, this.orders.orders.content, filterModel, rowGroupCols, groupKeys, valueCols)
              return false
            }
          }
          params.api.showLoadingOverlay()
          await this.fetchOrdersForUser({
            pageSize: pageSize,
            pageNumber: page + 1,
            sort: sort,
            search: this.search,
            orderStatuses: this.showArchivedOrders ? 'ARCHIVED' : ''
          })
          if (this.orders.orders?.content?.length) {
            if (Object.keys(filterModel).length || rowGroupCols.length) {
              await this.loadFilterAndGrouping(params, this.orders.orders.content, filterModel, rowGroupCols, groupKeys, valueCols)
              return false
            }
            params.success({
              rowData: this.orders.orders?.content,
              rowCount: this.orders.orders?.totalElements
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

  getEditableColumns (params: EditableCallbackParams) {
    const order = params.data as Order

    if (order.packLists) {
      const packlistsWithoutShipmentPlan = order.packLists.filter(
        (packlist: PackList) => packlist.shipmentPlanNumber === null
      )
      return packlistsWithoutShipmentPlan.length > 0
    }
    return false
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

  async localGroupExpand (filteredList: Array<any>, groupKeys: string[], rowGroupCols: ColumnVO[]): Promise<Array<any> | []> {
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
  searchFunction (value: string) {
    if (this.search !== value) {
      this.search = value
      this.agApi.api.setServerSideDatasource(this.dataSourceOrders)
    }
  }

  currencyFormatter (params: any) {
    if (this.currencySymbol && params.value) {
      return formatCurrency(this.currencySymbol, params.value)
    } else return '-'
  }

  get formattedOrders () {
    return this.selectedOrders.map((order: Order) => {
      return this.allHeadersOrder.reduce((prev: Record<string, any>, cur: any) => {
        if (cur.field !== '') {
          prev[cur.headerName.toString()] = `${
            get(order, cur.field) ? get(order, cur.field).toString() : ''
          }`
        }
        return prev
      }, {})
    })
  }

  get exportName () {
    return `order-export-${new Date().toLocaleDateString()}.csv`
  }

  get exportWorksheetName () {
    return `Order Export${new Date().toLocaleDateString()}`
  }

  // AG-GRID Functionalities -START

  restoreOrdersView () {
    this.agApi.columnApi.applyColumnState({
      state: this.ordersState.colState,
      applyOrder: true
    })
    this.agApi.api.setFilterModel(this.ordersState.filterModel)
  }

  async saveColumnState () {
    const columnState = this.agApi.columnApi.getColumnState()
    this.getOrdersState({
      colState: columnState,
      rowPerPage: this.agApi.api.paginationGetPageSize()
    })
  }

  saveFilterState () {
    const filterState = this.agApi.api.getFilterModel()
    this.getOrdersState({ filterModel: filterState })
  }

  removeFilterState () {
    this.agApi.api.setFilterModel({})
    this.getOrdersState({ filterModel: {} })
  }

  async removeColState () {
    this.agApi.columnApi.resetColumnState()
    this.getOrdersState({ colState: [], rowPerPage: null })
    await this.initialLoadOrders()
  }

  get viewSavedColumn () {
    return isEmpty(this.ordersState.colState)
  }

  get viewSavedFilter () {
    return isEmpty(this.ordersState.filterModel)
  }

  openToolPanel (key: string) {
    if (key === this.agApi.api.getOpenedToolPanel()) {
      this.agApi.api.closeToolPanel()
      return false
    }
    this.agApi.api.openToolPanel(key)
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

  // AG-GRID Functionalities - END
  async updateOrderReq (event: CellValueChangedEvent) {
    switch (event.colDef.field?.toString()) {
      case 'packagingLongestSideDimensionUnit':
        {
          const updatedOrderPatch: OrderPatchPostDto = {
            packagingLongestSideDimensionUnit: event.newValue,
            packagingMedianSideDimensionUnit: event.newValue,
            packagingShortSideDimensionUnit: event.newValue
          }
          await this.updateOrder({ orderId: event.data.id, orderPatchPostDto: updatedOrderPatch }, event)
        }
        break
      case 'caseLongestSideDimensionUnit':
        {
          const updatedOrderPatch: OrderPatchPostDto = {
            caseLongestSideDimensionUnit: event.newValue,
            caseMedianSideDimensionUnit: event.newValue,
            caseShortSideDimensionUnit: event.newValue
          }
          await this.updateOrder({ orderId: event.data.id, orderPatchPostDto: updatedOrderPatch }, event)
        }
        break
      default: {
        const updatedOrderPatch: OrderPatchPostDto = {
          [event.colDef.field as string]: event.newValue
        }
        await this.updateOrder({ orderId: event.data.id, orderPatchPostDto: updatedOrderPatch }, event)
      }
        break
    }
  }

  async updateOrder (req: { orderId: number, orderPatchPostDto: OrderPatchPostDto }, event: CellValueChangedEvent) {
    // switch (key) {
    //   case value:

    //     break

    //   default:

    //     break
    // }

    // const updatedOrderPatch: OrderPatchPostDto = {
    //   [event.colDef.field as string]: event.newValue
    // }
    try {
      const updatedOrder = await this.patchOrderForUser(req)
      this.refreshGrid(event, updatedOrder)
    } catch (error) {
      this.agApi.api.undoCellEditing()
    }
  }

  async updateOrderBasedPacklist (orderId: number, nodeId: string) {
    const newOrder: Order = await this.fetchOrderByIdForUser({ orderId })
    const rowNode = this.agApi.api.getRowNode(nodeId)
    if (newOrder && rowNode) {
      rowNode.updateData(newOrder)
      const params = {
        force: true,
        suppressFlash: true
      }
      // if (!newOrder.packLists?.length) {
      //   rowNode.setExpanded(false)
      // }
      this.agApi.api.refreshCells(params)
    }
  }

  async refreshGrid (event: CellValueChangedEvent, newData: Order) {
    if (newData) {
      const rowNode = event.node
      // const newRecord = { ...newData, packLists: event.node.data.packLists }
      rowNode.updateData({ ...newData })
    }
  }
}
</script>
<style lang="scss" scoped>
.marketplace-indicator {
  height: 36px;
  min-width: 64px;
  padding: 0 16px;
  border: solid 1px $primary;
  border-radius: 4px;
  color: $primary;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.0892857143em;
}
.indicator {
  color: $primary;
}
</style>
