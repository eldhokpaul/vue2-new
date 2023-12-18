<template>
  <v-container fluid>
    <v-form
      :readonly="isViewer"
      @submit.prevent="validate"
    >
      <v-row>
        <v-col
          cols="12"
          sm="6"
        >
          <v-btn
            icon
            exact
            large
            :to="{
              name: goBack || 'invoices'
            }"
          >
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
        </v-col>
        <v-col
          cols="12"
          sm="6"
          :class="{
            'd-flex flex-row justify-end align-center':
              $vuetify.breakpoint.smAndUp,
          }"
        >
          <v-btn
            v-show="!isViewer"
            v-t="'pages.invoice.actions.upload'"
            depressed
            class="mr-2"
            :block="!$vuetify.breakpoint.smAndUp"
            @click="onUploadNewClick"
          />
          <input
            v-show="!isViewer"
            ref="uploader"
            type="file"
            accept=".pdf, .doc, .docx"
            class="d-none"
            @change="onFileChanged"
          >
          <!-- Disabling Delete functionality for temp -->
          <!-- <app-delete-dialog
            v-show="!isViewer"
            :action-btn-text="'pages.invoice.actions.delete'"
            :confirm-text="'pages.invoice.actions.text'"
            :block="!$vuetify.breakpoint.smAndUp"
            :max-width="490"
            :class="{
              'mx-2': $vuetify.breakpoint.smAndUp,
              'my-2': !$vuetify.breakpoint.smAndUp,
            }"
            @confirm="confirmDeleteInvoice"
          /> -->

          <v-btn
            v-show="!isViewer"
            v-t="'components.invoiceForm.saveInvoice'"
            color="primary"
            depressed
            :block="!$vuetify.breakpoint.smAndUp"
            :loading="updateTask.isActive"
            type="submit"
          />
        </v-col>
      </v-row>
      <v-skeleton-loader
        v-if="initialLoadTask.isActive || !invoice"
        type="table"
      />
      <template v-else>
        <v-row class="mt-0">
          <v-col cols="12">
            <v-card outlined>
              <v-expansion-panels v-model="shouldShowSection.invoiceForm">
                <v-expansion-panel>
                  <v-expansion-panel-header>
                    {{ $t("pages.invoice.details") }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-divider />
                    <v-card-text>
                      <template v-if="initialLoadTask.isActive || updateTask.isActive || schedulePaymentLoadTask.isActive">
                        <v-skeleton-loader type="list-item" />
                        <v-skeleton-loader type="list-item" />
                      </template>
                      <template v-else>
                        <invoice-form
                          :invoice-data="updatedInvoice"
                          :valid-forms="validForms"
                          :suppliers="suppliers.content"
                          :is-viewer="isViewer"
                          @update:ref-invoice-form="saveInvoiceFormRef"
                          @update:submit="validate"
                        />
                      </template>
                    </v-card-text>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card>
          </v-col>

          <v-col
            cols="12"
            :md="5"
          >
            <v-card outlined>
              <v-expansion-panels v-model="shouldShowSection.uploadedFile">
                <v-expansion-panel>
                  <v-expansion-panel-header>
                    {{ $t("pages.invoice.uploadedFile") }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content v-if="document !== ''">
                    <v-divider />
                    <invoice-uploaded-file
                      v-if="!initialLoadTask.isActive"
                      :document="document"
                      style="min-height: 80vh"
                    />
                    <v-skeleton-loader
                      v-else
                      type="table"
                    />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card>
          </v-col>
          <v-col
            cols="12"
            :md="7"
          >
            <v-card
              outlined
            >
              <v-expansion-panels
                v-model="shouldShowSection.schedulePayment"
                :readonly="!!shouldShowSection.schedulePayment"
              >
                <v-expansion-panel>
                  <v-expansion-panel-header>
                    <v-img
                      v-if="userXeroIntegrationDetails.length"
                      width="24px"
                      max-width="24px"
                      class="mr-3"
                      :src="require('@/assets/xero.svg')"
                    />
                    <v-tooltip top>
                      <template #activator="{ on }">
                        <span v-on="on">
                          {{ $t("pages.invoice.schedulePayment") }}</span>
                      </template>
                      <span>{{ $t('components.invoiceForm.schedulePayments') }}</span>
                    </v-tooltip>
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <template v-if="initialLoadTask.isActive || updateTask.isActive || schedulePaymentLoadTask.isActive">
                      <v-skeleton-loader type="list-item" />
                      <v-skeleton-loader type="list-item" />
                      <v-skeleton-loader type="table" />
                    </template>
                    <template v-else>
                      <schedule-payment
                        v-model="schedulePayment"
                        :valid-forms="validForms"
                        :accounts="accounts"
                        :current-supplier="currentSupplier"
                        :suppliers="suppliers.content"
                        :invoice-total="invoiceTotal"
                        :is-viewer="isViewer || !invoice.invoiceLines.length"
                        @update:ref-schedulePayment-form="saveSchedulePaymentFormRef"
                        @sync:payment="schedulePaymentLoad('sync')"
                        @save="validate"
                      />
                    </template>
                    <!-- @sync-supplier="showSyncDialog = true" -->
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card>

            <v-card
              outlined
              class="mt-6"
            >
              <v-expansion-panels
                v-model="shouldShowSection.invoiceLines"
                :readonly="!!shouldShowSection.invoiceLines"
              >
                <v-expansion-panel>
                  <v-expansion-panel-header>
                    <v-tooltip top>
                      <template #activator="{ on }">
                        <span v-on="on">{{ $t("pages.invoice.lineItems") }}</span>
                      </template>
                      <span>{{ $t('components.invoiceForm.schedulePayments') }}</span>
                    </v-tooltip>
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <invoice-lines
                      :invoice="invoice"
                      :products="products.content"
                      :loading="updateTask.isActive"
                      :cost-types="costTypes"
                      :is-viewer="isViewer"
                      @save:continue="validate"
                    />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-form>
    <invoice-confirmation-product-change-differences
      v-if="dialog"
      :should-show="dialog"
      :route-name="'invoices'"
      :go-back="goBack"
      :altered-products="alteredProducts"
      :cached-products="cachedProducts"
      @update:close="onContinueEditing"
    />
    <!-- <supplier-sync-dialog
      v-model="showSyncDialog"
      :supplier="currentSupplier"
      @sync-complete="initialLoad"
    /> -->
  </v-container>
</template>

<script lang="ts">
// import { Integrations } from '@sentry/tracing'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'

import type { InvoicePaymentDto, PaymentDto } from '@/client/invoices'
import type { Pageable } from '@/client/suppliers'
import type { AccountSettingsDto, AccountUserDto } from '@/client/users'
import AppIntegrationWrapper from '@/components/AppIntegrationWrapper.vue'
import AppConfirmationDialog from '@/components/dialogs/AppConfirmationDialog.vue'
import AppDeleteDialog from '@/components/dialogs/AppDeleteDialog.vue'
// import SupplierSyncDialog from '@/components/SupplierSyncDialog.vue'
import { Task } from '@/decorators/task'
import { ICurrency } from '@/modules/account-settings/types'
import type { ISuppliers } from '@/modules/contacts/types'
import InvoiceConfirmationProductChangeDifferences from '@/modules/invoices/components/InvoiceConfirmationProductChangeDifferences.vue'
import InvoiceForm from '@/modules/invoices/components/InvoiceForm.vue'
import InvoiceLines from '@/modules/invoices/components/InvoiceLines.vue'
import InvoiceUploadedFile from '@/modules/invoices/components/InvoiceUploadedFile.vue'
import SchedulePayment from '@/modules/invoices/components/SchedulePayment.vue'
import { IProduct, IProducts } from '@/modules/products/types'
import type { IUser } from '@/modules/user/types'

import type { IInvoice, IInvoiceLine } from '../types'

export enum TTab {
  Bills = 'bills',
  Payables = 'payables',
  Costs = 'costs'
}

const namespaces = {
  invoices: 'invoices',
  suppliers: 'suppliers',
  notifications: 'notifications',
  toasts: 'toasts',
  products: 'products',
  users: 'users',
  accountSettings: 'accountSettings',
  user: 'user'
}
@Component({
  name: 'Invoice',
  components: {
    AppConfirmationDialog,
    AppDeleteDialog,
    AppIntegrationWrapper,
    SchedulePayment,
    // SupplierSyncDialog,
    InvoiceConfirmationProductChangeDifferences,
    InvoiceForm,
    InvoiceLines,
    InvoiceUploadedFile
  }
})
export default class InvoiceDetails extends Vue {
  @Action('getInvoice', { namespace: namespaces.invoices })
  getInvoice!: any;

  @Action('getInvoicePayment', { namespace: namespaces.invoices })
  getInvoicePayment!: (opts: {
    userId: number
    invoicePaymentId: number
  }) => Promise<void>;

  @Action('createInvoicePayment', { namespace: namespaces.invoices })
  createInvoicePayment!: (
    invoicePaymentDto: InvoicePaymentDto
  ) => Promise<void>;

  @Action('replaceInvoicePayment', { namespace: namespaces.invoices })
  replaceInvoicePayment!: (
    invoicePaymentDto: InvoicePaymentDto
  ) => Promise<InvoicePaymentDto>;

  // @Action('deleteInvoicePayment', { namespace: namespaces.invoices })
  // deleteInvoicePayment!: (invoicePaymentId: number) => Promise<void>

  @Action('getCostTypes', { namespace: namespaces.invoices })
  getCostTypes!: any;

  // @Action('getPaymentStatuses', { namespace: namespaces.invoices })
  // getPaymentStatuses!: (userId: number) => any

  @Action('getAccountCode', { namespace: namespaces.invoices })
  getAccountCode!: (userId: number) => any;

  @Action('getPayFromAccountCode', { namespace: namespaces.invoices })
  getPayFromAccountCode!: (userId: number) => any;

  @Getter('isViewer', { namespace: namespaces.user }) isViewer!: boolean;

  @Action('getSuppliers', { namespace: namespaces.suppliers })
  getSuppliers!: (pagination: Pageable) => Promise<void>;

  @Action('getPlaneProducts', { namespace: namespaces.products })
  getProducts!: (opts: { userId: number, size: number }) => Promise<IProducts>;

  @Action('deleteInvoice', { namespace: namespaces.invoices })
  deleteInvoice!: any;

  @Action('updateDocument', { namespace: namespaces.invoices })
  updateDocument!: any;

  @Action('getProductWithStatsById', { namespace: namespaces.products })
  getProductWithStatsById!: (opts: {
    id: number
    userId: number
  }) => Promise<IProduct>;

  // @Action('initializeEventSource', { namespace: namespaces.notifications })
  // initializeEventSource!: () => Promise<void>;

  // @Action('disconnectEventSource', { namespace: namespaces.notifications })
  // disconnectEventSource!: () => Promise<void>;
  // @Action('getXeroAccounts', { namespace: namespaces.invoices })
  // getXeroAccounts!: any

  @State('invoice', { namespace: namespaces.invoices })
  invoice!: IInvoice;

  @State('invoicePayment', { namespace: namespaces.invoices })
  invoicePayment!: InvoicePaymentDto;

  @State('accounts', { namespace: namespaces.invoices })
  accounts!: { code: string, name: string, accountId: string }[];

  @State('suppliers', { namespace: namespaces.suppliers })
  suppliers!: ISuppliers;

  @State('costTypes', { namespace: namespaces.invoices })
  costTypes!: Record<string, any>;

  @Prop({
    required: true
  })
  readonly id!: number;

  @Prop()
  readonly goBack?: string;

  @Prop()
  readonly preselectedTab!: TTab;

  @State('user', { namespace: namespaces.user })
  user!: IUser;

  @Action('saveInvoice', { namespace: namespaces.invoices })
  saveInvoice!: (invoice: IInvoice) => any;

  @Action('addSuccess', { namespace: namespaces.toasts })
  addSuccess!: (text: string) => Promise<any>;

  @Action('addError', { namespace: namespaces.toasts })
  addError!: (text: string) => Promise<any>;

  @Action('getDocumentById', { namespace: namespaces.invoices })
  getDocumentById!: (invoiceId: number) => any;

  @Action('getUserXeroIntegrationDetails', { namespace: 'integrations' })
  getUserXeroIntegrationDetails!: () => Promise<any>;

  @State('userXeroIntegrationDetails', { namespace: 'integrations' })
  userXeroIntegrationDetails!: any;

  @Action('getXeroPayments', { namespace: 'invoices' }) getXeroPayments!: (
    xeroId: string
  ) => Promise<any>;

  @State('xeroPayments', { namespace: 'invoices' }) xeroPayments!: any;

  @Action('saveXeroBill', { namespace: namespaces.invoices }) saveXeroBill!: ({
    userId,
    bill
  }: {
    userId: number
    bill: any
  }) => Promise<any>;

  @Action('getCurrencies', { namespace: namespaces.accountSettings })
  getCurrencies!: () => Promise<ICurrency[]>;

  @Action('getAccountSettings', { namespace: namespaces.accountSettings })
  getAccountSettings!: () => Promise<void>;

  @State('accountSettings', { namespace: namespaces.accountSettings })
  accountSettings!: AccountSettingsDto;

  @State('currencies', { namespace: namespaces.accountSettings })
  currencies!: ICurrency[];

  @Action('getUserById', { namespace: namespaces.users }) getUserById!: (
    userId: number
  ) => Promise<void>;

  @State('users', { namespace: namespaces.users }) users!: AccountUserDto[];

  updatedInvoice: IInvoice = { ...this.invoice };
  validForms = { invoice: false, lines: false, schedulePayment: false };
  document = '';
  invoiceFormRef: HTMLElement | null = null;
  schedulePaymentFormRef: HTMLElement | null = null;
  dialog = false;
  invoiceProductIds: Record<string, number> = {};
  changedProductIds: Array<number> = [];
  cachedProducts: Array<IProduct> = [];
  alteredProducts: Array<IProduct> = [];
  products: IProducts | null = null;
  shouldEraseClickedList = false;

  schedulePayment: InvoicePaymentDto = {
    unixDueDate: 0,
    accountCode: {},
    payments: []
  };

  shouldShowSection = {
    invoiceForm: 0,
    uploadedFile: 0,
    schedulePayment: 1,
    invoiceLines: 2
  };

  async beforeMount (): Promise<void> {
    await this.initialLoad()
    // await this.initializeEventSource()
  }

  // beforeDestroy () {
  //   this.disconnectEventSource()
  // }

  saveInvoiceFormRef (val: HTMLElement) {
    this.invoiceFormRef = val
  }

  saveSchedulePaymentFormRef (val: HTMLElement) {
    this.schedulePaymentFormRef = val
  }

  get currentSupplier () {
    return (
      this.suppliers &&
      this.suppliers.content.find(
        ({ id }) => id === this.updatedInvoice.supplier?.id
      )
    )
  }

  get invoiceTotal () {
    return Number(this.updatedInvoice.invoiceTotal?.toString().replace(/[^0-9.-]+/g, ''))
  }

  @Task('initialLoadTask')
  async initialLoad () {
    const calls = [
      this.getInvoice(this.id),
      this.getCostTypes(),
      // this.getPaymentStatuses(this.user.id),
      // this.getAccountCode(this.user.id),
      // this.getPayFromAccountCode(this.user.id),
      this.getSuppliers({ pageSize: 2000 }),
      this.currencies ? null : this.getCurrencies(),
      this.accountSettings ? null : this.getAccountSettings(),
      // this.users ? null : this.getUserById(this.user.id as number),
      this.getUserXeroIntegrationDetails()
    ]
    await Promise.all(calls)

    await this.schedulePaymentLoad('initial')
    if (this.invoice.invoiceTotal) {
      this.shouldShowSection.schedulePayment = 0
      this.shouldShowSection.invoiceLines = 0
    }
    this.document = await this.getDocumentById(this.invoice.id)
    this.products = await this.getProducts({
      userId: this.user.id as number,
      size: 2000
    })
  }

  @Task('schedulePaymentLoadTask')
  async schedulePaymentLoad (type: string) {
    const calls = [
      this.getAccountCode(this.user.id),
      this.getPayFromAccountCode(this.user.id)
    ]
    await Promise.all(calls)
    if (this.invoice?.invoicePaymentId) {
      await this.getInvoicePayment({
        userId: this.user.id,
        invoicePaymentId: this.invoice.invoicePaymentId
      })
      this.schedulePayment = { ...this.invoicePayment }
      if (type === 'sync') {
        this.updatedInvoice = {} as IInvoice
        await this.getInvoice(this.id)
      }
    }
  }

  @Task('updateTask')
  async onInvoiceSave (updatedInvoice: IInvoice) {
    const data = updatedInvoice || this.invoice
    data.invoiceLines = this.invoiceLinesCleanUp(
      data.invoiceLines as Array<IInvoiceLine>
    )
    data.invoiceTotal = Number(data.invoiceTotal?.toString().replace(/[^0-9.-]+/g, ''))
    const response = await this.saveInvoice(data)
    await this.getInvoice(this.id)
    this.updatedInvoice = { ...this.invoice }
    await this.setAlteredProducts(this.changedProductIds)

    const invoicePayments = this.paymentCleanUp(
      this.schedulePayment.payments as Array<PaymentDto>
    )
    if (this.invoice.invoiceTotal) {
      this.shouldShowSection.schedulePayment = 0
      this.shouldShowSection.invoiceLines = 0
      if (this.schedulePayment.id || invoicePayments.length) {
        await this.saveSchedulePayment()
      }
    }
    this.updatedInvoice = {} as IInvoice
    await this.getInvoice(this.id)
    await this.createDialog(!!response)
  }

  // @Task('updateTaskSaveAndContinue')
  // async onInvoiceSaveAndContinue () {
  //   // @ts-ignore
  //   this.invoiceFormRef.validate()
  //   if (!this.validForms.invoice) return
  //   const updatedInvoice = this.refreshedInvoiceFormData()
  //   const data = updatedInvoice || this.invoice
  //   data.invoiceLines = this.invoiceLinesCleanUp(
  //     data.invoiceLines as Array<IInvoiceLine>
  //   )
  //   await this.saveInvoice(data)
  //   await this.getInvoice(this.id)
  //   await this.setAlteredProducts(this.changedProductIds)
  //   // const invoiceLines = this.invoiceLinesCleanUp(
  //   //   this.invoice.invoiceLines as Array<IInvoiceLine>
  //   // )
  //   // if (invoiceLines?.length) {
  //   //   this.shouldShowSection.schedulePayment = 0
  //   // } else {
  //   //   this.shouldShowSection.schedulePayment = 1
  //   // }
  //   // await this.createDialog(!!response)
  // }

  async setAlteredProducts (ids: number[]) {
    this.alteredProducts = await this.fetchChangedProductsByIds(ids)
  }

  get xeroContacts () {
    return this.suppliers.content.filter((c) => c.xeroId !== null)
  }

  invoiceLinesCleanUp (invoiceLines: Array<IInvoiceLine>) {
    const filter = (line: any) => {
      if (typeof (line as IInvoiceLine).id === 'string') {
        delete (line as IInvoiceLine).id
      }
      return line.product?.id
    }
    return invoiceLines.filter(filter)
  }

  paymentCleanUp (payments: Array<PaymentDto>) {
    const filter = (line: any) => {
      // if (typeof (line as PaymentDto).id === 'undefined') {
      //   delete (line as PaymentDto).id
      // }
      return (
        line.unixDueDate &&
        line.paidFromAccount?.id &&
        Number(line.amount) &&
        line.currency?.id
      )
    }
    return payments.filter(filter)
  }

  async createDialog (success: boolean) {
    if (success) {
      this.dialog = true
    } else {
      await this.addError(this.$t('pages.invoices.actions.error') as string)
    }
  }

  // File actions
  onUploadNewClick () {
    const expectedInput = this.$refs.uploader as HTMLElement
    expectedInput.click()
  }

  onContinueEditing () {
    this.dialog = false
    this.cachedProducts = []
    this.changedProductIds = []
  }

  async onFileChanged (e: Event) {
    const target = e.target as HTMLInputElement
    const file = target.files?.length ? target.files[0] : null
    if (!file) return
    this.document = ''
    const document = await this.updateDocument(file)
    // Push onto the event loop for force a rerender as this does not rerender properly on update in safari
    setTimeout(() => {
      this.document = document
    }, 1)
  }

  async validate () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.invoiceFormRef.validate()
    if (!this.validForms.invoice) return
    const payments = this.paymentCleanUp(this.schedulePayment.payments as Array<PaymentDto>)
    if (payments.length) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.schedulePaymentFormRef.validate()
      if (!this.validForms.schedulePayment) return
    }
    await this.onInvoiceSave(this.refreshedInvoiceFormData())
  }

  refreshedInvoiceFormData (): IInvoice {
    this.updatedInvoice = {
      ...this.invoice,
      ...this.updatedInvoice,
      invoiceLines: this.invoice.invoiceLines.map((l) => ({
        ...l,
        amount: Number(l.amount?.toString().replace(/[^0-9.-]+/g, ''))
      })),
      userId: this.user.id as number
    }
    return this.updatedInvoice
  }

  async confirmDeleteInvoice () {
    // BE automatically delete  InvoicePayment
    // await this.deleteInvoicePayment(this.invoice.invoicePaymentId as number)
    await this.deleteInvoice(this.invoice.id)
    this.$router.push({
      name: 'invoices'
    })
  }

  // add new or select another product in the invoiceLine
  writeNewProductIds (newIds: Record<string, any>) {
    const newProductIds = Object.values(newIds).filter(
      (id) => !this.invoiceProductIds[id]
    )
    this.changedProductIds = this.changedProductIds.filter(
      (id) => newIds[id as number]
    )
    if (!newProductIds) return

    const tmpSet = new Set(this.changedProductIds.concat(newProductIds))
    this.changedProductIds = Array.from(tmpSet.values())
  }

  getProductsByIds (ids: number[]) {
    if (isEmpty(ids)) return []
    return this.products?.content.filter((entity) => ids.includes(entity.id))
  }

  async fetchChangedProductsByIds (ids: number[]) {
    if (isEmpty(ids)) return []

    const calls = ids.map((id) =>
      this.getProductWithStatsById({ id, userId: this.user.id })
    )
    return await Promise.all(calls)
  }

  cacheChangedProducts (ids: Array<number>) {
    this.cachedProducts = this.getProductsByIds(ids) as IProduct[]
  }

  getInvoiceProductIds (invoiceLines: IInvoiceLine[]) {
    const result: { [key: string]: number } = {}
    invoiceLines.forEach((line) => {
      const id = line.product?.id
      if (!id) return

      result[id] = id
    })
    return result
  }

  @Watch('invoice', { deep: true })
  onInvoiceChange () {
    this.refreshedInvoiceFormData()
  }

  @Watch('updatedInvoice.invoiceTotal', { deep: true, immediate: true })
  onInvoiceTotalChange (invoiceTotal: string) {
    const total = Number(invoiceTotal?.toString().replace(/[^0-9.-]+/g, ''))
    if (total > 0) {
      this.shouldShowSection.schedulePayment = 0
      this.shouldShowSection.invoiceLines = 0
    } else {
      this.shouldShowSection.schedulePayment = 1
      this.shouldShowSection.invoiceLines = 2
    }
  }

  @Watch('invoice.invoiceLines', { deep: true })
  onProductIdChange (newProps: IInvoiceLine[]) {
    const newIds = this.getInvoiceProductIds(newProps)
    // cover case with changing product in invoice line and adding a new invoiceLine
    if (
      !isEmpty(this.invoiceProductIds) &&
      !isEqual(Object.values(newIds), Object.values(this.invoiceProductIds))
    ) {
      this.writeNewProductIds(newIds)
    }
    this.invoiceProductIds = newIds
  }

  @Watch('changedProductIds')
  onChangedProductIds (ids: number[]) {
    this.cacheChangedProducts(ids)
  }

  async saveSchedulePayment () {
    const invoicePayment = {
      ...this.schedulePayment,
      invoice: { id: this.id }
    }
    const payments = this.paymentCleanUp(
      this.schedulePayment.payments as Array<PaymentDto>
    )
    invoicePayment.payments = payments
    if (invoicePayment?.id) {
      await this.replaceInvoicePayment(invoicePayment)
    } else {
      await this.createInvoicePayment(invoicePayment)
      await this.getInvoice(this.id)
      this.updatedInvoice = { ...this.invoice }
    }
    await this.getInvoicePayment({
      userId: this.user.id,
      invoicePaymentId: this.invoice.invoicePaymentId as number
    })
    this.schedulePayment = { ...this.invoicePayment }
  }
}
</script>

<style lang="scss">
.v-expansion-panel {
  box-shadow: none;
}

.v-expansion-panel::before {
  box-shadow: none !important;
}

.v-expansion-panel-content__wrap {
  padding: 0 !important;
}
</style>
