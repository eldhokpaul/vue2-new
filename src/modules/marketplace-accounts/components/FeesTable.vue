<template>
  <ag-grid-vue
    :class="$vuetify.theme.dark?'ag-theme-alpine-dark':'ag-theme-alpine'"
    style="width: 100%; flex: 1; height: 100%;"
    v-bind="agGridProps"
    :row-data="transformedData"
    :suppress-row-click-selection="true"
  />
</template>
<script lang="ts">
import { AgGridVue } from 'ag-grid-vue'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  components: {
    AgGridVue
  }
})
export default class FeesTable extends Vue {
  @Prop({ required: true }) readonly rowData!: Record<string, number>
  columnDefs = [
    {
      headerName: 'Fee Name',
      field: 'feeName',
      suppressMenu: true,
      sortable: true
    },
    {
      headerName: 'Fee Amount',
      field: 'total',
      suppressMenu: true,
      valueFormatter: this.formatCurrency,
      sortable: true
    }
  ]

  formatCurrency (param: any) {
    return '$' + param.value.toFixed(2)
  }

  get gridOptions () {
    return {
      defaultColDef: {
        sortable: false,
        resizable: false
      }
    }
  }

  get lastRowIndex () {
    return this.transformedData.length - 1
  }

  get transformedData () {
    return Object.keys(this.rowData).map(key => ({
      feeName: key,
      total: this.rowData[key]
    }))
  }

  get agGridProps () {
    return {
      pagination: false,
      columnDefs: this.columnDefs,
      defaultColDef: {
        flex: 1,
        sortable: false,
        resizable: true
      },
      sideBar: false,
      ensureDomOrder: true,
      domLayout: 'autoHeight'
    }
  }
}

</script>
