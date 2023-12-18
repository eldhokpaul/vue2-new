<template>
  <v-container
    class="page-container"
    fluid
  >
    <page-header :title="$t('routes.integrations')" />
    <v-row>
      <v-col>
        <v-card outlined>
          <v-tabs>
            <!-- <v-tab
              exact
              :to="{name: 'integrations'}"
              v-text="'Connected'"
            /> -->
            <v-tab
              exact
              :to="{name: 'integrationsApplications'}"
            >
              {{ $t('components.applications.applications') }}
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
export default class Integrations extends Vue {}
</script>
