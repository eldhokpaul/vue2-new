import * as Sentry from '@sentry/vue'
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

import api from '@/api'
import type { AccountCode, InvoicePaymentDto, Pageable, PageInvoicePaymentDto, PagePaymentDto, PaymentConfirmationDto } from '@/client/invoices'
import { PaymentsControllerApi } from '@/client/invoices'
import type {
  IDocument,
  IInvoice,
  IInvoiceLineForm,
  IInvoices,
  IInvoiceUploadFormData
} from '@/modules/invoices/types'
import { i18n } from '@/plugins/i18n'
import type { ICurrentPageOpts, ObjectKeyAsAny } from '@/types/app'

const { VUE_APP_BASE_URL } = process.env
const BASE_URL = VUE_APP_BASE_URL.slice(0, VUE_APP_BASE_URL.length - 1)

const paymentsControllerApi = new PaymentsControllerApi(undefined, BASE_URL)
@Module({
  namespaced: true
})
export class InvoicesModule extends VuexModule {
  content: IInvoices | null = null
  invoice: IInvoice | null = null
  payables: PagePaymentDto | null = null
  bills: PageInvoicePaymentDto | null = null
  invoicePayment: InvoicePaymentDto = {
    unixDueDate: 0,
    payments: []
    // assignedToUser: {}
  }

  // share costTypes between different forms(invoice, invoiceLine)
  payFromAccountCode: AccountCode | [] = []
  costTypes: ObjectKeyAsAny | null = null
  paymentStatuses: ObjectKeyAsAny | null = null
  accountCode: AccountCode | [] = []
  accounts: { code: string, name: string, accountId: string }[] = []
  xeroContacts: any[] = []
  xeroPayments: any = null

  @Mutation
  setPayables (content: PagePaymentDto) {
    this.payables = content
  }

  @Mutation
  setBills (content: PageInvoicePaymentDto) {
    this.bills = content
  }

  @Mutation
  setInvoices (content: IInvoices) {
    if (!content) {
      this.content = null
    } else {
      const oldContent = this.content || {}
      this.content = { ...oldContent, ...content }
    }
  }

  @Mutation
  setInvoicePayment (invoicePayment: InvoicePaymentDto) {
    if (!invoicePayment) {
      this.invoicePayment = {
        unixDueDate: 0,
        // assignedToUser: {},
        payments: []
      }
    } else {
      this.invoicePayment = invoicePayment
    }
  }

  @Mutation
  setCostTypes (content: ObjectKeyAsAny) {
    this.costTypes = content
  }

  @Mutation
  setAccountCode (content: AccountCode) {
    this.accountCode = content
  }

  @Mutation
  setPayFromAccountCode (accountCode: AccountCode) {
    this.payFromAccountCode = accountCode
  }

  @Mutation
  setPaymentStatuses (content: ObjectKeyAsAny) {
    this.paymentStatuses = content
  }

  @Mutation
  setInvoice (invoice: IInvoice) {
    this.invoice = invoice
  }

  @Mutation
  setDocument (params: { invoiceId: number, doc: IDocument }) {
    const { invoiceId, doc } = params
    const targetInvoice = this.content?.content.find(invoice => invoice.id === invoiceId)
    if (!targetInvoice) throw new Error('Invoice not found')

    targetInvoice.document = doc
  }

  @Mutation
  setAccounts (accounts: { code: string, name: string, accountId: string }[]) {
    this.accounts = accounts
  }

  @Mutation
  setXeroPayments (payments: any) {
    this.xeroPayments = payments
  }

  @Action({ rawError: true })
  async getInvoice (invoiceId: number) {
    const res = await api.invoices.getInvoice(this.context.rootGetters['auth/jwt'], invoiceId, this.context.rootGetters['user/id'])
    this.context.commit('setInvoice', res)
  }

