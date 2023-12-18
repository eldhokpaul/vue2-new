<template>
  <v-container
    class="pa-0"
    fluid
  >
    <template v-if="initialLoadTask.isActive">
      <v-skeleton-loader type="table" />
    </template>
    <v-data-table
      v-else
      :items="[]"
    />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import { Task } from '@/decorators/task'
import type { Subscription } from '@/modules/billing/types/Subscription'
import type { IUser } from '@/modules/user/types'

@Component
export default class BillingInvoices extends Vue {
  @State('user', { namespace: 'user' }) user!: IUser
  @State('subscription', { namespace: 'user' }) subscription!: Subscription
  @State('subscriptionHistory', { namespace: 'user' }) subscriptionHistory!: Subscription
  @Action('getUserSubscriptionByUserId', { namespace: 'user' }) getUserSubscriptionByUserId!: (userId: number) => Promise<any>
  @Action('getUserSubscriptionHistoryByUserId', { namespace: 'user' }) getUserSubscriptionHistoryByUserId!: (userId: number) => Promise<any>

  @Task('initialLoadTask')
  async initialLoad () {
    await this.getUserSubscriptionByUserId(this.user.id)
    // await this.getUserSubscriptionHistoryByUserId(this.user.id)
  }

  async mounted () {
    await this.initialLoad()
  }
}
</script>
