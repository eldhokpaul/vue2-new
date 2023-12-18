<template>
  <v-container
    class="page-container"
    fluid
    style="height: 75%; display: flex; flex-direction: column"
  >
    <ag-grid-vue
      v-if="rowData && rowData.length"
      style="width: 100%; flex: 1"
      :class="$vuetify.theme.dark?'ag-theme-alpine-dark':'ag-theme-alpine'"
      v-bind="agGridProps"
      row-selection="multiple"
      :suppress-row-click-selection="true"
      :row-data="rowData"
      :suppress-row-deselection="true"
      :get-context-menu-items="getContextMenu"
      @grid-ready="onGridReady"
      @selection-changed="onSelectionChanged"
      @pagination-changed="onPaginationChanged"
      v-on="$listeners"
    />
  </v-container>
</template>

<script lang="ts">
import { GridReadyEvent, SelectionChangedEvent } from 'ag-grid-community'
import { ColDef } from 'ag-grid-enterprise'
import { AgGridVue } from 'ag-grid-vue'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import type { AccountUserDto } from '@/client/users'
import StatusRender from '@/components/table-components/StatusRender.vue'
import TableSizeSelect from '@/components/table-components/TableSizeSelect.vue'

import CellEditButtons from './widgets/CellButtons.vue'

const statusBar = {
  statusPanels: [{ statusPanel: 'TableSizeSelect' }]
}
@Component({
  components: {
    AgGridVue,
    StatusRender,
    TableSizeSelect,
    CellEditButtons
  }
})
export default class VueUserDataGrid extends Vue {
@Prop({ required: true }) columns!: ColDef[];
@Prop({ required: true }) rowData!: AccountUserDto[];

// getRowId = (params: { data: { id: number } }) => params.data.id

context: any
agParams!: GridReadyEvent
paginationPageSize=15

get agGridProps () {
  return {
    paginationAutoPageSize: false,
    paginationPageSize: 15,
    pagination: true,
    tooltipShowDelay: 0,
    multiSortKey: 'ctrl',
    enableRangeSelection: true,
    enableCharts: true,
    context: this.context,
    statusBar: statusBar,
    columnDefs: this.columns,
    defaultColDef: {
      flex: 1,
      sortable: false,
      resizable: true,
      menuTabs: ['generalMenuTab', 'columnsMenuTab']
    },
    sideBar: {
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
          toolPanelParams: {
            suppressRowGroups: true,
            suppressValues: true,
            suppressPivots: true,
            suppressPivotMode: true
          }
        }
      ]
    }
  }
}

@Watch('paginationPageSize')
onPageSizeChanged (val: number) {
  this.agParams.api.paginationSetPageSize(val)
}

onPaginationChanged (param: { columnApi: { autoSizeAllColumns: () => any }, api: { sizeColumnsToFit: () => any } }) {
  param.api.sizeColumnsToFit()
}

beforeMount () {
  this.context = { componentParent: this }
}

onSelectionChanged (GridApi: SelectionChangedEvent) {
  const selectedRows = GridApi?.api?.getSelectedRows()
  this.$emit('input', selectedRows)
}

getContextMenu () {
  return ['copy', 'copyWithHeaders', 'separator', 'export']
}

onGridReady (params: GridReadyEvent) {
  this.agParams = params
  this.$emit('update:agParams', this.agParams)
}

editClick (user: AccountUserDto) {
  this.$emit('update:editClicked', user)
}

deleteClick (user: AccountUserDto) {
  this.$emit('update:deleteClicked', user)
}

revokeClick (user: AccountUserDto) {
  this.$emit('update:revokeClicked', user)
}

resendClick (user: AccountUserDto) {
  this.$emit('update:resendClicked', user)
}
}
</script>

<style lang='scss' scoped>

.ag-header-cell-label {
   justify-content: center;
}
.ag-theme-alpine .ag-status-bar, .ag-theme-alpine-dark .ag-status-bar {
  font-weight: normal;
  height: 48px;
}
.ag-paging-panel {
  position: relative;
}

.ag-status-bar {
  position: absolute;

  bottom: 0;

  z-index: 1;

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
</style>
