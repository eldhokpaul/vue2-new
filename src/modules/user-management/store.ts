import * as Sentry from '@sentry/vue'
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

import api from '@/api'
import type { AccountSettingsDto, EmailDto, Pageable, PageUser, User, UserAdminPatchDto, UserAdminStatsDto } from '@/client/users'
import { AccountSettingsControllerApi, AuthControllerApi, UserAdminControllerApi, UserControllerApi } from '@/client/users'
import { i18n } from '@/plugins/i18n'
import type { ObjectKeyAsAny } from '@/types/app'

const { VUE_APP_BASE_URL } = process.env
const BASE_URL = VUE_APP_BASE_URL.slice(0, VUE_APP_BASE_URL.length - 1)

const userControllerApi = new UserControllerApi(undefined, BASE_URL)
const userAdminControllerApi = new UserAdminControllerApi(undefined, BASE_URL)
const authControllerApi = new AuthControllerApi(undefined, BASE_URL)
const accountSettingsControllerApi = new AccountSettingsControllerApi(undefined, BASE_URL)

@Module({
  namespaced: true
})
export class UserManageModule extends VuexModule {
  allUsers: PageUser | null = null
  userDetails: User | null = null
  userTiers: ObjectKeyAsAny | null = null
  userStatus: UserAdminStatsDto | null= null
  accountSettingsByUser: AccountSettingsDto | null = null

  @Mutation
  setUsers (allUsers: PageUser) {
    this.allUsers = allUsers
  }

  @Mutation
  setuserStatus (userStatus: UserAdminStatsDto) {
    this.userStatus = userStatus
  }

  @Mutation
  setUserDetails (user: User) {
    this.userDetails = user
  }

  @Mutation
  setUserTiers (content: ObjectKeyAsAny) {
    this.userTiers = content
  }

  @Mutation
  setAccountSettingsByUser (content: AccountSettingsDto) {
    this.accountSettingsByUser = content
  }

  @Action({ rawError: true })
  async getAllUsers (pagination?: Pageable & { sort: Array<any>, search: string }): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const res = await api.user.getAllUser(token, {
        page: pagination?.pageNumber,
        size: pagination?.pageSize,
        search: pagination?.search,
        sort: pagination?.sort
      })
      this.context.commit('setUsers', res)
    } catch (e) {
      Sentry.captureException(e)
      this.context.commit('setUsers', [])
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw e
    }
  }

  @Action({ rawError: true })
  async getUserById (id: string): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await userControllerApi.getUserById(id, requestOpts)
      this.context.commit('setUserDetails', res.data)
    } catch (e) {
      Sentry.captureException(e)
      this.context.commit('setUserDetails', null)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
  }

  @Action({ rawError: true })
  async updateUser (options: {userId: number, userData: UserAdminPatchDto}): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await userAdminControllerApi.adminUpdateUserDetails(options.userId, options.userData, requestOpts)
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
  async adminReverifyUser (userId: number): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await userAdminControllerApi.adminReverifyUser(userId, requestOpts)
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
  async adminPasswordResetEmail (email: EmailDto): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await authControllerApi.resetPassword(email, requestOpts)
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
  async getUserTiers (userId: number): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await userControllerApi.getUserTiers(userId, requestOpts)
      this.context.commit('setUserTiers', res.data)
    } catch (e) {
      this.context.commit('setUserTiers', null)
      Sentry.captureException(e)
    }
  }

  @Action({ rawError: true })
  async registerUser (email: string): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await userAdminControllerApi.registerUser({ email: email }, requestOpts)
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
  async getUserAdminStats (): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await userAdminControllerApi.getUserAdminStats(requestOpts)
      this.context.commit('setuserStatus', res.data)
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
  async getOwnedAccountSettingsByUserId (userId: number): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const { data } = await accountSettingsControllerApi.getOwnedAccountSettingsByUserId(userId, requestOpts)
      this.context.commit('setAccountSettingsByUser', data)
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
