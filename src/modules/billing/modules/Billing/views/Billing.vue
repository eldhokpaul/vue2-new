<template>
  <v-container fluid>
    <template v-if="initialLoadTask.isActive">
      <v-skeleton-loader type="table" />
    </template>
    <template v-else-if="subscription && subscription.subscriptionId && currentAccount &&currentAccount.accountTier!=='SV_BETA_TRIAL_1'">
      <v-row>
        <v-col cols="12">
          <v-card
            class="mt-3"
            outlined
          >
            <v-card-title>
              <span v-t="'pages.billing.subscriptionStatusTitle'" />
              <strong
                v-t="`pages.billing.subscriptionStatuses.${subscription.status}`"
                :class="`ml-2 ${subscriptionStatusMap[subscription.status]}--text`"
              />
            </v-card-title>

            <v-container
              class="px-5"
              fluid
            >
              <v-row>
                <v-col>
                  <router-link
                    :to="{
                      name: 'billingSubscriptions'
                    }"
                  >
                    {{ $t('pages.billing.viewHistory') }}
                  </router-link>
                </v-col>
                <v-col class="text-right">
                  <p>{{ $t('pages.billing.nextInvoice') }}<strong>{{ nextBillDate }}</strong></p>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-card
            style="min-height: 400px;"
            outlined
          >
            <v-container>
              <v-row>
                <v-col>
                  <div class="d-flex flex-row justify-start align-center mb-3">
                    <v-icon
                      v-if="subscription.paymentMethod === 'card'"
                      size="32px"
                    >
                      mdi-credit-card
                    </v-icon>
                    <v-img
                      v-if="subscription.paymentMethod === 'paypal'"
                      max-width="128px"
                      contain
                      src="@/assets/paypal.svg"
                    />
                    <h4
                      v-if="!subscription.paymentMethod"
                      v-text="$t('pages.billing.unknownPayment')"
                    />
                    <v-chip
                      small
                      color="success"
                      class="mx-2 font-weight-bold"
                    >
                      {{ $t('pages.billing.primary') }}
                    </v-chip>
                    <p class="mb-0">
                      {{ formatCurrency(currencySymbol, Number(activeSub.amount)) || formatCurrency(currencySymbol, Number(120)) }} {{ subscription.currency }}/{{ activeSub.userTier === 'ANNUAL'? 'year' : 'mo' }}
                    </p>
                  </div>
                </v-col>
              </v-row>
              <v-divider class="mb-2" />
              <v-row>
                <v-col>
                  <v-container fluid>
                    <v-row
                      style="min-height: 300px;"
                      class="d-flex flex-column justify-center align-start"
                    >
                      <v-col
                        style="height: 100%;"
                        class="d-flex flex-column justify-center align-start"
                      >
                        <h4 v-t="'pages.billing.whatWouldYouLikeToDo'" />
                        <ul>
                          <li class="my-3">
                            <a
                              v-t="'pages.billing.updateYourPaymentMethod'"
                              :href="subscription.updateUrl"
                              target="_blank"
                            />
                          </li>
                          <li class="my-3">
                            <a
                              v-t="'pages.billing.upgradeOrChangePlan'"
                              :href="subscription.updateUrl"
                              target="_blank"
                            />
                          </li>
                          <li class="my-3">
                            <a
                              v-t="'pages.billing.cancelYourSubscription'"
                              href="mailto:support@sellervue.com"
                              target="_blank"
                            />
                          </li>
                        </ul>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
        <v-col
          v-if="activeSub.userTier !== 'ANNUAL'"
          cols="12"
          md="6"
        >
          <v-card
            dark
            class="d-flex flex-column justify-center align-center"
            style="min-height: 400px;"
            color="info"
            outlined
          >
            <h2 v-t="'pages.billing.annualPlan'" />
            <p v-t="'pages.billing.save'" />
            <h1 class="font-weight-black">
              {{ savings }}
            </h1>
            <p v-t="'pages.billing.eachYearByChangingYourPlanToTheAnnualPlan'" />
            <v-btn
              v-t="'pages.billing.learnMore'"
              depressed
              class="my-4 black--text"
              color="white"
              :href="subscription.updateUrl"
              target="_blank"
            />
            <p><strong class="mr-1">{{ formatCurrency(currencySymbol, Number(annualSub.amount)) }}</strong><span v-t="'pages.billing.billedOnceAnnually'" /> </p>
          </v-card>
        </v-col>
      </v-row>
    </template>
    <template v-else>
      <billing-table />
    </template>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'

import type { User } from '@/client/users'
import BillingTable from '@/components/BillingTable.vue'
import { Task } from '@/decorators/task'
import type { Subscription } from '@/modules/billing/types/Subscription'
import { formatCurrency } from '@/utils/currency'
import { formatServerDate } from '@/utils/date'

@Component({
  components: {
    BillingTable
  }
})
export default class BillingBilling extends Vue {
  @State('user', { namespace: 'user' }) user!: User
  @State('subscription', { namespace: 'user' }) subscription!: Subscription
  @Action('getUserSubscriptionByUserId', { namespace: 'user' }) getUserSubscriptionByUserId!: (userId: number) => Promise<any>
  @Getter('currencySymbol', { namespace: 'accountSettings' }) currencySymbol!: string

  annualPlanDiscountMultiplier = 2
  formatCurrency = formatCurrency

  @Task('initialLoadTask')
  async initialLoad () {
    await this.getUserSubscriptionByUserId(this.user.id as number)
  }

  async mounted () {
    await this.initialLoad()
  }

  get currentAccount (): any {
    return this.user.accounts?.find((s) => s.isCurrent)
  }

  get activeSub (): any {
    return this.subscription.subscriptionPlans.find((s) => s.isActiveForUser)
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

  get savings () {
    return formatCurrency(this.currencySymbol, Number((this.annualSub.amount - (this.annualSub.amount - (this.monthlySub.amount * this.annualPlanDiscountMultiplier)))))
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
