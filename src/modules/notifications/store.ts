
import * as Sentry from '@sentry/vue'
import Vue from 'vue'
import { SSEClient } from 'vue-sse'
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

import api from '@/api'
import type { DismissNotificationsDto, NotificationUpdateStatusDto, Pageable, PageNotification } from '@/client/notifications'
import { NotificationsControllerApi } from '@/client/notifications'
import { i18n } from '@/plugins/i18n'

import type { INotification } from './types'
const { VUE_APP_BASE_URL } = process.env
const BASE_URL = VUE_APP_BASE_URL.slice(0, VUE_APP_BASE_URL.length - 1)
// Vue.use(VueSSE)
const notificationsControllerApi = new NotificationsControllerApi(undefined, BASE_URL)
const notificationUrls = {
  subscribeNotifications: (userId: number) => `${VUE_APP_BASE_URL}notifications/${userId}/subscribe`
}
let sseClient: SSEClient | null
@Module({
  namespaced: true
})

export class NotificationsModule extends VuexModule {
  // sseClient!: SSEClient | null
  notifications: PageNotification | null = null
  notificationsQueue: INotification[]=[]

  @Mutation
  setPageNotifications (pageNotifications: PageNotification) {
    this.notifications = pageNotifications
  }

  @Mutation
  setNotifications (notificationsQueueNew: INotification[]) {
    this.notificationsQueue = notificationsQueueNew
  }

  @Mutation
  setNotificationsQueue (newNotifications: INotification) {
    this.notificationsQueue.unshift(newNotifications)
  }

  @Action
  async initializeEventSource () {
    let connectionTry = 1
    this.context.dispatch('disconnectEventSource')
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    const url = `${notificationUrls.subscribeNotifications(userId)}`

    sseClient = Vue.$sse.create({
      url: url,
      polyfillOptions: requestOpts
    })
    sseClient!.on('error', () => { // eslint-disable-line
      console.log('[error] disconnected, automatically re-attempting connection', 'sse')
    })
    sseClient!.on('INFO', (data) => { // eslint-disable-line
      this.context.commit('setNotificationsQueue', data)
      Vue.$toast.info(data.summary)
    })
    sseClient!.on('ACTION_NEEDED', (data) => { // eslint-disable-line
      this.context.commit('setNotificationsQueue', data)
      Vue.$toast.warning(data.summary)
    })
    sseClient!.on('ERROR', (data) => { // eslint-disable-line
      this.context.commit('setNotificationsQueue', data)
      Vue.$toast.error(data.summary)
    })
    // and finally -- try to connect!
    sseClient!.connect() // eslint-disable-line
      .then(() => {
        console.log('[info] connected', 'sse')
      })
      .catch((er) => {
        console.log('[error] failed to connect', 'sse')
        if (er.status === 401 || er.status === 403) {
          console.log('401 || 403 [error] failed to connect', 'sse')
        } else if (connectionTry < 10) {
          connectionTry++
          console.log('[info] try to reconnect', 'sse')
          this.context.dispatch('initializeEventSource')
        }
      })
  }

  @Action
  async disconnectEventSource () {
    if (sseClient) {
      sseClient.disconnect()
      sseClient = null
      console.log('[info] disconnected', 'sse')
    }
  }

  @Action
  async getPageNotifications (pagination: Pageable): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const res = await api.notifications.getUserNotifications(token, {
        userId,
        pageNumber: pagination?.pageNumber,
        pageSize: pagination?.pageSize
      })

      this.context.commit('setPageNotifications', res)
      // this.context.commit('setNotifications', res?.content)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
  }

  @Action
  async getPageNotificationsQueue (): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const res = await api.notifications.getUserNotifications(token, {
        userId,
        pageNumber: 1,
        pageSize: 200
      })

      this.context.commit('setNotifications', res?.content)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
  }

  @Action
  async updateNotifications (opts: {notificationId: number, notificationUpdateStatus?: NotificationUpdateStatusDto}): Promise<any> {
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await notificationsControllerApi.updateNotificationStatus(userId, opts.notificationId, opts.notificationUpdateStatus, requestOpts)
      await this.context.dispatch('getPageNotificationsQueue')
      // this.context.commit('', res.data)
      return res.data
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
  }

  @Action
  getNotificationQueue (newNotifications: INotification) {
    this.context.commit('setNotificationsQueue', newNotifications)
    // this.context.dispatch(
    //   'toasts/showAlert',
    //   newNotifications.summary,
    //   { root: true }
    // )
  }

  @Action
  async dismissNotifications (dismissNotifications?: DismissNotificationsDto): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    try {
      await api.notifications.dismissNotifications(token, { userId, dismissNotifications })
      await this.context.dispatch('getPageNotificationsQueue')
      // this.context.commit('setPageNotifications', res)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
  }

  @Action
  async sendNotificationAction (opts: { serviceSource: string, notification: {summary: string, message: string, notificationType: string} }): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    try {
      await api.notifications.postNotifications(token, { userId, ...opts })
      // this.context.commit('setPageNotifications', res)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
  }
}
