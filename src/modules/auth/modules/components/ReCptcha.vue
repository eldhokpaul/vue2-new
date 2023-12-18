<template>
  <div
    id="turnstilecontainer"
  />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({
  components: {
    // VueTurnstile
  }
})
export default class ReCptcha extends Vue {
  created () {
    this.$emit('input', '')
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
          self.$emit('input', token)
          // self.captchaToken = token
          // self.reCAPTCHA = true
        }
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.turnstile.render('#turnstilecontainer', turnstileOptions)
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
