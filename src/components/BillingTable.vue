<template>
  <section>
    <template v-if="initialLoadTask.isActive">
      <v-skeleton-loader type="table" />
    </template>
    <template v-else-if="buy">
      <paddle
        :vendor-id="paddleSubscriptionInfo.vendorId"
        :product="paymentDetails[paymentPeriod].paymentProviderPlanId"
        :is-sandbox="paddleSubscriptionInfo.isSandbox"
      />
    </template>
    <template v-else>
      <v-row>
        <v-col cols="12">
          <v-card
            class="mt-3"
            outlined
          >
            <v-card-title>
              <span v-t="'pages.billing.subscriptionStatusTitle'" />
              <strong
                v-if="currentAccount && currentAccount.accountTier=='SV_BETA_TRIAL_1'"
                v-t="`pages.billing.subscriptionStatuses.BetaTrial`"
                :class="`ml-2 ${subscriptionStatusMap[subscription.status]}--text`"
              />
              <strong
                v-if="currentAccount && currentAccount.accountTier=='FREE_ACCOUNT'"
                v-t="`pages.billing.subscriptionStatuses.FreeAccount`"
                :class="`ml-2 ${subscriptionStatusMap[subscription.status]}--text`"
              />
              <strong
                v-else
                v-t="`pages.billing.subscriptionStatuses.TRIAL`"
                :class="`ml-2 ${subscriptionStatusMap[subscription.status]}--text`"
              />
            </v-card-title>

            <v-container
              class="px-5"
              fluid
            >
              <v-col v-if="user.tierExpiryDate && currentAccount && currentAccount.accountTier!=='SV_BETA_TRIAL_1' && currentAccount.accountTier!=='FREE_ACCOUNT'">
                {{ $t('components.appBillingTable.yourTrial') }}{{ trialDaysRemaining }}{{ $t('components.appBillingTable.daysRemaining') }}
              </v-col>
              <v-col>
                <router-link
                  v-t="'components.appBillingTable.viewHistory'"
                  :to="{
                    name: 'billingSubscriptions'
                  }"
                />
              </v-col>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
      <v-alert
        border="left"
        colored-border
        type="info"
        elevation="2"
        class="mt-2"
        prominent
        dense
      >
        <v-row align="center">
          <v-col>
            <div
              v-t="'components.appBillingTable.alertTitle'"
              class="title"
            />
            <div v-t="'components.appBillingTable.alertDescription'" />
          </v-col>
        </v-row>
      </v-alert>

      <v-simple-table>
        <thead>
          <tr>
            <th
              v-t="'components.appBillingTable.tableHeading'"
              class="text-left"
            />
            <th
              v-t="'components.appBillingTable.descriptionHeading'"
              class="text-left"
            />
            <th
              v-t="'components.appBillingTable.unitHeading'"
              class="text-right"
            />
            <th
              v-t="'components.appBillingTable.termHeading'"
              class="text-right"
            />
            <th
              v-t="'components.appBillingTable.totalHeading'"
              class="text-right"
            />
          </tr>
        </thead>
        <tbody v-if="paymentDetails[paymentPeriod]">
          <tr>
            <td>{{ user.email }}</td>
            <td>{{ paymentDetails[paymentPeriod].description }}</td>
            <td class="text-right">
              {{ $n(Number(paymentDetails[paymentPeriod].unitCost), 'currency') }}
            </td>
            <td class="text-right">
              {{ paymentDetails[paymentPeriod].unitQuatity }}
            </td>
            <td class="text-right">
              {{ $n(Number(paymentDetails[paymentPeriod].subTotal), 'currency') }}
            </td>
          </tr>
          <tr>
            <td />
            <td />
            <td />
            <td
              v-t="'components.appBillingTable.subtotal'"
              class="text-right"
            />
            <td class="text-right">
              {{ $n(Number(paymentDetails[paymentPeriod].subTotal), 'currency') }}
            </td>
          </tr>
          <tr>
            <td />
            <td />
            <td />
            <td
              v-t="'components.appBillingTable.annualDiscount'"
              class="text-right"
            />
            <td class="text-right">
              {{ $n(Number(paymentDetails[paymentPeriod].annualDiscount), 'currency') }}
            </td>
          </tr>
          <tr>
            <td />
            <td />
            <td />
            <td
              v-t="'components.appBillingTable.total'"
              class="text-right font-weight-bold"
            />
            <td class="text-right">
              {{ $n(Number(paymentDetails[paymentPeriod].total), 'currency') }}
            </td>
          </tr>
          <tr>
            <td />
            <td />
            <td
              v-if="currentAccount &&currentAccount.accountTier !== 'SV_BETA_TRIAL_1'"
              v-t="'components.appBillingTable.selectInterval'"
              class="text-right"
            />
            <td
              v-if="currentAccount &&currentAccount.accountTier !== 'SV_BETA_TRIAL_1'"
              colspan="2"
              class="text-right"
            >
              <v-btn-toggle
                v-model="paymentPeriod"
                class="my-4"
                mandatory
                style="height: 24px;"
              >
                <template v-for="plan in paddleSubscriptionInfo.subscriptionPlans">
                  <v-btn
                    :key="plan.paymentProviderPlanId"
                    color="primary"
                    height="24"
                    outlined
                  >
                    {{ plan.name }}
                  </v-btn>
                </template>
              </v-btn-toggle>
            </td>
          </tr>
          <tr>
            <td />
            <td />
            <td
              v-t="'components.appBillingTable.grandTotal'"
              class="text-right"
            />
            <td />
            <td class="text-right title font-weight-normal">
              {{ $n(Number(paymentDetails[paymentPeriod].grandTotal), 'currency') }}
            </td>
          </tr>
        </tbody>
      </v-simple-table>
      <v-row class="ma-4">
        <v-btn
          v-t="'components.appDrawer.supportCenter'"
          color="primary"
          outlined
          depressed
          small
          href="https://help.sellervue.com"
          target="_blank"
        />
        <v-spacer />
        <v-btn
          color="primary"
          @click="buy = true"
        >
          <v-icon>mdi-cart</v-icon>
          {{ $t('components.appBillingTable.buyNow') }}
        </v-btn>
      </v-row>
    </template>
  </section>
