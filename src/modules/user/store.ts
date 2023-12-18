
import * as Sentry from '@sentry/vue'
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

import api from '@/api'
import type { Account, PaddleSubscriptionInfo, Pageable, PagePaddleSubscriptionHistory, SubscriptionPlan, User, UserAccountSettingsDto, UserPatchDto } from '@/client/users'
import { AccountUserSettingsControllerApi, UserControllerApi, UserSubscriptionControllerApi } from '@/client/users'
import { i18n } from '@/plugins/i18n'

import type { Subscription } from '../billing/types/Subscription'
// import type { IUser } from './types'

const { VUE_APP_BASE_URL } = process.env
const BASE_URL = VUE_APP_BASE_URL.slice(0, VUE_APP_BASE_URL.length - 1)

const userSubController = new UserSubscriptionControllerApi(undefined, BASE_URL)
const userController = new UserControllerApi(undefined, BASE_URL)
const accountUserSettingsController = new AccountUserSettingsControllerApi(undefined, BASE_URL)
@Module({
  namespaced: true
})

export class UserModule extends VuexModule {
  user: User | null = null
  subscription: Subscription | null = null
  subscriptionHistory: PagePaddleSubscriptionHistory | null = null
  subscriptionPlans: SubscriptionPlan[] = []
  paddleSubscriptionInfo: PaddleSubscriptionInfo | null = null

  @Mutation
  setUser (user: User | null) {
    this.user = user
  }

  @Mutation
  setUserSubscription (subscription: Subscription) {
    this.subscription = subscription
  }

   @Mutation
  setUserSubscriptionHistory (subscriptionHistory: PagePaddleSubscriptionHistory) {
    this.subscriptionHistory = subscriptionHistory
  }

   @Mutation
   setPaddleSubscriptionInfo (paddleSubscriptionInfo: PaddleSubscriptionInfo) {
     this.paddleSubscriptionInfo = paddleSubscriptionInfo
   }

  @Mutation
   setSubscriptionPlans (subscriptionPlans: SubscriptionPlan[]) {
     this.subscriptionPlans = subscriptionPlans
   }

  @Mutation
  setUserParams (params: User) {
    if (!this.user) {
      this.user = { ...params }
      return
    }

    this.user = { ...this.user, ...params }
  }

  get id () {
    if (!this.user) return null

    return this.user.id
  }

  get email () {
    if (!this.user) return null

    return this.user.email
  }

  @Action({ rawError: true })
  async clearUser (): Promise<void> {
    this.context.commit('setUser', null)
  }

  @Action({ rawError: true })
  async getUser (): Promise<void> {
    if (!this.user) throw new Error(i18n.t('pages.errors.user.noUser') as string)
    if (!this.user.email) throw new Error(i18n.t('pages.errors.user.noEmail') as string)
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    try {
      const reqOptions = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      const { data } = await userController.getUserById(userId, reqOptions)
      // const user = await api.user.getUserByEmail(this.context.rootGetters['auth/jwt'], this.user.email)
      this.context.commit('setUser', data)
    } catch (e) {
      await this.context.dispatch('auth/clearToken', null, { root: true })
      await this.context.dispatch('clearUser')
      Sentry.captureException(e)
      this.context.dispatch('toasts/addError', i18n.t('pages.errors.user.noUser'), { root: true })
      throw e
    }
  }

