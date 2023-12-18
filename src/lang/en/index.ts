import accountSettingsForm from './account-settings/componentAccountSettingsForm.json'
import accountSettings from './account-settings/pageAccountSettings.json'
import app from './app/app.json'
import appConfirmationDialog from './app/componentAppConfirmationDialog.json'
import appDeleteDialog from './app/componentAppDeleteDialog.json'
import appDialogDatePicker from './app/componentAppDialogDatePicker.json'
import appDrawer from './app/componentAppDrawer.json'
import appOnboarding from './app/componentAppOnboarding.json'
import appProductChangeStatsCard from './app/componentAppProductChangeStatsCard.json'
import appBillingTable from './app/componentBillingTable.json'
import appCreateNewDialog from './app/componentCreateNewDialog.json'
import tableControls from './app/componentTableControls.json'
import xeroContactsSyncDialog from './app/componentXeroContactsSyncDialog.json'
import authLoginForm from './auth/components/loginForm.json'
import resetPasswordForm from './auth/components/resetPasswordForm.json'
import authVerification from './auth/pageAuthVerification.json'
import authLogin from './auth/pageLogin.json'
import authNewPassword from './auth/pageNewPassword.json'
import authRegister from './auth/pageRegister.json'
import authResetPassword from './auth/pageResetPassword.json'
import setupAccount from './auth/pageSetupAccount.json'
import setupIntegration from './auth/pageSetupIntegration.json'
import setupProductUpload from './auth/pageSetupProductUpload.json'
import setupScheduleCall from './auth/pageSetupScheduleCall.json'
import billing from './billing/pageBilling.json'
import billingSubscriptions from './billing/pageSubscriptions.json'
import companyForm from './company/components/companyForm.json'
import BillsTable from './costs/components/componentBillsTable.json'
import costsStatsCard from './costs/components/componentCostsStatsCard.json'
import costsTable from './costs/components/componentCostsTable.json'
import PayablesTable from './costs/components/componentPayablesTable.json'
import costs from './costs/pageCosts.json'
import dashboard from './dashboard/pageDashboard.json'
import errors from './errors/errors.json'
import applications from './integration/componentApplications.json'
import integrationRedirect from './integration/componentIntegrationRedirect.json'
import invoiceEdit from './invoices/componentInvoiceEdit.json'
import invoiceForm from './invoices/componentInvoiceForm.json'
import invoiceLineForm from './invoices/componentInvoiceLineForm.json'
import invoiceLinesTable from './invoices/componentInvoiceLinesTable.json'
import invoicesTable from './invoices/componentInvoicesTable.json'
import invoiceUploadForm from './invoices/componentInvoiceUploadForm.json'
import invoice from './invoices/invoice.json'
import invoices from './invoices/invoices.json'
import marketplaceFees from './marketplace/pageMarketplaceFees.json'
import marketplaceOverview2 from './marketplace/pageMarketplaceOverview2.json'
import notification from './notifications/componentsNotification.json'
import ordersTable from './orders/components/componentOrdersTable.json'
import orders from './orders/pageOrders.json'
import amazonProductDetails from './products/componentAmazonProductDetails.json'
import amazonProductsTable from './products/componentAmazonProductsTable.json'
import amazonProductSyncDialog from './products/componentAmazonProductSyncDialog.json'
import brandForm from './products/componentBrandForm.json'
import productForm from './products/componentProductForm.json'
import productsTable from './products/componentProductsTable.json'
import productSuppliersForm from './products/componentProductSupplierForm.json'
import productSuppliers from './products/componentProductSuppliers.json'
import addProduct from './products/pageAddProduct.json'
import amazonProducts from './products/pageAmazonProducts.json'
import marketplaceOverview1 from './products/pageMarketplaceOverview1.json'
import productDetails from './products/pageProductDetails.json'
import products from './products/pageProducts.json'
import routes from './routes/routes.json'
import rules from './rules/rules.json'
import shipmentPlanForm from './shipment/components/componentShipmentPlanForm.json'
import shipment from './shipment/pageShipmentPlan.json'
import supplierForm from './suppliers/componentSupplierForm.json'
import suppliersTable from './suppliers/componentSuppliersTable.json'
import suppliers from './suppliers/pageSupplier.json'
import userMenu from './user/componentUserMenu.json'
import userProfileForm from './user/componentUserProfileForm.json'
import usersDialogs from './user-management/components/componentUserDialogs.json'
import usersStatsCard from './user-management/components/componentUsersStatsCard.json'
import usersForm from './users/componentUsersForm.json'
import usersTable from './users/componentUsersTable.json'
import users from './users/pageUsers.json'

const pages = {
  app,
  addProduct,
  productDetails,
  authLogin,
  authResetPassword,
  authNewPassword,
  authVerification,
  authRegister,
  billing,
  billingSubscriptions,
  dashboard,
  products,
  errors,
  invoice,
  invoices,
  rules,
  suppliers,
  users,
  costs,
  amazonProducts,
  orders,
  shipment,
  accountSettings,
  setupIntegration,
  setupProductUpload,
  setupScheduleCall,
  setupAccount,
  appOnboarding,
  marketplaceOverview1,
  marketplaceFees,
  marketplaceOverview2
}

const components = {
  appDrawer,
  appBillingTable,
  suppliersTable,
  supplierForm,
  authLoginForm,
  resetPasswordForm,
  appCreateNewDialog,
  appDialogDatePicker,
  companyForm,
  productsTable,
  productForm,
  productSuppliers,
  productSuppliersForm,
  brandForm,
  userProfileForm,
  userMenu,
  appDeleteDialog,
  appProductChangeStatsCard,
  tableControls,
  invoicesTable,
  invoiceUploadForm,
  invoiceLinesTable,
  invoiceLineForm,
  invoiceForm,
  invoiceEdit,
  costsTable,
  PayablesTable,
  BillsTable,
  costsStatsCard,
  usersForm,
  usersTable,
  accountSettingsForm,
  amazonProductSyncDialog,
  appConfirmationDialog,
  amazonProductsTable,
  amazonProductDetails,
  usersStatsCard,
  usersDialogs,
  ordersTable,
  shipmentPlanForm,
  xeroContactsSyncDialog,
  applications,
  integrationRedirect,
  notification
}

export default {
  pages,
  components,
  routes
}
