<template>
  <v-img
    :src="logo"
    alt="SellerVue"
    :height="height || 'auto'"
    :width="width"
    :max-width="600"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import LogoPrimary from '@/assets/logo-primary.png'
import LogoWhite from '@/assets/logo-white.png'

@Component
export default class AppLogo extends Vue {
  @Prop({ required: false }) readonly height?: string
  @Prop({ required: false }) readonly width?: string
  @Prop({ required: false, default: true }) readonly primary?: boolean
  logos = {
    white: LogoWhite,
    primary: LogoPrimary
  }

  get logo () {
    return this.logos[this.primary ? 'primary' : 'white']
  }
}
</script>
