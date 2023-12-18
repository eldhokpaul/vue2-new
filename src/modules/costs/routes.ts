import type { RouteConfig } from 'vue-router'

import { ensureToken } from '@/router/guards/ensureToken'

export default [
  {
    path: '/transactions',
    component: () => import(/* webpackChunkName: "transactions-views" */ './views/Transactions.vue'),
    props: true,
    meta: {
      management: true
    },
    beforeEnter: ensureToken,
    children: [
      {
        path: '',
        name: 'bills',
        component: () => import(/* webpackChunkName: "transactions-views" */ './modules/bills/views/Bills.vue')
      },
      {
        path: 'payables',
        name: 'payables',
        component: () => import(/* webpackChunkName: "transactions-views" */ './modules/payables/views/Payables.vue')
      },
      {
        path: 'assigned-costs',
        name: 'assignedCosts',
        component: () => import(/* webpackChunkName: "transactions-views" */ './modules/costs/views/Costs.vue')
      }
    ]
  }
] as Array<RouteConfig>
