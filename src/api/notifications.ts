import * as Sentry from '@sentry/vue'
import ky from 'ky'

// import Vue from 'vue'
import type { DismissNotificationsDto, PageNotification } from '@/client/notifications'
import { i18n } from '@/plugins/i18n'
import store from '@/store'
import type { IToken } from '@/types/app'
const { VUE_APP_BASE_URL } = process.env

const notificationUrls = {
  userNotifications: (userId: number) => `${VUE_APP_BASE_URL}notifications/${userId}`,
  dismissNotifications: (userId: number) => `${VUE_APP_BASE_URL}notifications/${userId}/dismiss`,
  postdefaultNotifications: (userId: number) => `${VUE_APP_BASE_URL}notifications/${userId}`,
  postNotifications: (userId: number, serviceSource: string) => `${VUE_APP_BASE_URL}${serviceSource}/${userId}/notification`
}

export type NotificationsApiInterface = {
  getUserNotifications: (token: IToken, opts: { userId: number, pageNumber?: number, pageSize?: number }) => Promise<PageNotification | null>
  dismissNotifications: (token: IToken, opts: { userId: number, dismissNotifications?: DismissNotificationsDto }) => Promise<PageNotification | null>
  postNotifications: (token: IToken, opts: { userId: number, serviceSource: string, notification: {summary: string, message: string, notificationType: string} }) => Promise<any | null>
}

export default {
  async getUserNotifications (token: IToken, opts: { userId: number, pageNumber?: number, pageSize?: number }): Promise<PageNotification | null> {
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }

    }

    const { userId, pageSize, pageNumber } = opts
    let url = `${notificationUrls.userNotifications(userId)}`
    if (pageSize) url = `${url}?size=${pageSize}`
    if (typeof pageNumber !== 'undefined') url = `${url}&page=${pageNumber - 1}`
    try {
      return await ky.get(url, requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'Notifications' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },
  async dismissNotifications (token: IToken, opts: { userId: number, dismissNotifications?: DismissNotificationsDto }): Promise<PageNotification | null> {
    const { userId, dismissNotifications } = opts
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(dismissNotifications)

    }
    const url = `${notificationUrls.dismissNotifications(userId)}`
    try {
      return await ky.post(url, requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'Notifications' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },
  async postNotifications (token: IToken, opts: { userId: number, serviceSource: string, notification: {summary: string, message: string, notificationType: string} }): Promise<void | null> {
    const { userId, serviceSource, notification } = opts
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(notification)

    }
    let url = ''
    if (serviceSource === 'notifications') {
      url = `${notificationUrls.postdefaultNotifications(userId)}`
    } else { url = `${notificationUrls.postNotifications(userId, serviceSource)}` }
    try {
      return await ky.post(url, requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'Notifications' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  }
} as NotificationsApiInterface
