<template>
  <v-card
    outlined
  >
    <v-container
      fluid
    >
      <v-row
        dense
        flat
        tile
        class="justify-space-between"
      >
        <v-col
          v-for="(stat, key) in stats"
          :key="key"
          md="3"
          lg="2"
          data-testid="ChangeStatsCard"
        >
          <span
            class="overline text--secondary text-no-wrap"
          >{{ stat.statName }}</span>
          <div
            class="d-flex align-center justify-start"
          >
            <h3 v-if="stat.type === 'units'">
              {{ stat.value && stat.value.toLocaleString() || 0 }} {{ stat.unit && stat.unit }}
            </h3>
            <h3 v-else>
              {{ stat.value && `${formatCurrency(currencySymbol, stat.value)}` || '0' }}
            </h3>
          </div>
          <div>
            <span
              class="text-no-wrap"
            >
              <change-indicator
                :is-unit="stat.type === 'units'? true : false"
                :is-percent="true"
                :value="stat.change"
              /> vs last year
            </span>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import ChangeIndicator from '@/components/ChangeIndicator.vue'
import { formatCurrency } from '@/utils/currency'

const namespaces = {
  accountSettings: 'accountSettings'
}

export const targetStats: Array<keyof any> = [
  'unitsOrdered',
  'avarageOrderValue',
  'grossRevenue',
  'amazonFees',
  'productCosts',
  'advertisingCosts',
  'marketplaceProfit'
]

@Component({
  components: {
    ChangeIndicator
  }
})
export default class SummaryChangeStatsCard extends Vue {
  @Prop() readonly productStats!: any

  @Getter('currencySymbol', { namespace: namespaces.accountSettings }) currencySymbol!: string

  formatCurrency = formatCurrency

  get stats () {
    const result: any = []
    targetStats.forEach((stat) => {
      result.push({
        value: (this.productStats[stat])?.value,
        change: (this.productStats[stat])?.percentage,
        statName: (this.productStats[stat])?.name,
        type: stat === 'totalUnitsOrdered' ? 'units' : ''
      })
    })

    return result
  }
}
</script>
