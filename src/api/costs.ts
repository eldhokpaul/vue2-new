import * as Sentry from '@sentry/vue'
import ky from 'ky'

import type {
  ICost,
  ICosts
} from '@/modules/costs/types'
import { i18n } from '@/plugins/i18n'
import store from '@/store'
import type { IToken } from '@/types/app'
import { ICurrentPageOpts } from '@/types/app'
// import { formatUnixDate } from '@/utils/date'
const { VUE_APP_BASE_URL } = process.env

type IBatchInvoiceLine = {
  id: number
  isExcludedFromProductCostsData: boolean
}

const costUrls = {
  lineCost: (id: number, invoiceId: number, userId: number) => `${VUE_APP_BASE_URL}invoices/${userId}/${invoiceId}/invoice-lines/${id}`,
  batchLineCost: (userId: number) => `${VUE_APP_BASE_URL}invoices/${userId}/invoice-lines`,
  costTypes: (userId: number) => `${VUE_APP_BASE_URL}reporting/${userId}/cost-types`,
  allCostsFor: (userId: number) => `${VUE_APP_BASE_URL}reporting/${userId}/costs`,
  allCostsByProductIdFor: (productId: number, userId: number) => `${VUE_APP_BASE_URL}reporting/${userId}/costs/${productId}`
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
//     url += '&search='
//     for (const item in search) {
//       if (search[item].filterType === 'date') {
//         const unixDate = formatUnixDate(search[item].dateFrom)
//         url += `${item}${filterMode(search[item].type, unixDate.toString())};`
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

export type CostsApiInterface = {
  excludeBatchProductCostLines: (token: IToken, userId: number, lines: IBatchInvoiceLine[]) => Promise<void>
  alterCost: (token: IToken, opts: { id: number, invoiceId: number, isExcludedFromGeneralCostsData: boolean, userId: number }) => Promise<ICost | null>
  getCostTypes: (token: IToken, userId: number) => Promise<Array<string> | null>
  getCosts: (token: IToken, opts: { userId: number, page?: number, size?: number, search?: any, offset?: number, sort?: Array<any> }) => Promise<ICosts | null>
  getCostsByProductId: (token: IToken, opts: { productId: number } & ICurrentPageOpts) => Promise<ICosts | null>
}

export default {
  async getCostTypes (token: IToken, userId: number): Promise<Array<string> | null> {
    try {
      return await ky.get(costUrls.costTypes(userId), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'cost types' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },

  async getCosts (token: IToken, opts: { userId: number, page?: number, size?: number, search?: any, offset?: number, sort?: Array<any> }): Promise<ICosts | void> {
    const requestOpts = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }

    const { userId, size, page, search, offset, sort } = opts

    let url = `${costUrls.allCostsFor(userId)}`
    if (size) url = `${url}?size=${size}`
    if (typeof page !== 'undefined') url = `${url}&page=${page - 1}`
    if (offset) url = `${url}&offset=${offset}`
    if (sort) url = sortable(url, sort)
    if (search) url = `${url}&search=${search}`
    // if (search) url = searching(url, search)
    try {
      return await ky.get(url, requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'costs' }),
        { root: true }
      )
    }
  },

  async getCostsByProductId (token: IToken, opts: { productId: number } & ICurrentPageOpts): Promise<ICosts | void> {
    const requestOpts = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }

    const { productId, userId, size, page, search, offset, sort } = opts
    let url = `${costUrls.allCostsByProductIdFor(productId, userId)}`
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
        i18n.t('pages.errors.generic.get', { entityName: 'product costs' }),
        { root: true }
      )
    }
  },

  async alterCost (token: IToken, opts: { id: number, invoiceId: number, isExcludedFromGeneralCostsData: boolean, userId: number }): Promise<ICost | null> {
    const params = {
      headers:
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isExcludedFromGeneralCostsData: opts.isExcludedFromGeneralCostsData })
    }

    try {
      return await ky.patch(costUrls.lineCost(opts.id, opts.invoiceId, opts.userId), params).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.patch', { entityName: 'costs' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },

  async excludeBatchProductCostLines (
    token: IToken,
    userId: number,
    lines: Array<IBatchInvoiceLine>): Promise<void> {
    try {
      return await ky.patch(costUrls.batchLineCost(userId), {
        headers:
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lines)
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.patch', { entityName: 'product costs' }),
        { root: true }
      )
    }
  }
} as CostsApiInterface
