<template>
  <v-container
    class="page-container"
    fluid
  >
    <page-header :title="product && product.name">
      <template #back>
        <v-btn
          icon
          text
          large
          class="mr-2"
          color="toolbar"
          :to="{
            name: goBack || 'products',
          }"
          exact
        >
          <v-icon> mdi-arrow-left</v-icon>
        </v-btn>
      </template>
      <template
        v-if="selectedTab === Tab.Overview && !isViewer"
        #buttons
      >
        <v-btn
          color="primary"
          depressed
          exact
          @click="shouldShow = true"
        >
          <v-icon left>
            mdi-content-duplicate
          </v-icon>
          <span v-t="'pages.products.duplicate'" />
        </v-btn>
        <v-btn
          v-t="'components.productForm.saveProduct'"
          class="ml-2"
          color="primary"
          depressed
          @click="updateProduct"
        />
        <!-- <app-delete-dialog
          v-show="!isViewer"
          class="ml-2"
          :action-btn-text="'pages.products.actions.delete'"
          :confirm-text="'pages.products.actions.text'"
          @confirm="onProductDelete"
        /> -->
      </template>
    </page-header>
    <v-skeleton-loader
      v-if="initialLoadTask.isActive || updateTask.isActive"
      type="table"
    />
    <template v-else>
      <v-row
        v-if="productWithStats"
        class="my-0 py-0"
      >
        <v-col class="mb-0 pb-0">
          <app-product-change-stats-card :product-stats="productWithStats" />
        </v-col>
      </v-row>
      <v-btn-toggle
        id="sv-btn-group"
        v-model="selectedTab"
        active-class="active-tab"
        borderless
        group
        color="primary"
      >
        <v-btn
          v-t="'pages.productDetails.overview'"
          :value="Tab.Overview"
        />
        <v-btn
          v-if="isManagementSectionEnabled"
          v-t="'pages.productDetails.costs'"
          :value="Tab.Costs"
        />
        <v-btn
          v-t="'pages.productDetails.changelog'"
          :value="Tab.Changelog"
        />
        <!-- <v-btn
          v-t="'pages.productDetails.orders'"
          :value="Tab.Orders"
        />
        <v-btn
          v-t="'pages.productDetails.shipmentPlans'"
          :value="Tab.ShipmentPlans"
        /> -->
      </v-btn-toggle>
      <v-card
        v-if="selectedTab === Tab.Costs"
        :id="Tab.Costs"
        style="display: flex; flex-direction: column"
        height="95vh"
        outlined
      >
        <v-card-title>
          <h5
            v-t="'pages.productDetails.costs'"
            class="mr-2"
          />
          <app-table-controls
            :selected-items="formattedCosts"
            :export-file-name="`${
              product.name
            }-costs-export-${new Date().toLocaleDateString()}.csv`"
            :export-worksheet-name="`${
              product.name
            } Costs Export ${new Date().toLocaleDateString()}`"
            :headers="costHeaders"
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
        </v-card-title>
        <!-- <v-divider /> -->
        <vue-table-ag
          :key="Tab.Costs"
          v-model="selectedCosts"
          :columns="headers"
          :get-row-class="getRowClass"
          @paginate="paginationFun"
          @range-selection-changed="chartsSelected"
          @grid-ready="initializeGrid"
          @cost-exclude="onCostLineExclude"
          @update:selected-costs="onCostLineSelect"
        />
      </v-card>
      <v-card
        v-if="selectedTab === Tab.Changelog"
        :id="Tab.Changelog"
        style="display: flex; flex-direction: column"
        height="95vh"
        outlined
      >
        <v-card-title>
          <h5
            v-t="'pages.productDetails.changelog'"
            class="mr-2"
          />
          <app-table-controls
            :selected-items="formattedChangelog"
            :export-file-name="`${
              product.name
            }-changelog-export-${new Date().toLocaleDateString()}.csv`"
            :export-worksheet-name="`${
              product.name
            } changelog Export ${new Date().toLocaleDateString()}`"
            :headers="changelogHeaders"
            :show-graph="false"
            :show-filter="false"
            :show-columns="false"
            :view-saved-filter="viewSavedFilter"
            :view-saved-column="viewSavedColumn"
            @update:filter="openToolPanel"
            @update:column="openToolPanel"
            @clear:column-state="removeColState"
            @save:column-state="saveColumnState"
            @clear:filter-state="removeFilterState"
            @save:filter-state="saveFilterState"
          />
        </v-card-title>
        <!-- <v-divider /> -->
        <vue-table-ag
          :key="Tab.Changelog"
          v-model="selectedLog"
          :floating-filter="false"
          :side-bar="false"
          :columns="changelogHeaders"
          :pagination="rowPerPage"
          @grid-ready="initializeGrid"
        />
      </v-card>
      <v-row v-if="selectedTab === Tab.Overview">
        <v-col
          v-if="hasChanges"
          class="col-sm-12 col-md-12"
        >
          <v-alert
            outlined
            type="info"
          >
            <v-container fluid>
              <h4
                v-t="'Pending changes'"
                class="mb-4"
              />
              {{ product.changeDescription || "No change" }}
            </v-container>
          </v-alert>
        </v-col>
        <v-col class="col-sm-12 col-md-6">
          <v-card
            outlined
            min-height="860"
          >
            <v-container fluid>
              <v-row>
                <v-col>
                  <h4 v-t="'components.productForm.details'" />
                  <bundle-table
                    :product="product"
                    :products="childProductItems"
                    :is-viewer="isViewer"
                    :loading="initialLoadTask.isActive"
                    @bundle-change="updateIsBundle"
                  />
                  <product-form
                    ref="productFormRef"
                    class="mt-4"
                    :product="product"
                    :supplier-details="expectedSupplier"
                    :is-viewer="isViewer"
                    @submit="alteredProductFormData"
                    @update:delete-supplier="onSupplierDelete"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
        <v-col class="col-md-6 col-sm-12">
          <v-card
            class="mb-7"
            min-height="860"
            outlined
          >
            <v-container>
              <h4
                v-t="'pages.productDetails.contacts'"
                class="mb-4"
              />
              <contacts-form
                ref="contactsFormRef"
                class="mt-3"
                :countries="countries"
                :shipping-methods="shippingMethods"
                :product="product"
                :suppliers="suppliers.content"
                :is-viewer="isViewer"
                @submit="alteredProducContactDetailstFormData"
              />
            </v-container>
          </v-card>
        </v-col>
      </v-row>
    </template>
    <div class="alert-wrapper">
      <v-alert
        v-if="selectedCosts.length && !isViewer"
        border="top"
        colored-border
        dense
        tile
        max-width="400"
        elevation="10"
        color="primary"
        class="alert-selected-costs"
      >
        <v-card-text color="grey darken-1">
          <div
            class="grey--text"
            v-text="alertText"
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            v-t="'components.appDeleteDialog.actions.cancel'"
            text
            color="grey"
            @click="onCancelSelect"
          />
          <v-btn
            v-t="excludeBtnText"
            color="primary"
            depressed
            @click="batchExcludeLineCosts(selectedCosts)"
          />
        </v-card-actions>
      </v-alert>
    </div>
    <v-dialog
      v-model="shouldShow"
      width="500"
    >
      <v-card>
        <v-card-title v-t="'pages.products.skuDialogTitle'" />
        <v-card-subtitle v-t="'pages.products.skuDialogDescription'" />
        <v-card-text>
          <v-text-field
            v-model="newName"
            outlined
            dense
            autofocus
            :label="$t('pages.products.name')"
            :placeholder="$t('pages.products.name')"
          >
            <p
              v-if="error"
              class="red--text"
              v-text="error"
            />
          </v-text-field>
          <v-text-field
            v-model="newAsin"
            outlined
            dense
            :label="$t('pages.products.asin')"
            :placeholder="$t('pages.products.asin')"
          >
            <p
              v-if="error"
              class="red--text"
              v-text="error"
            />
          </v-text-field>
          <v-text-field
            v-model="newSku"
            outlined
            dense
            :label="$t('pages.products.sku')"
            :placeholder="$t('pages.products.sku')"
          >
            <p
              v-if="error"
              class="red--text"
              v-text="error"
            />
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            v-t="'pages.products.cancel'"
            text
            @click="shouldShow = false"
          />
          <v-btn
            v-t="'pages.products.confirm'"
            :disabled="!newSku.length || !newName.length || !newAsin.length"
            :loading="loading"
            color="primary"
            dense
            depressed
            @click="duplicate"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { CreateRangeChartParams, GridReadyEvent } from 'ag-grid-community'
import { CellRange, RowClassParams } from 'ag-grid-enterprise'
import get from 'lodash.get'
import chain from 'lodash/chain'
import find from 'lodash/find'
import isEmpty from 'lodash/isEmpty'
import set from 'lodash/set'
import sumBy from 'lodash/sumBy'
import { mixins } from 'vue-class-component'
import { Component, Prop, Ref, Watch } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'

import type {
  Pageable,
  PageProductChangeLog,
  ProductChangeLog
} from '@/client/products'
import type { AccountSettingsDto } from '@/client/users'
import AppProductChangeStatsCard from '@/components/AppProductChangeStatsCard.vue'
import AppTableControls from '@/components/AppTableControls.vue'
import AppDeleteDialog from '@/components/dialogs/AppDeleteDialog.vue'
import PageHeader from '@/components/PageHeader.vue'
import VueTableAg from '@/components/VueDataGrid.vue'
import { Task } from '@/decorators/task'
import { SellervueProductStats } from '@/mixins'
import type { ISuppliers } from '@/modules/contacts/types'
import type { ICost, ICosts } from '@/modules/costs/types'
import BundleTable from '@/modules/products/components/BundleTable.vue'
import SuppliersTable from '@/modules/products/components/SuppliersTable.vue'
import type { IUser } from '@/modules/user/types'
import type { ObjectKeyAsAny } from '@/types/app'
import { formatCurrency } from '@/utils/currency'
import { formatDate, formatUnixDateTime } from '@/utils/date'

import AmazonProductDetails from '../components/AmazonProductDetails.vue'
import ContactsForm from '../components/ContactDetailsForm.vue'
import ProductForm from '../components/ProductForm.vue'
import type {
  IProduct,
  IProductFormData,
  IProducts,
  IProductSupplier
} from '../types'

export enum Tab {
  Overview = 'overview',
  Costs = 'costs',
  Changelog = 'changelog',
  Orders = 'orders',
  ShipmentPlans = 'shipment plans',
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
const dimensionsUnitValueGetter = (params: any) => {
  if (params.data.longestSideDimension) {
    return `${params.data.longestSideDimensionUnit} x ${params.data.medianSideDimensionUnit} x ${params.data.shortSideDimensionUnit}`
  }
}
const namespaces = {
  products: 'products',
  integrations: 'integrations',
  suppliers: 'suppliers',
  costs: 'costs',
  accountSettings: 'accountSettings',
  grid: 'grid',
  user: 'user'
}

@Component({
  components: {
    AppTableControls,
    AppProductChangeStatsCard,
    AppDeleteDialog,
    BundleTable,
    PageHeader,
    VueTableAg,
    ProductForm,
    SuppliersTable,
    AmazonProductDetails,
    ContactsForm
  }
})
export default class ProductDetails extends mixins(SellervueProductStats) {
  @Getter('isViewer', { namespace: namespaces.user }) isViewer!: boolean;

  @Action('createProduct', { namespace: namespaces.products }) createProduct!: (product: IProductFormData) => Promise<void>;
  @Action('getChangelogSources', { namespace: namespaces.products }) getChangelogSources!: () => Promise<void>;
  @Action('getProductBySku', { namespace: namespaces.products }) getProductBySku!: (opts: { sku: string, userId: number }) => Promise<void>;
  @Action('patchProductAttributes', { namespace: namespaces.products }) patchProductAttributes: any;
  @Action('excludeBatchCostLines', { namespace: namespaces.costs }) excludeBatchCostLines!: (opts: { lines: ICost[] }) => Promise<void>;
  @Action('deleteProduct', { namespace: namespaces.products }) deleteProduct!: (opts: { id: number }) => Promise<void>;
  @Action('getPlaneProducts', { namespace: namespaces.products }) getPlaneProducts!: (opts: any) => Promise<any>;
  @Action('getSuppliers', { namespace: namespaces.suppliers }) getSuppliers!: (pagination: Pageable) => Promise<void>;
  @Action('getCostTypes', { namespace: namespaces.costs }) getCostTypes!:() => Promise<void>;
  @Action('getDimensionUnit', { namespace: namespaces.products }) getDimensionUnit!: () => Promise<void>;
  @Action('getWeightUnit', { namespace: namespaces.products }) getWeightUnit!: () => Promise<void>;
  @Action('getAmazonIntegrationDetails', { namespace: namespaces.integrations }) getAmazonIntegrationDetails!: () => Promise<void>;
  @Action('getProductCostState', { namespace: namespaces.grid }) getProductCostState!: (payableState: any) => Promise<void>;
  @Action('getCountries', { namespace: namespaces.products }) getCountries!: () => Promise<ObjectKeyAsAny>
  @Action('getAllShippingMethods', { namespace: namespaces.products }) getAllShippingMethods!: () => Promise<ObjectKeyAsAny>

  @Action('getProductWithStatsById', { namespace: namespaces.products })
  getProductWithStatsById!: (opts: { id: number, userId: number }) => Promise<IProduct>;

  @Action('getChangelog', { namespace: namespaces.products })
  getChangelog!: (opts: { productId: number, pagination: Pageable & { sort: Array<any>, search?: any } }) => Promise<void>;

  @Action('getCostsByProductId', { namespace: namespaces.costs })
  getCostsByProductId!: (opts: {
    productId: number
    userId: number
    page?: number
    size?: number
    search?: string
    offset?: number
    sort?: string
    sortDirection?: string
  }) => Promise<void>;

  @State('product', { namespace: namespaces.products }) product!: IProduct;
  @State('products', { namespace: namespaces.products }) products!: IProducts;
  @State('plainProducts', { namespace: namespaces.products }) plainProducts!: IProduct[];
  @State('costs', { namespace: namespaces.costs }) costs!: ICosts;
  @State('user', { namespace: namespaces.user }) user!: IUser;
  @State('suppliers', { namespace: namespaces.suppliers }) suppliers?: ISuppliers | null;
  @State('productCostState', { namespace: namespaces.grid }) productCostState?: any;
  @State('userAmazonIntegrationDetails', { namespace: namespaces.integrations }) userAmazonIntegrationDetails!: any;
  @State('accountSettings', { namespace: namespaces.accountSettings }) accountSettings!: AccountSettingsDto;
  @State('costTypes', { namespace: namespaces.costs }) costTypes!: ObjectKeyAsAny;;
  @State('changelogSources', { namespace: namespaces.products }) changelogSources!: ObjectKeyAsAny;
  @State('productChangeLog', { namespace: namespaces.products }) productChangeLog!: PageProductChangeLog;

  @Prop() readonly preselectedTab!: Tab;
  @Prop() readonly sku!: string;
  @Prop() readonly goBack!: string;

  @Ref() readonly productFormRef!: ProductForm;
  @Ref() readonly contactsFormRef!: ContactsForm;

  getRowClass = (params: RowClassParams) => { return params.data.isExcludedFromProductCostsData ? 'row-color' : '' };

  alteredProduct: IProduct | null = null;
  expectedSupplier: IProductSupplier | null = null;
  Tab = Tab;
  selectedTab = this.preselectedTab || this.Tab.Overview;
  cachedProductWithCosts: IProduct | null = null;
  selectedCosts: ICost[] = [];
  selectedLog: ProductChangeLog[] = [];
  shouldShow = false;
  newSku = '';
  newAsin = '';
  newName = '';
  loading = false;
  error = '';
  isBundle = false;
  headers = [...this.costHeaders];
  agApi!: GridReadyEvent;
  cellRanges: CellRange[] = [];
  rowPerPage = 15;
  alteredProductForm: IProduct | null = null;
  alteredProducContactDetailstForm: IProduct | null = null;
  countries!: ObjectKeyAsAny
  shippingMethods!: ObjectKeyAsAny

  @Watch('selectedTab', { immediate: true, deep: true })
  onTabChanged (value: string) {
    this.cellRanges = []
    this.selectedCosts = []
    this.selectedLog = []
    if (!value) {
      setTimeout(() => {
        this.selectedTab = Tab.Overview
      }, 10)
    }
  }

  get isManagementSectionEnabled (): boolean {
    return this.accountSettings?.isManagementSectionEnabled || false
  }

  saveColumnState () {
    const columnState = this.agApi.columnApi.getColumnState()
    this.getProductCostState({
      colState: columnState,
      rowPerPage: this.agApi.api.paginationGetPageSize()
    })
  }

  async removeColState () {
    this.agApi.columnApi.resetColumnState()
    this.getProductCostState({ colState: [], rowPerPage: null })
    await this.initializeCosts()
  }

  saveFilterState () {
    const filterState = this.agApi.api.getFilterModel()
    this.getProductCostState({ filterModel: filterState })
  }

  removeFilterState () {
    this.agApi.api.setFilterModel({})
    this.getProductCostState({ filterModel: {} })
  }

  get viewSavedColumn () {
    return isEmpty(this.productCostState.colState)
  }

  get viewSavedFilter () {
    return isEmpty(this.productCostState.filterModel)
  }

  openToolPanel (key: string) {
    if (key === this.agApi.api.getOpenedToolPanel()) {
      this.agApi.api.closeToolPanel()
      return false
    }
    this.agApi.api.openToolPanel(key)
  }

  get hasChanges () {
    return ['NEW_CHANGE', 'IN_REVIEW'].includes(
      this.product?.amazonProductStatus || ''
    )
  }

  get childProductItems () {
    return this.plainProducts
      .filter((p) => !p.isBundle)
      .map((p) => {
        return {
          id: p.id,
          label: p.name
        }
      })
      .filter((p) => {
        return p.id !== this.product.id
      })
  }

  get costHeaders () {
    return [
      {
        headerName: '',
        field: '',
        headerCheckboxSelection: true,
        resizable: false,
        // headerComponent: 'SelectAllCheckbox',
        headerTooltip:
          'Hold the shift key to select all the rows between two check-boxes',
        // headerComponentParams: { headerName: 'Export' },
        maxWidth: 60,
        suppressColumnsToolPanel: true,
        minWidth: 95,
        suppressMovable: true,
        filter: false,
        chartDataType: 'excluded',
        checkboxSelection: true,
        sortable: false
      },
      {
        headerName: this.$t('components.costsTable.headers.product'),
        field: 'product.name',
        sortable: true,
        cellRenderer: 'LinkRender',
        tooltipField: 'product.name',
        cellRendererParams: {
          name: 'productDetails',
          goBack: 'products',
          field: 'product',
          id: 'sku'
        }
      },
      {
        headerName: this.$t('components.costsTable.headers.orderDate'),
        field: 'invoice.unixDate',
        sortable: true,
        valueFormatter: this.dateFormatter

      },
      {
        headerName: this.$t('components.costsTable.headers.payReference'),
        field: 'invoice.payReferenceNumber',
        valueFormatter: dashDefault,
        sortable: true

      },
      {
        headerName: this.$t('components.costsTable.headers.invoice'),
        field: 'invoice.invoiceNumber',
        sortable: true,
        cellRenderer: 'LinkRender',
        cellRendererParams: {
          name: 'invoice',
          goBack: 'products',
          field: 'invoice',
          id: 'id'
        }
      },
      {
        headerName: this.$t('components.costsTable.headers.costType'),
        field: 'costType',
        valueFormatter: this.costTypesFormatter,
        enableRowGroup: true,
        sortable: true
      },
      {
        headerName: this.$t('components.costsTable.headers.internalReference'),
        field: 'internalReference',
        valueFormatter: dashDefault,
        sortable: true
      },
      {
        headerName: this.$t('components.costsTable.headers.unitsOrdered'),
        field: 'factoryUnits',
        valueFormatter: dashDefault,
        sortable: true
      },
      {
        headerName: this.$t('components.costsTable.headers.factoryCosts'),
        field: 'factoryCosts',
        sortable: false,
        aggFunc: 'sum',
        enableValue: true,
        valueFormatter: this.currencyFormatter
      },
      {
        headerName: this.$t('components.costsTable.headers.inboundCosts'),
        field: 'inboundCosts',
        sortable: false,
        aggFunc: 'sum',
        enableValue: true,
        valueFormatter: this.currencyFormatter
      },
      {
        headerName: this.$t('components.costsTable.headers.landedCosts'),
        field: 'totalCosts',
        sortable: false,
        aggFunc: 'sum',
        enableValue: true,
        valueFormatter: this.currencyFormatter
      },
      {
        headerName: this.$t('components.costsTable.headers.exclude'),
        field: 'isExcludedFromProductCostsData',
        sortable: false,
        cellRenderer: 'CheckboxRenderProduct',
        cellRendererParams: {
          isBundle: this.product?.isBundle
        },
        suppressFiltersToolPanel: true,
        filter: 'FilterModel',
        floatingFilterComponentParams: {
          suppressFilterButton: true
        }
      }
    ]
  }

  get changelogHeaders () {
    return [
      {
        headerName: '',
        field: '',
        resizable: false,
        headerCheckboxSelection: true,
        // headerComponent: 'SelectAllCheckbox',
        headerTooltip:
          'Hold the shift key to select all the rows between two check-boxes',
        // headerComponentParams: { headerName: 'Export' },
        maxWidth: 60,
        // headerCheckboxSelectionFilteredOnly: true,
        suppressColumnsToolPanel: true,
        minWidth: 95,
        suppressMovable: true,
        filter: false,
        chartDataType: 'excluded',
        checkboxSelection: true,
        sortable: false
      },
      {
        headerName: this.$t(
          'pages.productDetails.changeLog.headers.changeDate'
        ),
        field: 'unixDateTimeOfChange',
        sortable: true,
        valueFormatter: this.dateTimeFormatter
      },
      {
        headerName: this.$t(
          'pages.productDetails.changeLog.headers.dimensions'
        ),
        field: 'longestSideDimension',
        valueGetter: dimensionsValueGetter,
        sortable: true
      },
      {
        headerName: this.$t(
          'pages.productDetails.changeLog.headers.dimensionsUnit'
        ),
        field: 'longestSideDimensionUnit',
        valueGetter: dimensionsUnitValueGetter,
        valueFormatter: dashDefault,
        sortable: true
      },
      {
        headerName: this.$t('pages.productDetails.changeLog.headers.weight'),
        field: 'perUnitWeight',
        valueFormatter: dashDefault,
        sortable: true
      },
      {
        headerName: this.$t(
          'pages.productDetails.changeLog.headers.weightUnit'
        ),
        field: 'perUnitWeightUnit',
        valueFormatter: dashDefault,
        sortable: true
      },
      {
        headerName: this.$t(
          'pages.productDetails.changeLog.headers.changeSource'
        ),
        field: 'productChangeSource',
        sortable: true,
        valueFormatter: this.sourcesFormatter
      },
      {
        headerName: this.$t(
          'pages.productDetails.changeLog.headers.productSizeTier'
        ),
        hide: !this.amazonIntegrationEnabled || true,
        field: 'productSizeTier',
        valueFormatter: dashDefault,
        sortable: true
      },
      {
        headerName: this.$t(
          'pages.productDetails.changeLog.headers.description'
        ),
        field: 'changeDescription',
        hide: !this.amazonIntegrationEnabled || true,
        valueFormatter: dashDefault,
        sortable: true
      }
    ]
  }

  get expectedCosts () {
    return this.costs?.lineCosts || {}
  }

  costTypesFormatter (params: any) {
    if (this.costTypes && params.value) {
      return this.costTypes[params.value]
    } else {
      return '-'
    }
  }

  updateIsBundle () {
    this.product.products = []
    this.product.productSuppliers = []
  }

  async beforeMount () {
    await this.initialLoad()
  }

  async onSupplierDelete (id: number) {
    if (!this.product) return
    const result = { ...this.product }
    if (!result.productSuppliers) return

    result.productSuppliers = result.productSuppliers.filter(
      (currentSupplier) => currentSupplier.id !== id
    )
    await this.patchProductAttributes({ formData: result })
    this.expectedSupplier = null
  }

  async onCostLineSelect (item: ICost[]) {
    this.selectedCosts = item
  }

  async onCancelSelect () {
    // TODO - disgusting hack to refresh the table selected items state
    // this.selectedCosts = []
    // this.shouldShowCosts = false
    // await this.$nextTick()
    // this.shouldShowCosts = true

    // AG-Grid deselectAll Method
    this.agApi.api.deselectAll()
  }

  async batchExcludeLineCosts (items: ICost[]) {
    await this.excludeBatchCostLines({ lines: items })
    // this.selectedCosts = []
    this.agApi.api.deselectAll()
    const opts = { id: this.product.id, userId: this.user.id }
    this.alteredProduct = await this.getProductWithStatsById(opts)
    await this.agApi.api.setServerSideDatasource(this.dataSource)
  }

  async onCostLineExclude (item: ICost) {
    // comes as a single already excluded ICost, we do exclusion on the state level
    const tmpItem = {
      ...item,
      isExcludedFromProductCostsData: !item.isExcludedFromProductCostsData
    }
    await this.batchExcludeLineCosts([tmpItem])
  }

  async onProductDelete () {
    const { id } = this.product as IProduct

    await this.deleteProduct({ id })
    this.$router.push({
      name: 'products'
    })
  }

  async duplicate () {
    this.loading = true
    this.error = ''
    const params: any = {
      ...this.product,
      sku: this.newSku,
      name: this.newName,
      asin: this.newAsin
    }
    // Remove the id of the product so we do not attempt to update the same entity
    delete params.id
    // Remove the id of the many-to-many relationships
    // TODO type
    params.productSuppliers = params.productSuppliers.map(
      (ps: IProductSupplier) => {
        const newProductSuplier = {
          ...ps
        }
        delete newProductSuplier.id
        return newProductSuplier
      }
    )
    params.products = (params.products || []).map((p: IProduct) => {
      const newProduct = {
        id: p.id
      }
      return newProduct
    })

    try {
      await this.createProduct(params)
      this.shouldShow = false
      this.$router.push({
        name: 'productDetails',
        params: {
          sku: params.sku
        }
      })
      await this.initialLoad()
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.error = e.message
    } finally {
      this.loading = false
    }
  }

  async updateProduct () {
    this.productFormRef.validate()
    this.contactsFormRef.validate()
    if (this.productFormRef.valid && this.contactsFormRef.valid) {
      await this.submit()
    }
  }

  async alteredProductFormData (newParams: IProduct) {
    this.alteredProductForm = { ...newParams }
  }

  async alteredProducContactDetailstFormData (newParams: IProduct) {
    this.alteredProducContactDetailstForm = { ...newParams }
  }

  @Task('updateTask')
  async submit () {
    const newProduct = {
      ...this.alteredProductForm,
      // Kill any rows that are not populated
      productSuppliers:
        this.alteredProducContactDetailstForm?.productSuppliers?.filter(
          ({ supplier }) => supplier?.id
        ),
      notes: this.alteredProducContactDetailstForm?.notes,
      products: this.alteredProductForm?.products?.filter(({ id }) => id)
    }
    await this.patchProductAttributes({ formData: newProduct })
    this.$router.push({
      name: this.goBack || 'products'
    })
  }

  async restoreView () {
    this.agApi.columnApi.applyColumnState({
      state: this.productCostState.colState,
      applyOrder: true
    })
    this.agApi.api.setFilterModel(this.productCostState.filterModel)
  }

  async paginationFun (val: number) {
    this.rowPerPage = val
    this.agApi.api.setCacheBlockSize(val)
    this.agApi.api.paginationSetPageSize(val)
    this.restoreView()
  }

  async initializeGrid (param: GridReadyEvent) {
    this.agApi = param
    switch (this.selectedTab) {
      case Tab.Changelog:
        await this.initializeChangelog()
        break
      case Tab.Costs:
        await this.initializeCosts()
        break
      default:
        break
    }
  }

  async initializeCosts () {
    if (this.productCostState.rowPerPage) {
      await this.paginationFun(this.productCostState.rowPerPage)
    } else {
      await this.paginationFun(15)
    }
    this.agApi.api.setServerSideDatasource(this.dataSource)
    this.restoreView()
  }

  async initializeChangelog () {
    this.agApi.api.setServerSideDatasource(this.dataSourceChangelog)
  }

  @Task('initialLoadTask')
  async initialLoad () {
    await this.getDimensionUnit()
    await this.getWeightUnit()
    this.countries = await this.getCountries()
    this.shippingMethods = await this.getAllShippingMethods()
    await this.getProductBySku({
      sku: this.sku,
      userId: this.user.id as number
    })

    if (!this.product) {
      this.$router.replace({
        name: '404'
      })
    }

    await this.getPlaneProducts({ userId: this.user.id, size: 2000 })
    const calls = [
      this.getCostTypes(),
      this.getChangelogSources(),
      this.getAmazonIntegrationDetails(),
      this.getSuppliers({ pageSize: 2000 })
    ]
    await Promise.all(calls)
    const opts = { id: this.product.id, userId: this.user.id }
    this.alteredProduct = await this.getProductWithStatsById(opts)
    this.cachedProductWithCosts = { ...this.alteredProduct }
    this.newName = this.product.name
    this.newAsin = this.product.asin
  }

  get dataSourceChangelog () {
    return {
      getRows: async (params: any) => {
        params.api.showLoadingOverlay()
        const sort = params.request.sortModel || {}
        const pageSize = params.api.paginationGetPageSize()
        const page = params.api.paginationGetCurrentPage()
        const rowGroupCols = params.request.rowGroupCols || []
        const groupKeys = params.request.groupKeys || []
        const valueCols = params.request.valueCols || []
        try {
          if (this.productChangeLog?.content) {
            if (rowGroupCols.length) {
              const filteredListGroup = await this.localGroup(
                this.productChangeLog.content,
                rowGroupCols,
                valueCols
              )
              const filteredListGroupExpand = await this.localGroupExpand(
                filteredListGroup,
                groupKeys,
                rowGroupCols
              )
              if (filteredListGroupExpand.length) {
                params.success({
                  rowData: filteredListGroupExpand,
                  rowCount: filteredListGroupExpand.length
                })
                params.api.hideOverlay()
                // params.columnApi.autoSizeAllColumns()
                return false
              }
              params.success({
                rowData: [],
                rowCount: 0
              })
              params.api.showNoRowsOverlay()
              return false
            }
          }
          await this.getChangelog({
            productId: this.product.id,
            pagination: {
              pageSize: pageSize,
              pageNumber: page + 1,
              sort: sort
            }
          })
          if (this.productChangeLog?.content?.length) {
            params.api.hideOverlay()
            params.success({
              rowData: this.productChangeLog?.content,
              rowCount: this.productChangeLog?.totalElements
            })
            // params.columnApi.autoSizeAllColumns()
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

  get dataSource () {
    return {
      getRows: async (params: any) => {
        params.api.showLoadingOverlay()
        const sort = params.request.sortModel || {}
        const pageSize = params.api.paginationGetPageSize()
        const page = params.api.paginationGetCurrentPage()
        const rowGroupCols = params.request.rowGroupCols || []
        const groupKeys = params.request.groupKeys || []
        const valueCols = params.request.valueCols || []
        try {
          if (this.expectedCosts?.content) {
            if (rowGroupCols.length) {
              const filteredListGroup = await this.localGroup(
                this.expectedCosts.content,
                rowGroupCols,
                valueCols
              )
              const filteredListGroupExpand = await this.localGroupExpand(
                filteredListGroup,
                groupKeys,
                rowGroupCols
              )
              if (filteredListGroupExpand.length) {
                params.success({
                  rowData: filteredListGroupExpand,
                  rowCount: filteredListGroupExpand.length
                })
                params.api.hideOverlay()
                params.columnApi.autoSizeAllColumns()
                return false
              }
              params.success({
                rowData: [],
                rowCount: 0
              })
              params.api.showNoRowsOverlay()
              return false
            }
          }
          await this.getCostsByProductId({
            productId: this.product.id,
            userId: this.user.id as number,
            size: pageSize,
            page: page + 1,
            sort: sort
          })
          if (this.expectedCosts?.content.length) {
            params.api.hideOverlay()
            params.success({
              rowData: this.expectedCosts?.content,
              rowCount: this.expectedCosts?.totalElements
            })
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

  get excludeBtnText () {
    if (this.selectedCosts.length === 1) {
      return `${this.$t('components.costsTable.headers.exclude')} ${
        this.selectedCosts.length
      } ${this.$t('pages.productDetails.cost')}`
    }
    return `${this.$t('components.costsTable.headers.exclude')} ${
      this.selectedCosts.length
    } ${this.$t('pages.productDetails.costs')}`
  }

  get alertText () {
    if (this.selectedCosts.length === 1) {
      return `${this.selectedCosts.length} ${this.$t(
        'pages.productDetails.currentlySelectedCost'
      )}`
    }
    return `${this.selectedCosts.length} ${this.$t(
      'pages.productDetails.currentlySelectedCosts'
    )}`
  }

  get productWithStats () {
    if (!this.alteredProduct) return

    return this.statsForProduct(
      this.alteredProduct,
      this.cachedProductWithCosts
    )
  }

  get formattedCosts () {
    return this.selectedCosts.map((cost: ICost) => {
      return this.headers.reduce((prev: Record<string, any>, cur: any) => {
        if (cur.field === 'invoice') {
          prev[cur.headerName.toString()] = `"${get(
            cost,
            'invoice.invoiceNumber'
          )?.toString()}"`
        } else if (cur.field !== '') {
          prev[cur.headerName.toString()] = `"${get(
            cost,
            cur.field
          )?.toString()}"`
        }
        return prev
      }, {})
    })
  }

  get formattedChangelog () {
    return this.selectedLog.map((cost: ProductChangeLog) => {
      return this.changelogHeaders.reduce(
        (prev: Record<string, any>, cur: any) => {
          if (cur.field !== '') {
            prev[cur.headerName.toString()] = `"${get(
              cost,
              cur.field
            )?.toString()}"`
          }
          return prev
        },
        {}
      )
    })
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

  dateTimeFormatter (params: any) {
    if (params.value) {
      return formatUnixDateTime(params.value)
    } else {
      return '-'
    }
  }

  sourcesFormatter (params: any) {
    if (this.changelogSources && params.value) {
      return this.changelogSources[params.value]
    } else {
      return '-'
    }
  }

  async localGroup (
    filteredList: any[],
    rowGroupCols: any[],
    valueCols: any[]
  ): Promise<any[] | []> {
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
    filteredList: any[],
    groupKeys: any[],
    rowGroupCols: any[]
  ): Promise<any[] | []> {
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

  get isChartEnabled () {
    return !!this.cellRanges.length
  }

  get amazonIntegrationEnabled () {
    return !!this.userAmazonIntegrationDetails?.length
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

<style lang="scss">
.alert-wrapper {
  position: absolute;
  left: 50%;
  bottom: 0;

  .alert-selected-costs {
    position: relative;
    left: -50%;
  }
}

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
</style>
