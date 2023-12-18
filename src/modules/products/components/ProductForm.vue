<template>
  <div>
    <v-form
      ref="form"
      v-model="valid"
      :readonly="isViewer"
    >
      <form-builder
        :data="productData"
        :form-inputs="productFields"
      />
      <v-row class="align-center flex-sm-column flex-md-row">
        <v-col class="text-md-start text-sm-center">
          <!-- <h4
            v-t="'components.productForm.dimensions.dimensions'"
            class="mb-8"
          />
          <form-builder
            class="row"
            :data="productData"
            :form-inputs="productDimensionFields"
          /> -->
          <template v-if="$flags.AMAZON_ENABLED">
            <v-row>
              <v-col class="col-md-3">
                <h4
                  v-t="'pages.productDetails.amazon'"
                  class="float-left"
                />
              </v-col>
              <v-col class="col-md-9">
                <div class="pt-3 float-md-right">
                  <v-btn-toggle
                    v-model="productData.longestSideDimensionUnit"
                    tile
                    class="mr-2 pb-1"
                    dense
                    mandatory
                  >
                    <v-btn
                      v-for="(value, key) in dimensionUnits"
                      :key="key"
                      :value="key"
                    >
                      {{ value }}
                    </v-btn>
                  </v-btn-toggle>

                  <v-btn-toggle
                    v-model="productData.unitWeightUnit"
                    tile
                    dense
                    mandatory
                  >
                    <v-btn
                      v-for="(value, key) in weightUnits"
                      :key="key"
                      :value="key"
                    >
                      {{ value }}
                    </v-btn>
                  </v-btn-toggle>
                </div>
              </v-col>
            </v-row>
            <form-builder
              class="row mt-3"
              :data="productData"
              :form-inputs="amazonFeilds"
            />
            <div
              v-if="!!productData.amazonProductStatus"
              class="d-flex justify-space-between"
            >
              {{ $t('components.amazonProductDetails.feeStatus') }}: <app-chip
                type="product"
                :item="amazonProductStatus"
              />
            </div>
          </template>
        </v-col>
      </v-row>
      <!-- <v-row class="align-center flex-sm-column flex-md-row">
        <v-col>
          <h4
            v-t="'components.productForm.weights.weights'"
            class="mb-8"
          />
          <form-builder
            class="row"
            :data="productData"
            :form-inputs="productWeightFields"
          />
        </v-col>
      </v-row> -->

      <!-- <v-spacer />
      <v-row class="align-center flex-sm-column flex-md-row">
        <v-col class="text-md-start text-sm-center">
          <app-delete-dialog
            v-if="!newProduct"
            v-show="!isViewer"
            :action-btn-text="'pages.products.actions.delete'"
            :confirm-text="'pages.products.actions.text'"
            @confirm="$emit('delete')"
          />
        </v-col>
        <v-col class="d-flex justify-md-end justify-sm-center">
          <v-btn
            v-show="!isViewer"
            v-t="newProduct ? 'components.productForm.saveProduct' : 'components.productForm.saveProduct'"
            type="submit"
            color="primary"
            depressed
          />
        </v-col>
      </v-row> -->
    </v-form>
  </div>
</template>

<script lang="ts">
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'

import AppChip from '@/components/AppChip.vue'
// import AppDeleteDialog from '@/components/dialogs/AppDeleteDialog.vue'
import FormBuilder from '@/components/FormBuilder/FormBuilder.vue'

import type { IProductFormData } from '../types'

const namespaces = {
  products: 'products',
  toasts: 'toasts'
}

@Component({
  components: {
    // AppDeleteDialog,
    FormBuilder,
    AppChip

  }
})
export default class ProductForm extends Vue {
  @Getter('currencySymbol', { namespace: 'accountSettings' }) currencySymbol!: string

  @Action('addError', { namespace: namespaces.toasts }) addError!: (text: string) => Promise<any>
  // @Action('getBrands', { namespace: namespaces.products }) getBrands!: any

  @State('channels', { namespace: namespaces.products }) channels!: string[]
  @State('weightUnits', { namespace: namespaces.products }) weightUnits!: any
  @State('dimensionUnits', { namespace: namespaces.products }) dimensionUnits!: any

  @Prop({ required: true }) product!: IProductFormData
  @Prop({ default: true }) readonly isViewer!: boolean
  // @Prop() readonly supplierDetails!: IProductSupplier
  // @Prop() readonly newProduct!: boolean

  // brands: IBrand[]|null=[]
  valid = false
  productData!:IProductFormData
  // productData = { ...this.product }

  rules = {
    required: [
      (v: string) => !!v || this.$t('pages.errors.rules.fieldRequired')
    ]
  }

  async validate () {
    const { form } = this.$refs as HTMLFormElement
    form.validate()
    if (this.valid) {
      // this.productData.productSuppliers = this.product.productSuppliers
      this.productData.products = this.product.products
      // this.productData.notes = this.product.notes
      this.productData.amazonFees = Number(this.productData.amazonFees?.toString().replace(/[^0-9.-]+/g, ''))
      this.productData.medianSideDimensionUnit = this.productData.longestSideDimensionUnit
      this.productData.shortSideDimensionUnit = this.productData.longestSideDimensionUnit
      this.$emit('submit', this.productData)
    }
  }

