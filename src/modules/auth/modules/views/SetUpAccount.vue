<template>
  <v-col class="d-flex align-center justify-center flex-column">
    <app-logo
      v-if="!$vuetify.breakpoint.mdAndUp"
      width="280px"
      class="mb-5"
      :primary="true"
    />
    <v-card
      width="100%"
      max-width="900px"
    >
      <v-stepper
        v-model="e1"
        width="100%"
        flat
        tile
        class="no-transition"
      >
        <v-stepper-header>
          <v-stepper-step
            :complete="e1 > 1"
            step="1"
          >
            <strong>
              {{ $t('pages.setupAccount.upload') }}
            </strong>
          </v-stepper-step>

          <v-divider />

          <v-stepper-step
            :complete="e1 > 2"
            step="2"
          >
            <strong>
              {{ $t('pages.setupAccount.apiAuthorization') }}
            </strong>
          </v-stepper-step>

          <v-divider />

          <v-stepper-step
            step="3"
          >
            <strong>
              {{ $t('pages.setupAccount.bookCall') }}
            </strong>
          </v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
          <v-stepper-content :step="1">
            <set-up-product-upload
              @skip="handleSkipStep"
            />
          </v-stepper-content>
          <v-stepper-content :step="2">
            <set-up-integration
              @skip="handleSkipStep"
            />
          </v-stepper-content>
          <v-stepper-content :step="3">
            <set-up-schedule-call />
          </v-stepper-content>
          <p
            class="d-flex align-center justify-center pa-3"
          >
            <strong>
              {{ $t('pages.setupAccount.support') }}
            </strong>
          </p>
        </v-stepper-items>
      </v-stepper>
    </v-card>
  </v-col>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'

import AppLogo from '@/components/AppLogo.vue'

import SetUpIntegration from '../components/SetUpIntegration.vue'
import SetUpProductUpload from '../components/SetUpProductUpload.vue'
import SetUpScheduleCall from '../components/SetUpScheduleCall.vue'

@Component({
  components: {
    AppLogo,
    SetUpIntegration,
    SetUpProductUpload,
    SetUpScheduleCall
  }
})

export default class SetUpAccount extends Vue {
@Action('clearToken', { namespace: 'auth' }) clearToken: any
@Action('clearUser', { namespace: 'user' }) clearUser: any
@Getter('jwt', { namespace: 'auth' }) token?: string
@State('user', { namespace: 'user' }) user!: any
@Action('getUser', { namespace: 'user' }) getUser: any
@Action('getUserSubscriptionByUserId', { namespace: 'user' }) getUserSubscriptionByUserId: any
@Action('getAccountSettings', { namespace: 'accountSettings' }) getAccountSettings!: () => Promise<void>
@Action('disconnectEventSource', { namespace: 'notifications' }) disconnectEventSource!: () => Promise<void>;
e1= 1

async mounted () {
  if (!this.token) {
    await this.clearUserData()
  }
  if (!this.user) {
    await this.clearUserData()
  }
  // ensure user is authenticated
  if (!this.token) {
    this.$router.replace({ name: 'authLogin' })
  }
  await this.getUser()
  await this.getUserSubscriptionByUserId(this.user?.id)
  await this.getAccountSettings()
}

async clearUserData () {
  await this.clearToken()
  await this.clearUser()
  await this.disconnectEventSource()
}

handleSkipStep (step: number) {
  this.e1 = step + 1
}
}
</script>
