<template>
  <span class="ag-cell-wrapper ag-cell-expandable ag-row-group">
    <span class="ag-group-expanded">
      <span
        class="ag-icon ag-icon-tree-closed"
        :class="packListCount ? '' : 'disable-click'"
        :style="{ transform: rotation, cursor: 'pointer', display: 'inline-block' }"
        role="presentation"
        :disabled="!packListCount"
        @click="onExpand"
      /></span>
    <span class="ag-group-value">
      <router-link
        class="text-decoration-none"
        :to="{ name: 'shipmentPlans', params: { shipmentId: params.data.id}}"
      >
        {{ `${params.value?params.value:''}` }}
      </router-link>
      <!-- <a
        class="text-decoration-none"
        @click.prevent="openEditor"
      >{{ `${params.value?params.value:''}` }}</a> -->
      <!--
      <p
        class="blue--text"
      >
        {{ `${params.value?params.value:''}` }}

      </p> -->
    </span>
    <!-- <a
      class="ag-group-child-count text-decoration-none"
      @click.prevent="openEditor"
    >{{ `(${packListCount})` }}
    </a> -->
    <router-link
      class="text-decoration-none"
      :to="{ name: 'shipmentPlans', params: { shipmentId: params.data.id}}"
    >
      {{ `(${packListCount})` }}
    </router-link>
  </span>
</template>

<script lang="ts">
import { ICellRenderer, ICellRendererParams } from 'ag-grid-enterprise'
import { Component, Vue } from 'vue-property-decorator'

import type { ShipmentPlan } from '@/client/orders'

@Component
export default class ShipmentGroupCellRenderer extends Vue implements ICellRenderer<ShipmentPlan> {
  params!: ICellRendererParams
  isGroup?: boolean=false
  rotation= ''
  refresh (): boolean {
    return false
    // Implement the refresh logic here
    // Return true if the refresh was successful, false otherwise
    // return true
  }

  get packListCount (): number {
    return this.params.data.packLists.length
  }

  beforeMount () {
    this.isGroup = this.params.node.group
    this.rotation = this.params.node.expanded
      ? 'rotate(90deg)'
      : 'rotate(0deg)'

    this.params.node.addEventListener(
      'expandedChanged',
      this.onExpandedChanged
    )
  }

  beforeDestroy () {
    this.params.node.removeEventListener(
      'expandedChanged',
      this.onExpandedChanged
    )
  }

  onExpand () {
    if (this.packListCount) {
      this.params.node.setExpanded(!this.params.node.expanded)
    }
  }

  onExpandedChanged () {
    this.rotation = this.params.node.expanded
      ? 'rotate(90deg)'
      : 'rotate(0deg)'
  }
}
</script>
<style scoped>
.disable-click {
  pointer-events: none;
  cursor: default !important;
  color: #c6c6c6;
}
</style>
