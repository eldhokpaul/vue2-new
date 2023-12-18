import * as Sentry from '@sentry/vue'
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

// import api from '@/api'
import type { AccountUserDto, AccountUserUpdateDto, Role, User, UserDto } from '@/client/users'
import { AccountControllerApi, UserAdminControllerApi, UserControllerApi } from '@/client/users'
import { i18n } from '@/plugins/i18n'
import type { ICurrentPageOpts } from '@/types/app'

const { VUE_APP_BASE_URL } = process.env
const BASE_URL = VUE_APP_BASE_URL.slice(0, VUE_APP_BASE_URL.length - 1)

const AccountController = new AccountControllerApi(undefined, BASE_URL)
const userController = new UserControllerApi(undefined, BASE_URL)
const adminUserController = new UserAdminControllerApi(undefined, BASE_URL)

@Module({
  namespaced: true
})
export class UsersModule extends VuexModule {
  users: AccountUserDto[] | null = null
  roles: Role[] | null = null
  user: User | null = null

  @Mutation
  setUsers (users: AccountUserDto[]) {
    this.users = users
  }

  @Mutation
  userRoles (roles: Role[]) {
    this.roles = roles
  }

  @Action({ rawError: true })
  async getUsers (opts: ICurrentPageOpts): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    const { userId } = opts
    try {
      const res = await userController.getUserById(userId.toString(), requestOpts)
      const mockResult = {
        content: new Array(res.data),
        totalElements: 7,
        pageable: {
          pageNumber: 1,
          pageSize: 100
        }
      }
      this.context.commit('setUsers', mockResult)
    } catch (e) {
      Sentry.captureException(e)
      this.context.commit('setUsers', [])
      // this.context.dispatch(
      //   'toasts/addError',
      //   i18n.t('pages.errors.422.description'),
      //   { root: true }
      // )
    }
  }

  @Action({ rawError: true })
  async getUserById (id: number): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await AccountController.fetchUsersForAccount(id, requestOpts)
      this.context.commit('setUsers', res.data)
    } catch (e) {
      Sentry.captureException(e)
      this.context.commit('setUsers', [])
      // this.context.dispatch(
      //   'toasts/addError',
      //   i18n.t('pages.errors.422.description'),
      //   { root: true }
      // )
    }
  }

  @Action({ rawError: true })
  async getUserRoles (userId: number): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await AccountController.fetchAccountUserRoles(userId, requestOpts)
      this.context.commit('userRoles', res.data)
    } catch (e) {
      Sentry.captureException(e)
      this.context.commit('userRoles', null)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
  }

  @Action({ rawError: true })
  async inviteUser (opts: {userId: number, accountUser: AccountUserUpdateDto}): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await AccountController.addUserToAccount(opts.userId, opts.accountUser, requestOpts)
      this.context.commit('setUsers', res.data)
    } catch (e) {
      Sentry.captureException(e)
      // this.context.commit('userRoles', null)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
  }

  @Action({ rawError: true })
  async addUser (user: UserDto): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const options = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(user)
      }
      await adminUserController.createUser(user, options)
      await this.context.dispatch('getUsers')
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
  async removeUser (opts: {userId: number, deleteUserId: number}): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await AccountController.removeUserFromAccount(opts.userId, opts.deleteUserId, requestOpts)
      this.context.commit('setUsers', res.data.users)
    } catch (e) {
      Sentry.captureException(e)
      // this.context.commit('userRoles', null)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
  }

  @Action({ rawError: true })
  async updateRole (opts: {userId: number, updateUserId: number, accountUser: AccountUserUpdateDto}): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await AccountController.updateUserRolesForAccount(opts.userId, opts.updateUserId, opts.accountUser, requestOpts)
      this.context.commit('setUsers', res.data.users)
    } catch (e) {
      Sentry.captureException(e)
      // this.context.commit('userRoles', null)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
  }

  @Action({ rawError: true })
  async patchUserAttributes (formData: UserDto) {
    const token = this.context.rootGetters['auth/jwt']
    try {
      const options = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await userController.replaceUser(formData.id!, formData, options)
      await this.context.dispatch('getUsers')
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
