<template>
  <v-container
    class="page-container"
    style="height: 100%; display: flex; flex-direction: column"
    fluid
  >
    <page-header :title="$t('routes.users')">
      <template #controls>
        <app-table-controls
          v-if="!initialLoadTask.isActive && users"
          :selected-items="formattedUsers"
          :headers="allHeaders"
          @update:headers="(val) => (headers = val)"
        />
      </template>
      <template
        #buttons
      >
        <v-tooltip left>
          <template #activator="{ on, attrs }">
            <v-btn
              v-t="'Invite Support'"
              depressed
              outlined
              color="primary"
              v-bind="attrs"
              @click="inviteSupportUser"
              v-on="on"
            />
          </template>
          <span>Invite SellerVue Support to your account</span>
        </v-tooltip>
      </template>
    </page-header>
    <v-row>
      <v-col>
        <v-card
          v-if="initialLoadTask.isActive"
          outlined
        >
          <v-skeleton-loader type="card" />
          <v-skeleton-loader type="table" />
        </v-card>
        <v-card
          v-if="!initialLoadTask.isActive && roles"
          outlined
        >
          <div
            class="pa-4"
          >
            <p>
              {{ $t("pages.users.invite") }}
            </p>
          </div>
          <v-form
            ref="form"
            v-model="valid"
            @submit.prevent="validate"
          >
            <v-container>
              <v-row>
                <v-col
                  cols="3"
                  md="1"
                >
                  <v-subheader>
                    {{ $t("pages.users.email") }}
                  </v-subheader>
                </v-col>
                <v-col
                  cols="9"
                  md="6"
                >
                  <v-text-field
                    v-model="email"
                    outlined
                    required
                    dense
                    :label="$t('pages.users.emailText')"
                    :rules="rules.email"
                  />
                </v-col>
                <v-col
                  cols="3"
                  md="1"
                >
                  <v-subheader>
                    {{ $t("pages.users.userType") }}
                  </v-subheader>
                </v-col>
                <v-col
                  cols="9"
                  sm="2"
                >
                  <v-select
                    v-model="role"
                    :items="roles"
                    item-text="displayName"
                    item-value="id"
                    required
                    :rules="rules.select"
                    return-object
                    :label="$t('pages.users.labelUserRole')"
                    dense
                    outlined
                  />
                </v-col>
                <v-col
                  cols="12"
                  sm="2"
                >
                  <div class="text-left">
                    <v-btn
                      v-t="'pages.users.inviteUser'"
                      depressed
                      large
                      color="primary"
                      type="submit"
                    />
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card>
      </v-col>
      <template v-if="!initialLoadTask.isActive && users && users.length">
        <!-- <app-integration-wrapper :integration-id="'xero'">
            <template slot-scope="{ integrationData }"> -->
        <users-table
          v-model="selectedUsers"
          :columns="headers"
          :row-data="users"
          @update:agParams="setAGParams"
          @update:editClicked="editClicked"
          @update:deleteClicked="deleteClicked"
          @update:revokeClicked="revokeClicked"
          @update:resendClicked="resendClicked"
        />
        <!-- </template>
          </app-integration-wrapper> -->
      </template>
    </v-row>
    <app-confirmation-dialog
      :should-show="confirmDialogOpen"
      :details="'pages.users.confirm'"
      @confirm="deleteUser"
      @close="confirmDialogOpen = false"
      @close:update="confirmDialogOpen = false"
    />
    <update-user-role-dialog
      :title="'pages.users.edit'"
      :details="'pages.users.selectText'"
      :should-show="updateUserDialog"
      :roles="roles"
      @confirm="updateUser"
    />
  </v-container>
</template>

