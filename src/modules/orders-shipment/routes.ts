import type { RouteConfig } from 'vue-router'

import { ensureToken } from '@/router/guards/ensureToken'

export default [
  {
    path: '/orders-shipments',
    component: () => import(/* webpackChunkName: "transactions-views" */ './views/OrdersShipmentPlans.vue'),
    meta: {
      orders: true,
      management: true
    },
    beforeEnter: ensureToken,
    children: [
      {
        path: '',
        name: 'orders',
        component: () => import(/* webpackChunkName: "transactions-views" */ './modules/orders/views/Orders.vue')
      },
      {
        path: 'shipment-plans/:shipmentId?',
        name: 'shipmentPlans',
        props: true,
        component: () => import(/* webpackChunkName: "transactions-views" */ './modules/shipment-plans/views/ShipmentPlans.vue')
      }

    ]
  }
] as Array<RouteConfig>
