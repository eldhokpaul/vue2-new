import type { RouteConfig } from 'vue-router'

import { ensureToken } from '@/router/guards/ensureToken'

export default [
  {
    path: '/demo/settings',
    name: 'demoSettings',
    component: () => import(/* webpackChunkName: "marketplace-accounts-views" */ './views/DemoSettings.vue'),
    beforeEnter: ensureToken
  }
] as Array<RouteConfig>
