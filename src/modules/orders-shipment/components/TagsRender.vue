<template>
  <span v-if="params.value">
    <span>
      <v-chip
        v-for="(tag, index) in tags"
        :key="index"
        class="mr-1"
        small
        color="primary"
      >
        <!-- outlined -->
        {{ tag }}
      </v-chip>
    </span>
  </span>
  <span v-else>-</span>
</template>
<script lang="ts">
import { ICellRenderer, ICellRendererParams } from 'ag-grid-enterprise'
import { Component, Vue, Watch } from 'vue-property-decorator'

import type { Order } from '@/client/orders'

@Component
export default class TagsRender extends Vue implements ICellRenderer<Order> {
params!: ICellRendererParams

// refresh (params: ICellRendererParams): boolean {
@Watch('params.value')
refresh (): boolean {
  // Implement the refresh logic here
  // Return true if the refresh was successful, false otherwise
  return false
}

get tags (): string[] {
  if (this.params.value) {
    return this.params.value.split(', ')
  }
  return []
}
}
</script>
