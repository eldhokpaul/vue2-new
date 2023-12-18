<template>
  <section>
    <v-divider />
    <v-form
      ref="schedulePaymentForm"
      v-model="validForms.schedulePayment"
      :readonly="isViewer"
      @submit.prevent="$emit('save')"
    >
      <v-col>
        <form-builder
          :data="value"
          :form-inputs="paymentScheduleFields"
        />
      </v-col>
      <v-divider />
      <payments-table
        v-model="value.payments"
        :max-items="10"
        :headers="headers"
        @payment:action="updatePaymentStatus"
        @change:field="change"
        @add:row="addRow"
        @sync:account-code="syncAccountCodes"
      />
      <v-divider />
      <div class="d-flex flex-grow-1 flex-column justify-end">
        <div class="d-flex justify-end pt-4">
          <p class="pr-14">
            {{ `Total ${formatCurrency(currencySymbol,paymentsTotal)}` }}
          </p>
        </div>
      </div>
      <v-alert
        v-if="xeroDiscrepency && value.payments.length"
        dense
        type="warning"
        text
        class="mb-6"
      >
        {{ $t('components.PayablesTable.page.donotmatch') }} {{ formatCurrency(currencySymbol,xeroDiscrepency) }}
        <br>
        <template v-if="hasTranspositionalError">
          {{ $t('components.PayablesTable.page.swapped') }}
        </template>
      </v-alert>
      <v-divider />
      <div
        v-if="!isViewer"
        class="ma-2 text-right"
      >
        <v-btn
          depressed
          :disabled="valid()"
          color="primary"
          type="submit"
        >
          {{ $t('components.PayablesTable.page.publish') }}
        </v-btn>
      </div>
    </v-form>
    <!-- </template> -->
    <!-- <template v-else>
        <v-col class="text-center">
          <h1 class="title mb-2">
            Contact is not synced to Xero
          </h1>
          <h2 class="subtitle-1 mb-2">
            Sync this supplier to add payments
          </h2>
          <v-btn
            small
            color="primary"
            outlined
            @click.stop="$emit('sync-supplier', supplier)"
          >
            <v-img
              width="16px"
              max-width="16px"
              class="mr-2"
              :src="require('@/assets/xero.svg')"
            />
            Sync
          </v-btn>
        </v-col>
      </template> -->
    <confirmation-dialog
      v-model="confirmPaymentData"
      :should-show="showPaymentConfirmation"
      :is-active="updatePaymentStatusTask.isActive||syncAccountCodesTask.isActive"
      :pay-from-account-code="payFromAccountCode"
      @sync:account-code="syncAccountCodes"
      @confirm="confirmPaymentClick"
      @close="showPaymentConfirmation = false"
      @update:close="showPaymentConfirmation = false"
    />
    <email-confirmation-dialog
      v-if="suppliers"
      v-model="confirmPaymentData"
      :should-show="showEmailConfirmation"
      :is-active="confirmPaymentStatusTask.isActive"
      :suppliers="suppliers"
      @confirm="confirmPaymentStatus"
      @close="confirmPaymentClick,showEmailConfirmation = false"
      @update:close="confirmPaymentClick,showEmailConfirmation = false"
    />
    <app-confirmation-dialog
      :should-show="undoConfirmDialogOpen"
      :details="'components.PayablesTable.page.undoConfirmText'"
      :is-active="undoPaymentStatusTask.isActive"
      @confirm="undoPaymentStatus"
      @close="undoConfirmDialogOpen = false"
      @close:update="undoConfirmDialogOpen = false"
    />
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'

import type { AccountCode, PaymentConfirmationDto, PaymentDto, Supplier } from '@/client/invoices'
import type { AccountSettingsDto, AccountUserDto } from '@/client/users'
import AppConfirmationDialog from '@/components/dialogs/AppConfirmationDialog.vue'
import FormBuilder from '@/components/FormBuilder/FormBuilder.vue'
import { Task } from '@/decorators/task'
import { ICurrency } from '@/modules/account-settings/types'
import { ISupplier } from '@/modules/contacts/types'
import EmailConfirmationDialog from '@/modules/costs/components/dialogs/EmailConfirmationDialog.vue'
import ConfirmationDialog from '@/modules/costs/components/dialogs/PaymentConfirmationDialog.vue'
import PaymentsTable from '@/modules/invoices/components/PaymentsTable.vue'
// import { ISupplier } from '@/modules/contacts/types'
// import type { ObjectKeyAsAny } from '@/types/app'
import { formatCurrency } from '@/utils/currency'
const namespaces = {
  invoices: 'invoices',
  users: 'users',
  accountSettings: 'accountSettings',
  integrations: 'integrations'
}

