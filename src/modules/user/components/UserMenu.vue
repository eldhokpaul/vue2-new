<template>
  <v-menu
    v-if="user"
    v-model="open"
    :close-on-content-click="false"
    bottom
    left
    offset-y
    origin="top right"
    transition="slide-y-transition"
    max-width="280px"
  >
    <template #activator="{ on: onMenu }">
      <v-btn
        text
        v-on="{ ...onMenu }"
      >
        <v-icon
          :size="28"
        >
          mdi-account-circle
        </v-icon>
        <span
          v-if="user && user.firstName"
          class="mx-2"
          v-text="`${user.firstName}`"
        />
        <span
          v-else-if="user && user.lastName"
          class="mx-2"
          v-text="`${user.lastName}`"
        />
        <span
          v-else
          v-t="'pages.app.profile'"
          class="mx-2"
        />
        <v-icon>
          mdi-menu-down
        </v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-list subheader>
        <v-list-item @click="navigate">
          <v-list-item-icon>
            <v-icon
              size="28"
            >
              mdi-account-circle
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <template v-if="user">
              <v-list-item-title>
                {{ `${user.firstName} ${user.lastName}` }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ `${user.email}` }}
              </v-list-item-subtitle>
            </template>
            <span
              v-else
              v-t="'pages.app.profile'"
              class="mx-2"
            />
          </v-list-item-content>
        </v-list-item>
        <v-divider />
        <!--accounts list -->
        <v-list-group
          v-if="
            user &&
              user.accounts &&
              user.accounts.length &&
              user.accounts.length != 1 &&
              user.accounts.length <= 5
          "
          no-action
          sub-group
        >
          <template #activator>
            <v-list-item-content>
              <v-list-item-title>{{ "Available Accounts" }}</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item
            v-for="(users, idx) in user.accounts"
            :key="idx"
            :disabled="users.isCurrent"
            @click="switchUserOnClick(users)"
          >
            <v-list-item-title>
              {{ users.name }}
            </v-list-item-title>
            <v-icon
              v-if="users.isCurrent"
              color="green"
              small
            >
              mdi-checkbox-marked-circle
            </v-icon>
          </v-list-item>
        </v-list-group>
        <v-list-item
          v-if="user &&
            user.accounts &&
            user.accounts.length &&
            user.accounts.length > 5"
          @click="showSwitchUserDialog"
        >
          <v-list-item-action>
            <v-icon
              size="24"
            >
              mdi-account-group
            </v-icon>
          </v-list-item-action>
          <!-- <v-list-item-title v-t="'Switch Account'" /> -->
          <v-list-item-title>
            {{ $t('pages.billing.switchAccount') }}
          </v-list-item-title>
        </v-list-item>
        <app-switch-user-dialog
          ref="userDialogRef"
          :should-show="confirmDialogOpen"
          :title="'Available accounts'"
          :user="user"
          @close="confirmDialogOpen = false"
          @update:close="confirmDialogOpen = false"
        />
        <app-user-invite-dialog
          :should-show="inviteDialogOpen"
          :title="'User not Accepted'"
          @close="inviteDialogOpen = false"
          @update:close="inviteDialogOpen = false"
          @success="switchUserOnAcceptance"
          @reject="switchUserOnAcceptance"
        />
        <!--accounts list end -->
        <!-- Notification settings start-->
        <template v-if="user && user.accountUserSettings">
          <v-list-item
            v-if="
              user.accountUserSettings.showFeeTrackerDailySettings
            "
          >
            <v-list-item-icon>
              <v-icon
                size="28"
              >
                mdi-bell-outline
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('components.notification.notificationSettings') }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ $t('components.notification.notify') }}
              </v-list-item-subtitle>
              <v-sheet class="pa-5">
                <v-list-item-subtitle>
                  {{ $t('components.notification.feeChanges') }}
                </v-list-item-subtitle>
                <v-switch
                  v-model="
                    user.accountUserSettings.isFeeTrackerDailyFoundEmailEnabled
                  "
                  inset
                  :disabled="!isAdmin"
                  dense
                  change
                  height="5"
                  @change="updateSettings(user.accountUserSettings)"
                />

                <v-list-item-subtitle>
                  {{ $t('components.notification.noFeeChanges') }}
                </v-list-item-subtitle>
                <v-switch
                  v-model="
                    user.accountUserSettings
                      .isFeeTrackerDailyNotFoundEmailEnabled
                  "
                  :disabled="!isAdmin"
                  inset
                  dense
                  height="5"
                  @change="updateSettings(user.accountUserSettings)"
                />
              </v-sheet>
            </v-list-item-content>
          </v-list-item>
        </template>
        <v-divider />
        <!-- Notification settings end-->
        <v-list-item @click="toggleDarkModeHandler">
          <v-list-item-icon>
            <v-icon
              size="24"
            >
              mdi-theme-light-dark
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content v-t="'components.userMenu.toggleDarkMode'" />
        </v-list-item>
        <v-list-item @click="logout">
          <v-list-item-action>
            <v-icon
              size="24"
            >
              mdi-exit-to-app
            </v-icon>
          </v-list-item-action>
          <v-list-item-title v-t="'components.userMenu.logout'" />
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
  <v-skeleton-loader
    v-else
    type="button"
  />
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'

