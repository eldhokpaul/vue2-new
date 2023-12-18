<template>
  <v-card
    outlined
  >
    <v-container
      class="py-3"
      fluid
    >
      <v-row class="justify-space-between">
        <v-col
          v-for="stat in stats"
          :key="stat.title"
          cols="6"
          md="2"
          lg="2"
        >
          <span
            v-t="`components.usersStatsCard.title:${stat.name}`"
            class="overline text--secondary text-no-wrap"
          />
          <div class="d-flex align-center justify-start">
            <h2 v-if="stat.type === 'units'">
              {{ stat.value && formatNumber(stat.value) || '0' }}
            </h2>
            <h2 v-else-if="stat.type === 'number'">
              {{ stat.value && stat.value.toLocaleString() || '0' }}
            </h2>
            <h2 v-else>
              {{ stat.value && formatCurrency(currencySymbol,stat.value) || 0 }}
            </h2>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import type { UserAdminStatsDto } from '@/client/users'
import ChangeIndicator from '@/components/ChangeIndicator.vue'
import { formatCurrency } from '@/utils/currency'
import { formatNumber } from '@/utils/number'

const namespaces = {
  accountSettings: 'accountSettings'
}

@Component({
  components: {
    ChangeIndicator
  }
})
export default class CostsStatsCard extends Vue {
  @Getter('currencySymbol', { namespace: namespaces.accountSettings }) currencySymbol!: string
  @Prop()
  readonly userStatus!: UserAdminStatsDto

  formatCurrency = formatCurrency
  formatNumber = formatNumber

  get stats () {
    const { totalUsers, totalActivePayingCustomers, totalSignUpsLast24Hours, betaTrial1CountdownFrom1000 } = this.userStatus

    return [
      { value: totalUsers, name: 'TotalNumberOfUsers', type: 'number' },
      { value: totalActivePayingCustomers, name: 'totalActiveUsers', type: 'number' },
      { value: totalSignUpsLast24Hours, name: 'signupsInTheLast24Hours', type: 'number' },
      { value: betaTrial1CountdownFrom1000, name: 'betaProgramCountdown', type: 'number' }
    ]
  }
}
</script>
