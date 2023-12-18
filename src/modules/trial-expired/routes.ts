import type { RouteConfig } from 'vue-router'

import { ensureToken } from '@/router/guards/ensureToken'

export default [
  {
    path: '/trial-expired',
    name: 'trialExpired',
    component: () => import(/* webpackChunkName: "trial-views" */ './Index.vue'),
    props: true,
    beforeEnter: ensureToken
  }
] as Array<RouteConfig>