import type { Account, AccountUserSettings, User } from '@/client/users'
import AppSwitchUserDialog from '@/components/dialogs/AppSwitchUserDialog.vue'
import AppUserInviteDialog from '@/components/dialogs/AppUserInviteDialog.vue'
import { themes } from '@/plugins/vuetify-theme'

const namespaces = {
  app: 'app',
  auth: 'auth',
  user: 'user',
  toasts: 'toasts'
}
@Component({
  components: {
    AppSwitchUserDialog,
    AppUserInviteDialog
  }
})
export default class UserMenu extends Vue {
  @State('darkMode', { namespace: namespaces.app }) darkMode?: boolean;
  @Action('toggleDarkMode', { namespace: namespaces.app }) toggleDarkMode: any;
  @Action('updateaccountUserSettings', { namespace: namespaces.user })
  updateaccountUserSettings!: (opts: { userId: number, accountUserSettings: AccountUserSettings }) => Promise<void>;

  @Prop() readonly user!: User;

  @Getter('isAdmin', { namespace: namespaces.user }) isAdmin!: boolean;

  @Ref() readonly userDialogRef!: AppSwitchUserDialog

  selectedUser!: any;
  confirmDialogOpen = false;
  inviteDialogOpen = false;
  open = false;

  logout () {
    this.open = false
    this.$emit('logout')
  }

  toggleDarkModeHandler () {
    this.$setTheme(this.darkMode ? themes.light : themes.dark)
    this.toggleDarkMode()
    this.open = false
  }

  navigate () {
    this.open = false
    this.$router.push({
      name: 'profile'
    })
  }

  async updateSettings (accountSettings: AccountUserSettings) {
    const settings = (({ isFeeTrackerDailyFoundEmailEnabled, isFeeTrackerDailyNotFoundEmailEnabled }) => ({ isFeeTrackerDailyFoundEmailEnabled, isFeeTrackerDailyNotFoundEmailEnabled }))(accountSettings)
    await this.updateaccountUserSettings({ userId: accountSettings.userId as number, accountUserSettings: settings })
  }

  showSwitchUserDialog () {
    this.confirmDialogOpen = true
  }

  async switchUserOnClick (selectedUser: Account) {
    this.userDialogRef.selectedUser = selectedUser
    if (selectedUser?.currentAccountUser?.invitationStatus === 'INVITED') {
      this.inviteDialogOpen = true
    } else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.$refs.userDialogRef.switchUserFn(selectedUser)
      this.open = false
    }
  }

  switchUserOnAcceptance (invitationStatus: string) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.$refs.userDialogRef.invitationAct(invitationStatus)
    this.inviteDialogOpen = false
  }
}
</script>

<style>
.v-application--is-ltr .v-list-group--sub-group .v-list-group__header {
  padding-left: 16px !important;
}
.v-list-group.v-list-group--active.v-list-group--no-action.v-list-group--sub-group.primary--text
  .v-list-group__items {
  width: 100%;
}
.v-application--is-ltr
  .v-list-group--no-action.v-list-group--sub-group
  > .v-list-group__items
  > .v-list-item {
  padding-left: 16px !important;
}
</style>
