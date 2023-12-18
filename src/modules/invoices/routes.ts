import type { RouteConfig } from 'vue-router'

import { ensureToken } from '@/router/guards/ensureToken'

export default [
  {
    path: '/invoices/add',
    name: 'addInvoice',
    meta: {
      management: true
    },
    component: () => import(/* webpackChunkName: "invoice-views" */ './views/InvoiceUpload.vue'),
    beforeEnter: ensureToken
  },
  {
    path: '/invoices',
    name: 'invoices',
    meta: {
      management: true
    },
    component: () => import(/* webpackChunkName: "invoice-views" */ './views/Invoices.vue'),
    beforeEnter: ensureToken
  },
  {
    path: '/invoices/:id',
    name: 'invoice',
    component: () => import(/* webpackChunkName: "invoice-views" */ './views/InvoiceDetails.vue'),
    props: true,
    beforeEnter: ensureToken,
    meta: {
      management: true,
      fullScreen: true
    }
  }
] as Array<RouteConfig>
