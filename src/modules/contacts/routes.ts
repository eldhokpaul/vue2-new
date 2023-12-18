import type { RouteConfig } from 'vue-router'

import { ensureToken } from '@/router/guards/ensureToken'

export default [
  {
    path: '/suppliers',
    name: 'suppliers',
    meta: {
      management: true
    },
    component: () => import(/* webpackChunkName: "contacts-views" */ './views/Contacts.vue'),
    beforeEnter: ensureToken
  },
  {
    path: '/suppliers/add',
    name: 'addSupplier',
    meta: {
      management: true
    },
    component: () => import(/* webpackChunkName: "contacts-views" */ '../contacts/views/AddContact.vue'),
    beforeEnter: ensureToken
  },
  {
    path: '/suppliers/:id',
    name: 'supplierDetails',
    props: true,
    meta: {
      management: true
    },
    component: () => import(/* webpackChunkName: "contacts-views" */ '../contacts/views/ContactDetails.vue'),
    beforeEnter: ensureToken
  }
] as Array<RouteConfig>
