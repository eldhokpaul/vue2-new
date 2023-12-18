<template>
  <div v-if="params.value">
    <v-icon
      color="red"
    >
      mdi-check
    </v-icon>
  </div>
  <div v-else>
    <v-icon
      color="green"
    >
      mdi-close
    </v-icon>
  </div>
</template>
<script lang="ts">
import { ICellRenderer, ICellRendererParams } from 'ag-grid-enterprise'
import { Component, Vue } from 'vue-property-decorator'

import type { ShipmentPlan } from '@/client/orders'

@Component
export default class ContainsHazardousGoods extends Vue implements ICellRenderer<ShipmentPlan> {
params!: ICellRendererParams

// refresh (params: ICellRendererParams): boolean {
refresh (): boolean {
  // Implement the refresh logic here
  // Return true if the refresh was successful, false otherwise
  return true
}
}
</script>
