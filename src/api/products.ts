import * as Sentry from '@sentry/vue'
import ky from 'ky'

import type { PageProductChangeLog } from '@/client/products'
import type {
  IBrands,
  IProduct,
  IProductFormData,
  IProducts
} from '@/modules/products/types'
import { i18n } from '@/plugins/i18n'
import store from '@/store'
import type { IToken } from '@/types/app'
// import { formatUnixDate } from '@/utils/date'
const { VUE_APP_BASE_URL } = process.env

const productUrls = {
  products: (userId: number) => `${VUE_APP_BASE_URL}products/${userId}`,
  productById: (id: number, userId: number) => `${VUE_APP_BASE_URL}products/${userId}/${id}`,
  bulkUpload: (userId: number) => `${VUE_APP_BASE_URL}products/${userId}/csv`,
  bulkUploadTemplate: (userId: number) => `${VUE_APP_BASE_URL}products/${userId}/csv-template`,
  planeProductList: (userId: number) => `${VUE_APP_BASE_URL}products/${userId}`,
  productBySku: (userId: number, sku: string) => `${VUE_APP_BASE_URL}products/${userId}?sku=${sku}&size=1`,
  brandsBy: (userId: number) => `${VUE_APP_BASE_URL}brands/${userId}?userId=${userId}`,

  productList: (userId: number) => `${VUE_APP_BASE_URL}reporting/${userId}/products`,
  productStatsById: (id: number, userId: number) => `${VUE_APP_BASE_URL}reporting/${userId}/products/${id}`,
  productChangelog: (userId: number, productId: number) => `${VUE_APP_BASE_URL}products/${userId}/${productId}/changelog`
}

export type ProductsApiInterface = {
  createProduct: (token: IToken, formData: IProductFormData, userId: number) => Promise<IProduct>
  patchProductAttributes: (token: IToken, id: number, formData: IProductFormData, userId: number) => Promise<IProduct>
  delete: (token: IToken, id: number, userId: number) => Promise<void>
  getProductById: (token: IToken, id: number, userId: number) => Promise<IProduct>
  bulkUpload: (token: IToken, userId: number, file: File) => Promise<void>
  getBulkUploadTemplate: (token: IToken, userId: number) => Promise<any>
  getPlaneProducts: (token: IToken, opts: { userId: number, page?: number, size?: number}) => Promise<Response>
  getProductBySku: (token: IToken, sku: string, userId: number) => Promise<IProducts>
  getBrands: (token: IToken, userId: number) => Promise<IBrands | null>
  getProductWithStatsById: (token: IToken, id: number, userId: number) => Promise<Response>
  getProducts: (token: IToken, opts: { userId: number, page?: number, size?: number, search?: string, offset?: number, sort?: Array<any>}) => Promise<IProducts | null>
  getChangelogs: (token: IToken, opts: { userId: number, productId: number, pageNumber?: number, pageSize?: number, search?: any, offset?: number, sort?: Array<any>}) => Promise<IProducts | null>
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
  async getProducts (token: IToken, opts: { userId: number, page?: number, size?: number, search?: string, offset?: number, sort?: Array<any>}): Promise<IProducts | null> {
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }

    const { userId, size, page, search, offset, sort } = opts
    let url = `${productUrls.productList(userId)}`
    if (size) url = `${url}?size=${size}`
    if (typeof page !== 'undefined') url = `${url}&page=${page - 1}`
    if (offset) url = `${url}&offset=${offset}`
    if (search) url = `${url}&search=${search}`
    if (sort) url = sortable(url, sort)
    try {
      return await ky.get(url, requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'products' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },
  async getChangelogs (token: IToken, opts: { userId: number, productId: number, pageNumber?: number, pageSize?: number, search?: any, offset?: number, sort?: Array<any>}): Promise<PageProductChangeLog | null> {
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }

    const { userId, productId, pageSize, pageNumber, offset, sort } = opts
    let url = `${productUrls.productChangelog(userId, productId)}`
    if (pageSize) url = `${url}?size=${pageSize}`
    if (typeof pageNumber !== 'undefined') url = `${url}&page=${pageNumber - 1}`
    if (offset) url = `${url}&offset=${offset}`
    if (sort) url = sortable(url, sort)
    try {
      return await ky.get(url, requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'product changelog' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },
  async getPlaneProducts (token: IToken, opts: { userId: number, page?: number, size?: number}): Promise<Response | null> {
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    const { userId, size, page } = opts
    let url = `${productUrls.planeProductList(userId)}`
    if (size) url = `${url}?size=${size}`
    if (typeof page !== 'undefined') url = `${url}&page=${page - 1}`
    try {
      return await ky.get(url, requestOpts)
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'products' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },

  async getBulkUploadTemplate (token: IToken, userId: number): Promise<any> {
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    try {
      return await ky.get(productUrls.bulkUploadTemplate(userId), requestOpts)
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'the product upload template' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },

  async bulkUpload (token: IToken, userId: number, file: File): Promise<any> {
    const data = new FormData()
    data.append('file', file as File)

    const result = await fetch(productUrls.bulkUpload(userId), {
      method: 'POST',
      headers:
        {
          Authorization: `Bearer ${token}`
        },
      body: data
    }) as Response

    if (result.ok) return await result.json()

    const message = (await result.json() as { message: string }).message
    return Promise.reject(message)
  },

  async getProductBySku (token: IToken, sku: string, userId: number): Promise<IProducts | null> {
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    try {
      return await ky.get(productUrls.productBySku(userId, sku), requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'product' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },

  async getProductById (token: IToken, id: number, userId: number): Promise<IProduct | null> {
    const opts = { headers: { Authorization: `Bearer ${token}` } }
    try {
      return await ky.get(productUrls.productById(id, userId), opts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'product' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },

  async getProductWithStatsById (token: IToken, id: number, userId: number): Promise<Response> {
    const opts = { headers: { Authorization: `Bearer ${token}` } }
    return await ky.get(productUrls.productStatsById(id, userId), opts)
  },

  async delete (token: IToken, id: number, userId: number): Promise<void> {
    try {
      return await ky.delete(productUrls.productById(id, userId), {
        headers: { Authorization: `Bearer ${token}` }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.delete', { entityName: 'product' }),
        { root: true }
      )
    }
  },

  async createProduct (token: IToken, formData: IProductFormData, userId: number): Promise<IProduct | null> {
    try {
      return await ky.post(productUrls.products(userId), {
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
        i18n.t('pages.errors.generic.patch', { entityName: 'product' }),
        { root: true }
      )
      return null
    }
  },

  async getBrands (token: IToken, userId: number): Promise<IBrands | null> {
    try {
      return await ky.get(productUrls.brandsBy(userId), {
        headers: { Authorization: `Bearer ${token}` }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'brands' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },

  async patchProductAttributes (token: IToken, id: number, formData: IProductFormData, userId: number): Promise<IProduct | null> {
    const opts = {
      headers:
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      body: JSON.stringify(formData)
    }

    try {
      return await ky.put(productUrls.productById(id, userId), opts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.patch', { entityName: 'product' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  }
} as ProductsApiInterface
