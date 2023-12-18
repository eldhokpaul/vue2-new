import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
// import createMultiTabState from 'vuex-multi-tab-state'
import { VuexPersistence } from 'vuex-persist'

import { AccountSettingsModule } from '@/modules/account-settings/store'
import { AuthModule } from '@/modules/auth/store'
import { ContactsModule } from '@/modules/contacts/store'
import { CostsModule } from '@/modules/costs/store'
import { DashboardModule } from '@/modules/dashboard/store'
import { IntegrationsModule } from '@/modules/integrations/store'
import { InvoicesModule } from '@/modules/invoices/store'
import { MarketplaceAccountsModule } from '@/modules/marketplace-accounts/store'
import { NotificationsModule } from '@/modules/notifications/store'
import { OrdersModule } from '@/modules/orders-shipment/store'
import { ProductsModule } from '@/modules/products/store'
import { ToastModule } from '@/modules/toasts/store'
import { UserModule } from '@/modules/user/store'
import { UserManageModule } from '@/modules/user-management/store'
import { UsersModule } from '@/modules/users/store'
import { AppModule } from '@/store/app'
import { GridModule } from '@/store/grid'

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  reducer: (state: any) => ({
    app: state.app,
    auth: state.auth,
    user: state.user,
    grid: state.grid,
    accountSettings: state.accountSettings
  })
})

Vue.use(Vuex)
const debug = process.env?.NODE_ENV ? process.env.NODE_ENV !== 'production' : false

const testEnvPlugins = debug
  ? [
      createLogger({})
    ]
  : []

export default new Vuex.Store({
  plugins: [
    ...testEnvPlugins,
    vuexLocal.plugin
    // createMultiTabState({
    //   statesPaths: ['notifications.notificationsQueue']
    // })
  ],
  modules: {
    app: AppModule,
    auth: AuthModule,
    suppliers: ContactsModule,
    dashboard: DashboardModule,
    products: ProductsModule,
    costs: CostsModule,
    user: UserModule,
    users: UsersModule,
    userManagement: UserManageModule,
    invoices: InvoicesModule,
    toasts: ToastModule,
    integrations: IntegrationsModule,
    accountSettings: AccountSettingsModule,
    marketplaceAccounts: MarketplaceAccountsModule,
    grid: GridModule,
    notifications: NotificationsModule,
    orders: OrdersModule
  }
})
