<template>
  <v-container
    class="page-container"
    style="height: 100%; display: flex; flex-direction: column"
    fluid
  >
    <page-header :title="$t('routes.userManagement')">
      <template #controls>
        <app-table-controls
          class="d-none d-sm-flex"
          :selected-items="formattedUsers"
          :export-file-name="`invoices-export-${new Date().toLocaleDateString()}.csv`"
          :export-worksheet-name="`Invoices Export ${new Date().toLocaleDateString()}`"
          :headers="allHeaders"
          :show-filter="true"
          :show-columns="true"
          :view-saved-filter="viewSavedFilter"
          :view-saved-column="viewSavedColumn"
          :show-graph="false"
          :is-chart-enabled="isChartEnabled"
          @update:filter="openToolPanel"
          @update:column="openToolPanel"
          @clear:column-state="removeColState"
          @save:column-state="saveColumnState"
          @clear:filter-state="removeFilterState"
          @save:filter-state="saveFilterState"
        />
      </template>
      <template #search>
        <v-card
          width="250px"
          elevation="0"
          class="ms-3 mr-1 d-none d-sm-flex"
        >
          <v-text-field
            label="Search"
            outlined
            dense
            hide-details
            prepend-inner-icon="mdi-magnify"
            clearable
            @input="searchUser"
          />
        </v-card>
      </template>
      <template
        #buttons
      >
        <v-btn
          depressed
          color="primary"
          class="mr-3"
          @click="userRegisterDialogOpen=true"
        >
          {{ $t('components.usersDialogs.newUserRegistration') }}
        </v-btn>
      </template>
    </page-header>
    <template v-if="!!userStatus">
      <users-stats-card
        class="mb-3"
        :user-status="userStatus"
      />
    </template>
    <user-managment-table
      v-model="selectedUsers"
      :columns="headers"
      :pagination="rowPerPage"
      @grid-ready="initialFunction"
    />
    <user-register-dialog
      v-model="registerEmail"
      :should-show="userRegisterDialogOpen"
      @confirm="registerNewUser"
      @close="userRegisterDialogOpen = false"
      @update:close="userRegisterDialogOpen = false"
    />
    <!-- :details="'components.usersDialogs.reverifyConfirmText'" -->
    <app-confirmation-dialog
      key="resendVerification"
      :should-show="resendVerificationDialog"
      :is-active="resendVerificationTask.isActive"
      @confirm="resendVerificationConfirm"
      @close="resendVerificationDialog = false"
      @close:update="resendVerificationDialog = false"
    />
    <!-- :details="'components.usersDialogs.passwordConfirmText'" -->
    <app-confirmation-dialog
      key="passwordResetEmail"
      :should-show="passwordResetEmailDialog"
      :is-active="passwordResetEmailTask.isActive"
      @confirm="passwordResetEmailConfirm"
      @close="passwordResetEmailDialog = false"
      @close:update="passwordResetEmailDialog = false"
    />
  </v-container>
</template>

