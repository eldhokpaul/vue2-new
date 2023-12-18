<template>
  <v-dialog
    v-model="shouldShow"
    width="600"
    @click:outside="$emit('update:close')"
  >
    <v-card height="500px">
      <v-card-title v-t="title" />
      <v-container
        class="page-container"
        fluid
        style="height: 85%; display: flex; flex-direction: column"
      >
        <ag-grid-vue
          style="width: 100%; height: 100%"
          :class="$vuetify.theme.dark?'ag-theme-alpine-dark':'ag-theme-alpine'"
          :column-defs="columnDefs"
          :pagination="true"
          :context="context"
          :status-bar="statusBar"
          :default-col-def="defaultColDef"
          :row-data="user.accounts"
        />
      </v-container>
      <app-user-invite-dialog
        :should-show="inviteDialogOpen"
        :title="'User not Accepted'"
        @close="inviteDialogOpen = false"
        @update:close="inviteDialogOpen = false"
        @success="invitationAct"
        @reject="invitationAct"
      />
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { AgGridVue } from 'ag-grid-vue'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'

import type { Account, User, UserPatchDto } from '@/client/users'
import AppUserInviteDialog from '@/components/dialogs/AppUserInviteDialog.vue'
import TableSizeSelect from '@/components/table-components/TableSizeSelect.vue'
import { EventBus } from '@/utils/event-bus'

import CellUserSwitchButtons from './widgets/CellUserSwitchButtons.vue'
const namespaces = {
  user: 'user',
  auth: 'auth',
  accountSettings: 'accountSettings'
}

@Component({
  components: {
    AppUserInviteDialog,
    AgGridVue,
    CellUserSwitchButtons,
    TableSizeSelect
  }
})
export default class AppSwitchUserDialog extends Vue {
  @Getter('isManagementSectionEnabled', { namespace: namespaces.accountSettings }) isManagementSectionEnabled!: boolean
  @Getter('currentAccount', { namespace: namespaces.user }) currentAccount!: Account

  @Action('actOnInvitation', { namespace: namespaces.auth }) actOnInvitation!: (opts: { userId: number, accountId: number, invitationAction: string }) => Promise<User>;
  @Action('switchUser', { namespace: namespaces.user }) switchUser!: (options: {userId: number, userPatch: UserPatchDto }) => Promise<void>;

  @State('darkMode', { namespace: 'app' }) darkMode?: boolean

  @Prop() shouldShow!: boolean;
  @Prop({ default: 'components.appConfirmationDialog.confirm' }) title!: string;
  @Prop() user!: User;

  inviteDialogOpen = false;
  statusBar!: any;
  context!: any;
  paginationPageSize = 15;
  selectedUser!: any;

  async switchUserFn (selectedUser: any) {
    if (selectedUser.currentAccountUser.invitationStatus === 'INVITED') {
      this.selectedUser = selectedUser
      this.inviteDialogOpen = true
    } else {
      await this.switchUser({
        userId: this.user.id as number,
        userPatch: { currentAccountId: selectedUser.id }
      })
      await this.checkRoute()
      this.$emit('close')
    }
  }

  async invitationAct (invitationStatus: string) {
    if (invitationStatus === 'ACCEPT') {
      const user = await this.actOnInvitation({
        userId: this.user.id as number,
        accountId: this.selectedUser.id,
        invitationAction: invitationStatus
      })
      if (user.isActive && user.isVerified) {
        // setTimeout(async () => {
        await this.switchUser({
          userId: this.user.id as number,
          userPatch: { currentAccountId: this.selectedUser.id }
        })
        this.selectedUser = {}
        await this.checkRoute()
        this.$emit('close')
        // }, 1000)
      }
    } else {
      await this.actOnInvitation({
        userId: this.user.id as number,
        accountId: this.selectedUser.id,
        invitationAction: invitationStatus
      })
      this.selectedUser = {}
      this.$emit('close')
      this.inviteDialogOpen = false
    }
  }

  async checkRoute () {
    if (
      this.currentAccount &&
      this.currentAccount.tierExpiryDate &&
      new Date(this.currentAccount.tierExpiryDate).getTime() < Date.now()
    ) {
      this.$router.push({ name: 'trialExpired' })
    }
    if ((this.isManagementSectionEnabled && this.$route.name === 'dashboard') || this.$route.name === 'feeTrackerPro') {
      // this.$router.go(0)
      EventBus.$emit('switch-user-event')
    } else {
      this.$router.replace({ name: this.isManagementSectionEnabled ? 'dashboard' : 'feeTrackerPro' })
    }
  }

  data () {
    return {
      columnDefs: [
        {
          headerName: 'Name',
          field: 'name',
          minWidth: 455,
          filter: 'agTextColumnFilter'
        },
        {
          headerName: 'Action',
          field: 'buttons',
          sortable: false,
          cellRenderer: 'CellUserSwitchButtons',
          filter: false,
          cellRendererParams: {
            self: this
          }
        }
      ],
      defaultColDef: {
        filter: true,
        floatingFilter: true
      },
      gridApi: null,
      columnApi: null,
      PaginationItems: [{ text: 'All', value: 2000 }, 15, 25, 50, 100],
      statusBar: null,
      rowData: null,
      context: null
    }
  }

  beforeMount () {
    this.paginationPageSize = 15
    this.context = { componentParent: this }
    this.statusBar = {
      statusPanels: [{ statusPanel: 'TableSizeSelect' }]
    }
  }
}
</script>
<style lang='scss' scoped>
.switchcontainer {
  display: flex;
}
.ag-paging-panel {
  position: relative;
}

.ag-status-bar {
  position: absolute;

  bottom: -24px;

  z-index: 1;

  border: none !important;
}

button.ma-2.v-btn.v-btn--outlined.theme--light.v-size--x-small.green--text {
  cursor: no-drop;
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
