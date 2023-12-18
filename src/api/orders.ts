import * as Sentry from '@sentry/vue'
import ky from 'ky'

import type { OrdersListDto, PageShipmentPlan } from '@/client/orders'
import { i18n } from '@/plugins/i18n'
import store from '@/store'
import type { IToken } from '@/types/app'
// import { formatUnixDate } from '@/utils/date'

const baseUrl = process.env?.VUE_APP_BASE_URL

export type OrdersApiInterface = {
  fetchOrdersForUser: (token: IToken, opts: { userId: number, page?: number, size?: number, search?: string, offset?: number, sort?: Array<any>, orderStatuses?: string}) => Promise<OrdersListDto | null>
  fetchShipmentPlansForUser: (token: IToken, opts: { userId: number, page?: number, size?: number, search?: string, offset?: number, sort?: Array<any>, shipmentStatuses?: string}) => Promise<PageShipmentPlan | null>
}

// const invoiceUrls = {}

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
  async fetchOrdersForUser (token: IToken, opts: { userId: number, page?: number, size?: number, search?: string, offset?: number, sort?: Array<any>, orderStatuses?: string}): Promise<OrdersListDto | null> {
    const { userId, size, page, search, offset, sort, orderStatuses } = opts
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    let url = `${baseUrl}orders/${userId}`
    if (size) url = `${url}?size=${size}`
    if (offset) url = `${url}&offset=${offset}`
    if (typeof page !== 'undefined') url = `${url}&page=${page - 1}`
    if (search) url = `${url}&search=${search}`
    if (orderStatuses) url = `${url}&orderStatuses=${orderStatuses}`
    if (sort) url = sortable(url, sort)
    try {
      return await ky.get(url, requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'orders' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },
  async fetchShipmentPlansForUser (token: IToken, opts: { userId: number, page?: number, size?: number, search?: string, offset?: number, sort?: Array<any>, shipmentStatuses?: string}): Promise<PageShipmentPlan | null> {
    const { userId, size, page, offset, sort, shipmentStatuses, search } = opts
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    let url = `${baseUrl}orders/${userId}/shipmentplans`
    if (size) url = `${url}?size=${size}`
    if (offset) url = `${url}&offset=${offset}`
    if (typeof page !== 'undefined') url = `${url}&page=${page - 1}`
    if (search) url = `${url}&search=${search}`
    if (shipmentStatuses) url = `${url}&shipmentStatuses=${shipmentStatuses}`
    if (sort) url = sortable(url, sort)
    try {
      return await ky.get(url, requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'shipmentplans' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  }
} as OrdersApiInterface
