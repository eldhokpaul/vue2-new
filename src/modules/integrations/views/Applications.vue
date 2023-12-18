<template>
  <v-container
    class="page-container"
    fluid
  >
    <template v-if="initialLoadTask.isActive">
      <v-skeleton-loader type="table" />
    </template>
    <template v-else>
      <v-row class="mt-2">
        <v-col cols="12">
          <v-card
            outlined
            class="pa-0 ma-0"
            color="light"
          >
            <v-container
              class="pa-0 ma-0"
              fluid
            >
              <v-row no-gutters>
                <v-col
                  cols="12"
                  md="7"
                  lg="8"
                >
                  <div
                    class="pa-4"
                    style="max-width: 580px;"
                  >
                    <h1>{{ $t('components.applications.workapps') }}</h1>
                    <p>{{ $t('components.applications.integrationandmore') }}</p>
                  </div>
                </v-col>
                <v-col
                  v-if="$vuetify.breakpoint.mdAndUp"
                  cols="12"
                  md="5"
                  lg="4"
                  class="pa-0 ma-0 text-right"
                  style="overflow:hidden;"
                >
                  <img
                    src="@/assets/integrations.png"
                    height="100%"
                    class="mr-4"
                  >
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-container
            class="pa-0"
            fluid
          >
            <v-row>
              <v-col
                v-for="integration in integrations"
                :key="integration.id"
                cols="12"
                md="6"
                lg="3"
              >
                <v-card
                  class="pa-3"
                  outlined
                >
                  <div class="d-flex">
                    <v-avatar class="mr-2">
                      <img
                        :src="integration.icon"
                      >
                    </v-avatar>
                    <div class="d-flex flex-column">
                      <h3
                        class="font-weight-medium"
                        v-text="integration.name"
                      />
                      <p
                        class="secondary--text"
                        v-text="integration.category"
                      />
                    </div>
                  </div>
                  <p
                    v-text="integration.description"
                  />
                  <v-btn
                    v-if="!integration.connectionObject.length"
                    color="primary"
                    depressed
                    block
                    @click="openDialog(integration)"
                  >
                    {{ $t('components.applications.connect') }}
                  </v-btn>
                  <v-btn
                    v-else
                    color="error"
                    depressed
                    block
                    @click="openDisconnectDialog(integration)"
                  >
                    {{ $t('components.applications.disconnect') }}
                  </v-btn>
                </v-card>
              </v-col>
              <v-col
                cols="12"
                md="6"
                lg="3"
              >
                <v-card
                  class="pa-3"
                  outlined
                >
                  <div class="d-flex">
                    <v-avatar
                      class="mr-2 white--text"
                      color="primary"
                    >
                      {{ $t('components.applications.sv') }}
                    </v-avatar>
                    <div class="d-flex flex-column">
                      <h3
                        class="font-weight-medium"
                        v-text="$t('components.applications.more')"
                      />
                      <p
                        v-text="$t('components.applications.hearfromyou')"
                      />
                    </div>
                  </div>
                  <p
                    v-text="$t('components.applications.integrate')"
                  />
                  <v-btn
                    color="primary"
                    depressed
                    block
                    href="mailto:suppor@sellervue.com"
                  >
                    {{ $t('components.applications.getintouch') }}
                  </v-btn>
                </v-card>
              </v-col>
              <v-col
                v-if="!isXeroConnectivityEnabled"
                cols="12"
                md="6"
                lg="3"
              >
                <v-card
                  class="pa-3"
                  outlined
                >
                  <div class="d-flex">
                    <v-avatar class="mr-2">
                      <img
                        src="@/assets/xero.svg"
                      >
                    </v-avatar>
                    <div class="d-flex flex-column">
                      <h3
                        class="font-weight-medium"
                        v-text="$t('components.applications.xero')"
                      />
                      <p
                        v-text="$t('components.applications.accounting')"
                      />
                    </div>
                  </div>
                  <p
                    v-text="$t('components.applications.xeroaccounting')"
                  />
                  <v-btn
                    color="primary"
                    depressed
                    block
                    href="mailto:suppor@sellervue.com"
                  >
                    {{ $t('components.applications.xerointegration') }}
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
      <integration-dialog
        :open="dialogOpen"
        :integration="selectedIntegration"
        @setDialogOpen="val => dialogOpen = val"
      />
      <disconnect-integration-dialog
        :open="disconnectDialogOpen"
        :integration="selectedIntegration"
        @setDialogOpen="val => disconnectDialogOpen = val"
        @disconnectIntegration="disconnectIntegration"
      />
    </template>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import type { AccountSettingsDto } from '@/client/users'
import PageHeader from '@/components/PageHeader.vue'
import { Task } from '@/decorators/task'

import DisconnectIntegrationDialog from '../components/DisconnectIntegrationDialog.vue'
import IntegrationDialog from '../components/IntegrationDialog.vue'
import type { IAmazonClientDetails } from '../type'

const namespaces = {
  integrations: 'integrations',
  accountSettings: 'accountSettings'
}

