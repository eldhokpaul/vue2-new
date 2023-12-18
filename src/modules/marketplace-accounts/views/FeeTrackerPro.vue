<template>
  <v-container
    class="page-container"
    fluid
    style="height: 100%; display: flex; flex-direction: column"
  >
    <page-header :title="$t('routes.feeTrackerPro')">
      <template #controls>
        <app-table-controls
          class="d-none d-sm-flex"
          :selected-items="formattedProducts"
          :show-sync="isAdmin"
          :export-file-name="`products-export-${new Date().toLocaleDateString()}.csv`"
          :export-worksheet-name="`Products Export ${new Date().toLocaleDateString()}`"
          :headers="allHeaders"
          :show-filter="true"
          :show-columns="true"
          :view-saved-filter="viewSavedFilter"
          :view-saved-column="viewSavedColumn"
          :show-graph="true"
          :is-chart-enabled="isChartEnabled"
          @click:sync="syncProducts"
          @update:filter="openToolPanel"
          @update:column="openToolPanel"
          @clear:column-state="removeColState"
          @save:column-state="saveColumnState"
          @clear:filter-state="removeFilterState"
          @save:filter-state="saveFilterState"
          @click:graph="createChart"
          v-on="$listeners"
        />
      </template>
      <template #buttons>
        <v-chip
          label
          outlined
          class="mr-2 marketplace-indicator d-none d-md-flex"
        >
          {{ $t('pages.amazonProducts.changedInAmazon') }}
          <v-switch
            inset
            class="ml-3 mr-n4"
            dense
            color="primary"
            hide-details
            @change="val => filterProducts(val)"
          />
        </v-chip>
        <div
          v-if="!isViewer"
          class="d-flex align-center marketplace-indicator mr-2"
        >
          <v-img
            width="24px"
            max-width="24px"
            class="mr-2"
            :src="require('@/assets/amazon-icon.svg')"
          />
          <span> {{ $t('pages.amazonProducts.amazonUs') }}</span>
        </div>
        <v-btn
          v-if="!isViewer"
          v-t="'pages.amazonProducts.reject'"
          class="mr-2"
          depressed
          text
          :disabled="disableButtons"
          @click="validate(false)"
        />
        <v-btn
          v-if="!isViewer"
          v-t="'pages.amazonProducts.accept'"
          color="primary"
          depressed
          :disabled="disableButtons"
          class="mr-2"
          @click="validate(true)"
        />
      </template>
    </page-header>
    <v-alert
      v-if="isSyncInProgress"
      border="left"
      colored-border
      type="info"
      elevation="2"
      class="mt-2"
      prominent
      dense
    >
      <v-row align="center">
        <v-col>
          <div class="title">
            {{ $t('pages.amazonProducts.syncInProgress') }}
          </div>
          <div>
            {{ $t('pages.amazonProducts.amazonSync') }}
          </div>
        </v-col>
        <v-col class="shrink">
          <v-btn
            color="primary"
            @click="initialLoad"
          >
            {{ $t('pages.amazonProducts.refresh') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>
    <v-alert
      v-if="isSyncError"
      border="left"
      colored-border
      type="error"
      elevation="2"
      class="mt-2"
      prominent
      dense
    >
      <v-row align="center">
        <v-col>
          <div class="title">
            {{ $t('pages.amazonProducts.amazonSyncError') }}
          </div>
          <div>
            {{ $t('pages.amazonProducts.syncAgain') }}
          </div>
        </v-col>
      </v-row>
    </v-alert>
    <amazon-products-table
      v-model="selectedProducts"
      :columns="headers"
      :pagination="rowPerPage"
      @grid-ready="initialFunction"
      @range-selection-changed="chartsSelected"
      @rowClicked="
        ({ data: { sku } }) => {
          $router.push({
            name: 'productDetails',
            params: { sku, goBack: 'feeTrackerPro' },
          });
        }
      "
    />
    <amazon-products-sync-dialog
      :open="syncDialogOpen"
      @setDialogOpen="(val) => (syncDialogOpen = val)"
      @dismiss:error="showErrorDialog"
    />
    <app-confirmation-dialog
      :should-show="confirmDialogOpen"
      :details="confirmText"
      @confirm="acceptRejectChanges"
      @close="confirmDialogOpen = false"
    />
    <app-ok-dialog
      :is-success="false"
      :confirmation-text="'pages.amazonProducts.syncError'"
      :show-dialog="errorDialogOpen"
      @update:ok="errorDialogOpen = false"
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
import { Action, Getter, State } from 'vuex-class'

import type { Pageable } from '@/client/reporting/api'
import type { AccountSettingsDto } from '@/client/users'
import AppChip from '@/components/AppChip.vue'
import AppIntegrationWrapper from '@/components/AppIntegrationWrapper.vue'
import AppTableControls from '@/components/AppTableControls.vue'
import AppConfirmationDialog from '@/components/dialogs/AppConfirmationDialog.vue'
import AppOkDialog from '@/components/dialogs/AppOkDialog.vue'
import PageHeader from '@/components/PageHeader.vue'
import AmazonProductsTable from '@/components/VueDataGrid.vue'
import { formatCurrency } from '@/utils/currency'
import { EventBus } from '@/utils/event-bus'

import AmazonProductsSyncDialog from '../components/AmazonProductsSyncDialog.vue'
import type { IProduct, IProductAcceptRejectRequest, IProducts } from '../types'

const namespaces = {
  products: 'products',
  user: 'user',
  integrations: 'integrations',
  toasts: 'toasts',
  marketplaceAccounts: 'marketplaceAccounts',
  grid: 'grid',
  accountSettings: 'accountSettings'
}

enum AmazonStatus {
  accepted = 'Accepted',
  noChange = 'No Change',
  newChange = 'New Change',
  onHold = 'On Hold',
}
const dashDefault = (params: any) => {
  if (!params.value) return '-'
  return params.value
}
const dimensionsValueGetter = (params: any) => {
  if (params.data.longestSideDimension) {
    return `${params.data.longestSideDimension} x ${params.data.medianSideDimension} x ${params.data.shortSideDimension}`
  }
}
const percentageRender = (params: any) => {
  if (params.value) {
    return `${params.value.toFixed(2)}%`
  } else return '-'
}
const toLowercase = (params: any) => {
  if (params.value) return params.value.toLowerCase()
  else return '-'
}
const textFilterParams = {
  filterOptions: ['contains'],
  debounceMs: 200,
  suppressAndOrCondition: true
}
const modelFilterParams = {
  suppressFilterButton: true
}
@Component({
  components: {
    AppConfirmationDialog,
    AppIntegrationWrapper,
    AppTableControls,
    PageHeader,
    AmazonProductsSyncDialog,
    AmazonProductsTable,
    AppOkDialog,
    AppChip
    // ChangedInAmazonButton
  }
})
export default class FeeTrackerPro extends Vue {
  @Action('getAmazonProducts', { namespace: namespaces.marketplaceAccounts })
  getAmazonProducts!: (pageable: Pageable&{ sort?: Array<any>, changedInAmazon?: boolean}) => Promise<void>;

  @State('amazonProducts', { namespace: namespaces.marketplaceAccounts })
  amazonProducts?: IProducts;

  @State('accountSettings', { namespace: namespaces.accountSettings })
  accountSettings!: AccountSettingsDto;

  @Action('acceptAmazonProducts', { namespace: namespaces.marketplaceAccounts })
  acceptAmazonProducts!: (
    productList: IProductAcceptRejectRequest
  ) => Promise<void>;

  @Action('addError', { namespace: namespaces.toasts }) addError!: (
    text: string
  ) => Promise<void>;

  @Action('getAmazonIntegrationDetails', { namespace: namespaces.integrations })
  getAmazonIntegrationDetails!: () => Promise<void>;

  @State('userAmazonIntegrationDetails', { namespace: namespaces.integrations })
  userAmazonIntegrationDetails!: any;

  @Action('getAmazonProductSyncStatus', { namespace: 'integrations' })
  getAmazonProductSyncStatus!: () => Promise<void>;

  @State('amazonProductSyncStatus', { namespace: 'integrations' })
  amazonProductSyncStatus!: any;

  @Getter('isViewer', { namespace: namespaces.user }) isViewer!: boolean
  @Getter('isAdmin', { namespace: namespaces.user }) isAdmin!: boolean

  @Action('getAmazonState', { namespace: namespaces.grid })
  getAmazonState!: (amazonState: any) => void;

  @State('amazonState', { namespace: namespaces.grid }) amazonState?: any;

  // @Prop() readonly userSwitched!: string

  headers = [...this.allHeaders];
  selectedProducts: IProduct[] = [];
  syncDialogOpen = false;
  confirmDialogOpen = false;
  errorDialogOpen = false;
  confirmText = 'pages.amazonProducts.acceptConfirmMsg';
  status!: string;
  showChangedProducts = false;
  timer!: number;
  agApi!: GridReadyEvent;
  cellRanges: CellRange[] = [];
  rowPerPage=15

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

  get dataSource () {
    return {
      getRows: async (params: IServerSideGetRowsParams) => {
        const sort = params.request.sortModel || []
        const pageSize = params.api.paginationGetPageSize()
        const page = params.api.paginationGetCurrentPage()
        const filterModel = params.request.filterModel
        const rowGroupCols = params.request.rowGroupCols
        const groupKeys = params.request.groupKeys
        const valueCols = params.request.valueCols
        try {
          if (this.amazonProducts?.content) {
            if (Object.keys(filterModel).length || rowGroupCols.length) {
              await this.loadFilterAndGrouping(params, this.amazonProducts.content, filterModel, rowGroupCols, groupKeys, valueCols)
              return false
            }
          }
          params.api.showLoadingOverlay()
          await this.getAmazonProducts({
            pageSize: pageSize,
            pageNumber: page + 1,
            sort: sort,
            changedInAmazon: this.showChangedProducts
          // search: search
          })
          if (this.amazonProducts?.content.length) {
            if (Object.keys(filterModel).length || rowGroupCols.length) {
              await this.loadFilterAndGrouping(params, this.amazonProducts.content, filterModel, rowGroupCols, groupKeys, valueCols)
              return false
            }
            params.success({
              rowData: this.amazonProducts?.content,
              rowCount: this.amazonProducts?.totalElements
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

  saveColumnState () {
    const columnState = this.agApi.columnApi.getColumnState()
    this.getAmazonState({ colState: columnState, rowPerPage: this.agApi.api.paginationGetPageSize() })
  }

  saveFilterState () {
    const filterState = this.agApi.api.getFilterModel()
    this.getAmazonState({ filterModel: filterState })
  }

  removeFilterState () {
    this.agApi.api.setFilterModel({})
    this.getAmazonState({ filterModel: {} })
  }

  async removeColState () {
    this.agApi.columnApi.resetColumnState()
    this.getAmazonState({ colState: [], rowPerPage: null })
    await this.initialLoad()
  }

  get viewSavedColumn () {
    return isEmpty(this.amazonState.colState)
  }

  get viewSavedFilter () {
    return isEmpty(this.amazonState.filterModel)
  }

  openToolPanel (key: string) {
    if (key === this.agApi.api.getOpenedToolPanel()) {
      this.agApi.api.closeToolPanel()
      return false
    }
    this.agApi.api.openToolPanel(key)
  }

  get isSyncInProgress () {
    return ['QUEUED', 'CREATED', 'DOWNLOADED', 'PROCESSED'].includes(
      this.amazonProductSyncStatus?.svProcessingStatus
    )
  }

  get isSyncError () {
    return ['ERROR'].includes(this.amazonProductSyncStatus?.svProcessingStatus)
  }

  async restoreView () {
    this.agApi.columnApi.applyColumnState({
      state: this.amazonState.colState,
      applyOrder: true
    })
    this.agApi.api.setFilterModel(this.amazonState.filterModel)
  }

  async paginationFun (val: number) {
    this.rowPerPage = val
    this.agApi.api.setCacheBlockSize(val)
    this.agApi.api.paginationSetPageSize(val)
    // await this.restoreView()
  }

  async initialLoad () {
    await this.getAmazonProductSyncStatus()
    await this.getAmazonIntegrationDetails()
    if (this.userAmazonIntegrationDetails.length) {
      if (this.amazonState.rowPerPage) {
        this.paginationFun(this.amazonState.rowPerPage)
      } else {
        this.paginationFun(15)
      }
      this.agApi.api.setServerSideDatasource(this.dataSource)
      this.restoreView()
    } else {
      this.$router.push({
        name: 'integrations'
      })
    }
  }

  async mounted () {
    EventBus.$on('switch-user-event', this.initialLoad)
  }

  beforeDestroy () {
    // Remember to remove the event listener when the component is destroyed
    EventBus.$off('switch-user-event')
  }

  async initialFunction (param: GridReadyEvent) {
    this.agApi = param
    await this.initialLoad()
  }

  get allHeaders () {
    return [
      {
        headerName: '',
        field: '',
        headerTooltip: 'Hold the shift key to select all the rows between two check-boxes',
        // headerComponent: 'SelectAllCheckbox',
        // headerComponentParams: { headerName: 'Accept/Reject' },
        headerCheckboxSelection: true,
        resizable: false,
        suppressColumnsToolPanel: true,
        maxWidth: 60,
        checkboxSelection: true,
        chartDataType: 'excluded',
        filter: false,
        suppressMovable: true
      },
      {
        headerName: this.$t('components.amazonProductsTable.headers.status'),
        field: 'status',
        minWidth: 130,
        chartDataType: 'excluded',
        valueFormatter: dashDefault,
        sortable: true,
        suppressFiltersToolPanel: true,
        filter: 'FilterModel',
        floatingFilterComponentParams: modelFilterParams,
        cellRenderer: 'StatusRender',
        cellRendererParams: {
          type: 'product'
        }
      },
      {
        headerName: this.$t('components.amazonProductsTable.headers.name'),
        field: 'name',
        chartDataType: 'category',
        valueFormatter: dashDefault,
        sortable: true,
        filter: 'agTextColumnFilter',
        filterParams: textFilterParams,
        tooltipField: 'name'
      // cellRenderer: 'TooltipRender'
      },
      {
        headerName: this.$t('components.amazonProductsTable.headers.sku'),
        field: 'sku',
        valueFormatter: dashDefault,
        chartDataType: 'category',
        filter: 'agTextColumnFilter',
        filterParams: textFilterParams,
        sortable: true
      },
      {
        headerName: this.$t('components.amazonProductsTable.headers.asin'),
        field: 'asin',
        valueFormatter: dashDefault,
        chartDataType: 'excluded',
        filter: 'agTextColumnFilter',
        filterParams: textFilterParams,
        sortable: true
      },
      {
        headerName: this.$t(
          'components.amazonProductsTable.headers.dimensions'
        ),
        field: 'dimensions',
        valueFormatter: dashDefault,
        suppressFiltersToolPanel: true,
        filter: 'FilterModel',
        floatingFilterComponentParams: modelFilterParams,
        chartDataType: 'excluded',
        sortable: false,
        valueGetter: dimensionsValueGetter
      },
      {
        headerName: this.$t('components.amazonProductsTable.headers.unit'),
        field: 'longestSideDimensionUnit',
        chartDataType: 'excluded',
        valueFormatter: toLowercase,
        sortable: false
      },
      {
        headerName: this.$t(
          'components.amazonProductsTable.headers.unitWeight'
        ),
        field: 'perUnitWeight',
        chartDataType: 'excluded',
        valueFormatter: dashDefault,
        sortable: false
      },
      {
        headerName: this.$t('components.amazonProductsTable.headers.unit'),
        field: 'perUnitWeightUnit',
        chartDataType: 'excluded',
        valueFormatter: toLowercase,
        sortable: false
      },
      {
        headerName: this.$t(
          'components.amazonProductsTable.headers.productSizeTier'
        ),
        field: 'productSizeTier',
        chartDataType: 'excluded',
        valueFormatter: dashDefault,
        sortable: false
      },
      {
        headerName: this.$t('components.amazonProductsTable.headers.price'),
        field: 'listingPrice',
        chartDataType: 'series',
        valueFormatter: this.currencyFormatter,
        sortable: false
      },
      {
        headerName: this.$t('components.amazonProductsTable.headers.currency'),
        field: 'currency',
        chartDataType: 'excluded',
        suppressFiltersToolPanel: true,
        filter: 'FilterModel',
        floatingFilterComponentParams: modelFilterParams,
        valueFormatter: this.currencyValue,
        sortable: false
      },
      // {
      //   headerName: this.$t(
      //     'components.amazonProductsTable.headers.landedUnitCost'
      //   ),
      //   field: 'landedUnitCost',
      //   chartDataType: 'series',
      //   valueFormatter: this.currencyFormatter,
      //   sortable: false
      // },
      // {
      //   headerName: this.$t(
      //     'components.amazonProductsTable.headers.costMarginPercentage'
      //   ),
      //   field: 'costMargin',
      //   chartDataType: 'series',
      //   valueFormatter: percentageRender,
      //   sortable: false
      // },
      {
        headerName: this.$t(
          'components.amazonProductsTable.headers.estimatedReferralFee'
        ),
        field: 'estReferralFee',
        chartDataType: 'series',
        valueFormatter: this.currencyFormatter,
        sortable: false
      },
      {
        headerName: this.$t(
          'components.amazonProductsTable.headers.referralFeePercentage'
        ),
        field: 'estReferralFeePercentage',
        chartDataType: 'series',
        valueFormatter: percentageRender,
        sortable: false
      },
      {
        headerName: this.$t(
          'components.amazonProductsTable.headers.expectedFBAFee'
        ),
        field: 'fbaFee',
        chartDataType: 'series',
        valueFormatter: this.currencyFormatter,
        sortable: false
      },
      {
        headerName: this.$t(
          'components.amazonProductsTable.headers.fbaFeePercentage'
        ),
        field: 'fbaFeePercentage',
        chartDataType: 'series',
        valueFormatter: percentageRender,
        sortable: false
      },
      {
        headerName: this.$t(
          'components.amazonProductsTable.headers.estimatedFeeTotal'
        ),
        field: 'amazonFees',
        chartDataType: 'series',
        valueFormatter: this.currencyFormatter,
        sortable: false
      },
      {
        headerName: this.$t(
          'components.amazonProductsTable.headers.totalFBAFeePercentage'
        ),
        field: 'estFeeTotalPercentage',
        chartDataType: 'series',
        valueFormatter: percentageRender,
        sortable: false
      },
      // {
      //   headerName: this.$t(
      //     'components.amazonProductsTable.headers.grossProfit'
      //   ),
      //   field: 'grossProfit',
      //   chartDataType: 'series',
      //   valueFormatter: this.currencyFormatter,
      //   sortable: false
      // },
      // {
      //   headerName: this.$t(
      //     'components.amazonProductsTable.headers.grossMarginPercentage'
      //   ),
      //   field: 'grossMarginPercentage',
      //   chartDataType: 'series',
      //   valueFormatter: percentageRender,
      //   sortable: false
      // },
      {
        headerName: this.$t('components.amazonProductsTable.headers.estimatedVariableClosingFee'),
        field: 'estVariableClosingFee',
        chartDataType: 'series',
        valueFormatter: this.currencyFormatter,
        sortable: false
      },
      {
        headerName: this.$t(
          'components.amazonProductsTable.headers.variableClosingFeePercentage'
        ),
        field: 'estVariableClosingFeePercentage',
        chartDataType: 'series',
        valueFormatter: percentageRender,
        sortable: false
      },
      {
        headerName: this.$t('components.amazonProductsTable.headers.estimatedOrderHandlingFeePerOrder'),
        field: 'estOrderHandlingFeePerOrder',
        chartDataType: 'series',
        valueFormatter: this.currencyFormatter,
        sortable: false
      },
      {
        headerName: this.$t(
          'components.amazonProductsTable.headers.orderHandlingFeePerOrderPercentage'
        ),
        field: 'estOrderHandlingFeePerOrderPercentage',
        chartDataType: 'series',
        valueFormatter: percentageRender,
        sortable: false
      },
      {
        headerName: this.$t('components.amazonProductsTable.headers.estimatedPickPackFee'),
        field: 'estPickPackFee',
        chartDataType: 'series',
        valueFormatter: this.currencyFormatter,
        sortable: false
      },
      {
        headerName: this.$t(
          'components.amazonProductsTable.headers.pickPackFeePercentage'
        ),
        field: 'estPickPackFeePercentage',
        chartDataType: 'series',
        valueFormatter: percentageRender,
        sortable: false
      },
      {
        headerName: this.$t('components.amazonProductsTable.headers.estimatedWeightHandlingFee'),
        field: 'estWeightHandlingFee',
        chartDataType: 'series',
        valueFormatter: this.currencyFormatter,
        sortable: false
      },
      {
        headerName: this.$t(
          'components.amazonProductsTable.headers.weightHandlingFeePercentage'
        ),
        field: 'estWeightHandlingFeePercentage',
        chartDataType: 'series',
        valueFormatter: percentageRender,
        sortable: false
      },
      {
        headerName: this.$t(
          'components.amazonProductsTable.headers.feeCheckerPro'
        ),
        field: 'changedInAmazon',
        chartDataType: 'excluded',
        suppressFiltersToolPanel: true,
        filter: 'FilterModel',
        floatingFilterComponentParams: modelFilterParams,
        valueFormatter: dashDefault,
        sortable: false,
        cellRenderer: 'FeeTracker'
      },
      {
        headerName: this.$t('components.amazonProductsTable.headers.feeStatus'),
        field: 'amazonProductStatus',
        valueFormatter: dashDefault,
        chartDataType: 'excluded',
        cellRenderer: 'FeeStatusRender',
        sortable: true
      },
      {
        headerName: this.$t(
          'components.amazonProductsTable.headers.changeDescription'
        ),
        field: 'changeDescription',
        chartDataType: 'excluded',
        valueFormatter: dashDefault,
        sortable: false
      }
    ]
  }

  get disableButtons () {
    return this.selectedProducts?.length <= 0
  }

  get filters () {
    return [
      {
        text: this.$t('pages.amazonProducts.changedInAmazon'),
        value: 'changeInAmazon'
      }
    ]
  }

  get formattedProducts () {
    return this.selectedProducts.map((product: IProduct) => {
      return this.allHeaders.reduce((prev: Record<string, any>, cur: any) => {
        if (cur.field === 'isBundle') {
          prev[cur.headerName.toString()] = product.isBundle
            ? this.$t('pages.products.yes').toString()
            : this.$t('pages.products.no').toString()
        } else if (cur.field !== '') {
          prev[cur.headerName.toString()] = `${get(
            product,
            cur.field
          )
? get(
            product,
            cur.field
          ).toString()
: ''}`
        }
        return prev
      }, {})
    })
  }

  syncProducts () {
    this.getAmazonProductSyncStatus()
    this.syncDialogOpen = true
  }

  async validate (isAccept: boolean) {
    if (!this.selectedProducts.length) {
      await this.addError(
        this.$t('pages.errors.products.noProducts') as string
      )
    } else if (
      this.selectedProducts.find(
        (item) =>
          item.amazonProductStatus === 'NO_CHANGE' ||
          item.amazonProductStatus === 'ACCEPTED'
      )
    ) {
      await this.addError(
        this.$t('pages.errors.products.selectChangedProducts') as string
      )
    } else {
      isAccept
        ? this.showAcceptConfirmDialog()
        : this.showRejectConfirmDialog()
    }
  }

  showAcceptConfirmDialog () {
    this.confirmText = 'pages.amazonProducts.acceptConfirmMsg'
    this.confirmDialogOpen = true
    this.status = AmazonStatus.accepted
  }

  showRejectConfirmDialog () {
    this.confirmText = 'pages.amazonProducts.rejectConfirmMsg'
    this.confirmDialogOpen = true
    this.status = AmazonStatus.onHold
  }

  showErrorDialog () {
    this.syncDialogOpen = false
    this.errorDialogOpen = true
  }

  async acceptRejectChanges () {
    this.confirmDialogOpen = false
    const productList: IProductAcceptRejectRequest = {
      productIds: this.selectedProducts.map((product) => product.id),
      action: this.status
    }
    await this.acceptAmazonProducts(productList)
    await this.initialLoad()
  }

  async filterProducts (val: boolean) {
    this.showChangedProducts = val
    await this.initialLoad()
  }

  currencyValue (params: any) {
    if (this.accountSettings || params.value) {
      return this.accountSettings?.currency?.code || params.value
    } else {
      return '-'
    }
  }

  currencyFormatter (params: any) {
    if (this.accountSettings && params.value) {
      return formatCurrency(this.accountSettings?.currency?.currencySymbol, params.value)
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
        const value = filterModel[item].filter.toString().toLowerCase()
        filteredList = filteredList.filter((cellValue: IProduct) =>
          get(cellValue, item)
            ? get(cellValue, item)
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase())
            : ''
        )
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
