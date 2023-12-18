import type { RouteConfig } from 'vue-router'

import { ensureToken } from '@/router/guards/ensureToken'

export default [
  {
    path: '/account-settings',
    meta: { adminOnly: true },
    name: 'accountSettings',
    component: () => import(/* webpackChunkName: "account-settings-views" */ './views/AccountSettings.vue'),
    beforeEnter: ensureToken
  }
] as Array<RouteConfig>
