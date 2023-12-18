import * as Sentry from '@sentry/vue'
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

import api from '@/api'
import { AmazonSyncControllerApi } from '@/client/amazon'
import type { ProductAcceptRejectDto } from '@/client/products'
import { ProductControllerApi } from '@/client/products'
import type { Pageable } from '@/client/reporting'
import { i18n } from '@/plugins/i18n'

import type { IProducts, IReportUploadFormData } from './types'
const { VUE_APP_BASE_URL } = process.env
const BASE_URL = VUE_APP_BASE_URL.slice(0, VUE_APP_BASE_URL.length - 1)

const productController = new ProductControllerApi(undefined, BASE_URL)
const amazonSyncControllerApi = new AmazonSyncControllerApi(undefined, BASE_URL)

@Module({
  namespaced: true
})

export class MarketplaceAccountsModule extends VuexModule {
  amazonProducts: IProducts | null = null;
  reportDateRange:any
  reportSummary:any
  reportType:any

  @Mutation
  setAmazonProducts (product: IProducts) {
    this.amazonProducts = product
  }

  @Mutation
  setReportDateRange (res:any) {
    this.reportDateRange = res
  }

  @Mutation
  setReportType (res:any) {
    this.reportType = res
  }

  @Mutation
  setReportSummary (res:any) {
    this.reportSummary = res
  }

  @Action
  async getAmazonProducts (pagination: Pageable & { sort?: Array<any>, changedInAmazon?: boolean }): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const res = await api.reporting.getAllAmazonProductsByUserId(token, {
        userId,
        page: pagination?.pageNumber,
        size: pagination?.pageSize,
        sort: pagination?.sort,
        changedInAmazon: pagination?.changedInAmazon
        // search: pagination?.search
      })

      this.context.commit('setAmazonProducts', res)
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
  async acceptAmazonProducts (productAcceptRejectDto: ProductAcceptRejectDto): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(productAcceptRejectDto)
      }
      await productController.acceptRejectAmazonChanges(userId, productAcceptRejectDto, requestOpts)
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
  async dailyCheck (): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
      await amazonSyncControllerApi.checkAmazonProducts(userId, requestOpts)
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
  async sendEmail (): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
      await amazonSyncControllerApi.sendEmailToUser(userId, '', requestOpts)
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
    async getReportDateRange (): Promise<any> {
      const userId = this.context.rootGetters['user/id']
      const token = this.context.rootGetters['auth/jwt']
      try {
        const res = await api.summary.getReportDateRange(token,
          userId)
        this.context.commit('setReportDateRange', res)
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
  async getReportSummary (params: {dateFrom:string, dateTo:string}): Promise<any> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const res = await api.summary.getReportSummary(token,
        userId, params.dateFrom, params.dateTo)
      this.context.commit('setReportSummary', res)
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
  async getReportType (): Promise<any> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const res = await api.summary.getReportType(token,
        userId)
      this.context.commit('setReportType', res)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
  }

  @Action({ rawError: true })
  async uploadReport (formData: IReportUploadFormData): Promise<void> {
    try {
      await api.summary.uploadReport(this.context.rootGetters['auth/jwt'], formData)
    } catch (err) {
      Sentry.captureException(err)
    }
  }
}
