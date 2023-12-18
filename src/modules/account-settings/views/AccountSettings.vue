<template>
  <v-container
    class="page-container"
    fluid
  >
    <page-header :title="$t('routes.accountSettings')" />
    <v-skeleton-loader
      v-if="initialLoadTask.isActive"
      type="table"
    />
    <template v-else>
      <v-row>
        <v-col md="6">
          <v-card outlined>
            <v-container fluid>
              <v-row>
                <v-col>
                  <account-settings-form
                    :account-settings="accountSettings"
                    :currencies="currencies"
                    @submit="submit"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="isXeroConnectivityEnabled && userXeroIntegrationDetails.length">
        <v-col md="6">
          <v-card outlined>
            <v-card-title v-t="'pages.accountSettings.xero'" />
            <v-row class="d-flex justify-space-between mb-3">
              <v-col>
                <div
                  class="pl-4"
                >
                  <p>{{ $t('pages.accountSettings.syncXero') }}</p>
                </div>
              </v-col>
              <v-col>
                <!-- <v-card-actions> -->
                <v-btn
                  color="primary"
                  outlined
                  class="float-right mr-4 mt-n4"
                  large
                  @click="showSyncDialog=true"
                >
                  <v-img
                    width="30px"
                    max-width="30px"
                    class="mr-2"
                    :src="require('@/assets/xero.svg')"
                  />
                  {{ $t('pages.accountSettings.sync') }}
                </v-btn>
                <!-- </v-card-actions> -->
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </template>
    <account-code-sync-dialog
      v-model="showSyncDialog"
      @sync-complete="initialLoad"
    />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import type { AccountSettingsDto } from '@/client/users'
import AccountCodeSyncDialog from '@/components/AccountCodeSyncDialog.vue'
import PageHeader from '@/components/PageHeader.vue'
import { Task } from '@/decorators/task'

import AccountSettingsForm from '../components/AccountSettingsForm.vue'
import { ICurrency } from '../types'

const namespaces = {
  products: 'products',
  user: 'user',
  toasts: 'toasts',
  accountSettings: 'accountSettings',
  integrations: 'integrations'
}

@Component({
  components: {
    PageHeader,
    AccountSettingsForm,
    AccountCodeSyncDialog
  }
})

export default class AccountSettings extends Vue {
  @Action('updateAccountSettings', { namespace: namespaces.accountSettings }) updateAccountSettings!: (settings: AccountSettingsDto) => any
  @Action('getCurrencies', { namespace: namespaces.accountSettings }) getCurrencies!: () => Promise<ICurrency[]>
  @Action('getAccountSettings', { namespace: namespaces.accountSettings }) getAccountSettings!: () => Promise<void>
  @Action('syncAccountCodesFromXero', { namespace: namespaces.integrations }) syncAccountCodesFromXero!: () => Promise<void>
  @Action('getUserXeroIntegrationDetails', { namespace: namespaces.integrations }) getUserXeroIntegrationDetails!: () => Promise<any>

  @State('accountSettings', { namespace: namespaces.accountSettings }) accountSettings!: AccountSettingsDto
  @State('currencies', { namespace: namespaces.accountSettings }) currencies!: ICurrency[]
  @State('userXeroIntegrationDetails', { namespace: namespaces.integrations }) userXeroIntegrationDetails!: any

  showSyncDialog = false

  @Task('initialLoadTask')
  async initialLoad () {
    await Promise.all([this.getCurrencies(), this.getAccountSettings(), this.getUserXeroIntegrationDetails()])
  }

  async beforeMount () {
    await this.initialLoad()
  }

  get isXeroConnectivityEnabled (): boolean {
    return this.accountSettings?.isXeroConnectivityEnabled || false
  }

  async submit (settings: AccountSettingsDto) {
    const selectedCurrency = this.currencies?.find(item => item.id === settings?.currency?.id)
    const updatedSettings = {
      accountName: settings.accountName,
      currency: selectedCurrency,
      archiveClosedOrdersAndShipmentPlansInDays: Number(settings.archiveClosedOrdersAndShipmentPlansInDays)
    }
    await this.updateAccountSettings(updatedSettings)
    await this.$router.push({
      name: 'dashboard'
    })
  }
}
</script>
