<template>
  <v-container class="container-element">
    <label class="pb-1">Rows Per Page</label>
    <v-select
      id="paginate"
      v-model="params.context.componentParent.paginationPageSize"
      :items="PaginationItems"
    />
  </v-container>
</template>

<script lang="ts">
import { IStatusPanel, IStatusPanelParams } from 'ag-grid-enterprise'
import { Component, Vue } from 'vue-property-decorator'
@Component
export default class TableSizeSelect extends Vue implements IStatusPanel {
  PaginationItems= [{ text: 'All', value: 999999 }, 15, 25, 50, 100]
  params!: IStatusPanelParams;
  refresh (): boolean {
    return false
  }
}
</script>
<style lang='scss'>
.container-element{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}
.container-element label {
    padding-right: 10px;
    // top: 11px;
    // position: relative;
}
.container-element .v-select > .v-input__control > .v-input__slot {
    cursor: pointer;
    width: 60px !important;
}
.container-element .v-select__selection.v-select__selection--comma {
  font-size: 13px  !important;
  font-weight: bold;
}
.container-element .v-list-item__content .v-list-item__title {
  font-size: 13px !important;
}
.ag-theme-alpine .ag-status-bar, .ag-theme-alpine-dark .ag-status-bar {
  font-weight: normal;
  height: 48px;
}
.ag-paging-panel{
  position:relative;
}
.ag-status-bar{
  position:absolute;
  bottom:0;
  z-index:1;
  border:none !important
}
.ag-root-wrapper-body{
  border: none !important;
}
@media (max-width: 600px) {
  span.ag-paging-row-summary-panel {
    display: none;
  }
}
@media (max-width: 400px) {
  .ag-theme-alpine .ag-paging-button,
  .ag-theme-alpine .ag-paging-description {
    margin: 0 !important;
  }
}
@media (max-width:600px){
span.ag-paging-row-summary-panel{
display:none
}
}
</style>