<script lang="ts">
import get from 'lodash.get'
import { Component, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import type { AccountUserDto, AccountUserUpdateDto, Role } from '@/client/users'
import AppIntegrationWrapper from '@/components/AppIntegrationWrapper.vue'
import AppTableControls from '@/components/AppTableControls.vue'
import AppConfirmationDialog from '@/components/dialogs/AppConfirmationDialog.vue'
import PageHeader from '@/components/PageHeader.vue'
import { Task } from '@/decorators/task'
import type { IUser } from '@/modules/user/types'
import { formatDateString } from '@/utils/date'

import UpdateUserRoleDialog from '../components/UpdateUserRoleDialog.vue'
import UsersTable from '../components/UsersTable.vue'

const namespaces = {
  users: 'users',
  user: 'user',
  integrations: 'integrations'
}
const dashDefault = (params: any) => {
  if (!params.value) return '-'
  return params.value
}

@Component({
  components: {
    AppIntegrationWrapper,
    AppTableControls,
    AppConfirmationDialog,
    UsersTable,
    PageHeader,
    UpdateUserRoleDialog
  }
})
export default class Users extends Vue {
  @Action('getUserById', { namespace: namespaces.users }) getUserById!: (
    userId: number
  ) => Promise<void>;

    @Action('removeUser', { namespace: namespaces.users }) removeUser!: (
   opts: { userId: number, deleteUserId: number }
  ) => Promise<void>;

      @Action('updateRole', { namespace: namespaces.users }) updateRole!: (
   opts: { userId: number, updateUserId: number, accountUser: AccountUserUpdateDto }
  ) => Promise<void>;

    @Action('getUserRoles', { namespace: namespaces.users }) getUserRoles!: (
    userId: number
  ) => Promise<void>;

      @Action('inviteUser', { namespace: namespaces.users }) inviteUser!: (
    opts: {userId: number, accountUser: AccountUserUpdateDto}
  ) => Promise<void>;

  @State('users', { namespace: namespaces.users }) users!: AccountUserDto[];
  @State('roles', { namespace: namespaces.users }) roles!: Role[];

  @State('user', { namespace: namespaces.user }) user!: IUser;
  headers = [...this.allHeaders];
  selectedUsers: any[] = [];
  showSyncDialog = false;
  syncingSupplier: any | null = null;
  valid = false;
  email: string|undefined = '';
  role: any | null = null;
  agApi!: any;
  confirmText = 'pages.amazonProducts.text';
  confirmDialogOpen=false;
  updateUserDialog=false;
  userSelected!: any;
  rules = {
    email: [
      (v: string) => !!v || this.$t('pages.errors.rules.emailRequired'),
      (v: string) =>
        /.+@.+\..+/.test(v) || this.$t('pages.errors.rules.emailValid')
    ],
    select: [(v: string) => !!v || this.$t('pages.errors.rules.required')]
  };

  @Task('initialLoadTask')
  async initialLoad () {
    await this.getUserById(this.user.id as number)
    await this.getUserRoles(this.user.id as number)
  }

  get allHeaders () {
    return [
      {
        headerName: '',
        field: '',
        headerTooltip:
          'Hold the shift key to select all the rows between two check-boxes',
        resizable: false,
        suppressColumnsToolPanel: true,
        headerCheckboxSelection: true,
        suppressSizeToFit: true,
        width: 80,
        maxWidth: 80,
        suppressMovable: true,
        checkboxSelection: true,
        chartDataType: 'excluded',
        filter: false,
        sortable: false
      },
      {
        headerName: 'Name',
        field: 'firstName&lastName',
        sortable: true,
        valueGetter: this.fullNameGetter
      },
      {
        headerName: 'Email',
        field: 'email',
        valueFormatter: dashDefault,
        sortable: true
      },
      {
        headerName: 'User Type',
        field: 'displayName',
        sortable: false,
        valueGetter: (params: { data: { accountRoles: { displayName: any }[] } }) => {
          if (params.data.accountRoles[0]?.displayName) {
            return params.data.accountRoles[0].displayName
          } else return '-'
        }
      },
      {
        headerName: 'Expiry Date',
        field: 'accountUser.invitationExpiryDate',
        valueFormatter: this.dateFormatter,
        sortable: false
      },
      {
        headerName: 'Status',
        field: 'accountUser.invitationStatus',
        valueFormatter: dashDefault,
        sortable: false
      },
      {
        headerName: 'Action',
        field: 'buttons',
        minWidth: 500,
        suppressSizeToFit: true,
        width: 500,
        sortable: false,
        cellRenderer: 'CellEditButtons'
      }
    ]
  }

  editClicked (user: AccountUserDto) {
    this.userSelected = user
    this.updateUserDialog = true
  }

  deleteClicked (user: AccountUserDto) {
    this.userSelected = user
    this.confirmDialogOpen = true
    // await this.$nextTick()
  }

  revokeClicked (user: AccountUserDto) {
    this.userSelected = user
    this.deleteUser()
  }

  async resendClicked (user: AccountUserDto) {
    this.userSelected = user
    await this.resendInvite()
  }

  setAGParams (params: any) {
    this.agApi = params
  }

  async beforeMount () {
    await this.initialLoad()
  }

  fullNameGetter (params: { data: { firstName: string, lastName: string } }) {
    if (params.data.firstName || params.data.lastName) {
      return (params.data.firstName + ' ' + params.data.lastName).trim()
    } else {
      return '-'
    }
  }

  async validate () {
    const { form } = this.$refs as HTMLFormElement
    form.validate()
    if (this.valid) {
      const { id, name } = this.role
      await this.submit({ accountRoles: [{ id: id, name: name }], email: this.email })
      form.reset()
    }
  }

  async updateUser (role: { id: number }) {
    const { id } = role
    this.updateUserDialog = false
    const accountUser = { accountRoles: [{ id: id }] }
    await this.updateRole({ userId: this.user.id as number, updateUserId: this.userSelected.id, accountUser: accountUser })
    // this.agApi.columnApi.autoSizeAllColumns()
    this.agApi.api.sizeColumnsToFit()
  }

  async resendInvite () {
    this.userSelected.accountRoles.forEach(async (element: { id: any, name: any }) => {
      const { id, name } = element
      await this.submit({ accountRoles: [{ id: id, name: name }], email: this.userSelected.email })
    })
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

  dateFormatter (params: any) {
    if (params.value) {
      return formatDateString(params.value)
    } else {
      return '-'
    }
  }

  @Task('updateTask')
  async submit (formData: AccountUserUpdateDto) {
    await this.inviteUser({ userId: this.user.id as number, accountUser: formData })
    this.agApi.api.sizeColumnsToFit()
    // this.agApi.columnApi.autoSizeAllColumns()
  }

  @Task('deleteTask')
  async deleteUser () {
    this.confirmDialogOpen = false
    await this.removeUser({ userId: this.user.id as number, deleteUserId: this.userSelected.id })
    this.agApi.api.sizeColumnsToFit()
    // this.agApi.columnApi.autoSizeAllColumns()
  }

  async inviteSupportUser () {
    const formData = { accountRoles: [], email: process.env?.VUE_APP_INVITE_SUPPORT }
    await this.inviteUser({ userId: this.user.id, accountUser: formData })
    this.agApi.api.sizeColumnsToFit()
    // this.agApi.columnApi.autoSizeAllColumns()
  }
}
</script>
