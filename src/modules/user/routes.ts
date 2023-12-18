import type { RouteConfig } from 'vue-router'

import { ensureToken } from '@/router/guards/ensureToken'

export default [
  {
    path: '/profile',
    name: 'profile',
    component: () => import(/* webpackChunkName: "user-views" */ './views/Profile.vue'),
    props: true,
    beforeEnter: ensureToken
  }
] as Array<RouteConfig>
