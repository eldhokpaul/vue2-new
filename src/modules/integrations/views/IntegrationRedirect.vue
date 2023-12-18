<template>
  <v-overlay
    :dark="false"
    :value="overlay"
  >
    <v-card
      class="pa-5 text-center"
      max-width="680px"
    >
      <template
        v-if="!error"
      >
        <h1>
          {{ $t('components.integrationRedirect.authorizing') }}<span style="text-transform: capitalize">
            {{ integrationId }}
          </span> {{ $t('components.integrationRedirect.connection') }}
        </h1>
        <v-progress-circular
          class="mt-5 mb-3"
          indeterminate
          size="48"
          color="primary"
        />
        <!-- <p>{{ $route.query }}</p> -->
      </template>
      <template v-else>
        <h1>{{ $t('components.integrationRedirect.oops') }}</h1>
        <p>{{ error }}</p>
        <v-btn
          color="primary"
          depressed
          :to="{name:'integrations'}"
        >
          {{ $t('components.integrationRedirect.backtointegration') }}
        </v-btn>
      </template>
    </v-card>
  </v-overlay>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import { XeroSchema } from '../store'
import { IAmazonAuth } from '../type'

@Component
export default class IntegrationRedirect extends Vue {
  @Action('authorizeXero', { namespace: 'integrations' }) authorizeXero!: (xeroResponse: XeroSchema) => Promise<void>
  @Action('authorizeAmazon', { namespace: 'integrations' }) authorizeAmazon!: (amazonResponse: IAmazonAuth) => Promise<void>
  @Action('setMarketPlaceDefaultCurrency', { namespace: 'integrations' }) setMarketPlaceDefaultCurrency!: () => Promise<void>
  @Action('getAccountSettings', { namespace: 'accountSettings' }) getAccountSettings!: () => Promise<void>
  @Action('syncAmazonProducts', { namespace: 'integrations' }) syncAmazonProducts!: () => Promise<void>
  @Action('getAmazonProductSyncStatus', { namespace: 'integrations' }) getAmazonProductSyncStatus!: () => Promise<void>
  @Action('syncAccountCodesFromXero', { namespace: 'integrations' }) syncAccountCodesFromXero!: () => Promise<void>

  @Prop({ required: true })
  integrationId!: string | number

  overlay = true
  error = false

  async mounted () {
    try {
      switch (this.integrationId) {
        case 'xero':
          if (
            this.$route.query.code &&
            this.$route.query.state &&
            this.$route.query.scope &&
            this.$route.query.session_state
          ) {
            const xeroResponse: XeroSchema = {
              code: this.$route.query.code.toString(),
              scope: this.$route.query.scope.toString(),
              sessionState: this.$route.query.session_state.toString(),
              state: Number(this.$route.query.state)
            }
            await this.authorizeXero(xeroResponse)
            await this.syncAccountCodesFromXero()
            this.$router.push({
              name: 'integrations'
            })
          } else {
            throw new Error('Xero response query string not valid.')
          }
          break
        case 'amazon':
          if (
            this.$route.query.state &&
            this.$route.query.selling_partner_id &&
            this.$route.query.spapi_oauth_code
          ) {
            const amazonResponse: IAmazonAuth = {
              state: this.$route.query.state.toString(),
              sellingPartnerId: this.$route.query.selling_partner_id.toString(),
              authToken: this.$route.query.mws_auth_token?.toString(),
              code: this.$route.query.spapi_oauth_code.toString()
            }
            await this.authorizeAmazon(amazonResponse)
            await this.setMarketPlaceDefaultCurrency()
            await this.getAccountSettings()
            await this.syncAmazonProducts()
            await this.getAmazonProductSyncStatus()
            await this.$router.push({
              name: 'feeTrackerPro'
            })
          } else {
            throw new Error('Amazon response query string not valid.')
          }
          break
        default:
          throw new Error('Unknown integration, please try connecting with the integration again.')
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.error = error
    }
  }
}
</script>
