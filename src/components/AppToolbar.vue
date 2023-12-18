<template>
  <v-app-bar
    app
    class="app-toolbar"
    :clipped-left="$vuetify.breakpoint.lgAndUp"
    :color="$vuetify.theme.currentTheme.toolbar"
    :dark="true"
    flat
    dense
    fixed
  >
    <v-app-bar-nav-icon
      @click.stop="$emit('input', !value)"
    />
    <router-link
      :class="{
        'align-center': true,
        'd-flex': true,
        'ml-2': $vuetify.breakpoint.lgAndUp,
        'mr-6': $vuetify.breakpoint.lgAndUp
      }"
      :to="home"
    >
      <app-logo
        width="128px"
        :primary="false"
      />
    </router-link>
    <v-spacer />
    <v-toolbar-items>
      <user-menu
        :user="user"
        @logout="logout"
      />
      <notifications :loading="initialLoadTask.isActive" />
    </v-toolbar-items>
  </v-app-bar>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { POSITION } from 'vue-toastification'
import { Action, Getter, Mutation, State } from 'vuex-class'

import type { AccountSettingsDto } from '@/client/users'
import EmailVerifyToast from '@/components/EmailVerifyToast.vue'
import { Task } from '@/decorators/task'
import Notifications from '@/modules/notifications/components/NotificationsPanel.vue'
import UserMenu from '@/modules/user/components/UserMenu.vue'
import type { IUser } from '@/modules/user/types'

import AppLogo from './AppLogo.vue'

const namespaces = {
  auth: 'auth',
  app: 'app',
  user: 'user',
  notifications: 'notifications',
  accountSettings: 'accountSettings'
}
@Component({
  components: {
    AppLogo,
    UserMenu,
    Notifications,
    EmailVerifyToast
  }
})
export default class AppToolbar extends Vue {
  @Action('clearToken', { namespace: namespaces.auth }) clearToken: any
  @Action('clearUser', { namespace: namespaces.user }) clearUser: any
  @Action('getUser', { namespace: namespaces.user }) getUser!: () => Promise<void>
  @Getter('id', { namespace: namespaces.user }) userId!: number
  @Getter('jwt', { namespace: namespaces.auth }) token?: string
  @Action('getAccountSettings', { namespace: namespaces.accountSettings }) getAccountSettings!: () => Promise<void>
  @State('user', { namespace: namespaces.user }) user?: IUser
  @Mutation('setOnboarding', { namespace: namespaces.app }) setOnboarding!: (val: boolean) => void
  @Action('getPageNotificationsQueue', { namespace: namespaces.notifications }) getPageNotificationsQueue!: () => Promise<void>
  @Action('initializeEventSource', { namespace: namespaces.notifications }) initializeEventSource!: () => Promise<void>
  @Action('disconnectEventSource', { namespace: namespaces.notifications }) disconnectEventSource!: () => Promise<void>
  @Action('verifyEmail', { namespace: namespaces.user }) verifyEmail!: () => Promise<void>;

  @State('accountSettings', { namespace: namespaces.accountSettings }) accountSettings!: AccountSettingsDto

  @Prop()
  readonly value!: boolean

  @Task('initialLoadTask')
  async initialLoad () {
    const calls = [
      this.getUser(),
      this.getAccountSettings(),
      this.getPageNotificationsQueue(),
      this.initializeEventSource()
    ]
    await Promise.all(calls)
  }

  async mounted () {
    await this.initialLoad()
  }

  @Watch('user')
  userChanged (user: IUser | null) {
    if (user) {
      if (!this.user?.isVerified) {
        this.$toast.error(
          {
            component: EmailVerifyToast,
            listeners: {
              emailVerifyEvent: this.emailVerify // Optional
            }
          },
          {
            id: 'emailToast',
            toastClassName: 'my-custom-toast-class',
            position: POSITION.TOP_RIGHT,
            timeout: false,
            closeOnClick: false,
            pauseOnFocusLoss: false,
            pauseOnHover: false,
            draggable: false,
            draggablePercent: 0.6,
            showCloseButtonOnHover: false,
            hideProgressBar: false,
            closeButton: false,
            icon: false,
            rtl: false
          })
      } else {
        this.$toast.dismiss('emailToast')
      }
    }
  }

  get home () {
    return {
      name: this.isManagementSectionEnabled ? 'dashboard' : 'feeTrackerPro'
    }
  }

  get isManagementSectionEnabled (): boolean {
    return this.accountSettings?.isManagementSectionEnabled || false
  }

  async logout () {
    this.setOnboarding(true)
    await this.clearToken()
    await this.clearUser()
    this.disconnectEventSource()
    this.$toast.dismiss('emailToast')
    this.$router.push({
      name: 'authLogin'
    })
  }

  async emailVerify () {
    this.verifyEmail()
    this.$toast.dismiss('emailToast')
  }

  beforeDestroy () {
    // this.disconnectEventSource()
  }
}
</script>

<style lang="scss" scoped>
@import '~vuetify/src/styles/styles.sass';

.app-toolbar {
  &.theme--dark {
    border-bottom: 1px solid map-get($material-dark, 'dividers') !important;
  }
}
</style>

<style lang="scss">

.Vue-Toastification__container.top-right {
  .my-custom-toast-class
  {
  top: 2em;
  }
  // top: 2em !important;
}
</style>
