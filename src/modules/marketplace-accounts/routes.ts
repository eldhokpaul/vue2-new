import type { RouteConfig } from 'vue-router'

import { ensureToken } from '@/router/guards/ensureToken'

export default [
  {
    path: '/fee-tracker-pro',
    name: 'feeTrackerPro',
    meta: {
      isFeeTrackerActive: true
    },
    component: () => import(/* webpackChunkName: "marketplace-accounts-views" */ './views/FeeTrackerPro.vue'),
    beforeEnter: ensureToken
  },
  {
    path: '/marketplace-overview1',
    name: 'marketplaceOverview1',
    component: () => import(/* webpackChunkName: "marketplace-accounts-views" */ './views/Overview1.vue'),
    beforeEnter: ensureToken
  },
  {
    path: '/marketplace-overview2',
    name: 'marketplaceOverview2',
    component: () => import(/* webpackChunkName: "marketplace-accounts-views" */ './views/Overview2.vue'),
    beforeEnter: ensureToken
  },
  {
    path: '/marketplace-fees',
    name: 'marketplaceFees',
    component: () => import(/* webpackChunkName: "marketplace-accounts-views" */ './views/Fees.vue'),
    beforeEnter: ensureToken
  }
] as Array<RouteConfig>
