import * as Sentry from '@sentry/vue'
import ky from 'ky'

import type {
  ICountry,
  ISupplier,
  ISupplierFormData,
  ISuppliers
} from '@/modules/contacts/types'
import { i18n } from '@/plugins/i18n'
import store from '@/store'
import type { IToken } from '@/types/app'
const { VUE_APP_BASE_URL } = process.env

const supplierUrls = {
  suppliers: (userId: number) => `${VUE_APP_BASE_URL}suppliers/${userId}`,
  suppliersFor: (userId: number) => `${VUE_APP_BASE_URL}suppliers/${userId}?userId=${userId}`,
  countries: (userId: number) => `${VUE_APP_BASE_URL}countries/${userId}`,
  supplierBy: (id: number, userId: number) => `${VUE_APP_BASE_URL}suppliers/${userId}/${id}`
}

export type SuppliersApiInterface = {
  create: (token: IToken, formData: ISupplierFormData, userId: number) => Promise<ISupplier | null>
  getSuppliers: (token: IToken, opts: { userId: number, page?: number, size?: number, search?: string, offset?: number, sort?: Array<any>}) => Promise<ISuppliers | null>
  getCountries: (token: IToken, userId: number) => Promise<ICountry[] | null>
  getSupplierById: (token: IToken, id: number, userId: number) => Promise<ISupplier | null>
  delete: (token: IToken, id: number, userId: number) => Promise<void>
  update: (token: IToken, formData: ISupplier, userId: number) => Promise<ISupplier | null>
}

const sortable = (url: string, sort: Array<any> | null): any => {
  if (sort) {
    sort.forEach((option) => {
      url +=
        `&sort=${option.colId},${option.sort}`
    })
  }
  return url
}

export default {
  async getSuppliers (token: IToken, opts: { userId: number, page?: number, size?: number, search?: string, offset?: number, sort?: Array<any>}): Promise<ISuppliers | null> {
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    const { userId, size, page, search, offset, sort } = opts
    let url = supplierUrls.suppliersFor(userId)
    if (size) url = `${url}&size=${size}`
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
        i18n.t('pages.errors.generic.get', { entityName: 'contacts' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },

  async getSupplierById (token: IToken, id: number, userId: number): Promise<ISupplier | null> {
    try {
      return await ky.get(supplierUrls.supplierBy(id, userId), {
        headers: { Authorization: `Bearer ${token}` }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'contact' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },

  async delete (token: IToken, id: number, userId: number): Promise<void> {
    try {
      return await ky.delete(supplierUrls.supplierBy(id, userId), {
        headers: { Authorization: `Bearer ${token}` }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.delete', { entityName: 'contact' }),
        { root: true }
      )
    }
  },

  async create (token: IToken, formData: ISupplierFormData, userId: number): Promise<ISupplier | null> {
    try {
      return await ky.post(supplierUrls.suppliers(userId), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.post', { entityName: 'contact' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },

  async update (token: IToken, formData: ISupplier, userId: number): Promise<ISupplier | null> {
    try {
      return await ky.put(`${supplierUrls.supplierBy(formData.id as number, userId)}?userId=${formData.userId}`, {
        headers:
          {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
        body: JSON.stringify(formData)
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.patch', { entityName: 'contact' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },

  async getCountries (token: IToken, userId: number): Promise<ICountry[] | null> {
    try {
      return await ky.get(supplierUrls.countries(userId), {
        headers: { Authorization: `Bearer ${token}` }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'countries' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  }
} as SuppliersApiInterface
