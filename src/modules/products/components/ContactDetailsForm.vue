<template>
  <div>
    <v-form
      ref="form"
      v-model="valid"
      :readonly="isViewer"
    >
      <!-- @submit.prevent="validate" -->
      <v-row class="align-center flex-sm-column flex-md-row">
        <v-col class="text-md-start text-sm-center">
          <form-builder
            class="row"
            :data="productData"
            :form-inputs="contactDetailsFields"
          />
          <div>
            <v-chip
              v-for="(tag, index) in hsCodes"
              :key="index"
              class="mb-3 mr-1"
              outlined
              color="primary"
              close
              @click:close="removeHsCode(index)"
            >
              {{ tag }}
            </v-chip>
            <v-text-field
              v-model.trim="hsCode"
              label="HS Codes"
              outlined
              dense
              append-icon="mdi-plus"
              @click:append="addHsCode"
            />
          </div>
          <div>
            <v-chip
              v-for="(tag, index) in tariffRates"
              :key="index"
              close
              outlined
              color="primary"
              class="mb-3 mr-1"
              @click:close="removeTariffRate(index)"
            >
              {{ tag }}
            </v-chip>
            <v-text-field
              v-model.trim="tariffRate"
              label="Duties and Tariffs"
              dense
              :rules="rules.tariffRule"
              outlined
              append-icon="mdi-plus"
              @click:append="addTariffRate"
            />
          </div>
          <v-row>
            <v-col class="col-md-3">
              <h4
                v-t="'pages.productDetails.productPackaging'"
              />
            </v-col>
            <v-col class="col-md-9">
              <div class="pt-3 float-md-right">
                <v-btn-toggle
                  v-model="selectedProductMetricLenght"
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
                  v-model="selectedProductMetricWeight"
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
            :form-inputs="productPackagingFeilds"
          />
          <v-row>
            <v-col class="col-md-3">
              <h4
                v-t="'pages.productDetails.casePackaging'"
              />
            </v-col>
            <v-col class="col-md-9">
              <div class="pt-3 float-md-right">
                <v-btn-toggle
                  v-model="selectedCaseMetricLenght"
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
                  v-model="selectedCaseMetricWeight"
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
            :form-inputs="casePackagingFeilds"
          />
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import AppChip from '@/components/AppChip.vue'
import AppDeleteDialog from '@/components/dialogs/AppDeleteDialog.vue'
import FormBuilder from '@/components/FormBuilder/FormBuilder.vue'
import type { ISupplier } from '@/modules/contacts/types'
import type { ObjectKeyAsAny } from '@/types/app'

import type { IBrand, IProductFormData } from '../types'
const namespaces = {
  products: 'products',
  toasts: 'toasts'
}

@Component({
  components: {
    AppDeleteDialog,
    FormBuilder,
    AppChip

  }
})
export default class ContactDetailsForm extends Vue {
  @Getter('currencySymbol', { namespace: 'accountSettings' }) currencySymbol!: string

  @State('channels', { namespace: namespaces.products }) channels!: string[]
  @State('weightUnits', { namespace: namespaces.products }) weightUnits!: any
  @State('dimensionUnits', { namespace: namespaces.products }) dimensionUnits!: any

  // @Action('getBrands', { namespace: namespaces.products }) getBrands!:() => Promise<void>
  // @Action('addError', { namespace: namespaces.toasts }) addError!: (text: string) => Promise<any>

  @Prop({ required: true }) product!: IProductFormData
  @Prop({ required: true }) suppliers!: ISupplier[]
  @Prop({ default: true }) readonly isViewer!: boolean
  @Prop() readonly newProduct!: boolean
  @Prop({ default: {} }) countries!: ObjectKeyAsAny
  @Prop({ default: {} }) shippingMethods!: ObjectKeyAsAny
  // @Prop() readonly supplierDetails!: IProductSupplier