  @Action({ rawError: true })
  async switchUser (options: {userId: number, userPatch: UserPatchDto}): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const reqOptions = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      const { data } = await userController.updateExistingUser(options.userId, options.userPatch, reqOptions)
      await this.context.dispatch('getUserById', data.id)
      await this.context.dispatch('auth/sessionAuthToken', this.user?.id, { root: true })
      const calls = [
        this.context.dispatch('getUserSubscriptionByUserId', this.user?.id),
        this.context.dispatch('accountSettings/getAccountSettings', this.user?.id, { root: true })
      ]
      await Promise.all(calls)
      // const userDetail = await this.context.dispatch('user/getUserByEmail', user.data.email, { root: true })
      // await this.context.dispatch('getUserSubscriptionByUserId', data.id)
      // await this.context.dispatch('accountSettings/getAccountSettings', data.id, { root: true })
      this.context.dispatch('toasts/showAlert', 'User successfully switched', { root: true })
    } catch (e) {
      Sentry.captureException(e)
      await this.context.dispatch('clearUser')
      this.context.dispatch('auth/clearToken', null, { root: true })
      this.context.dispatch('toasts/addError', i18n.t('pages.errors.422.description'), { root: true })
    }
  }

  @Action({ rawError: true })
  async getUserById (): Promise<void> {
    try {
      const token = this.context.rootGetters['auth/jwt']
      const userId = this.context.rootGetters['user/id']
      const reqOptions = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      const { data } = await userController.getUserById(userId, reqOptions)
      this.context.commit('setUser', data)
    } catch (error) {
      this.context.dispatch('toasts/addError', i18n.t('pages.errors.422.description'), { root: true })
      this.context.dispatch('auth/clearToken', null, { root: true })
      this.context.dispatch('clearUser')
    }
  }

  @Action({ rawError: true })
  async updateUserParams (params: User): Promise<void> {
    this.context.commit('setUserParams', params)
  }

  @Action({ rawError: true })
  async getUserByEmail (email: string): Promise<User | null> {
    return await api.user.getUserByEmail(this.context.rootGetters['auth/jwt'], email)
  }

  @Action({ rawError: true })
  async patchUserAttributes (formData: User): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    const dateOfBirth = formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : formData.dateOfBirth
    const updatedUser = await api.user.patchUserAttributes(token, { ...formData, dateOfBirth })
    this.context.commit('setUser', updatedUser)
  }

  @Action({ rawError: true })
  async getUserSubscriptionByUserId (userId: number): Promise<any> {
    const user = userId ?? this.context.rootGetters['user/id']
    const res = await api.user.getUserSubscription(this.context.rootGetters['auth/jwt'], user)
    this.context.commit('setUserSubscription', res)
  }

  @Action({ rawError: true })
  async getPaddleSubscriptions (): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    const userId = this.context.rootGetters['user/id']
    const res = await userSubController.getPaddleIntegrationInfo(userId, requestOpts)
    this.context.commit('setPaddleSubscriptionInfo', res.data)
  }

  @Action({ rawError: true })
  async getSubscriptionPlans (): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    const res = await userSubController.getSubscriptionPlans(this.context.rootGetters['user/id'], requestOpts)
    this.context.commit('setSubscriptionPlans', res.data)
  }

  @Action({ rawError: true })
  async getUserSubscriptionHistoryByUserId (pagination: Pageable & {sort?: Array<any>}): Promise<any> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    const res = await api.user.getUserSubscriptionHistory(token, userId, pagination)
    this.context.commit('setUserSubscriptionHistory', res)
  }

  @Action({ rawError: true })
  async updateaccountUserSettings (opts: {userId: number, accountUserSettings: UserAccountSettingsDto}): Promise<void> {
    try {
      const token = this.context.rootGetters['auth/jwt']
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await accountUserSettingsController.updateAccountUserSettingsByUserId(opts.userId, opts.accountUserSettings, requestOpts)
      this.context.commit('setUserParams', { accountUserSettings: res.data })
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
  async verifyEmail (): Promise<void> {
    try {
      const token = this.context.rootGetters['auth/jwt']
      const userId = this.context.rootGetters['user/id']
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await userController.verifyEmail(userId, requestOpts)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
  }

  get isAdmin () {
    if (this.user?.accountRoles?.length) {
      return this.user.accountRoles.some((element: any) => {
        return ['sv-account-admin', 'sv-admin'].includes(
          element.name
        )
      })
    }
    return false
  }

  get isSysAdmin () {
    if (this.user?.accountRoles?.length) {
      return this.user.accountRoles.some((element: any) => {
        return ['sv-support', 'sv-admin'].includes(
          element.name
        )
      })
    }
    return false
  }

  get isViewer () {
    if (this.user?.accountRoles?.length) {
      return this.user.accountRoles.some((element: any) => {
        return ['sv-account-viewer'].includes(
          element.name
        )
      })
    }
    return false
  }

  get currentAccount () {
    if (this.user?.accounts?.length) {
      return this.user.accounts.find(account => account.isCurrent) as Account
    }
  }
}
