<template>
  <ag-grid-vue
    :class="$vuetify.theme.dark?'ag-theme-alpine-dark':'ag-theme-alpine'"
    style="width: 100%; flex: 1; height: 100%;"
    v-bind="agGridProps"
    :row-data="rowData"
    :suppress-row-click-selection="true"
    :master-detail="true"
    :is-row-master="isRowExpandable"
    :get-row-style="rowStyle"
  />
</template>
<script lang="ts">
import { GetDetailRowDataParams } from 'ag-grid-community'
import { AgGridVue } from 'ag-grid-vue'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import { formatCurrency } from '@/utils/currency'

const namespaces = {
  accountSettings: 'accountSettings'
}

@Component({
  components: {
    AgGridVue
  }
})
export default class SimpleTableAgGrid extends Vue {
  @Prop({ required: true }) readonly rowData!: any[]
  @Getter('currencySymbol', { namespace: namespaces.accountSettings }) currencySymbol!: string;

  formatCurrency=formatCurrency;

  columnDefs = [
    {
      headerName: '',
      field: 'name',
      cellRenderer: 'agGroupCellRenderer',
      suppressMenu: true
    },
    {
      headerName: 'Total',
      field: 'value',
      suppressMenu: true,
      valueFormatter: this.currencyFormatter
    }
  ]

  isRowExpandable (data: any) {
    return data.sub !== undefined && data.sub.length > 0
  }

  rowStyle (params: any) {
    if (this.isRowExpandable(params.data) && params.node.master) {
      return { 'font-weight': 'bold' }
    }
    return null
  }

  currencyFormatter (params: any) {
    if (this.currencySymbol && params.value.toString()) {
      return formatCurrency(this.currencySymbol, params.value)
    } else return ''
  }

  get gridOptions () {
    return {
      defaultColDef: {
        sortable: false,
        resizable: false
      }
    }
  }

  get detailCellRendererParams () {
    return {
      detailGridOptions: {
        headerHeight: 0,
        columnDefs: [
          { field: 'name', cellRenderer: 'agGroupCellRenderer' },
          {
            field: 'value',
            valueFormatter: this.currencyFormatter
          }
        ],
        defaultColDef: {
          flex: 1
        }
      },
      getDetailRowData: (params:GetDetailRowDataParams) => {
        params.successCallback(params.data.sub)
      },
      template:
          '<div ref="eDetailGrid" class="ag-details-grid ag-details-grid-auto-height"/>'
    }
  }

  get agGridProps () {
    return {
      pagination: false,
      columnDefs: this.columnDefs,
      detailRowAutoHeight: true,
      detailCellRendererParams: this.detailCellRendererParams,
      defaultColDef: {
        flex: 1,
        sortable: false,
        resizable: true,
        suppressMovable: true
      },
      sideBar: false
    }
  }
}

</script>
<style>
.ag-theme-alpine .ag-layout-auto-height .ag-center-cols-clipper{
min-height: 0;
}
 </style>
