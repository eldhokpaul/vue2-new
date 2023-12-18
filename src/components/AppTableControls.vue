<template>
  <div class="table-controls">
    <v-tooltip
      v-if="showSearch"
      top
    >
      <template #activator="{ on, attrs }">
        <v-btn
          icon
          v-bind="attrs"
          v-on="on"
        >
          <search-control
            @change="(val) => $emit('update:search', val)"
          />
        </v-btn>
      </template>
      <span v-t="'components.tableControls.labels.search'" />
    </v-tooltip>
    <v-tooltip
      v-if="showPrint"
      top
    >
      <template #activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          icon
          :color="selectedItems.length ? 'primary' : 'grey lighten-2'"
          v-on="on"
          @click="selectedItems.length ? print() : false"
        >
          <v-icon>
            mdi-printer
          </v-icon>
        </v-btn>
      </template>

      <span v-t="selectedItems.length ? 'components.tableControls.labels.print' : 'components.tableControls.labels.printSelectItems'" />
    </v-tooltip>
    <v-tooltip
      top
    >
      <template #activator="{ on, attrs }">
        <download-excel
          :data="selectedItems"
          type="csv"
          class="ma-0 pa-0 d-inline-block"
          :name="exportFileName"
          :worksheet="exportWorksheetName"
          :escape-csv="false"
        >
          <v-btn
            v-bind="attrs"
            :color="selectedItems.length ? 'primary' : 'grey lighten-2'"
            icon
            v-on="on"
          >
            <v-icon>mdi-export-variant</v-icon>
          </v-btn>
        </download-excel>
      </template>

      <span v-t="selectedItems.length ? 'components.tableControls.labels.export' : 'components.tableControls.labels.exportSelectItems'" />
    </v-tooltip>
    <v-tooltip
      v-if="showFilter"
      top
    >
      <template #activator="{ on, attrs }">
        <v-btn
          icon
          v-bind="attrs"
          v-on="on"
        >
          <filter-options
            :view-saved-filter="viewSavedFilter"
            @clear:filter="$emit('clear:filter-state')"
            @save:filter="$emit('save:filter-state')"
            @filter="(val) => $emit('update:filter', val)"
          />
        </v-btn>
      </template>
      <span v-t="'components.tableControls.labels.filter'" />
    </v-tooltip>
    <v-tooltip
      v-if="showColumns"
      top
    >
      <template #activator="{ on, attrs }">
        <v-btn
          icon
          v-bind="attrs"
          v-on="on"
        >
          <column-options
            :view-saved-column="viewSavedColumn"
            @clear:column="$emit('clear:column-state')"
            @save:column="$emit('save:column-state')"
            @column="(val) => $emit('update:column', val)"
          />
        </v-btn>
      </template>
      <span v-t="'components.tableControls.labels.columns'" />
    </v-tooltip>
    <v-tooltip
      v-if="showSync"
      top
    >
      <template #activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          color="primary"
          icon
          v-on="on"
          @click="(val) => $emit('click:sync', val)"
        >
          <v-icon>
            mdi-sync
          </v-icon>
        </v-btn>
      </template>
      <span v-t="'components.tableControls.labels.sync'" />
    </v-tooltip>
    <v-tooltip
      v-if="showGraph"
      top
    >
      <template #activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          :color="isChartEnabled ? 'primary' : 'grey lighten-2'"
          icon
          v-on="on"
          @click="isChartEnabled ? $emit('click:graph') : false"
        >
          <v-icon>
            mdi-chart-arc
          </v-icon>
        </v-btn>
      </template>
      <span v-t="'components.tableControls.labels.charts'" />
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { DataTableHeader } from 'vuetify'

import ColumnOptions from '@/components/ColumnOptions.vue'
import ColumnSelector from '@/components/ColumnSelector.vue'
import FilterOptions from '@/components/FilterOptions.vue'
import SearchControl from '@/components/SearchControl.vue'
import { toSimpleTable } from '@/utils/simple-table'

@Component({
  components: {
    ColumnSelector,
    SearchControl,
    FilterOptions,
    ColumnOptions
  }
})
export default class TableControls extends Vue {
  @Prop({
    required: false,
    default: () => []
  })
  selectedItems!: any[]

  @Prop({
    required: false,
    default: () => []
  })
  selectedChart!: any[]

  @Prop({
    required: false,
    default: () => []
  })
  selectedColumns!: any[]

  @Prop({
    default: `export-${new Date().toLocaleDateString()}.csv`
  })
  exportFileName!: string

  @Prop({
    default: `Export ${new Date().toLocaleDateString()}`
  })
  exportWorksheetName!: string

  @Prop({ required: true })
  headers!: DataTableHeader[]

  @Prop({ required: false, default: false })
  viewSavedFilter!: boolean

  @Prop({ required: false, default: false })
  viewSavedColumn!: boolean

  @Prop({ required: false, default: false })
  showSearch!: boolean

  @Prop({ required: false, default: false })
  showSync!: boolean

  @Prop({ required: false, default: false })
  showGraph!: boolean

  @Prop({ required: false, default: false })
  showFilter!: boolean

  @Prop({ required: false, default: false })
  showColumns!: boolean

  @Prop({ required: false, default: true })
  showPrint!: boolean

  @Prop({ required: false, default: false })
  isChartEnabled!: boolean

  print () {
    let headers: any[]
    if (!this.selectedColumns.length) {
      headers = Object.keys(this.selectedItems[0])
    } else {
      headers = []
    }
    const content = toSimpleTable(this.exportWorksheetName, headers, this.selectedItems)
    // const newWindow = window.open('')
    const newWindow = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0')
    if (newWindow) {
      newWindow.document.write(content)
      newWindow.print()
      newWindow.close()
    }
  }
}
</script>
