import * as Sentry from '@sentry/vue'
import ky from 'ky'

import type { Pageable, PageUser, User } from '@/client/users'
import type { Subscription } from '@/modules/billing/types/Subscription'
// import type { IUser } from '@/modules/user/types'
import { i18n } from '@/plugins/i18n'
import store from '@/store'
import type { IToken } from '@/types/app'
// import { formatUnixDate } from '@/utils/date'
const baseUrl = process.env?.VUE_APP_BASE_URL
const userUrls = {
  resetPass: (userId: string) => `${baseUrl}auth/${userId}/reset-forgotten-password`,
  me: `${baseUrl}user/me`,
  patchById: (id: number) => `${baseUrl}users/${id}`,
  byEmail: (email: string) => `${baseUrl}users/${email}`,
  byId: (id: number) => `${baseUrl}users/${id}`,
  getUserSubscription: (userId: number) => `${baseUrl}users/${userId}/subscription`,
  getUserSubscriptionHistory: (userId: number) => `${baseUrl}users/${userId}/subscription/history`,
  getAllUser: () => `${baseUrl}admin/users`

}
export type UserApiInterface = {
  me: (token: IToken) => Promise<User | null>
  getUserById: (token: IToken, id: number) => Promise<User | null>
  getUserByEmail: (token: IToken, email: string) => Promise<User | null>
  patchUserAttributes: (token: IToken, formData: User) => Promise<User | null>
  setNewPassword: (userId: string | number, verificationToken: string, password: string) => Promise<any>
  getUserSubscription: (token: IToken, userId: string | number) => Promise<Subscription | null>
  getUserSubscriptionHistory: (token: IToken, userId: string | number, pagination: Pageable& {sort?: Array<any>}) => Promise<any>
  getAllUser: (token: IToken, pagination: { page?: number, size?: number, search?: any, offset?: number, sort?: Array<any> }) => Promise<PageUser |any>
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
  async me (token: IToken): Promise<User | null> {
    try {
      return await ky.get(userUrls.me, {
        headers: { Authorization: `Bearer ${token}` }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'user' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },

  async getUserById (token: IToken, id: number): Promise<User | null> {
    try {
      return await ky.get(userUrls.byId(id), {
        headers: { Authorization: `Bearer ${token}` }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addInfo',
        i18n.t('pages.errors.user.sessionExpired'),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },

  async getUserByEmail (token: IToken, email: string): Promise<User | null> {
    try {
      return await ky.get(userUrls.byEmail(email), {
        headers: { Authorization: `Bearer ${token}` }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addInfo',
        i18n.t('pages.errors.user.sessionExpired'),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },

  async patchUserAttributes (token: IToken, formData: User): Promise<User | void> {
    try {
      return await ky.put(userUrls.patchById(formData.id as number), {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.update', { entityName: 'user' }),
        { root: true }
      )
    }
  },

  async setNewPassword (userId: string | number, verificationToken: string, password: string): Promise<any> {
    try {
      return await ky.post(userUrls.resetPass(userId as string), {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationToken, password })
      })
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.update', { entityName: 'user password' }),
        { root: true }
      )
    }
  },

  async getUserSubscription (token: IToken, userId: string | number): Promise<Subscription | null> {
    try {
      return await ky.get(userUrls.getUserSubscription(userId as number), {
        headers: { Authorization: `Bearer ${token}` }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'user subscription' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },

  async getUserSubscriptionHistory (token: IToken, userId: string | number, pagination: Pageable & {sort?: Array<any>}): Promise<Subscription[] | null> {
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    const { pageSize, pageNumber, offset, sort } = pagination
    let url = userUrls.getUserSubscriptionHistory(userId as number)
    if (pageSize) url = `${url}?size=${pageSize}`
    if (offset) url = `${url}&offset=${offset}`
    if (sort) url = sortable(url, sort)
    if (typeof pageNumber !== 'undefined') url = `${url}&page=${pageNumber - 1}`
    try {
      return await ky.get(url, requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.update', { entityName: 'user subscription history' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },

  async getAllUser (token: IToken, pagination: { page?: number, size?: number, search?: any, offset?: number, sort?: Array<any> }): Promise<PageUser | any> {
    const requestOpts = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
    const { size, page, search, offset, sort } = pagination

    let url = `${userUrls.getAllUser()}`
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
        i18n.t('pages.errors.generic.get', { entityName: 'costs' }),
        { root: true }
      )
    }
  }
} as UserApiInterface
