<template>
  <v-app
    id="app"
  >
    <transition
      name="fade"
      mode="out-in"
    >
      <v-navigation-drawer
        v-if="!$route.meta.fullScreen && user && user.accountRoles && showSubroute"
        v-model="drawer"
        app
        fixed
        floating
        :clipped="$vuetify.breakpoint.lgAndUp"
        class="navigation-drawer"
      >
        <app-drawer
          :app-name="appName"
        />
      </v-navigation-drawer>
    </transition>
    <transition
      name="fade"
      mode="out-in"
    >
      <app-toolbar
        v-if="!$route.meta.fullScreen && user && user.accountRoles && showSubroute"
        :value="drawer"
        @input="(val) => drawer = val"
      />
    </transition>
    <v-main class="ma-0">
      <transition
        name="fade"
        mode="out-in"
      >
        <router-view
          v-if="showSubroute"
        />
      </transition>
    </v-main>
    <toasts-popup />
  </v-app>
</template>

<script lang="ts">
import * as Sentry from '@sentry/vue'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import AppDrawer from '@/components/AppDrawer.vue'
import AppToolbar from '@/components/AppToolbar.vue'
import authRoutes from '@/modules/auth/modules/routes'
import ToastsPopup from '@/modules/toasts/components/ToastsPopup.vue'
import type { IUser } from '@/modules/user/types'

const namespaces = {
  app: 'app',
  auth: 'auth',
  user: 'user',
  toasts: 'toasts'
}

@Component({
  components: {
    ToastsPopup,
    AppToolbar,
    AppDrawer
  }
})

export default class App extends Vue {
  @State('name', { namespace: namespaces.app }) appName?: string | null
  @State('user', { namespace: namespaces.user }) user?: IUser | null
  drawer = true

  get showSubroute () {
    const res = !!this.user || ['404', ...authRoutes.flatMap((r) => r.children || r).map(({ name }) => name)].includes(this.$route.name || undefined)
    return res
  }

  @Watch('user')
  userChanged (user: IUser | null) {
    this.$intercom.shutdown()
    this.bootIntercom(user)
    if (user) {
      Sentry.setUser({
        id: user.id?.toString(),
        email: user.email,
        username: user.firstName + ' ' + user.lastName
      })
    } else {
      Sentry.setUser(null)
    }
  }

  mounted (): void {
    this.bootIntercom()
  }

  bootIntercom (user: IUser | null = null): void {
    if (user) {
      const name = (user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : ''
      this.$intercom.boot({
        user_id: user.id,
        name: name,
        email: user.email
      })
    } else {
      this.$intercom.boot()
    }
  }
}
</script>

<style lang="scss" scoped>

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
  opacity: 0;
  animation: app-fade-in;
  animation-duration: 250ms;
  animation-delay: 500ms;
  animation-fill-mode: forwards;
  animation-iteration-count: 1;

  @keyframes app-fade-in {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }
}

.v-main {
  transition: none !important;
}

</style>
