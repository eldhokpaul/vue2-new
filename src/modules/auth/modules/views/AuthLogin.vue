<template>
  <v-col class="d-flex align-center justify-center flex-column">
    <app-logo
      v-if="!$vuetify.breakpoint.mdAndUp"
      width="280px"
      class="mb-2"
      :primary="true"
    />
    <v-card
      width="100%"
      max-width="420px"
      outlined
    >
      <v-card-title
        v-t="'pages.authLogin.title'"
      />
      <v-card-text>
        <v-alert
          v-if="error"
          type="error"
        >
          {{ error }}
        </v-alert>
        <login-form
          :disabled="disabled"
          :form-data="loginData"
          @submit="submit"
        />
      </v-card-text>
    </v-card>
  </v-col>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action, Getter, Mutation, State } from 'vuex-class'

import type { User } from '@/client/users'
import AppLogo from '@/components/AppLogo.vue'
import type { IToken } from '@/types/app'

import LoginForm from '../components/AuthLoginForm.vue'

@Component({
  components: {
    AppLogo,
    LoginForm
  }
})
export default class AuthLogin extends Vue {
  @Getter('isManagementSectionEnabled', { namespace: 'accountSettings' }) isManagementSectionEnabled!: boolean

  @State('darkMode', { namespace: 'app' }) darkMode?: boolean
  @State('user', { namespace: 'user' }) user!: any
  @State('token', { namespace: 'auth' }) token?: IToken | null

  @Action('login', { namespace: 'auth' }) login: any
  @Action('getUserReturn', { namespace: 'auth' }) getUserReturn!: () => Promise<User>
  @Action('getUser', { namespace: 'user' }) getUser!: () => Promise<void>
  @Action('getUserSubscriptionByUserId', { namespace: 'user' }) getUserSubscriptionByUserId!: (userId: number) => Promise<void>
  @Action('getAccountSettings', { namespace: 'accountSettings' }) getAccountSettings!: () => Promise<void>

  @Mutation('setUser', { namespace: 'user' }) setUser!: (userData: User) => Promise<void>

  @Prop() userId!: string
  @Prop() accountId!: string
  @Prop() invitationAction!: string

  disabled = false
  create = false

  loginData = { email: null, password: null }

  error: string | null = null

  async submit () {
    this.error = null
    this.disabled = true
    try {
      await this.login(this.loginData)

      const user = await this.getUserReturn()
      if (user.showRegistrationOnBoarding) {
        this.navigateOnboarding()
        return
      }

      await this.setUser(user)
      await this.getAccountSettings()
      await this.getUserSubscriptionByUserId(this.user?.id)
      this.navigate()
    } catch (err) {
      this.disabled = false
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (err?.response?.status === (401 || 403)) {
        this.error = this.$t('pages.authLogin.invalid').toString()
      } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
        this.error = err
      }
    }
  }

  async navigate () {
    (this.userId && this.accountId && this.invitationAction)
      ? this.$router.replace({ name: 'InviteUser', params: { userId: this.userId, accountId: this.accountId, invitationAction: this.invitationAction } })
      : !this.isManagementSectionEnabled
          ? this.$router.replace({ name: 'feeTrackerPro' })
          : this.$route.query.path
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ? this.$router.replace(this.$route.query.path)
            : this.$router.replace({ name: 'dashboard' })
  }

  navigateOnboarding () {
    this.$router.replace({ name: 'setUpAccount' })
  }
}
</script>