@Component({
  components: {
    PageHeader,
    IntegrationDialog,
    DisconnectIntegrationDialog
  }
})
export default class Applications extends Vue {
  @Action('getXeroClientReqUrl', { namespace: namespaces.integrations }) getXeroClientReqUrl!: () => Promise<any>
  @Action('disconnectXeroIntegration', { namespace: namespaces.integrations }) disconnectXeroIntegration!: () => Promise<any>
  @State('xeroClientReqUrl', { namespace: namespaces.integrations }) xeroClientReqUrl!: any
  @Action('getUserXeroIntegrationDetails', { namespace: namespaces.integrations }) getUserXeroIntegrationDetails!: () => Promise<any>
  @State('userXeroIntegrationDetails', { namespace: namespaces.integrations }) userXeroIntegrationDetails!: any
  @State('userAmazonIntegrationDetails', { namespace: namespaces.integrations }) userAmazonIntegrationDetails!: any
  @Action('getAmazonClientDetails', { namespace: namespaces.integrations }) getAmazonClientDetails!: () => Promise<void>
  @State('amazonClientDetails', { namespace: namespaces.integrations }) amazonClientDetails!: IAmazonClientDetails
  @Action('disconnectAmazonIntegration', { namespace: namespaces.integrations }) disconnectAmazonIntegration!: () => Promise<void>
  @Action('getAmazonIntegrationDetails', { namespace: namespaces.integrations }) getAmazonIntegrationDetails!: () => Promise<void>
  @State('accountSettings', { namespace: namespaces.accountSettings }) accountSettings!: AccountSettingsDto

  @Task('initialLoadTask')
  async initialLoad () {
    await this.getAmazonClientDetails()
    await this.getUserXeroIntegrationDetails()
    await this.getXeroClientReqUrl()
    await this.getAmazonIntegrationDetails()
  }

  beforeMount () {
    this.initialLoad()
  }

  selectedIntegration = null
  dialogOpen = false
  disconnectDialogOpen = false

  get integrations () {
    return [{
      id: 0,
      name: 'Xero',
      category: 'Accounting',
      description: "Seamlessly connect Xero's online capabilities with SellerVue.",
      disconnect: "Disconnecting Xero from SellerVue means you won't be able to sync contacts or push bills to and from Xero anymore. Are you sure you want to disconnect?",
      icon: require('@/assets/xero.svg'),
      url: this.xeroReqUrl,
      // url: `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${this.xeroClientId}&redirect_uri=${this.xeroRedirectUrl}&scope=${this.xeroScopes}&state=${this.xeroState}`,
      connectionObject: this.userXeroIntegrationDetails,
      dialogButton: 'Connect with Xero',
      isEnable: this.$flags.XERO_ENABLED && this.isXeroConnectivityEnabled
    },
    {
      id: 1,
      name: 'Amazon',
      category: 'Product',
      description: "Seamlessly connect Amazon's online capabilities with SellerVue.",
      disconnect: "Disconnecting Amazon from SellerVue means you won't be able to sync products from Amazon anymore. Are you sure you want to disconnect?",
      icon: require('@/assets/amazon-icon.svg'),
      url: `https://sellercentral.amazon.com/apps/authorize/consent?application_id=${this.amazonApplicationId}&redirect_uri=${this.amazonRedirectUrl}&state=${this.amazonSessionState}&version=beta`,
      connectionObject: this.userAmazonIntegrationDetails,
      dialogButton: 'Connect with Amazon',
      isEnable: this.$flags.AMAZON_ENABLED
    }].filter(item => item.isEnable)
  }

  get isXeroConnectivityEnabled (): boolean {
    return this.accountSettings?.isXeroConnectivityEnabled || false
  }

  get xeroReqUrl (): string {
    return this.xeroClientReqUrl
  }

  // get xeroClientId (): string {
  //   return this.xeroClientDetails?.clientId
  // }

  // get xeroRedirectUrl (): string {
  //   return this.xeroClientDetails?.redirectUrl
  // }

  // get xeroScopes (): string {
  //   return this.xeroClientDetails?.scopes.join(' ')
  // }

  // get xeroState (): string {
  //   return this.xeroClientDetails?.state
  // }

  get amazonApplicationId (): string {
    return this.amazonClientDetails?.applicationId
  }

  get amazonRedirectUrl (): string {
    return process.env.VUE_APP_AMAZON_REDIRECTION_URL
  }

  get amazonSessionState (): number {
    return this.amazonClientDetails?.sessionState
  }

  openDialog (integration: any) {
    this.selectedIntegration = integration
    this.dialogOpen = true
  }

  openDisconnectDialog (integration: any) {
    this.selectedIntegration = integration
    this.disconnectDialogOpen = true
  }

  @Task('disconnectIntegrationTask')
  async disconnectIntegration (integration: any) {
    if (integration.name === 'Xero') {
      await this.disconnectXeroIntegration()
      this.disconnectDialogOpen = false
      await this.initialLoad()
    } else if (integration.name === 'Amazon') {
      await this.disconnectAmazonIntegration()
      this.disconnectDialogOpen = false
      await this.initialLoad
    }
  }
}
</script>
