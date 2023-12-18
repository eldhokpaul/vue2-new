import type { RouteConfig } from 'vue-router'

import { ensureToken } from '@/router/guards/ensureToken'

export default [
  {
    path: '/products',
    name: 'products',
    component: () => import(/* webpackChunkName: "product-views" */ './views/Products.vue'),
    meta: {
      management: true
    },
    beforeEnter: ensureToken
  },
  {
    path: '/products/add',
    name: 'addProduct',
    meta: {
      management: true
    },
    component: () => import(/* webpackChunkName: "product-views" */ './views/AddProduct.vue'),
    beforeEnter: ensureToken
  },
  {
    path: '/products/:sku',
    name: 'productDetails',
    props: true,
    component: () => import(/* webpackChunkName: "product-views" */ './views/ProductDetails.vue'),
    beforeEnter: ensureToken
  }
] as Array<RouteConfig>
