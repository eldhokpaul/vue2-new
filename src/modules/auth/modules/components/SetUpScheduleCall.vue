<template>
  <v-card
    tile
    flat
    width="100%"
  >
    <v-card-text>
      <v-list>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              <strong>
                {{ $t('pages.setupScheduleCall.inviteRecovery') }}
              </strong>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-list-item-action-text class="pa-3">
              {{ $t('pages.setupScheduleCall.accountAccess') }}
            </v-list-item-action-text>
            <v-list-item-action>
              <v-btn
                depressed
                color="primary"
                @click="inviteSupportUser"
              >
                {{ $t('pages.setupScheduleCall.inviteSupport') }}
              </v-btn>
            </v-list-item-action>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              <strong>
                {{ $t('pages.setupScheduleCall.bookCall') }}
              </strong>
            </v-list-item-title>
            <div
              id="calendlyDiv"
              data-auto-load="true"
              class="calendly-inline-widget"
              style="min-width:340px;height:580px;"
            />
          </v-list-item-content>
        </v-list-item>
        <v-card
          class="pa-2"
          tile
          flat
        >
          <v-card-actions class="pa-0 ma-0">
            <v-btn
              class="ma-1"
              plain
              @click="navigate"
            >
              <v-icon>
                mdi-logout
              </v-icon>{{ $t('pages.setupScheduleCall.skip') }}
            </v-btn>
            <v-spacer />

            <v-btn
              depressed
              exact
              color="primary"
              @click="navigate"
            >
              {{ $t('pages.setupScheduleCall.done') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'

import type { AccountUserUpdateDto, User } from '@/client/users'
const namespaces = {
  users: 'users'
}
@Component({
  components: { }
})

export default class SetUpScheduleCall extends Vue {
@Getter('isManagementSectionEnabled', { namespace: 'accountSettings' }) isManagementSectionEnabled!: boolean
@State('user', { namespace: 'user' }) user!: User
@Action('inviteUser', { namespace: namespaces.users }) inviteUser!: (opts: {userId: number, accountUser: AccountUserUpdateDto}) => Promise<void>;

e1=3
mounted () {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const calendly = window.Calendly
  if (calendly && this.user && this.user.email) {
    const name = this.user.firstName ? this.user.firstName : '' + this.user.lastName ? this.user.lastName : ''
    calendly.initInlineWidget({
      url: 'https://calendly.com/sellervue-demo/growth-strategy-session',
      parentElement: document.getElementById('calendlyDiv'),
      prefill: {
        name: name?.trim(),
        email: this.user.email
      }
    })
  }
}

async inviteSupportUser () {
  const formData = { accountRoles: [], email: process.env?.VUE_APP_INVITE_SUPPORT }
  await this.inviteUser({ userId: this.user.id as number, accountUser: formData })
}

async navigate () {
  !this.isManagementSectionEnabled
    ? this.$router.replace({ name: 'feeTrackerPro' })
    : this.$route.query.path
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      ? this.$router.replace(this.$route.query.path)
      : this.$router.replace({ name: 'dashboard' })
}
}
</script>
