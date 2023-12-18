import '@/scss/main.scss'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
// Import the CSS or use your own!
import 'vue-toastification/dist/index.css'
import 'flag-icons/css/flag-icons.min.css'

import * as Sentry from '@sentry/vue'
import { LicenseManager } from 'ag-grid-enterprise'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import VueMask from 'v-mask'
import Vue from 'vue'
import VueIntercom from 'vue-intercom'
import JsonExcel from 'vue-json-excel'
import VueSSE from 'vue-sse'
import Toast, { POSITION } from 'vue-toastification'

import App from './App.vue'
import flags from './plugins/flags'
import { i18n } from './plugins/i18n'
import vuetify from './plugins/vuetify'
import createVuetifyThemePlugin from './plugins/vuetify-theme'
import router from './router'
import store from './store'
const { VUE_APP_SENTRY_DSN, VUE_APP_SENTRY_ENVIRONMENT, VUE_APP_AG_GRID_LICENSE } = process.env

LicenseManager.setLicenseKey(VUE_APP_AG_GRID_LICENSE)

const options = {
  position: POSITION.BOTTOM_RIGHT,
  timeout: 5000,
  closeOnClick: true,
  pauseOnHover: true,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: 'button',
  icon: true
}

Vue.use(Toast, options)
// VueSSE enables effortless use of Server-Sent Events by providing a high-level interface to an underlying EventSource.
Vue.use(VueSSE, {
  format: 'json',
  forcePolyfill: true
})
if (VUE_APP_SENTRY_DSN) {
  const environment = VUE_APP_SENTRY_ENVIRONMENT || 'local'
  Sentry.init({
    Vue,
    environment,
    dsn: VUE_APP_SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router)
      }),
      new Sentry.Replay()
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,

    // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
    // tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
  })
}

Vue.use(VueIntercom, { appId: 'snfioymy' })
const vuetifyThemePlugin = createVuetifyThemePlugin(store)

Vue.config.productionTip = false

Vue.use(flags)
Vue.use(vuetifyThemePlugin)
Vue.use(VueMask)
Vue.component('DownloadExcel', JsonExcel)

Vue.mixin({
  mounted () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const el = this.$el
    const name = this.name || this.constructor.name
    if (el && el.setAttribute && name && name !== 'VueComponent') {
      el.setAttribute('data-testid', name)
    }
  }
})

new Vue({
  router,
  store,
  i18n,
  vuetify,
  render: h => h(App)
}).$mount('#app')