</template>

<script lang="ts">
import { differenceInCalendarDays } from 'date-fns'
import { Component, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import type { PaddleSubscriptionInfo, User } from '@/client/users'
import Paddle from '@/components/Paddle.vue'
import { Task } from '@/decorators/task'
import type { Subscription } from '@/modules/billing/types/Subscription'
import { formatServerDate } from '@/utils/date'

@Component({
  components: {
    Paddle
  }
})
export default class BillingBilling extends Vue {
  @State('user', { namespace: 'user' }) user!: User
  @State('subscription', { namespace: 'user' }) subscription!: Subscription
  @State('paddleSubscriptionInfo', { namespace: 'user' }) paddleSubscriptionInfo!: PaddleSubscriptionInfo
  @Action('getUserSubscriptionByUserId', { namespace: 'user' }) getUserSubscriptionByUserId!: (userId: number) => Promise<any>
  @Action('getPaddleSubscriptions', { namespace: 'user' }) getPaddleSubscriptions: any

  annualPlanDiscountMultiplier = 2
  paymentPeriod = 1
  paymentDetails: any[] = []
  buy = false

  @Task('initialLoadTask')
  async initialLoad () {
    await this.getUserSubscriptionByUserId(this.user.id as number)
    await Promise.all([
      this.getPaddleSubscriptions()
    ])
    this.paymentDetails = this.paddleSubscriptionInfo.subscriptionPlans?.map((p) => {
      const term = (p.termInMonths || 1)
      const discount = p.planSavings || 0
      const total = (p.amount || 0)
      const subTotal = ((p.amount || 0) - discount)
      return {
        ...p,
        unitCost: subTotal / term,
        unitQuatity: p.termInMonths,
        subTotal,
        annualDiscount: discount,
        total,
        grandTotal: total,
        paymentProviderPlanId: p.paymentProviderPlanId
      }
    }
    ) || []
    if (this.currentAccount.accountTier === 'SV_BETA_TRIAL_1') {
      this.paymentPeriod = 0
    }
  }

  async mounted () {
    await this.initialLoad()
  }

  get trialDaysRemaining () {
    return Math.max(0, differenceInCalendarDays(new Date(this.user.tierExpiryDate ? this.user.tierExpiryDate : new Date()), new Date()))
  }

  get currentAccount (): any {
    return this.user.accounts?.find((s) => s.isCurrent)
  }

  get annualSub (): any {
    return this.subscription.subscriptionPlans.find((s) => s.userTier === 'ANNUAL')
  }

  get monthlySub (): any {
    return this.subscription.subscriptionPlans.find((s) => s.userTier === 'MONTHLY')
  }

  get nextBillDate (): string {
    return this.subscription.nextBillDate ? formatServerDate(this.subscription.nextBillDate) : 'Unknown'
  }

  get subscriptionStatusMap () {
    return {
      ACTIVE: 'success',
      TRIALING: 'warning',
      PAST_DUE: 'error',
      PAUSED: 'error',
      DELETED: 'error'
    }
  }
}
</script>

<style scoped lang="scss">
td {
  height: 36px !important;
}

tr {
  line-height: 0.5rem;
  height: 24px;

  &:not(:nth-child(1)) {
    background-color: transparent !important;

    & td {
      border: 0 !important;
    }
  }

  &:nth-child(1) {
    line-height: 4rem;
    height: 48px;
  }
}
</style>
