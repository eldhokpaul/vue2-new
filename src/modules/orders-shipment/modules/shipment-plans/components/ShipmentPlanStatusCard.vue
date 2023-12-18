<template>
  <v-card
    tile
    flat
  >
    <v-container
      class="py-3"
      fluid
    >
      <v-row class="justify-space-between">
        <v-col
          v-for="stat in stats"
          :key="stat.title"
          md="3"
          lg="2"
        >
          <span
            class="overline text--secondary text-no-wrap"
          >{{ stat.name }}</span>
          <div class="d-flex align-center justify-start">
            <h2 v-if="stat.type === 'units'">
              {{ stat.value && formatNumber(stat.value) || 0 }} {{ stat.unit && stat.unit }}
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

import type { ShipmentPlan } from '@/client/orders'
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
export default class ShipmentPlanStatusCard extends Vue {
  @Getter('currencySymbol', { namespace: namespaces.accountSettings }) currencySymbol!: string
  @Prop() readonly shipmentPlan!: ShipmentPlan

  formatCurrency = formatCurrency
  formatNumber = formatNumber

  get stats () {
    const { totalCases, totalShippedCost, totalCubicMetres, totalGrossWeight } = this.shipmentPlan

    return [
      { value: totalCases, name: 'Total Cases', type: 'number' },
      { value: totalShippedCost, name: 'Total Shipped Cost' },
      { value: totalCubicMetres, name: 'Total CBM', type: 'units' },
      { value: totalGrossWeight, name: 'Total Gross Weight', type: 'units' }
      // { value: totalGrossWeightTotal, name: 'Gross Weight', type: 'units', unit: totalGrossWeightTotalUnit?.toLowerCase() }
    ]
  }
}
</script>
