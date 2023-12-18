<template>
  <v-dialog
    v-model="dialogOpen"
    max-width="680px"
  >
    <v-card
      outlined
      class="pa-4 text-center"
    >
      <img
        style="max-width:64px"
        :src="require('@/assets/amazon-icon.svg')"
      >
      <template v-if="!amazonProductSyncStatus.isCsvProcessed && amazonProductSyncStatus.isCsvProcessed !== null">
        <h2>{{ $t('components.amazonProductSyncDialog.syncInProgress') }}</h2>
        <p>{{ $t('components.amazonProductSyncDialog.checkLater') }}</p>
        <v-btn
          color="primary"
          depressed
          @click="dialogOpen = false"
        >
          {{ $t('components.amazonProductSyncDialog.close') }}
        </v-btn>
      </template>
      <template v-else-if="syncFinished && amazonProductSyncStatus.updatedAt">
        <h2>{{ $t('components.amazonProductSyncDialog.syncSuccessful') }}</h2>
        <p>{{ $t('components.amazonProductSyncDialog.syncSuccess', { value: formatDateString(amazonProductSyncStatus.updatedAt) }) }}</p>
      </template>
      <template v-else-if="!handleAmazonSyncTask.isActive">
        <h2>{{ $t('components.amazonProductSyncDialog.SyncProductsAmazon') }}</h2>
        <p>{{ $t('components.amazonProductSyncDialog.syncProductDescription') }}</p>
        <v-btn
          color="primary"
          depressed
          @click="handleAmazonSync"
        >
          {{ $t('components.amazonProductSyncDialog.startSync') }}
        </v-btn>
      </template>
      <template v-else-if="handleAmazonSyncTask.isActive">
        <v-progress-circular
          class="d-flex"
          style="margin: auto;"
          color="primary"
          :indeterminate="handleAmazonSyncTask.isActive"
        />
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import { Task } from '@/decorators/task'
import { formatDateString } from '@/utils/date'

@Component
export default class AmazonProductsSyncDialog extends Vue {
  @Action('syncAmazonProducts', { namespace: 'integrations' }) syncAmazonProducts!: () => Promise<void>
  @State('amazonProductSyncStatus', { namespace: 'integrations' }) amazonProductSyncStatus!: any
  @Action('getAmazonProductSyncStatus', { namespace: 'integrations' }) getAmazonProductSyncStatus!: () => Promise<void>

  formatDateString = formatDateString

  @Prop({ default: false })
  open!: boolean

  syncFinished = false

  get dialogOpen () {
    this.syncFinished = false
    return this.open
  }

  set dialogOpen (val: boolean) {
    this.$emit('setDialogOpen', val)
  }

  async beforeMount () {
    await this.getAmazonProductSyncStatus()
  }

  @Task('handleAmazonSyncTask')
  async handleAmazonSync () {
    try {
      await this.syncAmazonProducts()
      await this.getAmazonProductSyncStatus()
      this.syncFinished = true
    } catch (error) {
      this.$emit('dismiss:error')
    }
  }
}
</script>
