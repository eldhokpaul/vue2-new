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
                {{ $t('pages.setupIntegration.marketPlace') }}
              </strong>
            </v-list-item-title>
            <v-card
              tile
              flat
            >
              <v-card-text>
                <v-radio-group
                  v-model="selectedRadioButton"
                >
                  <v-radio
                    v-for="(radio, radioIndex) in radioButtons"
                    :key="radioIndex"
                    :readonly="radio.readonly"
                    :disabled="radio.readonly"
                    :value="radio.value"
                    color="primary"
                    dense
                  >
                    <template slot="label">
                      <strong>
                        {{ radio.label }}
                      </strong>
                    </template>
                  </v-radio>
                </v-radio-group>
              </v-card-text>
            </v-card>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              <strong>
                {{ $t('pages.setupIntegration.openAccount') }}
              </strong>
            </v-list-item-title>
            <!-- <div class="pa-3">
                <v-alert
                  outlined
                  color="primary"
                >
                  In a seperate Browser Tab,please login to your Main Seller Central Account, or click here.You will need to use your Primary User Login Credentials.
                </v-alert>
              </div> -->
            <p class="pa-4 text--secondary font-weight-medium">
              {{ $t('pages.setupIntegration.mainAccountLogin') }}
            </p>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              <strong>
                {{ $t('pages.setupIntegration.authorizeApi') }}
              </strong>
            </v-list-item-title>
            <!-- <div class="pa-3">
                <v-alert
                  color="primary"
                  outlined
                >
                  Once you are logged into your Seller Central Account,you need to grant SellerVue access to your store data by clicking on the AUTHORIZE button on the right.
                </v-alert>
              </div> -->
            <p class="pa-4 text--secondary font-weight-medium">
              {{ $t('pages.setupIntegration.grantAccess') }}
            </p>
          </v-list-item-content>
        </v-list-item>
        <v-card
          class="pa-2"
          elevation="0"
        >
          <v-card-actions class="pa-0 ma-0">
            <v-btn
              class="ma-1"
              plain
              @click="skipStep"
            >
              <v-icon>
                mdi-logout
              </v-icon>Skip
            </v-btn>
            <v-spacer />
            <div
              v-for="integration in integrations"
              :key="integration.id"
            >
              <v-btn
                :disabled="!!integration.connectionObject.length"
                depressed
                exact
                color="primary"
                @click="openDialog(integration)"
              >
                {{ $t('pages.setupIntegration.authorize') }}
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import type { IAmazonClientDetails } from '@/modules/integrations/type'

const namespaces = {
  integrations: 'integrations',
  accountSettings: 'accountSettings'
}

@Component
export default class SetUpIntegration extends Vue {
  @Action('getAmazonIntegrationDetails', { namespace: namespaces.integrations }) getAmazonIntegrationDetails!: () => Promise<void>
  @State('userAmazonIntegrationDetails', { namespace: namespaces.integrations }) userAmazonIntegrationDetails!: any
  @Action('getAmazonClientDetails', { namespace: namespaces.integrations }) getAmazonClientDetails!: () => Promise<void>
  @State('amazonClientDetails', { namespace: namespaces.integrations }) amazonClientDetails!: IAmazonClientDetails
  e1= 2
  selectedRadioButton= 1

  radioButtons= [
    { label: 'USA Marketplace', value: 1, readonly: false },
    { label: 'North American Marketplace - Coming Soon', value: 2, readonly: true },
    { label: 'UK Marketplace - Coming Soon', value: 3, readonly: true },
    { label: 'Europe Marketplace - Coming Soon', value: 4, readonly: true },
    { label: 'India Marketplace - Coming Soon', value: 5, readonly: true },
    { label: 'U.A.E Marketplace - Coming Soon', value: 6, readonly: true },
    { label: 'Far East(Australia) - Coming Soon', value: 7, readonly: true }
  ]

  selectedIntegration = null

  skipStep () {
    this.$emit('skip', this.e1)
  }

  async initialLoad () {
    await this.getAmazonClientDetails()
    await this.getAmazonIntegrationDetails()
  }

  beforeMount () {
    this.initialLoad()
  }

  get integrations () {
    return [
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
    window.open(integration.url,
      '_blank')
    this.$emit('skip', this.e1)
  }
}
</script>
