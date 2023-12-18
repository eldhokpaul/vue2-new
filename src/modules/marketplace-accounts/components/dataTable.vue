<template>
  <div style="height: 550px">
    <v-text-field
      v-model="searchText"
      label="Search"
    />
    <ag-grid-vue
      :class="$vuetify.theme.dark ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'"
      style="width: 100%; flex: 1; height: 100%;"
      v-bind="agGridProps"
      :row-data="rowData"
      :suppress-row-click-selection="true"
      :quick-filter-text="searchText"
      :pagination="true"
      @grid-ready="onGridReady"
    />
  </div>
</template>

<script lang="ts">
import { GridReadyEvent } from 'ag-grid-community'
import { AgGridVue } from 'ag-grid-vue'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  components: {
    AgGridVue
  }
})
export default class dataTable extends Vue {
    @Prop({ required: true }) readonly rowData!: Array<any>;

  searchText = '';
  gridApi!: GridReadyEvent
  reconcile=''
  dropdownOptions = ['Select a SKU', '115-SB-lipobox', '112-SB-napblanket', '111-SB-Spiderbox'];
  columnDefs = [
    {
      headerName: 'Date',
      field: 'transaction_date',
      valueFormatter: this.formatDate,
      suppressMenu: true,
      filter: true,
      suppressMovable: true
    },
    {
      headerName: 'Type',
      field: 'transaction_type',
      suppressMenu: true,
      filter: false,
      valueFormatter: this.formatTransactionType,
      suppressMovable: true
    },
    {
      headerName: 'Order_id',
      field: 'order_id',
      suppressMenu: true,
      filter: true,
      suppressMovable: true
    },
    {
      headerName: 'Description',
      field: 'description',
      suppressMenu: true,
      filter: true,
      suppressMovable: true
    },
    {
      headerName: 'Amount',
      field: 'total',
      valueFormatter: this.formatCurrency,
      suppressMenu: true,
      filter: true,
      suppressMovable: true
    },
    {
      headerName: 'Reconcile',
      field: 'reconcile',
      suppressMenu: true,
      filter: true,
      suppressMovable: true,
      editable: (params:any) => params.data.is_sku_editable === 1,
      cellEditor: 'agRichSelectCellEditor',
      cellEditorParams: (params:any) => {
        return {
          values: this.dropdownOptions,
          defaultValue: params.data.reconcile
        }
      },
      cellRenderer: (params:any) => {
        if (params.data.is_sku_editable === 1) {
          return params.value ? params.value : 'Select a SKU'
        } else {
          return null
        }
      }
    }
  ]

  formatCurrency (param: any) {
    return '$' + param.value.toFixed(2)
  }

  formatTransactionType (params: any) {
    return params.value ? params.value.replace(/_/g, ' ') : ''
  }

  formatDate (params: { value: string|number|Date }) {
    if (params.value) {
      const date = new Date(params.value)
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
      const formattedDate = date.toLocaleString('en-US', options)
      const hours = date.getHours()
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const formattedTime = `${hours % 12}:${date.getMinutes().toString().padStart(2, '0')} ${ampm}`
      return `${formattedDate}, ${formattedTime}`
    }
    return ''
  }

  get gridOptions () {
    return {
      defaultColDef: {
        sortable: false,
        resizable: false
      }
    }
  }

  onGridReady (params: GridReadyEvent) {
    this.gridApi = params
    this.gridApi.columnApi.autoSizeAllColumns()
  }

  get agGridProps () {
    return {
      paginationAutoPageSize: false,
      paginationPageSize: 15,
      columnDefs: this.columnDefs,
      detailRowAutoHeight: true,
      defaultColDef: {
        flex: 1,
        sortable: false,
        resizable: true
      },
      sideBar: false,
      singleClickEdit: true
    }
  }
}
</script>
