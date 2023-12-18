<template>
  <v-form
    ref="invoiceForm"
    v-model="validForms.invoice"
    :disabled="disabled"
    :readonly="isViewer"
    @submit.prevent="$emit('update:submit')"
  >
    <v-row class="py-0 my-0">
      <v-col
        v-for="(input, key) in invoiceInputs"
        :key="key"
        cols="12"
        md="3"
        class="my-0 py-0"
      >
        <v-tooltip
          :key="key"
          top
          left
          max-width="480px"
        >
          <template #activator="{ on, attrs }">
            <div
              v-bind="attrs"
              v-on="on"
            >
              <form-field
                :class="input.class"
                :form-input="input"
                :data="invoiceData"
              />
            </div>
          </template>
          <span v-text="input.hint" />
        </v-tooltip>
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import FormField from '@/components/FormBuilder/FormField.vue'
import type { ISupplier } from '@/modules/contacts/types'
import type { IUser } from '@/modules/user/types'
import type { ObjectKeyAsAny } from '@/types/app'

import type { IInvoice } from '../types'

const namespaces = {
  user: 'user',
  invoices: 'invoices'
}

enum InputType {
  datePicker = 'datePicker',
  select = 'select',
  text = 'text',
  number = 'number',
  email = 'email',
  checkbox = 'checkbox'
}

@Component({
  components: {
    FormField
  }
})
export default class InvoiceForm extends Vue {
  @Prop()
  invoiceData!: IInvoice

  @Prop()
  readonly disabled!: boolean

  @Prop({ default: true })
  readonly isViewer!: boolean

  @Prop()
  validForms!: { invoice: boolean, lines: boolean, schedulePayment: boolean }

  @Prop({ required: true })
  suppliers!: ISupplier[]

  @State('user', { namespace: namespaces.user })
  user!: IUser

  @State('costTypes', { namespace: namespaces.invoices })
  costTypes!: ObjectKeyAsAny

  @Getter('currencySymbol', { namespace: 'accountSettings' }) currencySymbol!: string

  mounted () {
    this.$emit('update:ref-invoice-form', this.$refs.invoiceForm)
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

  rules = {
    required: [
      (v: string) => !!v || this.$t('pages.errors.rules.fieldRequired')
    ]
  }

  get invoiceInputs () {
    return [
      {
        model: 'unixDate',
        type: InputType.datePicker,
        hint: this.$t('components.invoiceForm.dateHint'),
        props: {
          disabled: this.isViewer,
          label: this.$t('components.invoiceForm.dateLabel')
        }
      },
      {
        model: 'status',
        type: InputType.select,
        variant: 'chip',
        hint: this.$t('components.invoiceForm.statusHint'),
        props: {
          readonly: true,
          label: this.$t('components.invoiceForm.statusLabel'),
          items: [
            {
              label: this.$t('components.invoiceForm.statusOptions.OPEN'),
              value: 'OPEN',
              status: 'OPEN'
            },
            {
              label: this.$t('components.invoiceForm.statusOptions.CLOSED'),
              value: 'CLOSED',
              status: 'CLOSED'
            }
          ]
        }
      },
      {
        model: 'supplier.id',
        type: InputType.select,
        hint: this.$t('components.invoiceForm.supplierHint'),
        props: {
          label: this.$t('components.invoiceForm.supplier'),
          rules: this.rules.required,
          required: true,
          items: this.expectedSuppliers
        }
      },
      {
        model: 'invoiceNumber',
        type: InputType.text,
        hint: this.$t('components.invoiceForm.invoiceNumberHint'),
        props: {
          rules: this.rules.required,
          required: true,
          label: this.$t('components.invoiceForm.invoiceNumberLabel')
        }
      },
      {
        model: 'payReferenceNumber',
        type: InputType.text,
        hint: this.$t('components.invoiceForm.payNumberHint'),
        props: {
          label: this.$t('components.invoiceForm.payNumberLabel')
        }
      },
      {
        model: 'costType',
        type: InputType.select,
        hint: this.$t('components.invoiceForm.costTypeHint'),
        props: {
          rules: this.rules.required,
          label: this.$t('components.invoiceForm.costType'),
          items: this.costTypeValues
        }
      },
      {
        model: 'invoiceTotal',
        type: InputType.text,
        hint: this.$t('components.invoiceForm.invoiceLineTotalHint'),
        mask: createNumberMask({
          prefix: this.currencySymbol,
          allowDecimal: true,
          includeThousandsSeparator: true,
          allowNegative: false
        }),
        props: {
          label: 'Invoice Total',
          required: true,
          rules: this.rules.required
        }
      },
      {
        model: 'reconciled',
        type: InputType.checkbox,
        hint: this.$t('components.invoiceForm.reconciledHint'),
        class: 'mt-n1',
        props: {
          readonly: true,
          label: this.$t('components.invoiceForm.reconciled')
        }
      }]
  }

  get costTypeValues () {
    if (!this.costTypes) return []

    return Object.keys(this.costTypes).map(costKey => {
      return { label: this.costTypes[costKey], value: costKey }
    }).sort((a, b) => a.label.localeCompare(b.label))
  }
}
</script>

<style lang="scss">
.v-text-field__details {
  padding: 0 !important;
  margin: 0 !important;

  .v-messages__message {
    margin-top: 2px;
    line-height: 1rem;
  }
}
</style>
