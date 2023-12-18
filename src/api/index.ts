import CostsApi from './costs'
import DashboardApi from './dashboard'
import IntegrationsApi from './integrations'
import InvoicesApi from './invoices'
import NotificationsApi from './notifications'
import OrdersApi from './orders'
import ProductsApi from './products'
import Reporting from './reporting'
import SummaryApi from './summary'
import SuppliersApi from './suppliers'
import UserApi from './user'
const api = {
  products: ProductsApi,
  user: UserApi,
  suppliers: SuppliersApi,
  invoices: InvoicesApi,
  costs: CostsApi,
  dashboard: DashboardApi,
  integrations: IntegrationsApi,
  reporting: Reporting,
  notifications: NotificationsApi,
  orders: OrdersApi,
  summary: SummaryApi

}

export default api
