import type { RouteConfig } from 'vue-router'

import { ensureToken } from '@/router/guards/ensureToken'

export default [
  {
    path: '/users',
    name: 'users',
    meta: { adminOnly: true },
    component: () => import(/* webpackChunkName: "users-views" */ './views/Users.vue'),
    beforeEnter: ensureToken
  }
] as Array<RouteConfig>
