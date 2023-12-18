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
      <template v-if="!syncSupplierTask.isActive">
        <div class="px-4">
          <h1>{{ $t('components.xeroContactsSyncDialog.syncWithXero') }}</h1>

          <p v-if="supplier">
            >{{ $t('components.xeroContactsSyncDialog.thisWillSend') }}{{ supplier.companyName }}>{{ $t('components.xeroContactsSyncDialog.areYouSure') }}
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
            {{ $t('components.appConfirmationDialog.cancel') }}
          </v-btn>
          <v-btn
            depressed
            color="primary"
            @click="syncSupplier"
          >
            {{ $t('components.xeroContactsSyncDialog.confirmSync') }}
          </v-btn>
        </v-card-actions>
      </template>
      <template v-else>
        <div class="px-4 text-center">
          <h1>{{ $t('components.xeroContactsSyncDialog.syncing') }}</h1>
          <v-progress-circular
            color="primary"
            :indeterminate="syncSupplierTask.isActive"
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

import type { Supplier } from '@/client/xero'
import { Task } from '@/decorators/task'

@Component
export default class SupplierSyncDialog extends Vue {
  @Action('createOrUpdateXeroContact', { namespace: 'integrations' }) createOrUpdateXeroContact!: (Supplier: Array<Supplier>) => Promise<void>

  @Prop({ required: true })
  value!: boolean

  @Prop({ required: true })
  supplier!: Supplier

  @Task('syncSupplierTask')
  async syncSupplier () {
    await this.createOrUpdateXeroContact([this.supplier])
    this.$emit('sync-complete')
    this.$emit('input', false)
  }
}
</script>
