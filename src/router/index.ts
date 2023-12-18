import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

// import routes from modules
import accountSettingsRoutes from '@/modules/account-settings/routes'
import authRoutes from '@/modules/auth/routes'
import billingRoutes from '@/modules/billing/routes'
import contactsRoutes from '@/modules/contacts/routes'
import costsRoutes from '@/modules/costs/routes'
import dashboardRoutes from '@/modules/dashboard/routes'
import demoRoutes from '@/modules/demo/routes'
import integrationsRoutes from '@/modules/integrations/routes'
import invoicesRoutes from '@/modules/invoices/routes'
import marketplaceAccounts from '@/modules/marketplace-accounts/routes'
import notifications from '@/modules/notifications/routes'
import ordersRoutes from '@/modules/orders-shipment/routes'
import productsRoutes from '@/modules/products/routes'
import trialExpired from '@/modules/trial-expired/routes'
import userRoutes from '@/modules/user/routes'
import userManagement from '@/modules/user-management/routes'
import usersRoutes from '@/modules/users/routes'

Vue.use(VueRouter)

// set up default routes (404)
const defaultRoutes: RouteConfig[] = [
  {
    path: '*',
    name: '404',
    component: () => import(/* webpackChunkName: "default-views" */ '@/views/404.vue')
  }
]

const routes: RouteConfig[] = [
  ...authRoutes,
  ...dashboardRoutes,
  ...billingRoutes,
  ...productsRoutes,
  ...userRoutes,
  ...invoicesRoutes,
  ...costsRoutes,
  ...trialExpired,
  ...integrationsRoutes,
  ...usersRoutes,
  ...accountSettingsRoutes,
  ...marketplaceAccounts,
  ...defaultRoutes,
  ...contactsRoutes,
  ...ordersRoutes,
  ...userManagement,
  ...notifications,
  ...demoRoutes
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
