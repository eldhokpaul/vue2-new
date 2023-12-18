<template>
  <v-container
    class="page-container"
    fluid
  >
    <template v-if="initialLoadTask.isActive">
      <v-skeleton-loader type="table" />
    </template>
    <template v-else>
      <page-header :title="$t('routes.connected')" />
      <v-row>
        <v-col>
          <v-card
            class="pa-3"
            outlined
          >
            <v-container fluid />
          </v-card>
        </v-col>
      </v-row>
    </template>
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
export default class Connected extends Vue {
}
</script>
