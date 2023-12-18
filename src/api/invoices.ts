import * as Sentry from '@sentry/vue'
import ky from 'ky'

import type { PageInvoicePaymentDto, PagePaymentDto } from '@/client/invoices'
import type {
  IDocument,
  IInvoice,
  IInvoiceLine,
  IInvoiceLineForm,
  IInvoiceUploadFormData
} from '@/modules/invoices/types'
import { i18n } from '@/plugins/i18n'
import store from '@/store'
import type { IToken } from '@/types/app'
// import { formatUnixDate } from '@/utils/date'

const baseUrl = process.env?.VUE_APP_BASE_URL

export type InvoicesApiInterface = {
  getCostTypes: (token: IToken, userId: number) => Promise<any>
  getInvoice: (token: IToken, invoiceId: number, userId: number) => Promise<IInvoice | null>
  deleteInvoice: (token: IToken, invoiceId: number, userId: number) => Promise<any>
  save: (token: IToken, invoice: IInvoice, userId: number) => Promise<IInvoice | null>
  deleteInvoiceLine: (token: IToken, invoiceId: number, lineId: number, userId: number) => Promise<IInvoiceLine | null>
  getInvoices: (token: IToken, opts: { userId: number, page?: number, size?: number, search?: string, offset?: number, sort?: Array<any>}) => Promise<Array<IInvoice>>
  fetchPaymentsForUser: (token: IToken, opts: { userId: number, page?: number, size?: number, search?: string, offset?: number, sort?: Array<any>}) => Promise<PagePaymentDto | null>
  fetchInvoicePaymentsForUser: (token: IToken, opts: { userId: number, page?: number, size?: number, search?: string, offset?: number, sort?: Array<any>}) => Promise<PageInvoicePaymentDto | null>
  saveInvoiceLine: (token: IToken, form: IInvoiceLineForm, userId: number) => Promise<IInvoiceLine | null>
  getDocumentById: (token: IToken, invoiceId: number, userId: number) => Promise<IDocument | null>
  uploadInvoice: (token: string, formData: IInvoiceUploadFormData) => Promise<IInvoice>
  updateDocument: (opts: { token: string, file: File, invoiceId: number, userId: number }) => Promise<any>

  getXeroAccounts: (token: IToken, userId: number) => Promise<any>
  getXeroContacts: (token: IToken, userId: number) => Promise<any>
  saveXeroBill: (token: IToken, userId: number, data: any) => Promise<any>
  getXeroPayments: (token: IToken, xeroId: string, userId: number) => Promise<any>
}

const invoiceUrls = {
  costTypes: (userId: number) => `${baseUrl}invoices/${userId}/cost-types`,
  byId: (id: number, userId: number) => `${baseUrl}invoices/${userId}/${id}`,
  delete: (id: number, userId: number) => `${baseUrl}invoices/${userId}/${id}`,
  invoiceLines: (invoiceId: number, userId: number) => `${baseUrl}invoices/${userId}/${invoiceId}/invoice-lines`,
  deleteLine: (invoiceId: number, lineId: number, userId: number) => `${baseUrl}invoices/${userId}/${invoiceId}/invoice-lines/${lineId}`,
  document: (invoiceId: number, userId: number) => `${baseUrl}invoices/${userId}/${invoiceId}/document`,
  upload: (userId: number) => `${baseUrl}invoices/${userId}/upload`,
  updateDoc: (invoiceId: number, userId: number) => `${baseUrl}invoices/${userId}/${invoiceId}/upload`,
  xeroAccounts: (userId: number) => `${baseUrl}xero/${userId}/accounts`,
  xeroContacts: (userId: number) => `${baseUrl}xero/${userId}/suppliers`,
  xeroPayments: (userId: number, xeroId: string) => `${baseUrl}xero/${userId}/bills/${xeroId}`,
  xeroBill: (userId: number) => `${baseUrl}xero/${userId}/bills`
}

