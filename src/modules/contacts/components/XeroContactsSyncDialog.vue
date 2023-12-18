<template>
  <v-dialog
    :value="value"
    max-width="680px"
    @click:outside="$emit('input', false)"
  >
    <v-card
      outlined
      class="pa-4 text-center"
    >
      <img
        style="max-width:64px"
        :src="require('@/assets/xero.svg')"
      >
      <template v-if="!handleXeroSyncTask.isActive">
        <h2>{{ $t('components.xeroContactsSyncDialog.syncContact') }}</h2>
        <p>{{ $t('components.xeroContactsSyncDialog.sync') }}</p>
        <v-btn
          color="primary"
          depressed
          @click="handleXeroSync"
        >
          {{ $t('components.xeroContactsSyncDialog.startSync') }}
        </v-btn>
      </template>
      <template v-else>
        <h2>{{ $t('components.xeroContactsSyncDialog.progress') }}</h2>
        <v-progress-circular
          class="d-flex"
          style="margin: auto;"
          color="primary"
          :indeterminate="handleXeroSyncTask.isActive"
        />
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import { Task } from '@/decorators/task'

@Component
export default class XeroContactsSyncDialog extends Vue {
  @Action('syncSuppliersFromXero', { namespace: 'integrations' }) syncSuppliersFromXero!: () => Promise<void>

  @Prop({ required: true })
  value!: boolean

  @Task('handleXeroSyncTask')
  async handleXeroSync () {
    try {
      await this.syncSuppliersFromXero()
      this.$emit('xero:sync-complete')
      this.$emit('input', false)
    } catch (error) {
    }
  }
}
</script>
