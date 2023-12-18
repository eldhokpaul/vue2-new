<template>
  <v-container
    class="page-container"
    style="height: 100%; display: flex; flex-direction: column"
    fluid
  >
    <page-header :title="$t('routes.suppliers')">
      <template #search>
        <v-card
          width="250px"
          elevation="0"
          class="ms-3"
        >
          <v-text-field
            label="Search"
            outlined
            dense
            hide-details
            prepend-inner-icon="mdi-magnify"
            clearable
            @input="searchSuppliers"
          />
        </v-card>
      </template>
      <template #controls>
        <app-table-controls
          :selected-items="selectedRows"
          :export-file-name="`suppliers-export-${new Date().toLocaleDateString()}.csv`"
          :export-worksheet-name="`Suppliers Export ${new Date().toLocaleDateString()}`"
          :headers="columns"
          :show-filter="true"
          :show-columns="true"
          :view-saved-filter="viewSavedFilter"
          :view-saved-column="viewSavedColumn"
          :show-graph="true"
          :is-chart-enabled="isChartEnabled"
          @update:filter="openToolPanel"
          @update:column="openToolPanel"
          @clear:column-state="removeColState"
          @save:column-state="saveColumnState"
          @clear:filter-state="removeFilterState"
          @save:filter-state="saveFilterState"
          @click:graph="createChart"
        />
      </template>
      <template #buttons>
        <v-btn
          v-if="isXeroConnectivityEnabled"
          color="primary"
          class="mr-2"
          outlined
          @click="xeroSyncDialog=true"
        >
          <v-img
            width="25px"
            max-width="25px"
            class="mr-1"
            :src="require('@/assets/xero.svg')"
          />
          Sync
        </v-btn>
        <v-btn
          v-show="!isViewer"
          v-t="'pages.suppliers.add'"
          :to="{
            name: 'addSupplier',
          }"
          color="primary"
          depressed
          class="mr-3"
        />
      </template>
    </page-header>
    <contacts-table
      key="contacts"
      v-model="selectedRows"
      :columns="allHeaders"
      :pagination="rowPerPage"
      @range-selection-changed="chartsSelected"
      @grid-ready="gridReady"
      @update:xero-sync-supplier="xeroSyncSupplier"
    />
    <xero-integration-supplier-sync
      v-model="showSyncDialog"
      :supplier="supplierUpdate"
      @sync-complete="initialLoad()"
    />
    <xero-contacts-sync-dialog
      v-model="xeroSyncDialog"
      @xero:sync-complete="initialLoad()"
    />
  </v-container>
</template>

<script lang="ts">
import { CellRange, ColumnVO, CreateRangeChartParams, GridReadyEvent, IServerSideGetRowsParams } from 'ag-grid-community'
import get from 'lodash.get'
import chain from 'lodash/chain'
import find from 'lodash/find'
import isEmpty from 'lodash/isEmpty'
import set from 'lodash/set'
import sumBy from 'lodash/sumBy'
import { Bind, Debounce } from 'lodash-decorators'
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'

import type { Pageable } from '@/client/suppliers'
import type { AccountSettingsDto } from '@/client/users'
import AppIntegrationWrapper from '@/components/AppIntegrationWrapper.vue'
import AppTableControls from '@/components/AppTableControls.vue'
import PageHeader from '@/components/PageHeader.vue'
import XeroIntegrationSupplierSync from '@/components/SupplierSyncDialog.vue'
import ContactsTable from '@/components/VueDataGrid.vue'
import type { ISupplier, ISuppliers } from '@/modules/contacts/types'

import XeroContactsSyncDialog from '../components/XeroContactsSyncDialog.vue'

const dashDefault = (params: any) => {
  if (!params.value) return '-'
  return params.value
}
const namespaces = {
  suppliers: 'suppliers',
  grid: 'grid',
  user: 'user',
  accountSettings: 'accountSettings'
}

@Component({
  components: {
    AppIntegrationWrapper,
    AppTableControls,
    PageHeader,
    ContactsTable,
    XeroIntegrationSupplierSync,
    XeroContactsSyncDialog
  }
})
export default class Contacts extends Vue {
  @Action('getSuppliers', { namespace: namespaces.suppliers })
  getSuppliers!: (pagination: Pageable & { sort: Array<any>, search: string }) => Promise<void>;

