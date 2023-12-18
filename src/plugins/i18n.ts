import Vue from 'vue'
import VueI18n from 'vue-i18n'

import en from '@/lang/en'

// const loadedLanguages = ['en']
// const supportedLocales = [
//   'en'
// ]

Vue.use(VueI18n)

export const i18n = new VueI18n({
  fallbackLocale: 'en',
  preserveDirectiveContent: true,
  locale: 'en',
  messages: { en },
  silentFallbackWarn: true,
  numberFormats: {
    en: {
      currency: {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'symbol'
      }
    }
  }
})