  brands: IBrand[] | null = []
  valid = false
  // productData = { ...this.product }
  productData!:IProductFormData
  // countries: ObjectKeyAsAny=[{ }]
  // shippingMethods: ObjectKeyAsAny=[{ }]
  selectedProductMetricLenght: string | null=''
  selectedProductMetricWeight: string | null=''
  selectedCaseMetricLenght: string | null=''
  selectedCaseMetricWeight: string | null=''
  hsCode = '';
  hsCodes: string[] = [];
  tariffRate = '';
  tariffRates: string[] = [];

  rules = {
    required: [
      (v: string) => !!v || this.$t('pages.errors.rules.fieldRequired')
    ],
    tariffRule: [
      (v: string) => !v || /^\d+(\.?\d+)?%?$/.test(v) || 'Input must be valid'
    ]
  }

  async beforeMount () {
    // this.countries = await this.getCountries()
    // this.shippingMethods = await this.getAllShippingMethods()
    this.productData = { ...this.product }
  }

  async mounted () {
    if (this.product.productSuppliers?.length) {
      this.selectedProductMetricLenght = this.product.productSuppliers[0].packagingLongestSideDimensionUnit ?? 'CM'
      this.selectedProductMetricWeight = this.product.productSuppliers[0].packagingUnitWeightUnit ?? 'KG'
      this.selectedCaseMetricLenght = this.product.productSuppliers[0].caseLongestSideDimensionUnit ?? 'CM'
      this.selectedCaseMetricWeight = this.product.productSuppliers[0].caseGrossWeightUnit ?? 'CM'
      if (this.productData.productSuppliers && this.productData.productSuppliers[0] && this.productData.productSuppliers[0].hsCodes) {
        this.hsCodes = this.productData.productSuppliers[0].hsCodes.split(', ')
      }
      if (this.productData.productSuppliers && this.productData.productSuppliers[0] && this.productData.productSuppliers[0].tariffRates) {
        this.tariffRates = this.productData.productSuppliers[0].tariffRates.split(', ')
      }
    }
  }

  get expectedSuppliers () {
    const empty = [{
      label: null,
      value: null
    }]
    if (!this.suppliers.length) return empty
    return this.suppliers.map(supplier => {
      return {
        label: supplier.companyName,
        value: supplier.id
      }
    })
  }

  get shippingMethodValue () {
    const empty = [{
      label: null,
      value: null
    }]
    if (!this.shippingMethods) return empty
    return Object.keys(this.shippingMethods).map(key => {
      return { label: this.shippingMethods[key], value: key }
    }).sort((a, b) => a.label.localeCompare(b.label))
  }

  get countriesValue () {
    const empty = [{
      label: null,
      value: null
    }]
    if (!this.countries) return empty
    return Object.keys(this.countries).map(key => {
      return { label: this.countries[key], value: key }
    }).sort((a, b) => a.label.localeCompare(b.label))
  }

  async validate () {
    const { form } = this.$refs as HTMLFormElement
    form.validate()
    if (this.valid && this.productData.productSuppliers?.length) {
      this.productData.productSuppliers[0].packagingLongestSideDimensionUnit = this.selectedProductMetricLenght
      this.productData.productSuppliers[0].packagingMedianSideDimensionUnit = this.selectedProductMetricLenght
      this.productData.productSuppliers[0].packagingShortSideDimensionUnit = this.selectedProductMetricLenght
      this.productData.productSuppliers[0].packagingUnitWeightUnit = this.selectedProductMetricWeight

      this.productData.productSuppliers[0].caseLongestSideDimensionUnit = this.selectedCaseMetricLenght
      this.productData.productSuppliers[0].caseMedianSideDimensionUnit = this.selectedCaseMetricLenght
      this.productData.productSuppliers[0].caseShortSideDimensionUnit = this.selectedCaseMetricLenght
      this.productData.productSuppliers[0].caseGrossWeightUnit = this.selectedCaseMetricWeight

      this.productData.productSuppliers[0].hsCodes = this.hsCodes.join(', ')
      this.productData.productSuppliers[0].tariffRates = this.tariffRates.join(', ')

      this.$emit('submit', this.productData)
    }
  }

