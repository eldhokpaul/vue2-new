import { RawLocation, Route } from 'vue-router'

import { isTokenExpired } from '@/modules/auth/utils/token'
import store from '@/store'

export type NavigationGuardNext<V extends Vue = Vue> = (to?: RawLocation | false | ((vm: V) => any) | void) => void

export const ensureToken = async (to: Route, _from: Route, next: NavigationGuardNext<Vue>) => {
  try {
    const { token } = store.state.auth
    if (isTokenExpired(token)) {
      store.dispatch('user/clearUser', null, { root: true })
      store.dispatch('auth/clearToken', null, { root: true })
    }
    if (!store.state.user.user) {
      store.dispatch('auth/clearToken', null, { root: true })
      store.dispatch('user/clearUser', null, { root: true })
    }
    // ensure user is authenticated
    if (!store.state.auth.token) {
      store.dispatch('user/clearUser', null, { root: true })
      return next({ name: 'authLogin', query: { ...to.query, path: to.fullPath } })
    }
    const currentAccount = store.getters['user/currentAccount']
    if (
      store.state.user.user !== null &&
      currentAccount.accountTier !== null &&
      currentAccount.tierExpiryDate !== null &&
      new Date(currentAccount.tierExpiryDate).getTime() < Date.now() &&
      to.name !== 'trialExpired'
    ) {
      return next({ name: 'trialExpired' })
    }
    const isAdmin = store.getters['user/isAdmin']
    if (to.matched.some(record => record.meta.adminOnly) && !isAdmin) {
      return next({ name: '404' })
    }
    const isSysAdmin = store.getters['user/isSysAdmin']
    if (to.matched.some(record => record.meta.sysAdminOnly) && !isSysAdmin) {
      return next({ name: '404' })
    }
    const billingLifetime:string = currentAccount.accountTier || ''
    if (to.matched.some(record => record.meta.billingLifetime) && billingLifetime === 'LIFETIME') {
      return next({ name: '404' })
    }
    const isManagementSectionEnabled = store.getters['accountSettings/isManagementSectionEnabled']
    if (to.matched.some(record => record.meta.management) && !isManagementSectionEnabled) {
      return next({ name: '404' })
    }
    const isOrdersAndShippingEnabled = store.getters['accountSettings/isOrdersAndShippingEnabled']
    if (to.matched.some(record => record.meta.orders) && !isOrdersAndShippingEnabled) {
      return next({ name: '404' })
    }
    const isFeeTrackerActive = store.getters['accountSettings/isFeeTrackerActive']
    if (to.matched.some(record => record.meta.isFeeTrackerActive) && !isFeeTrackerActive) {
      return next({ name: '404' })
    }
    next()
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const message = err.statusText || 'error'
    store.dispatch('user/clearUser', null, { root: true })
    store.dispatch('auth/clearToken', null, { root: true })
    store.dispatch('toasts/addError', { message })
    next({ name: 'authLogin' })
  }
}
