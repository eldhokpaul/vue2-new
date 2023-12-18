<template>
  <div v-if="params.data.id">
    <v-btn
      class="ma-2"
      outlined
      small
      color="primary"
      @click="resetPassword()"
    >
      <v-icon x-small>
        mdi-lock-reset
      </v-icon>
      {{ $t('pages.authResetPassword.title') }}
    </v-btn>

    <v-btn
      class="ma-2"
      outlined
      small
      :disabled="params.data.isVerified"
      color="green"
      @click="resendVerification()"
    >
      <v-icon x-small>
        mdi-check-decagram
      </v-icon>
      {{ $t('pages.authResetPassword.resendVerification') }}
    </v-btn>
  </div>
</template>

<script>
import { Vue } from 'vue-property-decorator'

export default Vue.extend({
  name: 'UserCellButtons',
  methods: {
    resetPassword () {
      this.params.callbackPassword(this.params.data)
    },
    resendVerification () {
      this.params.callbackVerification(this.params.data)
    }
  }
})
</script>
