<template>
  <v-dialog
    :value="true"
    :persistent="true"
  >
    <v-card
      width="100%"
      outlined
    >
      <v-row class="ma-4">
        <v-card-title>{{ $t('pages.billing.subscriptionExpired') }}</v-card-title>
        <v-spacer />
        <v-btn
          v-if="user &&
            user.accounts &&
            user.accounts.length &&
            user.accounts.length != 1"
          class="mr-2"
          color="primary"
          outlined
          depressed
          small
          @click="showSwitchUserDialog"
        >
          <v-icon>mdi-account-group</v-icon>
          {{ $t('pages.billing.switchAccount') }}
        </v-btn>
        <v-btn
          color="primary"
          outlined
          depressed
          small
          @click="logout"
        >
          <v-icon>mdi-exit-to-app</v-icon>
          {{ $t('components.userMenu.logout') }}
        </v-btn>
      </v-row>
      <v-card-text>
        <div class="mb-4">
          {{ $t('pages.billing.signUp') }}
        </div>
        <billing-table />
      </v-card-text>
    </v-card>
    <app-switch-user-dialog
      :should-show="confirmDialogOpen"
      :title="'Available accounts'"
      :user="user"
      @close="confirmDialogOpen = false"
      @update:close="confirmDialogOpen = false"
    />
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Mutation, State } from 'vuex-class'

import BillingTable from '@/components/BillingTable.vue'
import AppSwitchUserDialog from '@/components/dialogs/AppSwitchUserDialog.vue'

import type { IUser } from '../user/types'

const namespaces = {
  auth: 'auth',
  app: 'app',
  notifications: 'notifications',
  user: 'user',
  accountSettings: 'accountSettings'
}

@Component({
  components: {
    BillingTable,
    AppSwitchUserDialog
  }
})

export default class TrialExpired extends Vue {
  @Action('clearToken', { namespace: namespaces.auth }) clearToken!:() => Promise<void>;
  @Action('clearUser', { namespace: namespaces.user }) clearUser!:() => Promise<void>;
  @Action('disconnectEventSource', { namespace: namespaces.notifications }) disconnectEventSource!: () => Promise<void>;

  @State('user', { namespace: namespaces.user }) user?: IUser

  @Mutation('setOnboarding', { namespace: namespaces.app }) setOnboarding!: (val: boolean) => void

  confirmDialogOpen = false;

  async logout () {
    this.setOnboarding(true)
    this.$toast.dismiss('emailToast')
    await this.clearToken()
    await this.clearUser()
    await this.disconnectEventSource()
    this.$router.push({
      name: 'authLogin'
    })
  }

  showSwitchUserDialog () {
    this.confirmDialogOpen = true
  }
}
</script>
