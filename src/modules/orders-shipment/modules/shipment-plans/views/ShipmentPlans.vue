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
          :selected-items="formattedShipment"
          :export-worksheet-name="exportWorksheetName"
          :export-file-name="exportName"
          :headers="allHeadersShipment"
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
          Archived Plans
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
    <ag-grid-table
      id="shipmentGridContainer"
      key="shipmentPlans"
      v-model="selectedShipmentPlans"
      detail-cell-renderer="ShipmentSubGrid"
      :columns="shipmentHeaders"
      :master-detail="true"
      :pagination="rowPerPage"
      :range-selection="false"
      :editable="false"
      :page-callback="updateShipmentBasedPacklist"
      @range-selection-changed="chartsSelected"
      @grid-ready="initialFunction"
      @selection-update-packlist="subItemSelection"
    />
    <move-to-shipment-plan-pop-up
      v-if="selectedPackLists && selectedPackLists.length"
      :loading="moveShipmentPlanTask.isActive"
      :packlist="selectedPackLists"
      @update:move-to-shipment="moveToShipmentPlan"
      @close:remove-packlists="removeSelectedPacklists"
    />
    <shipment-plan-Edit
      v-if="shipmentId"
      v-model="shipmentId"
      :countries="countries"
      :loading="updateShipmentPlanTask.isActive"
      @close-action="closeShipmentPlanform"
      @update-shipment-plan="patchShipmentPlanDetails"
    />
  </v-container>
</template>

