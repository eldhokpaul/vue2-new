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
            v-t="'pages.authNewPassword.title'"
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
            <auth-new-password-form
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
import { Bind, Debounce } from 'lodash-decorators'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import AuthNewPasswordForm from '../components/AuthNewPasswordForm.vue'
import AuthResetPasswordForm from '../components/AuthResetPasswordForm.vue'

@Component({
  components: {
    AuthNewPasswordForm,
    AuthResetPasswordForm
  }
})
export default class AuthNewPassword extends Vue {
  @Prop()
  userId!: string

  @Prop()
  verificationToken!: string

  @Action('setNewPassword', { namespace: 'auth' })
  setNewPassword!: (opts: { userId: string | number, verificationToken: string, password: string }) => any

  disabled = false

  error: string | null = null
  success: string | null = null

  async submit (formData:{password:string}) {
    this.error = null
    this.success = null
    this.disabled = true
    const { verificationToken, userId } = this
    try {
      await this.setNewPassword({ verificationToken, userId, password: formData.password as string })
      this.disabled = false
      this.success = this.$t('pages.authResetPassword.passwordChanged') as string
      this.navigate()
    } catch (err) {
      this.disabled = false
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.error = err
    }
  }

  @Debounce(1000)
  @Bind()
  navigate () {
    this.$route.query.path
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ? this.$router.replace(this.$route.query.path)
      : this.$router.replace({ name: 'authLogin' })
  }
}
</script>
