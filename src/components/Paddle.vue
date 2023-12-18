<template>
  <div>
    <div class="checkout-container" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import type { User } from '@/client/users'

@Component
export default class Paddle extends Vue {
  @Action('getPaddleSubscriptions', { namespace: 'user' }) getPaddleSubscriptions: any
  @Action('getUser', { namespace: 'user' }) getUser: any
  @State('user', { namespace: 'user' })
  user!: User

  @Prop()
  product!: number

  @Prop()
  vendorId!: number

  @Prop()
  isSandbox!: boolean

  async mounted () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.Paddle.Setup({
      vendor: this.vendorId
    })
    if (this.isSandbox) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.Paddle.Environment.set('sandbox')
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const referral = window.Rewardful && window.Rewardful.referral
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.Paddle.Checkout.open({
      method: 'inline',
      product: this.product,
      allowQuantity: false,
      disableLogout: true,
      email: this.user.email,
      passthrough: JSON.stringify({ rewardful: { referral: referral } }),
      frameTarget: 'checkout-container', // The className of your checkout <div>
      frameInitialHeight: 416,
      frameStyle: 'width:100%; min-width:312px; background-color: transparent; border: none;', // Please ensure the minimum width is kept at or above 286px with checkout padding disabled, or 312px with checkout padding enabled. See "General" section under "Branded Inline Checkout" below for more information on checkout padding.
      successCallback: async () => {
        setTimeout(async () => {
          await this.getUser()
          await this.$router.push({ name: 'dashboard' })
        }, 2000)
      }
    })
  }
}
</script>
