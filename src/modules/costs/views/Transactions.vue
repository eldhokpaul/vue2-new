<template>
  <v-container
    fluid
  >
    <!-- <page-header :title="'Transactions'" /> -->
    <v-row>
      <v-col>
        <v-card
          outlined
          height="88vh"
        >
          <v-tabs>
            <v-tab
              exact
              :to="{name: 'bills'}"
            >
              {{ $t('components.BillsTable.headers.bills') }}
            </v-tab>
            <v-tab
              exact
              :to="{name: 'payables'}"
            >
              {{ $t('components.PayablesTable.headers.payables') }}
            </v-tab>
            <v-tab
              exact
              :to="{name: 'assignedCosts'}"
            >
              {{ $t('components.costsTable.headers.costs') }}
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
export default class Transactions extends Vue {}
</script>