  @State('suppliers', { namespace: namespaces.suppliers })
  suppliers!: ISuppliers;

  @State('supplierState', { namespace: namespaces.grid }) supplierState?: any;
  @Action('getSupplierState', { namespace: namespaces.grid })
  getSupplierState!: (supplierState: any) => void;

  @Getter('isViewer', { namespace: namespaces.user }) isViewer!: boolean;
  @State('accountSettings', { namespace: namespaces.accountSettings }) accountSettings!: AccountSettingsDto

  @Action('getUserXeroIntegrationDetails', { namespace: 'integrations' }) getUserXeroIntegrationDetails!: () => Promise<any>
  @State('userXeroIntegrationDetails', { namespace: 'integrations' }) userXeroIntegrationDetails!: any

  search = '';
  selectedRows = [];
  agApi!: GridReadyEvent;
  cellRanges: CellRange[] = [];
  supplierUpdate: any={}
  showSyncDialog = false
  xeroSyncDialog = false
  rowPerPage=15
  get isXeroConnectivityEnabled (): boolean {
    return (!this.isViewer && !!this.userXeroIntegrationDetails.length)
  }

  get dataSource () {
    return {
      getRows: async (params: IServerSideGetRowsParams) => {
        const sort = params.request.sortModel || []
        const pageSize = params.api.paginationGetPageSize()
        const filterModel = params.request.filterModel || []
        const page = params.api.paginationGetCurrentPage()
        const rowGroupCols = params.request.rowGroupCols || []
        const groupKeys = params.request.groupKeys || []
        const valueCols = params.request.valueCols || []
        try {
          if (this.suppliers?.content) {
            if (Object.keys(filterModel).length || rowGroupCols.length) {
              await this.loadFilterAndGrouping(params, this.suppliers.content, filterModel, rowGroupCols, groupKeys, valueCols)
              return false
            }
          }

          params.api.showLoadingOverlay()
          await this.getSuppliers({
            pageNumber: page + 1,
            pageSize: pageSize,
            sort: sort,
            search: this.search
          })
          if (this.suppliers?.content.length) {
            if (Object.keys(filterModel).length || rowGroupCols.length) {
              await this.loadFilterAndGrouping(params, this.suppliers.content, filterModel, rowGroupCols, groupKeys, valueCols)
              return false
            }
            params.success({
              rowData: this.suppliers.content,
              rowCount: this.suppliers.totalElements
            })
            params.api.hideOverlay()
            this.sizeToFitGrid()
          } else {
            params.success({
              rowData: [],
              rowCount: 0
            })
            params.api.showNoRowsOverlay()
          }
        } catch (e) {
          params.fail()
        }
      }
    }
  }

  async sizeToFitGrid () {
    this.agApi.api.sizeColumnsToFit()
  }

  async saveColumnState () {
    const columnState = this.agApi.columnApi.getColumnState()
    this.getSupplierState({ colState: columnState, rowPerPage: this.agApi.api.paginationGetPageSize() })
  }

  async removeColState () {
    this.agApi.columnApi.resetColumnState()
    this.getSupplierState({ colState: [], rowPerPage: null })
    await this.initialLoad()
  }

  async saveFilterState () {
    const filterState = this.agApi.api.getFilterModel()
    this.getSupplierState({ filterModel: filterState })
  }

  async removeFilterState () {
    this.agApi.api.setFilterModel({})
    this.getSupplierState({ filterModel: {} })
  }

  get viewSavedColumn () {
    return isEmpty(this.supplierState.colState)
  }

  get viewSavedFilter () {
    return isEmpty(this.supplierState.filterModel)
  }

  async openToolPanel (key: string) {
    if (key === this.agApi.api.getOpenedToolPanel()) {
      this.agApi.api.closeToolPanel()
      return false
    }
    this.agApi.api.openToolPanel(key)
  }

  async gridReady (param: GridReadyEvent) {
    this.agApi = param
    this.initialLoad()
  }

  async restoreView () {
    this.agApi.columnApi.applyColumnState({
      state: this.supplierState.colState,
      applyOrder: true
    })
    this.agApi.api.setFilterModel(this.supplierState.filterModel)
  }