<script lang="ts">
import {
  CellRange,
  CellValueChangedEvent,
  ColumnVO,
  CreateRangeChartParams,
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
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import type {
  Order,
  PackList,
  Pageable,
  PageShipmentPlan,
  ShipmentPlan,
  ShipmentPlanPackListsDto,
  ShipmentPlanPatchDto,
  ShipmentPlanSummaryDto
} from '@/client/orders'
import type { AccountSettingsDto } from '@/client/users'
import AppTableControls from '@/components/AppTableControls.vue'
import PageHeader from '@/components/PageHeader.vue'
import AgGridTable from '@/components/VueDataGrid.vue'
import { Task } from '@/decorators/task'
import { ICurrency } from '@/modules/account-settings/types'
import { ICountry } from '@/modules/contacts/types'
import MoveToShipmentPlanPopUp from '@/modules/orders-shipment/components/MoveToShipmentPlan.vue'
import { formatCurrency } from '@/utils/currency'
import { dateTimeDifference, formatDate } from '@/utils/date'

import ShipmentPlanEdit from './ShipmentPlanEdit.vue'

const dashDefault = (params: any) => {
  if (!params.value) return '-'
  return params.value
}
const formatEnum = (params: any) => {
  if (!params.value) return '-'
  return params.value.replace(/_/g, ' ').toLowerCase()
}
const dateFilterParams = {
  filterOptions: ['lessThanOrEqual', 'greaterThanOrEqual'],
  debounceMs: 200,
  suppressAndOrCondition: true
}
const namespaces = {
  orders: 'orders',
  accountSettings: 'accountSettings',
  grid: 'grid',
  user: 'user',
  toasts: 'toasts',
  suppliers: 'suppliers'

}

@Component({
  components: {
    AppTableControls,
    AgGridTable,
    PageHeader,
    ShipmentPlanEdit,
    MoveToShipmentPlanPopUp
  }
})
export default class ShipmentPlans extends Vue {
  @Action('fetchShipmentPlans', { namespace: namespaces.orders }) fetchShipmentPlans!: (opts: Pageable & { sort?: Array<any>, search?: string, shipmentStatuses?: string }) => Promise<void>;

  @State('shipmentPlans', { namespace: namespaces.orders }) shipmentPlans!: PageShipmentPlan;
  @State('shipmentPlanSummaries', { namespace: namespaces.orders }) shipmentPlanSummaries!: ShipmentPlanSummaryDto[];
  @State('accountSettings', { namespace: namespaces.accountSettings })accountSettings!: AccountSettingsDto;
  // @Getter('isViewer', { namespace: namespaces.user }) isViewer!: boolean;

  @Action('getShipmentState', { namespace: namespaces.grid }) getShipmentState!: (shipmentState: any) => void;
  @State('shipmentState', { namespace: namespaces.grid }) shipmentState?: any;

  @Action('patchShipmentPlanDetailsForUser', { namespace: namespaces.orders }) patchShipmentPlanDetailsForUser!: (params: { shipmentPlanId: number, shipmentPlanPatchDto?: ShipmentPlanPatchDto }) => Promise<void>;
  @Action('fetchShipmentPlanSummaries', { namespace: namespaces.orders }) fetchShipmentPlanSummaries!: () => Promise<void>;

  @Action('setShipmentPlanPackListsForUser', { namespace: namespaces.orders }) setShipmentPlanPackListsForUser!: (shipmentPlanPackLists: ShipmentPlanPackListsDto) => Promise<void>;

  @Action('fetchFullShipmentPlanForUser', { namespace: namespaces.orders }) fetchFullShipmentPlanForUser!: (shipmentPlanId: number) => Promise<ShipmentPlan>;
  @Action('fetchShipmentPlanAddressTypes', { namespace: namespaces.orders }) fetchShipmentPlanAddressTypes!: any;
  @Action('fetchShipmentCalculateByOptions', { namespace: namespaces.orders }) fetchShipmentCalculateByOptions!: any;
  @Action('fetchShipmentPlanContainerTypes', { namespace: namespaces.orders }) fetchShipmentPlanContainerTypes!: any;
  @Action('fetchGoodsTimelineOptions', { namespace: namespaces.orders }) fetchGoodsTimelineOptions!: any;
  @Action('getCountries', { namespace: namespaces.suppliers }) getCountries!: any
  @Action('getCurrencies', { namespace: namespaces.accountSettings }) getCurrencies!: () => Promise<ICurrency[]>
  @State('currencies', { namespace: namespaces.accountSettings }) currencies!: ICurrency[]
  @Action('addError', { namespace: namespaces.toasts }) addError!: (text: string) => Promise<any>

  @Prop() readonly shipmentId!: number

  formatCurrency = formatCurrency;
  countries: ICountry[] | null = []
  dateTimeDifference = dateTimeDifference;
  shipmentHeaders = [...this.allHeadersShipment];
  selectedShipmentPlans: ShipmentPlan[] = [];
  selectedShipmentPlansForEdit: number | null=null
  agApi!: GridReadyEvent;
  search = '';
  cellRanges: CellRange[] = [];
  rowPerPage = 15;
  selectedPackLists: Array<number> = [];
  showArchivedPlans = false

  async beforeMount () {
    this.fetchShipmentPlanSummaries()
    this.fetchShipmentPlanAddressTypes()
    this.fetchShipmentCalculateByOptions()
    this.fetchGoodsTimelineOptions()
    this.fetchShipmentPlanContainerTypes()
    this.countries = await this.getCountries()
    if (!this.currencies) {
      this.getCurrencies()
    }
  }

  async filterProducts (val: boolean) {
    this.showArchivedPlans = val
    await this.initialLoadShipment()
  }

  subItemSelection () {
    this.selectedPackLists = []
    this.agApi.api.forEachDetailGridInfo(detailGridInfo => {
      if (detailGridInfo !== undefined) {
        const selectedRows = detailGridInfo?.api?.getSelectedRows() as PackList[]
        const packListIds: Array<number> = selectedRows.map((item: PackList) => item.id as number)
        this.selectedPackLists.push(...packListIds)
      }
    })
  }

  @Task('updateShipmentPlanTask')
  async patchShipmentPlanDetails (shipmentPlanDetails: ShipmentPlanPatchDto) {
    if (this.shipmentId) {
      await this.patchShipmentPlanDetailsForUser({ shipmentPlanId: this.shipmentId, shipmentPlanPatchDto: shipmentPlanDetails })
      await this.initialLoadShipment()
      this.closeShipmentPlanform()
    }
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
    await this.initialLoadShipment()
  }

  get shipmentPlanSummary () {
    return (
      this.shipmentPlanSummaries.map((item: ShipmentPlanSummaryDto) => ({
        name: item.name,
        id: item.name
      })) || []
    )
  }

  async initialFunction (param: GridReadyEvent) {
    this.agApi = param
    await this.initialLoadShipment()
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

  async initialLoadShipment () {
    if (this.shipmentState.rowPerPage) {
      this.paginationFun(this.shipmentState.rowPerPage)
    } else {
      this.paginationFun(15)
    }
    this.agApi.api.setServerSideDatasource(this.dataSourceShipments)
    this.restoreShipmentView()
  }

  async paginationFun (val: number) {
    this.rowPerPage = val
    this.agApi.api.setCacheBlockSize(val)
    this.agApi.api.paginationSetPageSize(val)
  }

  get allHeadersShipment () {
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
        pinned: 'left',
        lockPinned: true,
        suppressColumnsToolPanel: true,
        minWidth: 95,
        suppressMovable: true,
        checkboxSelection: true
      },
      {
        headerName: this.$t('pages.shipment.shipmentPlan'),
        resizable: false,
        editable: false,
        pinned: 'left',
        lockPinned: true,
        suppressMovable: true,
        sortable: true,
        field: 'name',
        cellRenderer: 'ShipmentGroupCellRenderer'
      },
      {
        headerName: this.$t('pages.shipment.estimatedReadyDate'),
        field: 'unixEstimatedReadyDate',
        sortable: true,
        minWidth: 180,
        filter: 'agDateColumnFilter',
        filterParams: dateFilterParams,
        valueFormatter: this.dateFormatter
      },
      {
        headerName: this.$t('pages.shipment.estimatedShipDate'),
        field: 'unixEstimatedShipDate',
        sortable: true,
        minWidth: 180,
        filter: 'agDateColumnFilter',
        filterParams: dateFilterParams,
        valueFormatter: this.dateFormatter
      },
      {
        headerName: this.$t('pages.shipment.estimatedDeliveryDate'),
        field: 'unixEstimatedDeliveryDate',
        sortable: true,
        minWidth: 180,
        filter: 'agDateColumnFilter',
        filterParams: dateFilterParams,
        valueFormatter: this.dateFormatter
      },
      {
        headerName: this.$t('pages.shipment.shipmentStatus'),
        valueFormatter: dashDefault,
        sortable: true,
        chartDataType: 'excluded',
        field: 'shipmentPlanStatus',
        cellRenderer: 'StatusRender',
        cellRendererParams: {
          type: 'shipment'
        }
      },
      {
        headerName: this.$t('pages.shipment.containertype'),
        valueFormatter: formatEnum,
        cellClass: 'text-capitalize',
        field: 'containerType'
      },
      {
        headerName: this.$t('pages.shipment.calculateBy'),
        cellClass: 'text-capitalize',
        valueFormatter: formatEnum,
        field: 'calculateBy'
      },
      {
        headerName: this.$t('pages.shipment.shippingRate'),
        valueFormatter: dashDefault,
        field: 'shippingRateOrContainerEstimate'
      },
      {
        headerName: this.$t('pages.shipment.fromAddressType'),
        cellClass: 'text-capitalize',
        valueFormatter: formatEnum,
        field: 'fromAddressType'
      },
      {
        headerName: this.$t('pages.shipment.fromAddress'),
        cellClass: 'text-capitalize',
        valueFormatter: formatEnum,
        field: 'fromAddress'
      },
      {
        headerName: this.$t('pages.shipment.fromCountry'),
        valueFormatter: dashDefault,
        field: 'fromCountry'
      },
      {
        headerName: this.$t('pages.shipment.toAddresstype'),
        cellClass: 'text-capitalize',
        valueFormatter: formatEnum,
        field: 'toAddressType'
      },
      {
        headerName: this.$t('pages.shipment.toAddress'),
        cellClass: 'text-capitalize',
        valueFormatter: formatEnum,
        field: 'toAddress'
      },
      {
        headerName: this.$t('pages.shipment.toCountry'),
        valueFormatter: dashDefault,
        field: 'toCountry'
      },
      {
        headerName: this.$t('pages.shipment.containsHazardousGoods'),
        // valueFormatter: dashDefault,
        field: 'containsHazardousGoods',
        chartDataType: 'excluded',
        cellRenderer: 'ContainsHazardousGoods'
      },
      {
        headerName: this.$t('pages.shipment.estimatedShipmentCost'),
        valueFormatter: this.currencyFormatter,
        field: 'estimatedShipmentCost'
      },
      {
        headerName: this.$t('pages.shipment.countryOfOrigin'),
        valueFormatter: dashDefault,
        hide: true,
        sortable: true,
        field: 'countryOfOrigin'
      },
      {
        headerName: this.$t('pages.shipment.productionLeadTime'),
        valueFormatter: dashDefault,
        hide: true,
        sortable: true,
        field: 'productionLeadTimeInDays'
      },
      {
        headerName: this.$t('pages.shipment.intransitLeadTime'),
        valueFormatter: dashDefault,
        hide: true,
        sortable: true,
        field: 'inTransitLeadTimeInDays'
      },
      {
        headerName: this.$t('pages.shipment.totalLeadTime'),
        hide: true,
        valueFormatter: dashDefault,
        sortable: true,
        field: 'totalLeadTimeInDays'
      },
      {
        headerName: this.$t('pages.shipment.supplierTerms'),
        hide: true,
        valueFormatter: dashDefault,
        sortable: true,
        field: 'supplierTermsInDays'
      },
      {
        headerName: this.$t('pages.shipment.shippingMethod'),
        hide: true,
        valueFormatter: dashDefault,
        sortable: true,
        field: 'shippingMethod'
      },
      {
        headerName: this.$t('pages.shipment.material'),
        hide: true,
        valueFormatter: dashDefault,
        sortable: true,
        field: 'material'
      },
      {
        headerName: this.$t('components.ordersTable.hsCodes'),
        hide: true,
        cellRenderer: 'TagsRender',
        sortable: true,
        field: 'hsCodes'
      },
      {
        headerName: this.$t('components.ordersTable.tariffRates'),
        hide: true,
        cellRenderer: 'TagsRender',
        sortable: true,
        field: 'tariffRates'
      },

      {
        headerName: this.$t('pages.shipment.orderQuantity'),
        hide: true,
        valueFormatter: dashDefault,
        sortable: true,
        field: 'orderQuantity'
      },
      {
        headerName: this.$t('pages.shipment.totalCases'),
        hide: true,
        valueFormatter: dashDefault,
        sortable: true,
        field: 'totalCases'
      },
      // {
      //   headerName: 'Total Cases',
      //   hide: true,
      //   valueFormatter: dashDefault,
      //   sortable: true,
      //   field: 'totalCases'
      // },
      {
        headerName: this.$t('components.ordersTable.packageLength'),
        hide: true,
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
        field: 'packagingLongestSideDimension'
      },
      {
        headerName: this.$t('components.ordersTable.packageWidth'),
        hide: true,
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
        field: 'packagingMedianSideDimension'
      },
      {
        headerName: this.$t('components.ordersTable.packageHeight'),
        hide: true,
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
        field: 'packagingShortSideDimension'
      },
      {
        headerName: this.$t('components.ordersTable.unitWeight'),
        hide: true,
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
        field: 'packagingUnitWeight'
      },
      {
        headerName: this.$t('components.ordersTable.caseLength'),
        hide: true,
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
        field: 'caseLongestSideDimension'
      },
      {
        headerName: this.$t('components.ordersTable.caseWidth'),
        hide: true,
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
        field: 'caseMedianSideDimension'
      },
      {
        headerName: this.$t('components.ordersTable.caseHeight'),
        hide: true,
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
        field: 'caseShortSideDimension'
      },
      {
        headerName: this.$t('components.ordersTable.gwPerCase'),
        hide: true,
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
        field: 'caseGrossWeight'
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

  get dataSourceShipments () {
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
          if (this.shipmentPlans?.content) {
            if (Object.keys(filterModel).length || rowGroupCols.length) {
              await this.loadFilterAndGrouping(params, this.shipmentPlans.content, filterModel, rowGroupCols, groupKeys, valueCols)
              return false
            }
          }
          params.api.showLoadingOverlay()
          await this.fetchShipmentPlans({
            pageSize: pageSize,
            pageNumber: page + 1,
            sort: sort,
            search: this.search,
            shipmentStatuses: this.showArchivedPlans ? 'ARCHIVED' : ''
          })
          if (this.shipmentPlans?.content?.length) {
            if (Object.keys(filterModel).length || rowGroupCols.length) {
              await this.loadFilterAndGrouping(params, this.shipmentPlans.content, filterModel, rowGroupCols, groupKeys, valueCols)
              return false
            }
            params.success({
              rowData: this.shipmentPlans?.content,
              rowCount: this.shipmentPlans?.totalElements
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
      this.agApi.api.setServerSideDatasource(this.dataSourceShipments)
    }
  }

  get formattedShipment () {
    return this.selectedShipmentPlans.map((order: ShipmentPlan) => {
      return this.allHeadersShipment.reduce((prev: Record<string, any>, cur: any) => {
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
    return `shipment-export-${new Date().toLocaleDateString()}.csv`
  }

  get exportWorksheetName () {
    return `Shipment Plans Export${new Date().toLocaleDateString()}`
  }

  // AG-GRID Functionalities

  restoreShipmentView () {
    this.agApi.columnApi.applyColumnState({
      state: this.shipmentState.colState,
      applyOrder: true
    })
    this.agApi.api.setFilterModel(this.shipmentState.filterModel)
  }

  async saveColumnState () {
    const columnState = this.agApi.columnApi.getColumnState()
    this.getShipmentState({
      colState: columnState,
      rowPerPage: this.agApi.api.paginationGetPageSize()
    })
  }

  saveFilterState () {
    const filterState = this.agApi.api.getFilterModel()
    this.getShipmentState({ filterModel: filterState })
  }

  removeFilterState () {
    this.agApi.api.setFilterModel({})
    this.getShipmentState({ filterModel: {} })
  }

  async removeColState () {
    this.agApi.columnApi.resetColumnState()
    this.getShipmentState({ colState: [], rowPerPage: null })
    await this.initialLoadShipment()
  }

  get viewSavedColumn () {
    return isEmpty(this.shipmentState.colState)
  }

  get viewSavedFilter () {
    return isEmpty(this.shipmentState.filterModel)
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

  async updateShipmentBasedPacklist (shipmentPlanId: number, nodeId: string) {
    const newShipment = await this.fetchFullShipmentPlanForUser(shipmentPlanId)
    const rowNode = this.agApi.api.getRowNode(nodeId)
    if (newShipment && rowNode) {
      rowNode.updateData(newShipment)
      const params = {
        force: true,
        suppressFlash: true
      }
      if (!newShipment.packLists?.length) {
        rowNode.setExpanded(false)
      }
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

  async closeShipmentPlanform () {
    this.$router.replace({ name: 'shipmentPlans' })
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