const prepopulateAmounts = [
  {
    value: 0.1,
    text: '10% of payment'
  },
  {
    value: 0.2,
    text: '20% of payment'
  },
  {
    value: 0.3,
    text: '30% of payment'
  },
  {
    value: 0.4,
    text: '40% of payment'
  },
  {
    value: 0.5,
    text: '50% of payment'
  },
  {
    value: 0.6,
    text: '60% of payment'
  },
  {
    value: 0.7,
    text: '70% of payment'
  },
  {
    value: 0.8,
    text: '80% of payment'
  },
  {
    value: 0.9,
    text: '90% of payment'
  },
  {
    value: 1,
    text: '100% of payment'
  }
]

@Component({
  components: {
    PaymentsTable,
    FormBuilder,
    AppConfirmationDialog,
    ConfirmationDialog,
    EmailConfirmationDialog
  }
})
export default class SchedulePayment extends Vue {
  @Prop({ required: true })
  value!: any

  @Prop({ default: true })
  isViewer!: boolean

  @Prop()
  validForms!: { invoice: boolean, lines: boolean, schedulePayment: boolean}

  @Prop({ required: true })
  invoiceTotal!: number

  @Prop({ required: true })
  suppliers!: ISupplier[]

  @Prop({ required: true })
  currentSupplier!: Supplier

  @Prop({ required: true })
  accounts!: { code: string, name: string, accountId: string }[]

  @State('payFromAccountCode', { namespace: namespaces.invoices })
  payFromAccountCode!: AccountCode[]

  @State('accountCode', { namespace: namespaces.invoices })
  accountCode!: AccountCode[]

  @State('accountSettings', { namespace: namespaces.accountSettings }) accountSettings!: AccountSettingsDto
  @State('currencies', { namespace: namespaces.accountSettings }) currencies!: ICurrency[]
  @State('users', { namespace: namespaces.users }) users!: AccountUserDto[]
  @Action('undoPaymentEntry', { namespace: namespaces.invoices })
  undoPaymentEntry!: (invoicePaymentId: number) => Promise<PaymentDto>;

  @Action('updatePaymentEntry', { namespace: namespaces.invoices })
  updatePaymentEntry!: (opts: {invoicePaymentId: number, paymentConfirmationDto?: PaymentConfirmationDto}) => Promise<PaymentDto>;

  @Action('syncAccountCodesFromXero', { namespace: namespaces.integrations }) syncAccountCodesFromXero!: () => Promise<void>

  @Getter('currencySymbol', { namespace: namespaces.accountSettings }) currencySymbol!: string

  formatCurrency = formatCurrency

  updatePaymentStatusId!: number
  showPaymentConfirmation=false
  showEmailConfirmation=false
  undoConfirmDialogOpen=false
  confirmPaymentData: PaymentConfirmationDto&{ confirmation?: boolean}={
    confirmation: false,
    isConfirmed: true,
    paidFromAccount: { id: 0 },
    paymentReference: '',
    confirmationEmailToAddresses: [],
    confirmationEmailCCAddresses: []
  }

  mounted () {
    this.$emit('update:ref-schedulePayment-form', this.$refs.schedulePaymentForm)
  }

  get paymentsTotal () {
    if (!this.value.payments) {
      return 0
    }
    return this.value.payments.reduce((a: number, b: any) => a + +(b.amount || 0), 0)
  }

  get xeroDiscrepency () {
    return this.paymentsTotal - this.invoiceTotal
  }

  get hasTranspositionalError () {
    return Number.isInteger((this.xeroDiscrepency * 100) / 9)
  }

  // get valid (): boolean {
  //   let valid = true
  //   if (
  //     this.value.unixDueDate && this.value.accountCode.id && this.value.payments.length
  //   ) {
  //     if (this.value.payments.filter((line: any) => {
  //       return (
  //         line.terms &&
  //       line.unixDueDate &&
  //       line.paidFromAccount?.id &&
  //       line.amount &&
  //       line.currency?.id
  //       )
  //     }).length) {
  //       valid = false
  //     } else { valid = true }
  //   }
  //   return valid
  // }

  // TODO - Make this not shit.
  valid (): boolean {
    let valid = true
    if (
      this.value.unixDueDate && this.value.accountCode.id && this.value.payments.length
    ) {
      const regex = /^[0-9.]+$/
      this.value.payments.forEach((payment: { paidFromAccount: any, unixDueDate: any, currency: any, amount: string }) => {
        if (payment.paidFromAccount.id && payment.unixDueDate && payment.currency.id && payment.amount && regex.test(payment.amount)) {
          valid = false
        } else {
          valid = true
          return valid
        }
      })
    }
    return valid
  }

  change (val: any, model: string, item: any) {
    if (model === 'terms') {
      const presetAmount = prepopulateAmounts.find(({ text }) => text === val)
      if (presetAmount) {
        item.amount = (+this.invoiceTotal * presetAmount.value).toFixed(2)
      }
    }
  }

