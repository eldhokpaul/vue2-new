
import * as Sentry from '@sentry/vue'
import ky from 'ky'

import { ISupplier } from '@/modules/contacts/types'
import { XeroSchema } from '@/modules/integrations/store'
import { i18n } from '@/plugins/i18n'
import store from '@/store'
import { IToken } from '@/types/app'

const { VUE_APP_BASE_URL } = process.env

const integrationsUrls = {
  xeroClientReqUrl: (userId: string) => `${VUE_APP_BASE_URL}xero/${userId}/oauth/code-request-url`,
  userXeroIntegrationDetails: (userId: string) => `${VUE_APP_BASE_URL}xero/${userId}/oauth`,
  xeroAuthorization: (userId: string) => `${VUE_APP_BASE_URL}xero/${userId}/oauth/generate`,
  syncXeroSupplier: (userId: string) => `${VUE_APP_BASE_URL}xero/${userId}/suppliers`
}

export type IntegrationsApiInterface = {
  getXeroClientReqUrl: (token: IToken, userId: number) => Promise<any | null>
  disconnectXeroIntegration: (token: IToken, userId: string) => Promise<any>
  getUserXeroIntegrationDetails: (token: IToken, userId: string) => Promise<any>
  postXeroAuthorization: (token: IToken, userId: string, xeroAuthorization: XeroSchema) => Promise<any | null>
  syncXeroSupplier: (token: IToken, userId: string, supplier: ISupplier) => Promise<any>
}

export default {
  async disconnectXeroIntegration (token: IToken, userId: string): Promise<any | null> {
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    try {
      return await ky.delete(integrationsUrls.userXeroIntegrationDetails(userId), requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.disconnect', { entityName: 'Xero integration' }),
        { root: true }
      )
    }
  },
  async getXeroClientReqUrl (token: IToken, userId: string): Promise<any | null> {
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    try {
      return await ky.get(integrationsUrls.xeroClientReqUrl(userId), requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'Xero integration details' }),
        { root: true }
      )
    }
  },
  async getUserXeroIntegrationDetails (token: IToken, userId: string): Promise<any | null> {
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    try {
      return await ky.get(integrationsUrls.userXeroIntegrationDetails(userId), requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.get', { entityName: 'Xero integtation details' }),
        { root: true }
      )
      return Promise.resolve([])
    }
  },
  async postXeroAuthorization (token: IToken, userId: string, xeroAuthorization: XeroSchema): Promise<any | null> {
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(xeroAuthorization)
    }
    try {
      return await ky.post(integrationsUrls.xeroAuthorization(userId), requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.create', { entityName: 'Xero integration' }),
        { root: true }
      )
    }
  },
  async syncXeroSupplier (token: IToken, userId: string, supplier: ISupplier): Promise<any | null> {
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([supplier])
    }
    try {
      return await ky.post(integrationsUrls.syncXeroSupplier(userId), requestOpts).json()
    } catch (e) {
      Sentry.captureException(e)
      await store.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.generic.sync', { entityName: 'contact with Xero' }),
        { root: true }
      )
    }
  }
}
