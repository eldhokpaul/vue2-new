<template>
  <span>
    <p
      v-t="'pages.app.please'"
      class="font-weight-bold"
    >
      Please
      <!-- {{ $t('pages.app.please') }} -->
      <a
        href="javascript:void(0)"
        @click="myClick"
      >
        <!-- {{ $t('pages.app.clickHere') }} -->
        click here
      </a>
      to verify your email address.
      <!-- {{ $t('pages.app.verifyEmail') }} -->
    </p>
  </span>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component
export default class EmailVerifyToast extends Vue {
  value= false

  myClick () {
    this.$emit('emailVerifyEvent')
  }
}
</script>
