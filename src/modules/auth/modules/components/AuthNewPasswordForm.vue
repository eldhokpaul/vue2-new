<template>
  <v-form
    id="passwordForm"
    ref="passwordForm"
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
        v-model="formData.password"
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
      <v-btn
        v-t="'components.resetPasswordForm.submit'"
        type="submit"
        depressed
        color="primary"
        block
        x-large
        :disabled="!valid"
        :loading="disabled"
      />
    </template>
  </v-form>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class AuthNewPasswordForm extends Vue {
  @Prop() disabled!: boolean

  valid = false
  formData : { password:string } = {
    password: ''
  }

  confirmPassword = ''
  rules= {
    password: [(v: string) => !!v || this.$t('pages.errors.rules.passwordRequired')],
    passwordConfirm: [
      (v: string) => !!v || this.$t('pages.errors.rules.passwordRequired'),
      (v: string) => (v && v === this.formData.password) || this.$t('pages.errors.rules.passwordMatch')
    ]
  }
}
</script>
