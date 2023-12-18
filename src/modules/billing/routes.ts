import type { RouteConfig } from 'vue-router'

import { ensureToken } from '@/router/guards/ensureToken'

export default [
  {
    path: '/billing',
    meta: {
      billingLifetime: true,
      adminOnly: true
    },
    component: () => import(/* webpackChunkName: "billing-views" */ './views/Billing.vue'),
    beforeEnter: ensureToken,
    children: [
      {
        path: '',
        name: 'billing',
        component: () => import(/* webpackChunkName: "billing-views" */ './modules/Billing/views/Billing.vue')
      },
      {
        path: 'subscriptions',
        name: 'billingSubscriptions',
        component: () => import(/* webpackChunkName: "billing-views" */ './modules/Subscriptions/views/Subscriptions.vue')
      },
      {
        path: 'invoices',
        name: 'billingInvoices',
        component: () => import(/* webpackChunkName: "billing-views" */ './modules/Invoices/views/Invoices.vue')
      }
    ]
  }
] as Array<RouteConfig>
