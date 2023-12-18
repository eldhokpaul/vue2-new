<template>
  <section>
    <v-divider />
    <template v-if="!loading">
      <editable-table
        v-model="invoice.invoiceLines"
        :headers="headers"
        :add-button="false"
      />
      <div class="text-right ma-4">
        {{ `Total: ${formatCurrency(currencySymbol,invoiceLineTotal)}` }}
      </div>
      <v-divider />
      <div
        v-if="!isViewer"
        class="ma-2 text-right"
      >
        <v-btn
          depressed
          color="primary"
          :disabled="!invoiceLinesCleanUp.length"
          @click="$emit('save:continue')"
        >
          {{ $t('components.invoiceLinesTable.save') }}
        </v-btn>
      </div>
      <v-divider />
    </template>
    <template v-else>
      <v-skeleton-loader type="list-item" />
      <v-skeleton-loader type="list-item" />
      <v-skeleton-loader type="table" />
    </template>
  </section>
</template>

<script lang="ts">
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import EditableTable from '@/components/EditableTable.vue'
import type { IProduct } from '@/modules/products/types'
import { formatCurrency } from '@/utils/currency'

import type { IInvoice, IInvoiceLine } from '../types'

@Component({
  components: {
    EditableTable
  }
})
export default class InvoiceLines extends Vue {
  @Getter('currencySymbol', { namespace: 'accountSettings' }) currencySymbol!: string
  @Prop({ required: true })
  invoice!: IInvoice

  @Prop({ required: false, default: false })
  loading!: any

  @Prop({ required: true })
  products!: IProduct[]

  @Prop({ default: true })
  isViewer!: boolean

  @Prop({ required: true })
  costTypes!: Record<string, any>

  formatCurrency=formatCurrency

  get costTypeValues () {
    return Object.keys(this.costTypes).map(costKey => {
      return { label: this.costTypes[costKey], value: costKey }
    }).sort((a, b) => a.label.localeCompare(b.label))
  }

  get headers () {
    return [
      {
        text: 'Product Name',
        value: 'product.id',
        field: {
          model: 'product.id',
          type: 'select',
          props: {
            'hide-details': true,
            readonly: this.isViewer,
            items: this.products.map((p) => ({
              label: p.name,
              value: p.id
            }))
          }
        }
      },
      {
        text: 'Internal Reference',
        value: 'internalReference',
        field: {
          model: 'internalReference',
          type: 'text',
          props: {
            readonly: this.isViewer,
            'hide-details': true
          }
        }
      },
      {
        text: 'Cost Type',
        value: 'costType',
        field: {
          model: 'costType',
          type: 'select',
          props: {
            readonly: this.isViewer,
            'hide-details': true,
            items: this.costTypeValues
          }
        }
      },
      {
        text: 'Quantity',
        value: 'quantity',
        isEditable (item: any) {
          return item.costType === 'FACTORY_INVOICE'
        },
        field: {
          model: 'quantity',
          type: 'text',
          props: {
            readonly: this.isViewer,
            type: 'number',
            'hide-details': true,
            min: 0.01,
            step: 0.01
          }
        }
      },
      {
        text: 'Amount',
        value: 'amount',
        field: {
          mask: createNumberMask({
            prefix: this.currencySymbol,
            allowDecimal: true,
            includeThousandsSeparator: true,
            allowNegative: false
          }),
          model: 'amount',
          type: 'text',
          props: {
            readonly: this.isViewer,
            'hide-details': true
          }
        }
      },
      {
        text: 'Exclude',
        value: 'isExcludedFromProductCostsData',
        field: {
          model: 'isExcludedFromProductCostsData',
          type: 'checkbox',
          props: {
            readonly: this.isViewer,
            'hide-details': true
          }
        }
      }
    ]
  }

  get invoiceLinesCleanUp () {
    const filter = (line: any) => {
      if (typeof (line as IInvoiceLine).id === 'string') {
        delete (line as IInvoiceLine).id
      }
      return line.product?.id
    }
    return this.invoice.invoiceLines.filter(filter)
  }

  get invoiceLineTotal () {
    if (!this.invoice.invoiceLines) {
      return 0
    }
    // return this.invoice.invoiceLines.reduce((a: number, b: any) => a + +(b.amount || 0), 0)
    return this.invoice.invoiceLines.reduce((a: number, b: any) => a + +(Number(b.amount?.toString().replace(/[^0-9.-]+/g, '')) || 0), 0)
    // return this.invoice.invoiceLines.reduce((sum, line) => {
    //   return sum + (Number(line.amount?.toString().replace(/[^0-9.-]+/g, '')) || 0) * (line.quantity || 1)
    // }, 0)
  }
}
</script>