  get contactDetailsFields () {
    return [
      {
        model: 'productSuppliers[0].supplier.id',
        type: 'select',
        class: 'my-0 py-0 col-md-12',
        props: {
          label: 'Company Name',
          required: true,
          readonly: this.isViewer,
          rules: this.rules.required,
          items: this.expectedSuppliers
        }
      },
      {
        model: 'productSuppliers[0].countryOfOrigin',
        type: 'select',
        class: 'my-0 py-0 col-md-12',
        props: {
          label: 'Country Of Origin',
          required: true,
          readonly: this.isViewer,
          rules: this.rules.required,
          items: this.countriesValue
        }
      },
      {
        model: 'productSuppliers[0].shippingMethod',
        type: 'select',
        class: 'my-0 py-0 col-md-4',
        props: {
          label: 'Shipping Method',
          readonly: this.isViewer,
          required: false,
          items: this.shippingMethodValue
        }
      },
      {
        model: 'productSuppliers[0].material',
        type: 'text',
        class: 'my-0 py-0 col-md-4',
        props: {
          label: 'Material',
          readonly: this.isViewer,
          required: false
        }
      },
      {
        model: 'productSuppliers[0].supplierTermsInDays',
        type: 'text',
        class: 'my-0 py-0 col-md-4',
        props: {
          required: false,
          readonly: this.isViewer,
          type: 'number',
          suffix: 'Days',
          label: 'Supplier Terms'
        }
      },
      {
        model: 'productSuppliers[0].productionLeadTimeInDays',
        type: 'text',
        class: 'my-0 py-0 col-md-4',
        props: {
          suffix: 'Days',
          required: false,
          readonly: this.isViewer,
          type: 'number',
          label: 'Production Time'
        }
      },
      {
        model: 'productSuppliers[0].inTransitLeadTimeInDays',
        type: 'text',
        class: 'my-0 py-0 col-md-4',
        props: {
          required: false,
          readonly: this.isViewer,
          suffix: 'Days',
          type: 'number',
          label: 'In-transit Time'
        }
      },
      {
        model: 'productSuppliers[0].totalLeadTimeInDays',
        type: 'text',
        class: 'my-0 py-0 col-md-4',
        props: {
          required: false,
          disabled: true,
          suffix: 'Days',
          label: 'Total Lead Time'
        }
      }
      // ,{
      //   model: 'productSuppliers[0].hsCodes',
      //   type: 'text',
      //   class: 'my-0 py-0 col-md-12',
      //   props: {
      //     label: 'HS Codes',
      //     readonly: this.isViewer,
      //     required: false
      //   }
      // },
      // {
      //   model: 'productSuppliers[0].tariffRates',
      //   type: 'text',
      //   class: 'my-0 py-0 col-md-12',
      //   props: {
      //     label: 'Duties and Tariffs',
      //     readonly: this.isViewer,
      //     required: false
      //   }
      // }
    ]
  }

