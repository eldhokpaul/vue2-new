<template>
  <v-container
    class="ma-0 pa-0"
    fill-height
    fluid
  >
    <v-col
      v-if="$vuetify.breakpoint.mdAndUp"
      :style="`background-color: ${$vuetify.theme.currentTheme.primary}; height: 100%;`"
    >
      <v-row
        class="fill-height align-center mx-16 justify-center"
      >
        <a
          href="https://sellervue.com"
          target="_blank"
        >
          <app-logo
            :primary="false"
          />
        </a>
      </v-row>
    </v-col>
    <v-col>
      <v-row>
        <v-col class="d-flex align-center justify-center flex-column">
          <router-view />
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import AppLogo from '@/components/AppLogo.vue'
import type { IToken } from '@/types/app'

@Component({
  components: {
    AppLogo
  }
})
export default class LoginIndex extends Vue {
  @State('darkMode', { namespace: 'app' }) darkMode?: boolean
  @State('user', { namespace: 'user' }) user!: any
  @Action('login', { namespace: 'auth' }) login: any
  @State('token', { namespace: 'auth' }) token?: IToken | null
  @Action('getUser', { namespace: 'user' }) getUser: any
  @Action('getUserSubscriptionByUserId', { namespace: 'user' }) getUserSubscriptionByUserId: any
  disabled = false
  create = false

  loginData = {
    email: null,
    password: null
  }

  registerData = {
    firstName: null,
    lastName: null,
    email: null
  }

  error: string | null = null

  async submit () {
    this.error = null
    this.disabled = true
    try {
      await this.login(this.loginData)
      await this.getUser()
      await this.getUserSubscriptionByUserId(this.user.id)

      this.navigate()
    } catch (err) {
      this.disabled = false
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.error = err
    }
  }

  navigate () {
    this.$route.query.path
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ? this.$router.replace(this.$route.query.path)
      : this.$router.replace({ name: 'dashboard' })
  }

  mounted () {
    if (this.token) {
      this.navigate()
    }
  }
}
</script>
