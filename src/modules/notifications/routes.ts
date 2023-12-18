import type { RouteConfig } from 'vue-router'

import { ensureToken } from '@/router/guards/ensureToken'

export default [
  {
    path: '/notifications',
    name: 'notifications',
    component: () => import(/* webpackChunkName: "user-views" */ './views/Notifications.vue'),
    props: true,
    beforeEnter: ensureToken
  }
] as Array<RouteConfig>
