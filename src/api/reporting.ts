import * as Sentry from '@sentry/vue'
import ky from 'ky'

import type {
  IProducts
} from '@/modules/marketplace-accounts/types'
import { i18n } from '@/plugins/i18n'
import store from '@/store'
import type { IToken } from '@/types/app'
// import { formatUnixDate } from '@/utils/date'

const baseUrl = process.env?.VUE_APP_BASE_URL

export type ReportingApiInterface = {
  getAllAmazonProductsByUserId: (token: IToken, opts: { userId: number, page?: number, size?: number, offset?: number, sort?: Array<any>, changedInAmazon?: boolean }) => Promise<IProducts | null>
}

const reportingUrls = {
  amazonProducts: (userId: number) => `${baseUrl}reporting/${userId}/amazon-products`
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
  async getAllAmazonProductsByUserId (token: IToken, opts: { userId: number, page?: number, size?: number, offset?: number, sort?: Array<any>, changedInAmazon?: boolean}): Promise<IProducts | null> {
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    const { userId, size, page, offset, sort, changedInAmazon } = opts
    let url = reportingUrls.amazonProducts(userId)
    if (size) url = `${url}?size=${size}`
    if (typeof page !== 'undefined') url = `${url}&page=${page - 1}`
    if (changedInAmazon) url = `${url}&changedInAmazon=${changedInAmazon}`
    if (offset) url = `${url}&offset=${offset}`
    if (sort) url = sortable(url, sort)
    // if (search) url = searching(url, search)

    try {
      return await ky.get(url, requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'Amazon Products' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  }
} as ReportingApiInterface
