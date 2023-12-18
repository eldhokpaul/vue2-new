<template>
  <v-form
    ref="form"
    v-model="valid"
    :disabled="disabled"
    @submit.prevent="$emit('submit', formData)"
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
        v-model="formData.login"
        autocomplete="email"
        :label="$t('components.authLoginForm.emailAddress')"
        :rules="rules.email"
        required
        outlined
      />
      <v-text-field
        v-model="formData.password"
        :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        autocomplete="current-password"
        :type="showPassword ? 'text' : 'password'"
        :label="$t('components.authLoginForm.password')"
        :rules="rules.password"
        required
        outlined
        @click:append="showPassword = !showPassword"
      />
      <div class="d-flex mb-8">
        <router-link
          v-t="'components.authLoginForm.forgotPassword'"
          :to="{name: 'authResetPassword'}"
        />
      </div>
      <v-btn
        v-t="'components.authLoginForm.login'"
        type="submit"
        depressed
        color="primary"
        block
        x-large
        :disabled="!valid"
        :loading="disabled"
      />
      <!-- <div class="mt-4 d-flex flex-row justify-center align-center">
        <span class="mx-1">{{ $t('components.authLoginForm.account') }}</span>
        <router-link
          :to="{ name: 'authRegister' }"
          @click="create = true"
        >
          {{ $t('components.authLoginForm.create') }}
        </router-link> -->
      <!-- <a
          :href="signUpUrl"
        >
          Create one
        </a> -->
      <!-- </div> -->
    </template>
  </v-form>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class AuthLoginForm extends Vue {
  @Prop()
  formData!: object

  @Prop()
  readonly disabled!: boolean

  valid = false

  showPassword = false

  rules = {
    email: [
      (v: string) => !!v || this.$t('pages.errors.rules.emailRequired'),
      (v: string) => /.+@.+\..+/.test(v) || this.$t('pages.errors.rules.emailValid')
    ],
    password: [
      (v: string) => !!v || this.$t('pages.errors.rules.passwordRequired')
    ]
  }

  // get signUpUrl (): string {
  //   return process.env?.VUE_APP_SIGN_UP
  // }
}
</script>