  async paginationFun (val: number) {
    this.rowPerPage = val
    this.agApi.api.setCacheBlockSize(val)
    this.agApi.api.paginationSetPageSize(val)
    // this.restoreView()
  }

  async initialLoad () {
    await this.getUserXeroIntegrationDetails()
    if (this.supplierState.rowPerPage) {
      this.paginationFun(this.supplierState.rowPerPage)
    } else {
      this.paginationFun(15)
    }
    this.agApi.api.setServerSideDatasource(this.dataSource)
    this.restoreView()
  }

  @Debounce(200)
  @Bind()
  searchSuppliers (value: string) {
    if (this.search !== value) {
      this.search = value
      this.agApi.api.setServerSideDatasource(this.dataSource)
    }
  }

  // Filter and grouping functions for ag-grid locally Start
  async loadFilterAndGrouping (params: IServerSideGetRowsParams, loadedData: Array<any>, filterModel: any, rowGroupCols: ColumnVO[], groupKeys: string[], valueCols: ColumnVO[]): Promise<void> {
    const filteredList = await this.localFilter(loadedData, filterModel)
    const filteredListGroup = await this.localGroup(filteredList, rowGroupCols, valueCols)
    const filteredListGroupExpand = await this.localGroupExpand(filteredListGroup, groupKeys, rowGroupCols)
    if (filteredListGroupExpand.length) {
      params.success({
        rowData: filteredListGroupExpand,
        rowCount: filteredListGroupExpand.length
      })
      params.api.hideOverlay()
      this.sizeToFitGrid()
    } else {
      params.success({
        rowData: [],
        rowCount: 0
      })
      params.api.showNoRowsOverlay()
    }
  }

