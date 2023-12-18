import * as Sentry from '@sentry/vue'
import ky from 'ky'

import type {
  IDashboardStats
} from '@/modules/dashboard/types'
import { i18n } from '@/plugins/i18n'
import store from '@/store'
import type { IDateRange } from '@/types/app'

const { VUE_APP_BASE_URL } = process.env

const dashboardUrls = {
  status: `${VUE_APP_BASE_URL}dashboard/stats`,
  availableDates: `${VUE_APP_BASE_URL}dashboard/available-dates`,
  topSellers: (from: string, to: string) => `${VUE_APP_BASE_URL}dashboard/top-sellers?startDate=${from}&endDate=${to}`,
  chardContent: (from: string, to: string) => `${VUE_APP_BASE_URL}dashboard/chard-content?startDate=${from}&endDate=${to}`
}

export type DashboardApiInterface = {
  getStats: () => Promise<IDashboardStats | null>
  getAvailableDates: () => Promise<IDateRange | null>
}

export default {
  async getStats (): Promise<IDashboardStats | null> {
    try {
      return await ky.get(dashboardUrls.status).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'dashboard stats' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },

  async getAvailableDates (): Promise<IDateRange | null> {
    try {
      return await ky.get(dashboardUrls.availableDates).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'date filters' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  }
} as DashboardApiInterface
