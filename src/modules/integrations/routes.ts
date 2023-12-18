import type { RouteConfig } from 'vue-router'

import { ensureToken } from '@/router/guards/ensureToken'

export default [
  {
    path: '/integrations',
    meta: { adminOnly: true },
    component: () => import(/* webpackChunkName: "integrations-views" */ './index.vue'),
    beforeEnter: ensureToken,
    children: [
      {
        path: '',
        name: 'integrations',
        component: () => import(/* webpackChunkName: "integrations-views" */ './views/Applications.vue')
      },
      {
        path: 'connected',
        name: 'integrationsConnected',
        component: () => import(/* webpackChunkName: "integrations-views" */ './views/Connected.vue')
      },
      {
        path: 'applications',
        name: 'integrationsApplications',
        component: () => import(/* webpackChunkName: "integrations-views" */ './views/Applications.vue')
      }
    ]
  },
  {
    path: '/integrations/:integrationId/redirect',
    name: 'integrationRedirect',
    component: () => import(/* webpackChunkName: "integrations-views" */ './views/IntegrationRedirect.vue'),
    props: true
  }
] as Array<RouteConfig>
