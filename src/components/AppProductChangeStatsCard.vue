<template>
  <v-card outlined>
    <v-container
      fluid
    >
      <v-row
        dense
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
            v-t="`components.productsTable.headers.${stat.statName}`"
            class="overline text--secondary text-no-wrap"
          />
          <div
            class="d-flex align-center justify-start"
          >
            <h3 v-if="stat.type === 'units'">
              {{ stat.value && stat.value.toLocaleString() || '0' }}
            </h3>
            <h3 v-else>
              {{ stat.value && `${formatCurrency(currencySymbol, stat.value)}` || '0' }}
            </h3>
            <span
              class="ml-2 text-no-wrap"
            >
              <change-indicator
                :is-unit="stat.type === 'units'?true:false"
                :is-percent="false"
                :value="stat.change"
              />
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
import type { ICostValue, IProductStatsDifference } from '@/modules/products/types'
import { formatCurrency } from '@/utils/currency'
import { formatNumber } from '@/utils/number'

const namespaces = {
  accountSettings: 'accountSettings'
}

export const targetStats: Array<keyof IProductStatsDifference> = [
  'totalUnitsOrdered',
  'totalLandedCosts',
  'totalFactoryUnitCosts',
  'totalInboundUnitCosts',
  'totalLandedUnitCosts'
]

@Component({
  components: {
    ChangeIndicator
  }
})
export default class AppProductChangeStatsCard extends Vue {
  @Prop()
  readonly productStats!: IProductStatsDifference

  @Getter('currencySymbol', { namespace: namespaces.accountSettings }) currencySymbol!: string

  formatCurrency = formatCurrency
  formatNumber = formatNumber

  get stats () {
    const result: any = []
    targetStats.forEach((stat) => {
      result.push({
        value: (this.productStats[stat] as ICostValue)?.value,
        change: (this.productStats[stat] as ICostValue)?.change,
        statName: stat,
        type: stat === 'totalUnitsOrdered' ? 'units' : undefined
      })
    })

    return result
  }
}
</script>
