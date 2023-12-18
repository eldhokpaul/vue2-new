<template>
  <v-form
    id="registerForm"
    ref="form"
    v-model="valid"
    :disabled="disabled"
    @submit.prevent="submit"
  >
    <template v-if="disabled">
      <div class="d-flex justify-center">
        <v-progress-circular
          :size="50"
          color="primary"
          indeterminate
        />
      </div>
    </template>
    <template v-else>
      <v-text-field
        v-model="registerData.email"
        autocomplete="email"
        :label="$t('components.authLoginForm.emailAddress')"
        :rules="rules.email"
        required
        outlined
      />
      <v-text-field
        v-model="registerData.firstName"
        autocomplete="given-name"
        :label="$t('components.authLoginForm.firstName')"
        :rules="rules.required"
        required
        outlined
      />
      <v-text-field
        v-model="registerData.lastName"
        autocomplete="family-name"
        :label="$t('components.authLoginForm.lastName')"
        :rules="rules.required"
        required
        outlined
      />
      <v-text-field
        v-model="registerData.password"
        autocomplete="new-password"
        type="password"
        :label="$t('components.authLoginForm.password')"
        :rules="rules.password"
        required
        outlined
      />
      <v-text-field
        v-model="confirmPassword"
        autocomplete="new-password"
        type="password"
        :label="$t('components.authLoginForm.passwordConfirm')"
        required
        :rules="rules.passwordConfirm"
        outlined
      />
      <re-cptcha v-model="registerData.captchaToken" />
      <v-btn
        v-t="'components.authLoginForm.register'"
        type="submit"
        depressed
        color="primary"
        block
        x-large
        :disabled="!valid || !registerData.captchaToken"
        :loading="disabled"
      />
      <div class="mt-4 d-flex flex-row justify-center align-center">
        <span class="mx-1">{{ $t('pages.authRegister.accountExist') }}</span>
        <router-link
          :to="{ name: 'authLogin' }"
          @click="create = true"
        >
          {{ $t('components.authLoginForm.login') }}
        </router-link>
      </div>
    </template>
  </v-form>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import type { UserRegisterDto } from '@/client/users'

import ReCptcha from './ReCptcha.vue'
@Component({
  components: {
    ReCptcha
  }
})
export default class AuthRegisterForm extends Vue {
  @Prop() readonly disabled!: boolean;

  valid = false;
  showPassword = false;

  registerData : UserRegisterDto= {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    captchaToken: ''
  }

  confirmPassword = ''
  rules= {
    email: [
      (v: string) => !!v || this.$t('pages.errors.rules.emailRequired'),
      (v: string) =>
        /.+@.+\..+/.test(v) || this.$t('pages.errors.rules.emailValid')
    ],
    required: [(v: string) => !!v || this.$t('pages.errors.rules.required')],
    password: [(v: string) => !!v || this.$t('pages.errors.rules.passwordRequired')],
    passwordConfirm: [
      (v: string) => !!v || this.$t('pages.errors.rules.passwordRequired'),
      (v: string) => (v && v === this.registerData.password) || this.$t('pages.errors.rules.passwordMatch')
    ]
  }

  submit () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ssNoform = window.__ss_noform
    // Trigger submission to marketing tool
    ssNoform.push(['submit', null, '55f01da0-526c-4c03-ac0a-6535b4612399'])
    this.$emit('submit', this.registerData)
  }

  mounted () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ssNoform = window.__ss_noform
    // Don't reconfigure if we have already done so
    if (!ssNoform || !ssNoform.length) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__ss_noform = [
        [
          'baseURI',
          'https://app-3QNTTDBXQ8.marketingautomation.services/webforms/receivePostback/MzawMLE0sTAzAgA/'
        ],
        // Use form id to tie to the specific register form
        ['form', 'registerForm', '55f01da0-526c-4c03-ac0a-6535b4612399'],
        // Manual submission so we can trigger after vaidation
        ['submitType', 'manual']
      ]
    }
    // This script assumes the form is rendered so must be injected after the form has been mounted to the DOM
    // else the script will error.
    const script = document.createElement('script') // create a script DOM node
    script.src =
      'https://koi-3QNTTDBXQ8.marketingautomation.services/client/noform.js?ver=1.24' // set its src to the provided URL
    document.head.appendChild(script)
  }
}
</script>
