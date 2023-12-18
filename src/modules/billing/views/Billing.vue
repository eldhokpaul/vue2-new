<template>
  <v-container
    class="page-container"
    fluid
  >
    <page-header :title="$t('routes.billing')" />
    <v-row>
      <v-col>
        <v-card
          outlined
          height="80vh"
        >
          <v-tabs>
            <v-tab
              exact
              :to="{name: 'billing'}"
            >
              {{ $t('pages.billing.billing') }}
            </v-tab>
            <v-tab
              exact
              :to="{name: 'billingSubscriptions'}"
            >
              {{ $t('pages.billing.history') }}
            </v-tab>
          </v-tabs>
          <v-divider />
          <router-view />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import PageHeader from '@/components/PageHeader.vue'

@Component({
  components: {
    PageHeader
  }
})
export default class Billing extends Vue {}
</script>
