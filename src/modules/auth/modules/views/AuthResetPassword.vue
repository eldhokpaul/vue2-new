<template>
  <v-container
    fill-height
    fluid
  >
    <v-row>
      <v-col class="d-flex align-center justify-center flex-column">
        <img
          v-if="!$vuetify.breakpoint.mdAndUp"
          src="@/assets/logo-primary.png"
          width="240px;"
          class="mb-4"
        >
        <v-card
          width="100%"
          max-width="420px"
          outlined
        >
          <v-card-title
            v-t="'pages.authResetPassword.title'"
          />
          <v-card-text>
            <v-alert
              v-if="error"
              type="error"
            >
              {{ error }}
            </v-alert>
            <v-alert
              v-if="success"
              type="success"
            >
              {{ success }}
            </v-alert>
            <auth-reset-password-form
              :form-data="formData"
              :disabled="disabled"
              @submit="submit"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import type { EmailDto } from '@/client/users'

import AuthResetPasswordForm from '../components/AuthResetPasswordForm.vue'

@Component({
  components: {
    AuthResetPasswordForm
  }
})
export default class AuthResetPassword extends Vue {
  @Prop()
  userId!: string

  @Prop()
  verificationToken!: string

  @Action('resetPasswordFor', { namespace: 'auth' })
  resetPasswordFor!: (options: EmailDto) => Promise<any>

  disabled = false

  formData = {
    email: '',
    captchaToken: ''
  }

  error: string | null = null
  success: string | null = null

  async submit () {
    this.error = null
    this.success = null
    this.disabled = true
    try {
      await this.resetPasswordFor(this.formData)
      this.disabled = false
      this.success = this.$t('pages.authResetPassword.checkEmail') as string
    } catch (err) {
      this.disabled = false
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.error = err
    }
  }
}
</script>
