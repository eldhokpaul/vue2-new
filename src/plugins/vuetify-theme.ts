import { VueConstructor } from 'vue'

export const themes = {
  light: {
    toolbar: '#052126',
    // primary: '#052126',
    primary: '#2196F3',
    secondary: '#9E9E9E',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#1867c0',
    success: '#4CAF50',
    warning: '#FFC107',
    background: '#fff',
    paginationIconColor: '#d1d1d1',
    borderColor: '#e0e0e0',
    chartPrimaryColor: '#f9b299'
  },
  dark: {
    // primary: '#052126',
    primary: '#2196F3',
    secondary: '#9E9E9E',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#1867c0',
    success: '#4CAF50',
    warning: '#FFC107',
    background: '#121212',
    paginationIconColor: '#d1d1d1',
    borderColor: '#e0e0e0',
    chartPrimaryColor: '#f9b299'
  }
}

export default (store: any) => ({
  install (Vue: VueConstructor) {
    Vue.prototype.$getTheme = function () {
      const theme = themes.light
      this.$setTheme(theme)
    }

    Vue.prototype.$setTheme = async function (theme: any) {
      if (!theme) return
      store.commit('app/setTheme', theme)
      await this.$nextTick()

      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
    }
  }
})
