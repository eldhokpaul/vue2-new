import * as Sentry from '@sentry/vue'
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

import type { AccountSettingsDto } from '@/client/users'
import { AccountSettingsControllerApi, UserControllerApi } from '@/client/users'
import { i18n } from '@/plugins/i18n'

// import flags from '@/utils/flags'
// import { IAccountSettings } from './types'
import { ICurrency } from './types'

const { VUE_APP_BASE_URL } = process.env
const BASE_URL = VUE_APP_BASE_URL.slice(0, VUE_APP_BASE_URL.length - 1)

const userController = new UserControllerApi(undefined, BASE_URL)
const accountSettingsController = new AccountSettingsControllerApi(undefined, BASE_URL)

@Module({
  namespaced: true
})

export class AccountSettingsModule extends VuexModule {
  accountSettings: AccountSettingsDto | null = null;
  currencies: ICurrency[] | null = null;

  @Mutation
  setAccountSettings (settings: AccountSettingsDto) {
    this.accountSettings = settings
  }

  @Mutation
  setCurrencies (currencies: ICurrency[]) {
    this.currencies = currencies
  }

  @Action({ rawError: true })
  async updateAccountSettings (settings: AccountSettingsDto): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    try {
      const requestOpts = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      }
      const res = await accountSettingsController.updateAccountSettingsByUserId(userId, settings, requestOpts)
      this.context.commit('setAccountSettings', res.data)
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
  async getAccountSettings (): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const { data } = await accountSettingsController.getAccountSettingsByUserId(userId, requestOpts)
      this.context.commit('setAccountSettings', data)
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
  async getCurrencies (): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await userController.getAllCurrencies(requestOpts)
      this.context.commit('setCurrencies', res.data)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
  }

  get currencySymbol () {
    return this.accountSettings?.currency?.currencySymbol || '$'
  }

  get isOrdersAndShippingEnabled () {
    return this.accountSettings?.isOrdersAndShippingEnabled || null
  }

  get isManagementSectionEnabled () {
    return this.accountSettings?.isManagementSectionEnabled || null
  }

  get isFeeTrackerActive () {
    return this.accountSettings?.isFeeTrackerActive || false
  }
}
export type AccountSettingsStore = Pick<AccountSettingsModule, 'accountSettings'>
