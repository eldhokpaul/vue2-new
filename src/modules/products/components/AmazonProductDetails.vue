<template>
  <div>
    <form-builder
      :data="product"
      :form-inputs="amazonFeilds"
    />
    <div class="d-flex justify-space-between">
      {{ $t('components.amazonProductDetails.feeStatus') }}: <app-chip
        type="product"
        :item="amazonProductStatus"
      />
    </div>
  </div>
</template>

<script lang="ts">
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import AppChip from '@/components/AppChip.vue'
import FormBuilder from '@/components/FormBuilder/FormBuilder.vue'

import type { IProductFormData } from '../types'

@Component({
  components: {
    AppChip,
    FormBuilder
  }
})
export default class AmazonProductDetails extends Vue {
  @Getter('currencySymbol', { namespace: 'accountSettings' }) currencySymbol!: string

  @Prop({ default: true })
  readonly isViewer!: boolean

  @Prop()
  product!: IProductFormData

  rules = {
    required: [
      (v: string) => !!v || this.$t('pages.errors.rules.fieldRequired')
    ]
  }

  get amazonProductStatus () {
    return {
      label: this.$t(`components.productForm.statusOptions.${this.product.amazonProductStatus}`),
      value: this.product.amazonProductStatus,
      status: this.product.amazonProductStatus
    }
  }

  get amazonFeilds () {
    return [
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
        model: 'asin',
        type: 'text',
        props: {
          readonly: this.isViewer,
          label: this.$t('components.amazonProductDetails.asin'),
          required: false
        }
      },
      {
        model: 'fnsku',
        type: 'text',
        props: {
          label: 'FNSKU',
          required: false
        }
      },
      {
        model: 'amazonFees',
        type: 'text',
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
