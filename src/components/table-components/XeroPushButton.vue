<template>
  <span>
    <v-btn
      :disabled="params.value&&!params.context.componentParent.isViewer"
      color="primary"
      class="ma-2"
      outlined
      small
      @click="pushClick()"
    >
      <v-img
        v-if="params.value"
        width="20px"
        max-width="20px"
        class="mr-1"
        :src="require('@/assets/xero-gray.svg')"
      />
      <v-img
        v-else
        width="20px"
        max-width="20px"
        class="mr-1"
        :src="require('@/assets/xero.svg')"
      />
      Push
    </v-btn>
  </span>
  <!-- <span v-else /> -->
</template>

<script lang="ts">
import { ICellRenderer, ICellRendererParams } from 'ag-grid-enterprise'
import { Component, Vue } from 'vue-property-decorator'
@Component
export default class XeroPushButton extends Vue implements ICellRenderer<any> {
  params!: ICellRendererParams;

  refresh (): boolean {
    return false
  }

  pushClick () {
    this.params.context.componentParent.xeroSyncSupplier(this.params.data)
  }
}
</script>
