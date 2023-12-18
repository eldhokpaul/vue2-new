<template>
  <v-container
    class="page-container"
    fluid
  >
    <page-header
      :title="$t('routes.addAProduct')"
    >
      <template #back>
        <v-btn
          icon
          text
          large
          class="mr-2"
          color="toolbar"
          :to="{
            name: goBack || 'products'
          }"
          exact
        >
          <v-icon>
            mdi-arrow-left
          </v-icon>
        </v-btn>
      </template>
      <template #buttons>
        <v-btn
          v-show="!isViewer"
          v-t="'components.productForm.saveProduct'"
          color="primary"
          depressed
          :block="!$vuetify.breakpoint.smAndUp"
          :loading="updateTask.isActive"
          @click="addProduct"
        />
      </template>
    </page-header>
    <v-skeleton-loader
      v-if="initialLoadTask.isActive"
      type="table"
    />
    <template v-else>
      <v-row>
        <v-col class="col-sm-12 col-md-6">
          <v-card
            outlined
            min-height="860"
          >
            <v-container fluid>
              <v-row>
                <v-col>
                  <h4
                    v-t="'components.productForm.details'"
                  />
                  <bundle-table
                    :product="product"
                    :products="childProductItems"
                    :is-viewer="isViewer"
                    :loading="initialLoadTask.isActive"
                    @bundle-change="updateIsBundle"
                  />
                  <product-form
                    ref="productFormRef"
                    :is-viewer="isViewer"
                    class="mt-4"
                    :product="product"
                    :new-product="true"
                    :is-bundle="product.isBundle"
                    :disabled="updateTask.isActive"
                    @submit="alteredProductFormData"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
        <v-col class="col-sm-12 col-md-6">
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
                :suppliers="suppliers.content"
                :product="product"
                :disabled="updateTask.isActive"
                :is-viewer="isViewer"
                :countries="countries"
                :shipping-methods="shippingMethods"
                @submit="alteredProducContactDetailstFormData"
              />
            </v-container>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script lang="ts">
import * as Sentry from '@sentry/vue'
import { Component, Prop, Ref, Vue } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'

import type { Pageable } from '@/client/suppliers'
import PageHeader from '@/components/PageHeader.vue'
import { Task } from '@/decorators/task'
import type { ISuppliers } from '@/modules/contacts/types'
import BundleTable from '@/modules/products/components/BundleTable.vue'
import SuppliersTable from '@/modules/products/components/SuppliersTable.vue'
import type { IUser } from '@/modules/user/types'
import { ObjectKeyAsAny } from '@/types/app'
import { getUniqueId } from '@/utils/uuid'

import ContactsForm from '../components/ContactDetailsForm.vue'
import ProductForm from '../components/ProductForm.vue'
import type { IProduct, IProductFormData, IProducts, IProductSupplier } from '../types'

const namespaces = {
  products: 'products',
  user: 'user',
  toasts: 'toasts',
  suppliers: 'suppliers'
}

@Component({
  components: {
    BundleTable,
    PageHeader,
    SuppliersTable,
    ProductForm,
    ContactsForm
  }
})
export default class AddProduct extends Vue {
  @Getter('isViewer', { namespace: namespaces.user }) isViewer!: boolean

  @Action('createProduct', { namespace: namespaces.products }) createProduct!: (product: IProductFormData) => Promise<void>
  @Action('getSuppliers', { namespace: namespaces.suppliers }) getSuppliers!: (pagination: Pageable) => Promise<void>;
  @Action('addError', { namespace: namespaces.toasts }) addError!: any
  @Action('getPlaneProducts', { namespace: namespaces.products }) getPlaneProducts!: (opts: any) => Promise<any>
  @Action('getDimensionUnit', { namespace: namespaces.products }) getDimensionUnit!: () => Promise<void>
  @Action('getWeightUnit', { namespace: namespaces.products }) getWeightUnit!: () => Promise<void>
  @Action('getCountries', { namespace: namespaces.products }) getCountries!: () => Promise<ObjectKeyAsAny>
  @Action('getAllShippingMethods', { namespace: namespaces.products }) getAllShippingMethods!: () => Promise<ObjectKeyAsAny>
  // @Action('patchProductAttributes', { namespace: namespaces.products }) patchProductAttributes: any

  @State('plainProducts', { namespace: namespaces.products }) plainProducts!: IProduct[]
  @State('user', { namespace: namespaces.user }) user!: IUser
  @State('suppliers', { namespace: namespaces.suppliers }) suppliers!: ISuppliers
  @State('products', { namespace: namespaces.products }) products!: IProducts

  @Prop() readonly goBack!: string

  @Ref() readonly productFormRef!: ProductForm
  @Ref() readonly contactsFormRef!: ContactsForm

  product: IProductFormData = {
    name: '',
    status: '',
    tag: '',
    group: null,
    reBrand: null,
    fnSku: '',
    longestSideDimension: null,
    medianSideDimension: null,
    shortSideDimension: null,
    perUnitWeight: null,
    productSizeTier: null,
    sku: '',
    notes: '',
    asin: '',
    productSuppliers: [],
    products: [],
    isBundle: false
  }

  alteredProductForm: IProductFormData | null = null;
  alteredProducContactDetailstForm: IProductFormData | null = null;
  expectedSupplier: IProductSupplier | null = null
  childProductMax = 10
  countries!: ObjectKeyAsAny
  shippingMethods!: ObjectKeyAsAny

  onSupplierClick (newValue: IProductSupplier) {
    this.expectedSupplier = newValue
    this.expectedSupplier.uuid = getUniqueId()
  }

  get childProductItems () {
    return this.plainProducts
      .filter(p => !p.isBundle)
      .map((p) => {
        return {
          id: p.id,
          label: p.name
        }
      })
  }

  updateIsBundle () {
    this.product.products = []
    this.product.productSuppliers = []
  }

  async beforeMount () {
    await this.initialLoad()
  }

  @Task('initialLoadTask')
  async initialLoad () {
    await Promise.all([
      this.getPlaneProducts({ userId: this.user.id, size: 2000 }),
      this.getSuppliers({ pageSize: 2000 }),
      this.getDimensionUnit(),
      this.getWeightUnit()
    ])
    this.countries = await this.getCountries()
    this.shippingMethods = await this.getAllShippingMethods()
  }

  async addProduct () {
    // this.productFormRef.validate()
    this.productFormRef.validate()
    this.contactsFormRef.validate()
    if (this.productFormRef.valid && this.contactsFormRef.valid) {
      await this.submit()
    }
  }

  async alteredProductFormData (newParams: IProductFormData) {
    this.alteredProductForm = { ...newParams }
  }

  async alteredProducContactDetailstFormData (newParams: IProductFormData) {
    this.alteredProducContactDetailstForm = { ...newParams }
  }

  @Task('updateTask')
  async submit () {
    const newProduct = {
      ...this.alteredProductForm,
      // Kill any rows that are not populated
      productSuppliers: this.alteredProducContactDetailstForm?.productSuppliers?.filter(
        ({ supplier }) => supplier?.id
      ),
      notes: this.alteredProducContactDetailstForm?.notes,
      products: this.alteredProductForm?.products?.filter(
        ({ id }) => id
      )
    }
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.createProduct(newProduct)
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (e.message.includes('sku')) {
        await this.addError(this.$t('pages.errors.products.skuNotUniq'))
      } else {
        Sentry.captureException(e)
        await this.addError(this.$t('pages.errors.422.description'))
      }
      return
    }

    this.$router.push({
      name: 'products'
    })
  }
}
</script>