  @Action({ rawError: true })
  async getInvoicePayment (opts: { userId: number, invoicePaymentId: number }): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await paymentsControllerApi.fetchInvoicePaymentForUserById(opts.userId, opts.invoicePaymentId, requestOpts)
      this.context.commit('setInvoicePayment', res.data)
    } catch (e) {
      Sentry.captureException(e)
      this.context.commit('setInvoicePayment', null)
    }
  }

  @Action({ rawError: true })
  async fetchPaymentsForUser (opts: Pageable&{ sort?: Array<any>, search?: any}): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    const data = await api.invoices.fetchPaymentsForUser(token, {
      userId: userId,
      page: opts?.pageNumber,
      size: opts?.pageSize,
      sort: opts?.sort,
      search: opts?.search
    })
    this.context.commit('setPayables', data)
  }

  @Action({ rawError: true })
  async getPaymentStatuses (userId: number): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await paymentsControllerApi.getPaymentStatusesForUser(userId, requestOpts)
      this.context.commit('setPaymentStatuses', res.data)
    } catch (e) {
      Sentry.captureException(e)
    }
  }

  @Action({ rawError: true })
  async getAccountCode (userId: number): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await paymentsControllerApi.getInvoiceAccountCodesForUser(userId, requestOpts)
      this.context.commit('setAccountCode', res.data)
    } catch (e) {
      Sentry.captureException(e)
    }
  }

  @Action({ rawError: true })
  async getPayFromAccountCode (userId: number): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await paymentsControllerApi.getPaymentAccountCodesForUser(userId, requestOpts)
      this.context.commit('setPayFromAccountCode', res.data)
    } catch (e) {
      Sentry.captureException(e)
    }
  }

  @Action({ rawError: true })
  async fetchInvoicePaymentsForUser (opts: Pageable&{ userId: number, sort?: Array<any>, search?: any}): Promise<void> {
    // const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    const data = await api.invoices.fetchInvoicePaymentsForUser(token, {
      userId: opts?.userId,
      page: opts?.pageNumber,
      size: opts?.pageSize,
      sort: opts?.sort,
      search: opts?.search
    })
    this.context.commit('setBills', data)
  }

  @Action
  async getXeroPayments (xeroId: string): Promise<any> {
    const res = await api.invoices.getXeroPayments(this.context.rootGetters['auth/jwt'], xeroId, this.context.rootGetters['user/id'])
    this.context.commit('setXeroPayments', res)
  }

  @Action({ rawError: true })
  async getCostTypes (): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    const res = await api.invoices.getCostTypes(token, this.context.rootGetters['user/id']) as Array<string>
    this.context.commit('setCostTypes', res)
  }

  @Action({ rawError: true })
  async deleteInvoiceLine (lineId: number, invoiceId?: number): Promise<void> {
    const id = invoiceId || this.invoice?.id
    if (!id) {
      await this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.invoices.noInvoice'),
        { root: true }
      )
      return
    }

    await api.invoices.deleteInvoiceLine(this.context.rootGetters['auth/jwt'], id, lineId, this.context.rootGetters['user/id'])
  }

  @Action({ rawError: true })
  async deleteInvoice (invoiceId: number): Promise<void> {
    await api.invoices.deleteInvoice(this.context.rootGetters['auth/jwt'], invoiceId, this.context.rootGetters['user/id'])
    this.context.commit('setInvoice', null)
  }

  @Action({ rawError: true })
  async getInvoices (opts: ICurrentPageOpts) {
    if (!opts || !opts.userId) opts = { ...opts, userId: this.context.rootGetters['user/id'] }
    try {
      const res = await api.invoices.getInvoices(this.context.rootGetters['auth/jwt'], opts)
      this.context.commit('setInvoices', res)
    } catch (err) {
      Sentry.captureException(err)
      this.context.commit('setInvoices', null)
    }
  }

  @Action({ rawError: true })
  async uploadInvoice (formData: IInvoiceUploadFormData): Promise<IInvoice> {
    const res = await api.invoices.uploadInvoice(this.context.rootGetters['auth/jwt'], formData)
    return res
  }

  @Action({ rawError: true })
  async updateDocument (file: File) {
    const opts = {
      file,
      invoiceId: this.invoice?.id as number,
      token: this.context.rootGetters['auth/jwt'],
      userId: this.context.rootGetters['user/id']
    }
    await api.invoices.updateDocument(opts)
    return await this.context.dispatch('getDocumentById', opts.invoiceId)
  }

  @Action({ rawError: true })
  async saveInvoiceLine (formData: IInvoiceLineForm) {
    return await api.invoices.saveInvoiceLine(this.context.rootGetters['auth/jwt'], formData, this.context.rootGetters['user/id'])
  }

  @Action({ rawError: true })
  async saveInvoice (invoice: IInvoice): Promise<IInvoice | null> {
    const updatedInvoice = await api.invoices.save(this.context.rootGetters['auth/jwt'], invoice, this.context.rootGetters['user/id'])

    await this.context.commit('setInvoice', updatedInvoice)
    return updatedInvoice
  }

  @Action({ rawError: true })
  async getDocumentById (id: number) {
    return await api.invoices.getDocumentById(this.context.rootGetters['auth/jwt'], id, this.context.rootGetters['user/id'])
  }

  @Action({ rawError: true })
  async getXeroAccounts (id: number) {
    const res = await api.invoices.getXeroAccounts(this.context.rootGetters['auth/jwt'], id)
    if (res) {
      const accounts = res.Accounts.map(({ Code, AccountID, Name }: any) => ({
        code: Code,
        accountId: AccountID,
        name: Name
      }))
      this.context.commit('setAccounts', accounts)
    }
  }

  // @Action({ rawError: true })
  // async getXeroContacts (id: number) {
  //   const res = await api.invoices.getXeroContacts(this.context.rootGetters['auth/jwt'], id)
  // }

   @Action({ rawError: true })
  async saveXeroBill (args: { userId: number, bill: any }): Promise<any> {
    const { userId, bill } = args
    const xeroBill = await api.invoices.saveXeroBill(this.context.rootGetters['auth/jwt'], userId, bill)
    return xeroBill
  }

  @Action({ rawError: true })
   async createInvoicePayment (invoicePaymentDto: InvoicePaymentDto): Promise<void> {
     const token = this.context.rootGetters['auth/jwt']
     const userId = this.context.rootGetters['user/id']
     try {
       const requestOpts = {
         headers: { Authorization: `Bearer ${token}` }
       }
       await paymentsControllerApi.createInvoicePayment(userId, invoicePaymentDto, requestOpts)
     } catch (e) {
       Sentry.captureException(e)
     }
   }

  @Action({ rawError: true })
  async replaceInvoicePayment (invoicePaymentDto: InvoicePaymentDto): Promise<any> {
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    const { id } = invoicePaymentDto
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await paymentsControllerApi.replaceInvoicePayment(userId, id as number, invoicePaymentDto, requestOpts)
      return res.data as InvoicePaymentDto
    } catch (e) {
      Sentry.captureException(e)
    }
  }

  @Action({ rawError: true })
  async deleteInvoicePayment (invoicePaymentId: number): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await paymentsControllerApi.deleteInvoicePayment(userId, invoicePaymentId, requestOpts)
    } catch (e) {
      Sentry.captureException(e)
    }
  }

  @Action({ rawError: true })
  async updatePaymentEntry (opts: {invoicePaymentId: number, paymentConfirmationDto?: PaymentConfirmationDto}): Promise<any> {
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await paymentsControllerApi.payPaymentEntry(userId, opts.invoicePaymentId, opts.paymentConfirmationDto, requestOpts)
      return res.data
    } catch (e) {
      Sentry.captureException(e)
    }
  }

  @Action({ rawError: true })
  async undoPaymentEntry (invoicePaymentId: number): Promise<any> {
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const paymentUndoDto =
      {
        isConfirmed: true,
        paymentReference: '',
        confirmationEmailToAddresses: [],
        confirmationEmailCCAddresses: []
      }
      const res = await paymentsControllerApi.undoPaymentEntry(userId, invoicePaymentId, paymentUndoDto, requestOpts)
      return res.data
    } catch (e) {
      Sentry.captureException(e)
    }
  }
}
