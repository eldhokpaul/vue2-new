<template>
  <v-tooltip
    v-if="params.value"
    top
  >
    <template #activator="{ on, attrs }">
      <div class="product-name">
        <span
          v-bind="attrs"
          v-on="on"
        >
          {{ params.value }}
        </span>
      </div>
    </template>
    <span v-t="params.value" />
  </v-tooltip>
</template>

<script lang="ts">
import { ICellRenderer, ICellRendererParams } from 'ag-grid-enterprise'
import { Component, Vue } from 'vue-property-decorator'
@Component
export default class TooltipRender extends Vue implements ICellRenderer<any> {
  params!: ICellRendererParams;
  refresh (): boolean {
    return false
  }
}
</script>
<style lang="scss" scoped>
  .product-name {
    overflow: hidden;
    white-space: nowrap;
    max-width: 300px;
    text-overflow: ellipsis;
  }
</style>