  async localFilter (filteredList: Array<any>, filterModel: any): Promise<any[] | []> {
    try {
      if (Object.keys(filterModel).length) {
        for (const item in filterModel) {
          const value = filterModel[item].filter.toString().toLowerCase()
          filteredList = filteredList.filter((cellValue: ISupplier) =>
            get(cellValue, item)
              ? get(cellValue, item)
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
              : ''
          )
        }
      }
      return filteredList
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async localGroup (filteredList: Array<any>, rowGroupCols: ColumnVO[], valueCols: ColumnVO[]): Promise<Array<any> | []> {
    try {
      if (rowGroupCols.length) {
        rowGroupCols.forEach(async (element: { id: any }) => {
          filteredList = chain(filteredList)
            .groupBy(element.id)
            .map((value, key) => ({ field: key, items: value }))
            .value()
        })
        rowGroupCols.forEach(async (element: { id: any }) => {
          const field = element.id.split('.')
          filteredList.forEach((newField) => {
            set(newField, field, newField.field)
          })
        })
        if (valueCols.length) {
          filteredList.forEach((data) => {
            valueCols.forEach((item) => {
              data[item.id] = sumBy(data.items, item.id)
            })
          })
        }
      }
      return filteredList
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async localGroupExpand (
    filteredList: Array<any>, groupKeys: string[], rowGroupCols: ColumnVO[]): Promise<Array<any> | []> {
    try {
      if (groupKeys.length) {
        for (const element of groupKeys) {
          for (const ele of rowGroupCols) {
            filteredList = find(filteredList, [ele.id, element])
            filteredList = get(filteredList, 'items') || []
          }
        }
      }
      return filteredList
    } catch (error) {
      console.log(error)
      return []
    }
  }
  // Filter and grouping functions for ag-grid locally end

  get allHeaders () {
    return [
      {
        headerName: '',
        field: '',
        headerTooltip:
          'Hold the shift key to select all the rows between two check-boxes',
        // headerComponent: 'SelectAllCheckbox',
        // headerComponentParams: { headerName: 'Export' },
        headerCheckboxSelection: true,
        resizable: false,
        suppressColumnsToolPanel: true,
        maxWidth: 80,
        suppressSizeToFit: true,
        suppressMovable: true,
        checkboxSelection: true,
        chartDataType: 'excluded',
        filter: false,
        sortable: false
      },
      {
        field: 'companyName',
        headerName: this.$t('components.suppliersTable.headers.companyName'),
        valueFormatter: dashDefault,
        tooltipField: 'companyName',
        cellRenderer: 'SimpleLinkRender',
        cellRendererParams: {
          name: 'supplierDetails',
          goBack: 'suppliers',
          field: 'id',
          id: 'id'
        },
        sortable: true
      },
      {
        headerName: this.$t('components.suppliersTable.headers.source'),
        maxWidth: 120,
        minWidth: 120,
        hide: !this.isXeroConnectivityEnabled,
        suppressColumnsToolPanel: !this.isXeroConnectivityEnabled,
        field: 'xeroId',
        suppressFiltersToolPanel: true,
        filter: 'FilterModel',
        floatingFilterComponentParams: {
          suppressFilterButton: true
        },
        cellRenderer: 'XeroEnabled',
        valueFormatter: dashDefault,
        sortable: false
      },
      {
        headerName: this.$t('components.suppliersTable.headers.email'),
        field: 'email',
        valueFormatter: dashDefault,
        sortable: true
      },
      {
        headerName: this.$t(
          'components.suppliersTable.headers.telephoneNumber'
        ),
        field: 'telephoneNumber',
        valueFormatter: dashDefault,
        sortable: true
      },
      {
        headerName: this.$t('components.suppliersTable.city'),
        field: 'city',
        valueFormatter: dashDefault,
        sortable: true
      },
      {
        headerName: this.$t('components.suppliersTable.country'),
        field: 'country',
        enableRowGroup: true,
        valueFormatter: dashDefault,
        sortable: true
      },
      {
        headerName: this.$t('components.suppliersTable.zipOrPostCode'),
        field: 'zipOrPostCode',
        valueFormatter: dashDefault,
        aggFunc: 'sum',
        enableValue: true,
        sortable: true
      }, {
        headerName: this.$t('components.suppliersTable.headers.push'),
        field: 'xeroId',
        suppressFiltersToolPanel: true,
        filter: 'FilterModel',
        floatingFilterComponentParams: {
          suppressFilterButton: true
        },
        hide: !this.isXeroConnectivityEnabled,
        suppressColumnsToolPanel: !this.isXeroConnectivityEnabled,
        cellRenderer: 'XeroPushButton',
        valueFormatter: dashDefault,
        sortable: false
      }
    ]
  }

  get columns () {
    return [
      {
        headerName: '',
        field: ''

      },
      {
        field: 'companyName',
        headerName: this.$t('components.suppliersTable.headers.companyName')

      },
      this.accountSettings?.isXeroConnectivityEnabled
        ? {
            headerName: this.$t('components.suppliersTable.headers.source'),
            field: 'xeroId'

          }
        : null,
      {
        headerName: this.$t('components.suppliersTable.headers.email'),
        field: 'email'

      },
      {
        headerName: this.$t(
          'components.suppliersTable.headers.telephoneNumber'
        ),
        field: 'telephoneNumber'

      },
      {
        headerName: this.$t('components.suppliersTable.city'),
        field: 'city'

      },
      {
        headerName: this.$t('components.suppliersTable.country'),
        field: 'country'

      },
      {
        headerName: this.$t('components.suppliersTable.zipOrPostCode'),
        field: 'zipOrPostCode'

      },
      this.accountSettings?.isXeroConnectivityEnabled && this.userXeroIntegrationDetails?.length
        ? {
            headerName: this.$t('components.suppliersTable.headers.push'),
            field: 'xeroId'

          }
        : null
    ].filter(Boolean)
  }

  get isChartEnabled () {
    return !!this.cellRanges.length
  }

  chartsSelected (agApi: GridReadyEvent) {
    const cellRange: CellRange[] = agApi.api.getCellRanges() || []
    this.cellRanges = cellRange
  }

  createChart () {
    const range: CellRange[] = this.cellRanges
    range.forEach((element: CellRange) => {
      const params: CreateRangeChartParams = {
        cellRange: {
          rowStartIndex: element?.startRow?.rowIndex,
          rowEndIndex: element?.endRow?.rowIndex,
          columns: element.columns
        },
        chartType: 'groupedColumn'
      }
      this.agApi.api.createRangeChart(params)
    })
  }

  async xeroSyncSupplier (supplier: ISupplier) {
    this.supplierUpdate = supplier
    this.showSyncDialog = true
  }
}
</script>
