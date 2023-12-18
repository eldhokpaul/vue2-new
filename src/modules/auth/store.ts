import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

import { GatewayControllerApi } from '@/client/gateway'
import type { EmailDto, User } from '@/client/users'
import { AuthControllerApi, UserControllerApi } from '@/client/users'
import type { IToken } from '@/types/app'

import type { ILoginFormData } from './types'
import { isTokenExpired } from './utils/token'

const { VUE_APP_BASE_URL } = process.env
const BASE_URL = VUE_APP_BASE_URL.slice(0, VUE_APP_BASE_URL.length - 1)

const authController = new AuthControllerApi(undefined, BASE_URL)
const userController = new UserControllerApi(undefined, BASE_URL)
const gatewayController = new GatewayControllerApi(undefined, BASE_URL)

// TODO use types from controllers
@Module({
  namespaced: true
})
export class AuthModule extends VuexModule {
  token: IToken | null = null

  get jwt () {
    if (!this.token || isTokenExpired(this.token)) return null

    return this.token.accessToken
  }

  @Mutation
  setToken (token: IToken | null) {
    this.token = token
  }

  @Action({ rawError: true })
  async clearToken () {
    this.context.commit('setToken', null)
  }

  @Action({ rawError: true })
  async verify (opts: { userId: number, verificationToken: string }) {
    const res = await authController.verifyUser(opts.userId, opts.verificationToken)
    const { data } = res
    return data
  }

  @Action({ rawError: true })
  async acceptAccountInvite (opts: { userId: number, accountId: number, verificationToken: string, invitationAction: 'ACCEPT' | 'REJECT' }) {
    const res = await authController.acceptAccountInvite(opts.userId, opts.accountId, opts.verificationToken, opts.invitationAction)
    const { data } = res
    return data
  }

  @Action({ rawError: true })
  async actOnInvitation (opts: { userId: number, accountId: number, invitationAction: 'ACCEPT' | 'REJECT' }) {
    const token = this.context.rootGetters['auth/jwt']
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    const res = await userController.actOnInvitation(opts.userId, opts.accountId, opts.invitationAction, requestOpts)
    const userDetail = await this.context.dispatch(
      'user/getUserByEmail',
      res.data.id,
      { root: true }
    )
    this.context.commit('user/setUserParams', userDetail, { root: true })
    const { data } = res
    return data
  }

  @Action({ rawError: true })
  async register (newUser: { email: string, firstName: string, lastName: string, password: string, captchaToken: string }) {
    const { data } = await authController.registerTrial(newUser)
    return data
  }

  @Action({ rawError: true })
  async resetPasswordFor (options: EmailDto) {
    const res = await authController.resetPassword(options)
    return res.data
  }

  @Action({ rawError: true })
  async setNewPassword (opts: { userId: number, verificationToken: string, password: string }) {
    const { userId, verificationToken, password } = opts
    const { data } = await authController.setNewPassword(userId, { password, verificationToken, userId })
    return data
  }

  @Action({ rawError: true })
  async login (formData: ILoginFormData) {
    const { data } = await gatewayController.authenticate({
      userName: formData.login,
      password: formData.password
    })
    if (!data) {
      this.context.commit('setToken', data)
      return
    }

    const expireDate = new Date()
    expireDate.setSeconds(data.expires_in as number)

    this.context.commit('setToken', {
      accessToken: data.access_token,
      expiresIn: expireDate,
      refreshExpiresIn: data.refresh_expires_in,
      refreshToken: data.refresh_token,
      scope: data.scope,
      sessionState: data.session_state
    } as IToken)
    await this.context.dispatch('user/updateUserParams', { email: formData.login, id: data.userId }, { root: true })
  }

  @Action({ rawError: true })
  async sessionAuthToken (userId: number) {
    const token = this.context.rootGetters['auth/jwt']
    const reqOptions = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    const { data } = await gatewayController.getUserSessionAuthToken(userId, reqOptions)
    if (!data) {
      this.context.commit('setToken', data)
      return
    }

    const expireDate = new Date()
    expireDate.setSeconds(data.expires_in as number)

    this.context.commit('setToken', {
      accessToken: data.access_token,
      expiresIn: expireDate,
      refreshExpiresIn: data.refresh_expires_in,
      refreshToken: data.refresh_token,
      scope: data.scope,
      sessionState: data.session_state
    } as IToken)
  }

  @Action({ rawError: true })
  async getUserReturn (): Promise<User|null> {
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const { data } = await userController.getUserById(userId, requestOpts)
      return data
    } catch (e) {
      return null
    }
  }
}
