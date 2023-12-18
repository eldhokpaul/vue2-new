<template>
  <v-container
    class="page-container"
    fluid
  >
    <page-header title="Notifications" />
    <v-row>
      <v-col
        cols="12"
        md="8"
      >
        <v-card
          outlined
        >
          <v-container
            fluid
          >
            <notification-list />
          </v-container>
          <v-divider />
        </v-card>
      </v-col>
      <v-col
        md="4"
        cols="12"
      >
        <v-card
          v-if="isAdmin && user && user.accountUserSettings"
          outlined
          class="d-flex flex-column align-left"
          height="250"
        >
          <v-list-item>
            <v-list-item-icon>
              <v-icon
                class="mt-7"
                size="28"
                color="blue"
              >
                mdi-bell-outline
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title> {{ $t('components.notification.notificationSettings') }}</v-list-item-title>
              <v-list-item-subtitle>{{ $t('components.notification.notify') }}</v-list-item-subtitle>
              <v-sheet class="pa-5">
                <v-switch
                  v-model="
                    user.accountUserSettings.isFeeTrackerDailyFoundEmailEnabled
                  "
                  inset
                  dense
                  :disabled="!isAdmin"
                  change
                  height="5"
                  @change="updateSettings(user.accountUserSettings)"
                >
                  <template #label>
                    <v-list-item-subtitle> {{ $t('components.notification.feeChanges') }}</v-list-item-subtitle>
                  </template>
                </v-switch>

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
                >
                  <template #label>
                    <v-list-item-subtitle> {{ $t('components.notification.noFeeChanges') }}</v-list-item-subtitle>
                  </template>
                </v-switch>
              </v-sheet>
            </v-list-item-content>
          </v-list-item>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'

import type { AccountSettingsDto, AccountUserSettings } from '@/client/users'
import PageHeader from '@/components/PageHeader.vue'
import type { IUser } from '@/modules/user/types'

import NotificationList from '../components/NotificationList.vue'

const namespaces = {
  accountSettings: 'accountSettings',
  user: 'user'
}

@Component({
  components: {
    PageHeader,
    NotificationList
  }
})
export default class Notifications extends Vue {
  @Action('updateaccountUserSettings', { namespace: namespaces.user })
  updateaccountUserSettings!: (opts: {
    userId: number
    accountUserSettings: AccountUserSettings
  }) => Promise<void>;

  @Action('getAccountSettings', { namespace: namespaces.accountSettings }) getAccountSettings!: () => Promise<void>

  @State('user', { namespace: namespaces.user }) user?: IUser
  @State('accountSettings', { namespace: namespaces.accountSettings }) accountSettings!: AccountSettingsDto

  @Getter('isAdmin', { namespace: namespaces.user }) isAdmin!: boolean;

  async beforeMount () {
    await Promise.all([this.accountSettings ? null : this.getAccountSettings()])
  }

  async updateSettings (accountSettings: AccountUserSettings) {
    const settings = (({ isFeeTrackerDailyFoundEmailEnabled, isFeeTrackerDailyNotFoundEmailEnabled }) => ({ isFeeTrackerDailyFoundEmailEnabled, isFeeTrackerDailyNotFoundEmailEnabled }))(accountSettings)
    await this.updateaccountUserSettings({ userId: accountSettings.userId as number, accountUserSettings: settings })
  }
}
</script>

<style lang="scss" scoped>
.outlined {
  border: 1px solid rgb(216, 216, 216);
}
.item-height{
  height: 80px !important;
}

</style>