<script lang="ts">
import { CellRange, ColumnVO, GridReadyEvent, IServerSideGetRowsParams } from 'ag-grid-community'
import get from 'lodash.get'
import chain from 'lodash/chain'
import find from 'lodash/find'
import isEmpty from 'lodash/isEmpty'
import set from 'lodash/set'
import sumBy from 'lodash/sumBy'
import { Bind, Debounce } from 'lodash-decorators'
import { Component, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import type { AccountUserDto, EmailDto, Pageable, PageUser, User, UserAdminStatsDto } from '@/client/users'
import AppTableControls from '@/components/AppTableControls.vue'
import AppConfirmationDialog from '@/components/dialogs/AppConfirmationDialog.vue'
import PageHeader from '@/components/PageHeader.vue'
import UserManagmentTable from '@/components/VueDataGrid.vue'
import { Task } from '@/decorators/task'
import UsersStatsCard from '@/modules/user-management/components/UsersStatsCard.vue'
import { formatDateString } from '@/utils/date'

import UserRegisterDialog from '../components/dialogs/UserRegisterDialog.vue'

const namespaces = {
  users: 'users',
  user: 'user',
  grid: 'grid',
  userManagment: 'userManagement',
  integrations: 'integrations'
}
const dashDefault = (params: any) => {
  if (!params.value) return '-'
  return params.value
}
// const textFilterParams = {
//   filterOptions: ['contains'],
//   debounceMs: 200,
//   suppressAndOrCondition: true
// }
const dateFilterParams = {
  filterOptions: ['lessThanOrEqual', 'greaterThanOrEqual'],
  debounceMs: 200,
  suppressAndOrCondition: true
}
const modelFilterParams = {
  suppressFilterButton: true
}

@Component({
  components: {
    PageHeader,
    AppTableControls,
    UserManagmentTable,
    UsersStatsCard,
    UserRegisterDialog,
    AppConfirmationDialog
  }
})
export default class UserManagement extends Vue {
  @Action('getAllUsers', { namespace: namespaces.userManagment })
  getAllUsers!: (pagination?: Pageable & { sort: Array<any>, search: string }) => Promise<void>;

  @Action('adminReverifyUser', { namespace: namespaces.userManagment }) adminReverifyUser!: (userId: number) => Promise<void>;
  @Action('adminPasswordResetEmail', { namespace: namespaces.userManagment }) adminPasswordResetEmail!: (email: EmailDto) => Promise<void>;
  @Action('getUserAdminStats', { namespace: namespaces.userManagment }) getUserAdminStats!: () => Promise<void>;
  @Action('registerUser', { namespace: namespaces.userManagment }) registerUser!: (email: string) => Promise<void>;
  @Action('getUserState', { namespace: namespaces.grid }) getUserState!: (userState: any) => void;

  @State('allUsers', { namespace: namespaces.userManagment }) allUsers!: PageUser;
  @State('userStatus', { namespace: namespaces.userManagment }) userStatus?: UserAdminStatsDto;
  @State('userState', { namespace: namespaces.grid }) userState?: any;

  resendVerificationDialog=false
  passwordResetEmailDialog=false
  headers = [...this.allHeaders];
  selectedUsers: any[] = [];
  agApi!: GridReadyEvent;
  userRegisterDialogOpen=false;
  userSelected!: any;
  rowPerPage=15;
  registerEmail=''
  cellRanges: CellRange[] = [];
  selectedId!: number
  resetEmail!: string
  search = ''

  rules = {
    email: [
      (v: string) => !!v || this.$t('pages.errors.rules.emailRequired'),
      (v: string) =>
        /.+@.+\..+/.test(v) || this.$t('pages.errors.rules.emailValid')
    ],
    select: [(v: string) => !!v || this.$t('pages.errors.rules.required')]
  };

  async initialFunction (param: GridReadyEvent) {
    this.agApi = param
    await this.getUserAdminStats()
    await this.initialLoad()
  }

  async registerNewUser (email: string) {
    this.userRegisterDialogOpen = false
    await this.registerUser(email)
  }

  async initialLoad () {
    if (this.userState.rowPerPage) {
      this.paginationFun(this.userState.rowPerPage)
    } else {
      this.paginationFun(15)
    }
    this.agApi.api.setServerSideDatasource(this.dataSource)
    this.restoreView()
    // await this.getAllUsers()
  }

  @Debounce(200)
  @Bind()
  searchUser (value: string) {
    if (this.search !== value) {
      this.search = value
      this.agApi.api.setServerSideDatasource(this.dataSource)
    }
  }

  async restoreView () {
    this.agApi.columnApi.applyColumnState({
      state: this.userState.colState,
      applyOrder: true
    })
    this.agApi.api.setFilterModel(this.userState.filterModel)
  }

  async paginationFun (val: number) {
    this.rowPerPage = val
    this.agApi.api.setCacheBlockSize(val)
    this.agApi.api.paginationSetPageSize(val)
    // await this.restoreView()
  }

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
      params.api.showNoRowsOverlay()
      params.success({
        rowData: [],
        rowCount: 0
      })
    }
  }

  async localFilter (filteredList: Array<User>, filterModel: any): Promise<Array<User> | []> {
    try {
      if (Object.keys(filterModel).length) {
        for (const item in filterModel) {
          const value = filterModel[item].filter.toString().toLowerCase()
          filteredList = filteredList.filter((cellValue: User) =>
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

  get isChartEnabled () {
    return !!this.cellRanges.length
  }

  async chartsSelected (gridApi: { api: { getCellRanges: () => any } }) {
    const cellRange = gridApi.api.getCellRanges()
    this.cellRanges = cellRange.length ? cellRange : []
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

        // this.getSupplierState({ sortModel: sort, filterModel: {} })
        try {
          params.api.showLoadingOverlay()
          if (this.allUsers?.content) {
            if (Object.keys(filterModel).length || rowGroupCols.length) {
              await this.loadFilterAndGrouping(params, this.allUsers.content, filterModel, rowGroupCols, groupKeys, valueCols)
              return false
            }
          }
          await this.getAllUsers({
            pageNumber: page + 1,
            pageSize: pageSize,
            sort: sort,
            search: this.search
          })
          if (this.allUsers?.content?.length) {
            if (Object.keys(filterModel).length || rowGroupCols.length) {
              await this.loadFilterAndGrouping(params, this.allUsers.content, filterModel, rowGroupCols, groupKeys, valueCols)
              return false
            }
            params.success({
              rowData: this.allUsers.content,
              rowCount: this.allUsers.totalElements
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

  get allHeaders () {
    return [
      {
        headerName: '',
        field: '',
        headerTooltip: 'Hold the shift key to select all the rows between two check-boxes',
        // headerComponent: 'SelectAllCheckbox',
        // headerComponentParams: { headerName: 'Accept/Reject' },
        headerCheckboxSelection: true,
        resizable: false,
        suppressColumnsToolPanel: true,
        maxWidth: 60,
        checkboxSelection: true,
        chartDataType: 'excluded',
        filter: false,
        suppressMovable: true
      },
      {
        headerName: 'ID',
        field: 'id',
        sortable: true,
        cellRenderer: 'SimpleLinkRender',
        cellRendererParams: {
          name: 'userDetails',
          goBack: 'user-management',
          field: 'id',
          id: 'id'
        }
      },
      {
        headerName: 'Email',
        field: 'email',
        minWidth: 300,
        sortable: true,
        cellRenderer: 'SimpleLinkRender',
        cellRendererParams: {
          name: 'userDetails',
          goBack: 'user-management',
          field: 'id',
          id: 'id'
        }
      },
      {
        headerName: 'First Name',
        field: 'firstName',
        valueFormatter: dashDefault,
        sortable: true
      },
      {
        headerName: 'Last Name',
        field: 'lastName',
        valueFormatter: dashDefault,
        sortable: true
      },
      {
        headerName: 'Tier',
        field: 'tier',
        valueFormatter: dashDefault,
        cellRenderer: 'FeeStatusRender',
        sortable: false
      },
      {
        headerName: 'Tier Expiry Date',
        field: 'tierExpiryDate',
        filter: 'agDateColumnFilter',
        filterParams: dateFilterParams,
        sortable: true,
        minWidth: 180,
        valueFormatter: this.dateFormatter
      },
      {
        headerName: 'Active',
        field: 'isActive',
        minWidth: 100,
        chartDataType: 'excluded',
        valueFormatter: dashDefault,
        sortable: true,
        suppressFiltersToolPanel: true,
        filter: 'FilterModel',
        floatingFilterComponentParams: modelFilterParams,
        cellRenderer: 'VerifiedRender'
      },
      {
        headerName: 'Verified',
        field: 'isVerified',
        minWidth: 100,
        chartDataType: 'excluded',
        valueFormatter: dashDefault,
        sortable: true,
        suppressFiltersToolPanel: true,
        filter: 'FilterModel',
        floatingFilterComponentParams: modelFilterParams,
        cellRenderer: 'VerifiedRender'
      },
      {
        headerName: 'Created At',
        field: 'createdAt',
        suppressFiltersToolPanel: true,
        filter: 'FilterModel',
        floatingFilterComponentParams: modelFilterParams,
        sortable: true,
        minWidth: 180,
        valueFormatter: this.dateFormatter
      },
      {
        headerName: 'Update At',
        field: 'updateAt',
        suppressFiltersToolPanel: true,
        filter: 'FilterModel',
        floatingFilterComponentParams: modelFilterParams,
        sortable: true,
        minWidth: 180,
        valueFormatter: this.dateFormatter
      },
      {
        headerName: 'Last Login',
        field: 'lastLogin',
        valueFormatter: this.dateFormatter,
        sortable: false
      },
      {
        headerName: 'Logged In',
        field: 'isLoggedIn',
        valueFormatter: this.dateFormatter,
        sortable: false
      },
      {
        headerName: 'Action',
        field: 'buttons',
        minWidth: 800,
        suppressSizeToFit: true,
        width: 800,
        sortable: false,
        cellRenderer: 'UserCellButtons',
        cellRendererParams: {
          callbackVerification: this.resendVerification,
          callbackPassword: this.passwordResetEmail
        },
        suppressFiltersToolPanel: true,
        filter: 'FilterModel',
        floatingFilterComponentParams: modelFilterParams
      }
    ]
  }

  get formattedUsers () {
    return this.selectedUsers.map((user: AccountUserDto) => {
      return this.headers.reduce((prev: Record<string, any>, cur: any) => {
        prev[cur.headerName.toString()] = `"${get(
          user,
          cur.field
        )?.toString()}"`
        return prev
      }, {})
    })
  }

  saveColumnState () {
    const columnState = this.agApi.columnApi.getColumnState()
    this.getUserState({ colState: columnState, rowPerPage: this.agApi.api.paginationGetPageSize() })
  }

  saveFilterState () {
    const filterState = this.agApi.api.getFilterModel()
    this.getUserState({ filterModel: filterState })
  }

  removeFilterState () {
    this.agApi.api.setFilterModel({})
    this.getUserState({ filterModel: {} })
  }

  async removeColState () {
    this.agApi.columnApi.resetColumnState()
    this.getUserState({ colState: [], rowPerPage: null })
    await this.initialLoad()
  }

  get viewSavedColumn () {
    return isEmpty(this.userState.colState)
  }

  get viewSavedFilter () {
    return isEmpty(this.userState.filterModel)
  }

  openToolPanel (key: string) {
    if (key === this.agApi.api.getOpenedToolPanel()) {
      this.agApi.api.closeToolPanel()
      return false
    }
    this.agApi.api.openToolPanel(key)
  }

  dateFormatter (params: any) {
    if (params.value) {
      return formatDateString(params.value)
    } else {
      return '-'
    }
  }

  @Task('resendVerificationTask')
  async resendVerificationConfirm () {
    const id = this.selectedId
    await this.adminReverifyUser(id)
    this.resendVerificationDialog = false
  }

  @Task('passwordResetEmailTask')
  async passwordResetEmailConfirm () {
    const email = this.resetEmail
    await this.adminPasswordResetEmail({ email: email })
    this.passwordResetEmailDialog = false
  }

  async resendVerification (...arg: any) {
    const { id } = arg[0]
    this.selectedId = id
    this.resendVerificationDialog = true
  }

  async passwordResetEmail (...arg: any) {
    const { email } = arg[0]
    this.resetEmail = email
    this.passwordResetEmailDialog = true
  }
}
</script>