  get productPackagingFeilds () {
    return [
      {
        model: 'productSuppliers[0].packagingLongestSideDimension',
        type: 'text',
        class: 'my-0 py-0 col-md-3',
        props: {
          suffix: this.selectedProductMetricLenght,
          label: this.$t('components.productForm.dimensions.length'),
          readonly: this.isViewer,
          required: false,
          type: 'number',
          min: 0.1,
          step: 0.1
        }
      },
      {
        model: 'productSuppliers[0].packagingMedianSideDimension',
        type: 'text',
        class: 'my-0 py-0 col-md-3',
        props: {
          suffix: this.selectedProductMetricLenght,
          label: this.$t('components.productForm.dimensions.width'),
          readonly: this.isViewer,
          required: false,
          type: 'number',
          min: 0.1,
          step: 0.1
        }
      },
      {
        model: 'productSuppliers[0].packagingShortSideDimension',
        type: 'text',
        class: 'my-0 py-0 col-md-3',
        props: {
          required: false,
          suffix: this.selectedProductMetricLenght,
          label: this.$t('components.productForm.dimensions.height'),
          readonly: this.isViewer,
          type: 'number',
          min: 0.1,
          step: 0.1
        }
      },
      {
        model: 'productSuppliers[0].packagingUnitWeight',
        type: 'text',
        class: 'my-0 py-0 col-md-3',
        props: {
          suffix: this.selectedProductMetricWeight,
          label: this.$t('components.productForm.weights.unitWeight'),
          required: false,
          readonly: this.isViewer,
          type: 'number',
          min: 0.1,
          step: 0.1
        }
      }
    ]
  }

  get casePackagingFeilds () {
    return [
      {
        model: 'productSuppliers[0].unitsPerCase',
        type: 'text',
        class: 'my-0 py-0 col-md-12',
        props: {
          label: 'Units Per Case ',
          required: false,
          readonly: this.isViewer,
          type: 'number',
          min: 0.1,
          step: 0.1
        }
      },
      // {
      //   model: 'productSuppliers[0].totalCases',
      //   type: 'text',
      //   class: 'my-0 py-0 col-md-12',
      //   props: {
      //     label: 'Total Cases',
      //     required: false
      //   }
      // },
      {
        model: 'productSuppliers[0].caseLongestSideDimension',
        type: 'text',
        class: 'my-0 py-0 col-md-3',
        props: {
          label: this.$t('components.productForm.dimensions.length'),
          suffix: this.selectedCaseMetricLenght,
          readonly: this.isViewer,
          required: false,
          type: 'number',
          min: 0.1,
          step: 0.1
        }
      },
      {
        model: 'productSuppliers[0].caseMedianSideDimension',
        type: 'text',
        class: 'my-0 py-0 col-md-3',
        props: {
          label: this.$t('components.productForm.dimensions.width'),
          suffix: this.selectedCaseMetricLenght,
          required: false,
          readonly: this.isViewer,
          type: 'number',
          min: 0.1,
          step: 0.1
        }
      },
      {
        model: 'productSuppliers[0].caseShortSideDimension',
        type: 'text',
        class: 'my-0 py-0 col-md-3',
        props: {
          required: false,
          suffix: this.selectedCaseMetricLenght,
          label: this.$t('components.productForm.dimensions.height'),
          readonly: this.isViewer,
          type: 'number',
          min: 0.1,
          step: 0.1
        }
      },
      {
        class: 'my-0 py-0 col-md-3',
        model: 'productSuppliers[0].caseGrossWeight',
        type: 'text',
        props: {
          label: 'Case Weight',
          suffix: this.selectedCaseMetricWeight,
          required: false,
          readonly: this.isViewer,
          type: 'number',
          min: 0.1,
          step: 0.1
        }
      },
      {
        model: 'notes',
        type: 'textarea',
        class: 'my-0 py-0 col-md-12',
        props: {
          readonly: this.isViewer,
          label: this.$t('components.productForm.notes'),
          required: false
        }
      }
    ]
  }

  addHsCode () {
    if (this.hsCode) {
      this.hsCodes.push(this.hsCode)
      this.hsCode = ''
    }
  }

  removeHsCode (index: number) {
    this.hsCodes.splice(index, 1)
  }

  addTariffRate () {
    const regExp = /^\d+(\.?\d+)?%?$/
    if (this.tariffRate && regExp.test(this.tariffRate)) {
      this.tariffRates.push(this.tariffRate)
      this.tariffRate = ''
    }
  }

  removeTariffRate (index: number) {
    this.tariffRates.splice(index, 1)
  }
}
</script>