  addRow () {
    if (this.value.payments.length) {
      const length = this.value.payments.length
      this.value.payments[length - 1].currency.id = this.accountSettings?.currency?.id
    }
  }

  get rules () {
    return {
      required: [
        (v: string) => !!v || this.$t('pages.errors.rules.fieldRequired')
      ],
      numberOnly: [
        (v: string) => {
          const regex = /^[0-9.]+$/
          return regex.test(v) || false
        }
      ]
    }
  }

  get paymentScheduleFields () {
    return [
      {
        model: 'unixDueDate',
        type: 'datePicker',
        props: {
          label: 'Invoice Due Date'
        }
      },
      {
        model: 'accountCode.id',
        type: 'select',
        props: {
          label: 'Account Code',
          'hide-details': true,
          rules: this.rules.required,
          required: true,
          items: this.accountCode.map((p) => ({
            label: p.name,
            value: p.id
          }))
        }
      }
    ]
  }

  get headers () {
    return [
      {
        text: 'Payment Terms',
        value: 'terms',
        sortable: false,
        field: {
          model: 'terms',
          type: 'combo',
          props: {
            'hide-details': true,
            items: prepopulateAmounts.map(({ text }) => ({
              text,
              value: text
            }))
          }
        }
      },
      {
        text: 'Due Date',
        value: 'unixDueDate',
        sortable: false,
        field: {
          model: 'unixDueDate',
          type: 'datePicker',
          props: {
            'hide-details': true
          }
        }
      },
      {
        text: 'Pay From',
        value: 'paidFromAccount',
        sortable: false,
        field: {
          model: 'paidFromAccount.id',
          type: 'select',
          props: {
            'hide-details': true,
            items: this.payFromAccountCode.map((p) => ({
              label: p.name,
              value: p.id
            }))
          }
        }
      },
      {
        text: 'Amount',
        value: 'amount',
        sortable: false,
        field: {
          model: 'amount',
          type: 'text',
          props: {
            'hide-details': true,
            rules: this.rules.numberOnly,
            type: 'number',
            min: 0.1,
            step: 'any'
          }
        }
      },
      {
        text: 'Currency',
        value: 'currency',
        sortable: false,
        field: {
          model: 'currency.id',
          type: 'select',
          props: {
            'hide-details': true,
            items: this.currencies.map((p) => ({
              label: p.code,
              value: p.id
            }))
          }
        }
      },
      {
        text: 'Status',
        value: 'status',
        sortable: false,
        field: { model: 'paymentStatus' }
      }
    ]
  }

  @Task('syncAccountCodesTask')
  async syncAccountCodes () {
    await this.syncAccountCodesFromXero()
    this.$emit('sync:payment')
  }

  async updatePaymentStatus (id: number, action: string) {
    this.updatePaymentStatusId = id
    if (action === 'undo') {
      this.undoConfirmDialogOpen = true
      return false
    }
    const payment = this.value?.payments?.find((payment: any) => payment.id === id)
    const paidFromAccount = payment?.paidFromAccount
    this.confirmPaymentData.paidFromAccount = { ...paidFromAccount }
    this.showPaymentConfirmation = true
  }

  @Task('undoPaymentStatusTask')
  async undoPaymentStatus () {
    await this.undoPaymentEntry(this.updatePaymentStatusId)
    this.undoConfirmDialogOpen = false
    this.$emit('sync:payment')
  }

  @Task('updatePaymentStatusTask')
  async confirmPaymentClick () {
    const { confirmation, ...data } = this.confirmPaymentData
    if (confirmation) {
      const email = this.currentSupplier?.email
      this.confirmPaymentData.confirmationEmailToAddresses = []
      this.confirmPaymentData.confirmationEmailToAddresses.push((email ?? ''))
      this.confirmPaymentData.confirmationEmailCCAddresses = []
      this.confirmPaymentData.confirmationEmailCCAddresses.push('')
      this.showPaymentConfirmation = false
      this.showEmailConfirmation = true
      return false
    }
    await this.updatePaymentEntry({ invoicePaymentId: this.updatePaymentStatusId, paymentConfirmationDto: data })
    this.showPaymentConfirmation = false
    this.syncPayments()
  }

  @Task('confirmPaymentStatusTask')
  async confirmPaymentStatus () {
    const { confirmation, ...data } = this.confirmPaymentData
    if (confirmation) {
      await this.updatePaymentEntry({ invoicePaymentId: this.updatePaymentStatusId, paymentConfirmationDto: data })
      this.showEmailConfirmation = false
      this.syncPayments()
    }
  }

  syncPayments () {
    this.confirmPaymentData = {
      confirmation: false,
      isConfirmed: true,
      paidFromAccount: { id: 0 },
      paymentReference: '',
      confirmationEmailToAddresses: [],
      confirmationEmailCCAddresses: []
    }
    this.$emit('sync:payment')
  }
}
</script>
