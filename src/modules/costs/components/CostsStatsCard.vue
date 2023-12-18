<template>
  <v-card
    flat
  >
    <v-divider />
    <v-container
      class="py-3"
      fluid
    >
      <v-row class="justify-space-between">
        <v-col
          v-for="stat in stats"
          :key="stat.title"
          cols="12"
          md="2"
          sm="4"
        >
          <span
            v-t="`components.costsStatsCard.title:${stat.name}`"
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
    <v-divider class="pb-1" />
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import ChangeIndicator from '@/components/ChangeIndicator.vue'
import { formatCurrency } from '@/utils/currency'
import { formatNumber } from '@/utils/number'

import type { ICosts } from '../types'

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
  readonly costs!: ICosts

  formatCurrency = formatCurrency
  formatNumber = formatNumber

  get stats () {
    const { totalUnitsOrdered, totalFactoryCosts, totalInboundCosts, totalLandedCosts, averageCost } = this.costs

    return [
      { value: totalUnitsOrdered, name: 'totalUnitsOrdered', type: 'number' },
      { value: totalFactoryCosts, name: 'totalFactoryCosts' },
      { value: totalInboundCosts, name: 'totalInboundCosts' },
      { value: totalLandedCosts, name: 'totalLandedCosts' },
      { value: averageCost, name: 'averagePerUnit' }
    ]
  }
}
</script>
