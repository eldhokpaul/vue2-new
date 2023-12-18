<template>
  <v-dialog
    :value="value"
    max-width="480px"
    @click:outside="$emit('input', false)"
  >
    <v-card
      outlined
      class="pt-3 pb-2"
    >
      <template v-if="!syncAccountCodeTask.isActive">
        <div class="px-4">
          <h1>{{ $t('components.xeroContactsSyncDialog.syncWithXero') }}</h1>
          <p>
            {{ $t('components.xeroContactsSyncDialog.sendAccountcode') }}
          </p>
        </div>
        <v-card-actions>
          <v-spacer />
          <v-btn
            depressed
            color="default"
            class="mr-2"
            @click="$emit('input', false)"
          >
            {{ $t('components.xeroContactsSyncDialog.cancel') }}
          </v-btn>
          <v-btn
            depressed
            color="primary"
            @click="syncAccountCodes"
          >
            {{ $t('components.xeroContactsSyncDialog.confirmSync') }}
          </v-btn>
        </v-card-actions>
      </template>
      <template v-else>
        <div class="px-4 text-center">
          <h1> {{ $t('components.xeroContactsSyncDialog.syncing') }}</h1>
          <v-progress-circular
            color="primary"
            :indeterminate="syncAccountCodeTask.isActive"
          />
        </div>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import { Task } from '@/decorators/task'

@Component
export default class AccountCodeSyncDialog extends Vue {
  @Prop({ required: true })
  value!: boolean

  @Action('syncAccountCodesFromXero', { namespace: 'integrations' }) syncAccountCodesFromXero!: () => Promise<void>

  @Task('syncAccountCodeTask')
  async syncAccountCodes () {
    await this.syncAccountCodesFromXero()
    this.$emit('input', false)
    this.$emit('sync-complete')
  }
}
</script>
