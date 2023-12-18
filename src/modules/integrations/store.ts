import * as Sentry from '@sentry/vue'
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

import api from '@/api'
import type { AmazonAuthInfoDto } from '@/client/amazon'
import { AmazonAuthControllerApi, AmazonSyncControllerApi } from '@/client/amazon'
import type { Supplier } from '@/client/xero'
import { XeroAuthControllerApi, XeroSyncControllerApi } from '@/client/xero'
import { i18n } from '@/plugins/i18n'
import flags from '@/utils/flags'

import type { IAmazonClientDetails } from './type'

const { VUE_APP_BASE_URL } = process.env
const BASE_URL = VUE_APP_BASE_URL.slice(0, VUE_APP_BASE_URL.length - 1)

const amazonAuthController = new AmazonAuthControllerApi(undefined, BASE_URL)

const amazonSyncControllerApi = new AmazonSyncControllerApi(undefined, BASE_URL)

const xeroAuthControllerApi = new XeroAuthControllerApi(undefined, BASE_URL)

const xeroSyncControllerApi = new XeroSyncControllerApi(undefined, BASE_URL)

export type XeroSchema = {
  code: string
  scope: string
  sessionState: string
  state: number
}
@Module({
  namespaced: true
})

export class IntegrationsModule extends VuexModule {
  xeroClientReqUrl: any = null
  userXeroIntegrationDetails: any = []
  amazonClientDetails: IAmazonClientDetails | null = null
  userAmazonIntegrationDetails: any = []
  amazonProductSyncStatus: any[] = []

  @Mutation
  setUserXeroIntegrationDetails (userXeroIntegrationDetails: any) {
    this.userXeroIntegrationDetails = userXeroIntegrationDetails
  }

  @Mutation
  setXeroClientReqUrl (xeroClientReqUrl: any) {
    this.xeroClientReqUrl = xeroClientReqUrl
  }

  @Mutation
  setAmazonClientDetails (amazonClientDetails: IAmazonClientDetails) {
    this.amazonClientDetails = amazonClientDetails
  }

  @Mutation
  setUserAmazonIntegrationDetails (userAmazonIntegrationDetails: any) {
    this.userAmazonIntegrationDetails = userAmazonIntegrationDetails
  }

  @Mutation
  setAmazonProductSyncStatusResult (amazonProductSyncStatus: any) {
    this.amazonProductSyncStatus = amazonProductSyncStatus
  }

  @Action({ rawError: true })
  async getUserXeroIntegrationDetails (): Promise<any> {
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    try {
    // HACK, less code to just not call this than disable the call in every single place
      const res = flags.XERO_ENABLED ? await api.integrations.getUserXeroIntegrationDetails(token, userId) : []
      this.context.commit('setUserXeroIntegrationDetails', res)
    } catch (error) {
      this.context.commit('setUserXeroIntegrationDetails', [])
    }
  }

  @Action({ rawError: true })
  async disconnectXeroIntegration (): Promise<any> {
    await api.integrations.disconnectXeroIntegration(this.context.rootGetters['auth/jwt'], this.context.rootGetters['user/id'])
  }

  @Action({ rawError: true })
  async syncSuppliersFromXero (): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await xeroSyncControllerApi.syncSuppliersFromXero(userId, requestOpts)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch('toasts/addError', i18n.t('pages.errors.422.description'), { root: true })
    }
  }

  @Action({ rawError: true })
  async createOrUpdateXeroContact (supplier: Array<Supplier>): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await xeroSyncControllerApi.createOrUpdateXeroContact(userId, supplier, requestOpts)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch('toasts/addError', i18n.t('pages.errors.422.description'), { root: true })
    }
  }

  @Action({ rawError: true })
  async getXeroClientReqUrl (): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = flags.XERO_ENABLED ? await xeroAuthControllerApi.getAuthCodeForUserById(userId, requestOpts) : { data: null }
      this.context.commit('setXeroClientReqUrl', res.data)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'Xero integration details' }),
        { root: true }
      )
    }
  }

  @Action({ rawError: true })
  async authorizeXero (xeroAuthorization: XeroSchema): Promise<any> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    await api.integrations.postXeroAuthorization(token, userId, xeroAuthorization)
  }

  @Action({ rawError: true })
  async getAmazonClientDetails (): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await amazonAuthController.getApiClientByUserId(userId, requestOpts)
      this.context.commit('setAmazonClientDetails', res.data)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch('toasts/addError', i18n.t('pages.errors.422.description'), { root: true })
    }
  }

  @Action({ rawError: true })
  async authorizeAmazon (authDetails: AmazonAuthInfoDto): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        timeout: 10000,
        body: JSON.stringify(authDetails)
      }
      await amazonAuthController.createNewOauthToken(userId, authDetails, requestOpts)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch('toasts/addError', i18n.t('pages.errors.422.description'), { root: true })
    }
  }

  @Action({ rawError: true })
  async getAmazonIntegrationDetails (): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      const res = await amazonAuthController.getOauthTokenByUserId(userId, requestOpts)
      this.context.commit('setUserAmazonIntegrationDetails', res.data)
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
  async getAmazonProductSyncStatus (): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    const res = await amazonSyncControllerApi.getSyncProductsStatus(userId, requestOpts)
    this.context.commit('setAmazonProductSyncStatusResult', res.data)
  }

  @Action({ rawError: true })
  async syncAmazonProducts (): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    await amazonSyncControllerApi.getSyncProducts(userId, requestOpts)
  }

  @Action({ rawError: true })
  async disconnectAmazonIntegration (): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await amazonAuthController.deleteOauthTokenByUserId(userId, requestOpts)
      this.context.commit('setUserAmazonIntegrationDetails', [])
      const userEmail = this.context.rootGetters['user/email']
      const userDetail = await this.context.dispatch('user/getUserByEmail', userEmail, { root: true })
      this.context.dispatch('user/updateUserParams', userDetail, { root: true })
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch('toasts/addError', i18n.t('pages.errors.422.description'), { root: true })
    }
  }

  @Action({ rawError: true })
  async setMarketPlaceDefaultCurrency (): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await amazonSyncControllerApi.getMarketPlaceCurrencyDetails(userId, requestOpts)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch('toasts/addError', i18n.t('pages.errors.422.description'), { root: true })
    }
  }

  @Action({ rawError: true })
  async syncAccountCodesFromXero (): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await xeroSyncControllerApi.syncAccountCosesFromXero(userId, requestOpts)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'Xero account-code sync' }),
        { root: true }
      )
    }
  }
}
