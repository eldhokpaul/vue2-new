<template>
  <span
    v-if="params.value"
    class="cell-center"
  >
    <v-img
      width="25px"
      max-width="25px"
      class="ma-2"
      :src="require('@/assets/xero.svg')"
    />
  </span>
  <span
    v-else
    class="cell-center"
  >
    -
  </span>
</template>

<script lang="ts">
import { ICellRenderer, ICellRendererParams } from 'ag-grid-enterprise'
import { Component, Vue } from 'vue-property-decorator'
@Component
export default class XeroEnabled extends Vue implements ICellRenderer<any> {
  params!: ICellRendererParams;
  refresh (): boolean {
    return false
  }
}
</script>
