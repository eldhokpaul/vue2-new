import type { RouteConfig } from 'vue-router'

import { ensureToken } from '@/router/guards/ensureToken'

export default [
  {
    path: '/',
    name: 'dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ './views/Dashboard.vue'),
    meta: {
      management: true
    },
    beforeEnter: ensureToken
  }
] as Array<RouteConfig>
