<template>
  <span
    v-if="params.value"
  >
    <router-link
      class="text-decoration-none"
      :to="{ name: params.name, params: { [params.id]: params.data[params.field], goBack: params.goBack }}"
    >
      {{ params.value }}
    </router-link>
  </span>
  <span
    v-else
    v-text="'-'"
  />
</template>

<script lang="ts">
import { ICellRenderer, ICellRendererParams } from 'ag-grid-enterprise'
import { Component, Vue } from 'vue-property-decorator'
@Component
export default class SimpleLinkRender extends Vue implements ICellRenderer<any> {
  params!: ICellRendererParams;
  refresh (): boolean {
    return false
  }
}
</script>
