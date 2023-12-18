<template>
  <app-chip
    :type="params.type"
    :item="{ status: params.value }"
  />
</template>

<script lang="ts">
import { ICellRenderer, ICellRendererParams } from 'ag-grid-enterprise'
import { Component, Vue } from 'vue-property-decorator'

import AppChip from '@/components/AppChip.vue'
@Component({
  components: {
    AppChip
  }
})
export default class StatusRender extends Vue implements ICellRenderer<any> {
  params!: ICellRendererParams;
  refresh (): boolean {
    return false
  }
}
</script>
