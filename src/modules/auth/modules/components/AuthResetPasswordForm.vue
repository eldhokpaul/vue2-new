<template>
  <v-form
    ref="form"
    v-model="valid"
    :disabled="disabled"
    @submit.prevent="submit"
  >
    <!-- <template v-if="disabled">
      <div class="d-flex justify-center">
        <v-progress-circular
          :size="50"
          color="primary"
          indeterminate
        />
      </div>
    </template> -->
    <v-text-field
      v-model="formData.email"
      autocomplete="email"
      :label="$t('components.authLoginForm.emailAddress')"
      :rules="rules.email"
      required
      outlined
    />
    <div
      id="turnstilebox"
    />
    <v-btn
      v-t="'components.resetPasswordForm.submit'"
      type="submit"
      depressed
      color="primary"
      block
      x-large
      :disabled="!valid || !reCAPTCHA"
      :loading="disabled"
    />
  </v-form>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class AuthResetPasswordForm extends Vue {
  @Prop()
  formData!: { email: string, captchaToken: string}

  @Prop()
  disabled!: boolean

  valid = false
  reCAPTCHA=false;
  captchaToken=''
  rules = {
    email: [
      (v: string) => !!v || this.$t('pages.errors.rules.emailRequired'),
      (v: string) => /.+@.+\..+/.test(v) || this.$t('pages.errors.rules.emailValid')
    ]
  }

  submit () {
    this.formData.captchaToken = this.captchaToken
    this.$emit('submit', this.formData)
  }

  mounted () {
    // Turnstile => Cloudflare’s smart CAPTCHA
    const sitekey = process.env.VUE_APP_TURNSTILE_SITE_KEY
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.onloadTurnstileCallback = function () {
      const turnstileOptions = {
        sitekey: sitekey,
        theme: self.$vuetify.theme.dark ? 'dark' : 'light',
        size: 'normal',
        callback: function (token: string) {
          self.captchaToken = token
          self.reCAPTCHA = true
        }
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.turnstile.render('#turnstilebox', turnstileOptions)
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const turnstile = window.turnstile
    if (turnstile) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.turnstile.ready(window.onloadTurnstileCallback)
    }
  }
}
</script>