const sortable = (url: string, sort: Array<any> | null): any => {
  console.log(sort)
  if (sort) {
    sort.forEach((option) => {
      url += `&sort=${option.colId},${option.sort}`
    })
  }
  return url
}
// const filterMode = (type: string, value: string): any => {
//   switch (type) {
//     case 'contains':
//       return `:${value}`
//     case 'in':
//       return `~${value}`
//     case 'lessThanOrEqual':
//       return `<${value}`
//     case 'greaterThanOrEqual':
//       return `>${value}`
//     case 'notEqual':
//       return `!${value}`
//   }
// }
// const searching = (url: string, search: any): any => {
//   if (Object.keys(search).length) {
//     console.log(search)
//     url += '&search='
//     for (const item in search) {
//       if (search[item].filterType === 'date') {
//         const unixDate = formatUnixDate(search[item].dateFrom)
//         // @ts-ignore
//         url += `${item}${filterMode(search[item].type, unixDate)};`
//       } else if (search[item].filterType === 'set') {
//         if (search[item].values.length) {
//           let params = ''
//           search[item].values.forEach((item: string) => {
//             params += `${item},`
//           })
//           params = params.replace(/,\s*$/, '')
//           url += `${item}${filterMode('in', params)};`
//         } else {
//           url += `${item}${filterMode('notEqual', 'ACTIVE')};`
//           url += `${item}${filterMode('notEqual', 'INACTIVE')};`
//         }
//       } else {
//         url += `${item}${filterMode(search[item].type, search[item].filter)};`
//       }
//     }
//   }
//   return url
// }
export default {
  async saveXeroBill (token: IToken, userId: number, data: any) {
    try {
      return await ky.post(invoiceUrls.xeroBill(userId), {
        headers:
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.post', { entityName: 'Xero bill' }),
        { root: true }
      )
      return null
    }
  },
  async getXeroContacts (token: IToken, userId: number) {
    try {
      return await ky.get(invoiceUrls.xeroContacts(userId), {
        headers: { Authorization: `Bearer ${token}` }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      return null
    }
  },
  async getXeroPayments (token: IToken, xeroId: string, userId: number) {
    try {
      return await ky.get(invoiceUrls.xeroPayments(userId, xeroId), {
        headers: { Authorization: `Bearer ${token}` }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'Xero payments' }),
        { root: true }
      )
      return null
    }
  },
  async getXeroAccounts (token: IToken, userId: number) {
    try {
      return await ky.get(invoiceUrls.xeroAccounts(userId), {
        headers: { Authorization: `Bearer ${token}` }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'Xero accounts' }),
        { root: true }
      )
      return null
    }
  },
  async getInvoice (token: IToken, invoiceId: number, userId: number): Promise<IInvoice | null> {
    try {
      return await ky.get(invoiceUrls.byId(invoiceId, userId), {
        headers: { Authorization: `Bearer ${token}` }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'invoice' }),
        { root: true }
      )
      return null
    }
  },
  async getCostTypes (token: IToken, userId: number): Promise<Array<string> | null> {
    try {
      return await ky.get(invoiceUrls.costTypes(userId), {
        headers: { Authorization: `Bearer ${token}` }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'coststypes' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },
  async deleteInvoiceLine (token: IToken, invoiceId: number, lineId: number, userId: number): Promise<IInvoiceLine | null> {
    try {
      return await ky.delete(invoiceUrls.deleteLine(invoiceId, lineId, userId), {
        headers: { Authorization: `Bearer ${token}` }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.delete', { entityName: 'invoice line item' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },
  async getInvoices (token: IToken, opts: { userId: number, page?: number, size?: number, search?: string, offset?: number, sort?: Array<any>}): Promise<Array<IInvoice> | null> {
    const { userId, size, page, search, offset, sort } = opts
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    let url = `${baseUrl}invoices/${userId}`
    if (size) url = `${url}?size=${size}`
    if (search) url = `${url}&search=${search}`
    if (offset) url = `${url}&offset=${offset}`
    if (sort) url = sortable(url, sort)
    if (typeof page !== 'undefined') url = `${url}&page=${page - 1}`
    try {
      return await ky.get(url, requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'invoices' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },
  async fetchPaymentsForUser (token: IToken, opts: { userId: number, page?: number, size?: number, search?: string, offset?: number, sort?: Array<any>}): Promise<PagePaymentDto | null> {
    const { userId, size, page, search, offset, sort } = opts
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    let url = `${baseUrl}payments/${userId}`
    if (size) url = `${url}?size=${size}`
    if (offset) url = `${url}&offset=${offset}`
    if (typeof page !== 'undefined') url = `${url}&page=${page - 1}`
    if (search) url = `${url}&search=${search}`
    if (sort?.length) url = sortable(url, sort); else url = `${url}&sort=unixDueDate,desc`
    // if (!sort?.length) url = `${url}&sort=unixDueDate,desc`
    try {
      return await ky.get(url, requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'invoices' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },
  async fetchInvoicePaymentsForUser (token: IToken, opts: { userId: number, page?: number, size?: number, search?: string, offset?: number, sort?: Array<any>}): Promise<PageInvoicePaymentDto | null> {
    const { userId, size, page, search, offset, sort } = opts
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    let url = `${baseUrl}payments/${userId}/invoice-payments`
    if (size) url = `${url}?size=${size}`
    if (offset) url = `${url}&offset=${offset}`
    if (typeof page !== 'undefined') url = `${url}&page=${page - 1}`
    if (search) url = `${url}&search=${search}`
    if (sort) url = sortable(url, sort)
    if (!sort?.length) url = `${url}&sort=invoice.unixDate,desc`
    try {
      return await ky.get(url, requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'invoices' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },
  async deleteInvoice (token: IToken, invoiceId: number, userId: number): Promise<any> {
    try {
      return await ky.delete(invoiceUrls.delete(invoiceId, userId), {
        headers: { Authorization: `Bearer ${token}` }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },
  async uploadInvoice (token: string, formData: IInvoiceUploadFormData): Promise<IInvoice | void> {
    const { userId, file } = formData
    const data = new FormData()
    data.append('file', file as File)

    try {
      return await ky.post(invoiceUrls.upload(userId), {
        method: 'POST',
        headers:
        {
          Authorization: `Bearer ${token}`
        },
        body: data
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.post', { entityName: 'invoice' }),
        { root: true }
      )
    }
  },
  async updateDocument (opts: { token: string, file: File, invoiceId: number, userId: number }): Promise<any> {
    const { token, file, invoiceId, userId } = opts
    const data = new FormData()
    data.append('file', file)

    try {
      return await ky.put(invoiceUrls.updateDoc(invoiceId, userId), {
        headers: { Authorization: `Bearer ${token}` },
        body: data
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.patch', { entityName: 'invoice' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },
  async save (token: IToken, invoice: IInvoice, userId: number): Promise<IInvoice | null> {
    try {
      return await ky.put(invoiceUrls.byId(invoice.id, userId), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(invoice)
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.patch', { entityName: 'invoice' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },
  async saveInvoiceLine (token: IToken, form: IInvoiceLineForm, userId: number): Promise<IInvoiceLine | null> {
    try {
      return await ky.post(invoiceUrls.invoiceLines(form.invoiceId as number, userId), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          quantity: !form.quantity ? 0 : form.quantity
        })
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.post', { entityName: 'invoice line item' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },
  async getDocumentById (token: IToken, invoiceId: number, userId: number): Promise<any> {
    try {
      const response = await ky.get(invoiceUrls.document(invoiceId, userId), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const blob = await response.blob()
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      const pdf = await new Promise((resolve) => {
        reader.onloadend = function () {
          resolve(reader.result)
        }
      })
      return pdf
    } catch (e) {
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'invoice document' }),
        { root: true }
      )
    }
  }
} as InvoicesApiInterface
