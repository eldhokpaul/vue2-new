import type { RouteConfig } from 'vue-router'

import { ensureToken } from '@/router/guards/ensureToken'

export default [
  {
    path: '/user-management',
    name: 'userManagement',
    meta: { sysAdminOnly: true },
    component: () => import(/* webpackChunkName: "users-views" */ './views/UserManagement.vue'),
    beforeEnter: ensureToken
  },
  {
    path: '/user-details/:id',
    name: 'userDetails',
    props: true,
    meta: { sysAdminOnly: true },
    component: () => import(/* webpackChunkName: "users-views" */ './views/UserDetails.vue'),
    beforeEnter: ensureToken
  }
] as Array<RouteConfig>
