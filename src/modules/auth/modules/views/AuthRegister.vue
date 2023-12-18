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
      <v-card-title>
        {{ $t('pages.authRegister.createAccount') }}
      </v-card-title>
      <!-- <v-card-text
        v-if="hasRegistered"
      >
        Please check your email and click on the activation link.
      </v-card-text> -->
      <v-card-text>
        <!-- <p>
          {{ $t('pages.authRegister.freeTrial') }}
        </p> -->
        <v-alert
          v-if="error"
          type="error"
        >
          {{ error }}
        </v-alert>
        <auth-register-form
          :disabled="disabled"
          @submit="submit"
        />
      </v-card-text>
    </v-card>
  </v-col>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter, Mutation, State } from 'vuex-class'

import type { User, UserRegisterDto, UserUpdateDto } from '@/client/users'
import AppLogo from '@/components/AppLogo.vue'

import AuthRegisterForm from '../components/AuthRegisterForm.vue'

@Component({
  components: {
    AppLogo,
    AuthRegisterForm
  }
})
export default class AuthLogin extends Vue {
  @Getter('isManagementSectionEnabled', { namespace: 'accountSettings' }) isManagementSectionEnabled!: boolean

  @State('darkMode', { namespace: 'app' }) darkMode?: boolean
  @State('user', { namespace: 'user' }) user!: User

  @Action('register', { namespace: 'auth' }) register!: (newUser: UserRegisterDto) => Promise<UserUpdateDto>
  @Action('login', { namespace: 'auth' }) login: any
  @Action('getUserReturn', { namespace: 'auth' }) getUserReturn!: () => Promise<User>
  @Action('getUserSubscriptionByUserId', { namespace: 'user' }) getUserSubscriptionByUserId!: (userId: number) => Promise<void>
  @Action('getAccountSettings', { namespace: 'accountSettings' }) getAccountSettings!: () => Promise<void>

  @Mutation('setUser', { namespace: 'user' }) setUser!: (userData: User) => Promise<void>

  disabled = false
  error: string | null = null

  async submit (registerData:UserRegisterDto) {
    this.error = null
    this.disabled = true
    try {
      const data = await this.register(registerData)
      setTimeout(async () => {
        await this.login({ login: data.email, password: data.password })

        const user = await this.getUserReturn()
        if (user.showRegistrationOnBoarding) {
          this.navigateOnboarding()
          return
        }

        await this.setUser(user)
        await this.getAccountSettings()
        await this.getUserSubscriptionByUserId(this.user.id as number)
        this.navigate()

        // await this.getUser()
        // await this.getUserSubscriptionByUserId(this.user?.id)
        // await this.getAccountSettings()
        // this.navigate()
      }, 1000)

      // this.hasRegistered = true
    } catch (err) {
      this.disabled = false
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (err?.response?.status === 422) {
        this.error = this.$t('pages.authRegister.invalid').toString()
      } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
        this.error = err?.response?.message || err
      }
    }
  }

  navigate () {
    !this.isManagementSectionEnabled
      ? this.$router.replace({ name: 'feeTrackerPro' })
      : this.$router.replace({ name: 'dashboard' })
  }

  navigateOnboarding () {
    this.$router.replace({ name: 'setUpAccount' })
  }
}
</script>