  async beforeMount () {
    this.productData = { ...this.product }
    // await this.initialLoad()
  }

  // @Task('initialLoadTask')
  // async initialLoad () {
  //   this.brands = await this.getBrands()
  // }

  get amazonProductStatus () {
    return {
      label: this.$t(`components.productForm.statusOptions.${this.product.amazonProductStatus}`),
      value: this.product.amazonProductStatus,
      status: this.product.amazonProductStatus
    }
  }

  // get expectedBrands () {
  //   const empty = [{
  //     label: null,
  //     value: null
  //   }]
  //   if (!this.brands?.length) return empty
  //   return this.brands.map(brand => {
  //     return {
  //       label: brand.name,
  //       value: brand.id
  //     }
  //   })
  // }

  get productFields () {
    return [
      {
        model: 'name',
        type: 'text',
        props: {
          rules: this.rules.required,
          autofocus: true,
          readonly: this.isViewer,
          required: true,
          label: this.$t('components.productForm.name')
        }
      },
      {
        model: 'sku',
        type: 'text',
        props: {
          label: 'SKU',
          readonly: this.isViewer,
          rules: this.rules.required,
          required: true
        }
      },
      {
        model: 'status',
        type: 'select',
        variant: 'chip',
        props: {
          label: this.$t('components.productForm.status'),
          required: true,
          readonly: this.isViewer,
          rules: this.rules.required,
          items: [
            {
              label: this.$t('components.productForm.statusOptions.ACTIVE'),
              value: 'ACTIVE',
              status: 'ACTIVE',
              type: 'product'
            },
            {
              label: this.$t('components.productForm.statusOptions.INACTIVE'),
              value: 'INACTIVE',
              status: 'INACTIVE',
              type: 'product'
            }
          ]
        }
      },
      // {
      //   model: 'brand.id',
      //   type: 'select',
      //   props: {
      //     label: 'Brand',
      //     required: true,
      //     rules: this.rules.required,
      //     items: this.expectedBrands
      //   }
      // },
      {
        model: 'tag',
        type: 'text',
        props: {
          required: false,
          readonly: this.isViewer,
          label: this.$t('components.productForm.tag')
        }
      }
    ]
  }

  get amazonFeilds () {
    return [
      {
        model: 'asin',
        type: 'text',
        class: 'my-0 py-0 col-md-12',
        props: {
          readonly: this.isViewer,
          label: this.$t('components.amazonProductDetails.asin'),
          required: false
        }
      },
      {
        model: 'fnSku',
        type: 'text',
        class: 'my-0 py-0 col-md-12',
        props: {
          label: 'FNSKU',
          readonly: this.isViewer,
          required: true
        }
      },
      {
        model: 'longestSideDimension',
        type: 'text',
        class: 'my-0 py-0 col-md-3',
        props: {
          label: this.$t('components.productForm.dimensions.length'),
          required: true,
          suffix: this.productData.longestSideDimensionUnit,
          readonly: this.isViewer,
          type: 'number',
          min: 0.1,
          step: 0.1
        }
      },
      {
        model: 'medianSideDimension',
        type: 'text',
        class: 'my-0 py-0 col-md-3',
        props: {
          suffix: this.productData.longestSideDimensionUnit,
          label: this.$t('components.productForm.dimensions.width'),
          required: false,
          readonly: this.isViewer,
          type: 'number',
          min: 0.1,
          step: 0.1
        }
      },
      {
        model: 'shortSideDimension',
        type: 'text',
        class: 'my-0 py-0 col-md-3',
        props: {
          required: false,
          suffix: this.productData.longestSideDimensionUnit,
          label: this.$t('components.productForm.dimensions.height'),
          type: 'number',
          readonly: this.isViewer,
          min: 0.1,
          step: 0.1
        }
      },
      // {
      //   model: 'lengthAndGirth',
      //   type: 'text',
      //   class: 'my-0 py-0 col-md-3',
      //   props: {
      //     required: false,
      //     label: this.$t('components.productForm.dimensions.lengthGirth'),
      //     type: 'number',
      //     min: 0.1,
      //     step: 0.1
      //   }
      // },
      {
        class: 'my-0 py-0 col-md-3',
        model: 'perUnitWeight',
        type: 'text',
        props: {
          suffix: this.productData.unitWeightUnit,
          label: this.$t('components.productForm.weights.unitWeight'),
          required: false,
          type: 'number',
          readonly: this.isViewer,
          min: 0.1,
          step: 0.1
        }
      },
      {
        model: 'productSizeTier',
        type: 'text',
        class: 'my-0 py-0 col-md-12',
        props: {
          label: 'Product Tier Size',
          readonly: this.isViewer,
          required: false
        }
      },
      {
        model: 'amazonFees',
        type: 'text',
        class: 'my-0 py-0 col-md-12',
        props: {
          readonly: this.isViewer,
          label: this.$t('components.amazonProductDetails.amazonFees'),
          required: false
        },
        mask: createNumberMask({
          prefix: this.currencySymbol,
          allowDecimal: true,
          includeThousandsSeparator: true,
          allowNegative: false
        })
      }
    ]
  }
}
</script>
