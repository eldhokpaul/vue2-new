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
          md="3"
          lg="2"
        >
          <!-- cols="12"
          md="2"
          sm="3" -->
          <!-- cols="3"
          md="2"
          lg="2" -->
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
    <v-divider class="pb-1" />
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import type { OrdersListDto } from '@/client/orders'
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
export default class OrdersStatsCard extends Vue {
  @Getter('currencySymbol', { namespace: namespaces.accountSettings }) currencySymbol!: string
  @Prop()
  readonly orders!: OrdersListDto

  formatCurrency = formatCurrency
  formatNumber = formatNumber

  get stats () {
    const { orderQuantityTotal, factoryCostTotal, totalCasesTotal, cubicMetresTotal, totalGrossWeightTotal, totalGrossWeightTotalUnit } = this.orders

    return [
      { value: orderQuantityTotal, name: 'Quatity Total', type: 'number' },
      { value: totalCasesTotal, name: 'Total Cases', type: 'number' },
      { value: factoryCostTotal, name: 'Factory Cost' },
      { value: cubicMetresTotal, name: 'Cubic Metres', type: 'units' },
      { value: totalGrossWeightTotal, name: 'Gross Weight', type: 'units', unit: totalGrossWeightTotalUnit?.toLowerCase() }
    ]
  }
}
</script>
