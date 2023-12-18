import * as Sentry from '@sentry/vue'
import ky from 'ky'

import { IReportUploadFormData } from '@/modules/marketplace-accounts/types'
import { i18n } from '@/plugins/i18n'
import store from '@/store'
import type { IToken } from '@/types/app'
const { VUE_APP_BASE_URL_V1 } = process.env

const summaryUrls = {
  dateRange: (userId: number) => `${VUE_APP_BASE_URL_V1}report/${userId}/date-ranges`,
  summaries: (userId: number, dateFrom:string, dateTo:string) => `${VUE_APP_BASE_URL_V1}report/${userId}/profit-dash/summaries/${dateFrom}/${dateTo}`,
  reportType: (userId: number) => `${VUE_APP_BASE_URL_V1}upload/${userId}/types`,
  uploadReport: (userId: number, reportType:string, year:string, month:string) => `${VUE_APP_BASE_URL_V1}upload/${userId}/${reportType}/${year}/${month}`
}

export type SummaryApiInterface = {
  getReportDateRange: (token: IToken, userId: number) => Promise<any | null>
  getReportSummary: (token: IToken, userId: number, dateFrom: string, dateTo: string) => Promise<any | null>
  getReportType:(token: IToken, userId: number) => Promise<any | null>
  uploadReport: (token: IToken, formData: IReportUploadFormData) => Promise<void>
}

export default {
  async getReportDateRange (token: IToken, userId: number): Promise<any | null> {
    try {
      return await ky.get(summaryUrls.dateRange(userId), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'date range' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },
  async getReportSummary (token: IToken, userId: number, dateFrom:string, dateTo:string):Promise<| null> {
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    try {
      return await ky.get(summaryUrls.summaries(userId, dateFrom, dateTo), requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'report summary' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },
  async getReportType (token: IToken, userId: number): Promise<any | null> {
    try {
      return await ky.get(summaryUrls.reportType(userId), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'report type' }),
        { root: true }
      )
      return Promise.resolve(null)
    }
  },
  async uploadReport (token: IToken, formData: IReportUploadFormData): Promise<any> {
    const { userId, reportType, year, month, file } = formData
    const data = new FormData()
    data.append('file', file as File)
    const result = await fetch(summaryUrls.uploadReport(userId, reportType, year, month), {
      method: 'POST',
      headers:
        {
          Authorization: `Bearer ${token}`
        },
      body: data
    }) as Response
    if (result.ok) return await result.json()
    const message = (await result.json() as { message: string }).message
    Sentry.captureException(message)
    store.dispatch(
      'toasts/addError',
      i18n.t('pages.errors.422.description'),
      { root: true }
    )
    return Promise.reject(message)
  }

} as SummaryApiInterface
