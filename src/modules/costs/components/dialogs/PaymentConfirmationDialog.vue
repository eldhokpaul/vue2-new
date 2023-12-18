<template>
  <v-dialog
    v-model="shouldShow"
    width="600"
    @click:outside="$emit('update:close')"
  >
    <v-card>
      <v-card-title v-t="title" />
      <v-divider />

      <v-container>
        <v-row class="px-0">
          <v-card-text
            v-t="details"
            class="font-weight-medium"
          />
          <v-col
            cols="12"
          >
            <v-text-field
              v-model="value.paymentReference"
              class="pa-2"
              outlined
              autofocus
              counter="200"
              right
              dense
              :label="$t('components.PayablesTable.page.transactionReferenceNumber')"
              :messages="$t('components.PayablesTable.page.optional')"
            />
            <v-row>
              <v-col
                cols="11"
              >
                <v-select
                  v-model="value.paidFromAccount.id"
                  :items="payFromAccountCode"
                  class="py-2 pl-2"
                  item-text="name"
                  item-value="id"
                  :label="$t('components.PayablesTable.page.payFrom')"
                  required
                  outlined
                  dense
                />
              </v-col>
              <v-col
                cols="1"
              >
                <v-tooltip top>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      color="primary"
                      class="mt-3 ml-n3"
                      icon
                      @click="$emit('sync:account-code')"
                      v-on="on"
                    >
                      <v-icon>mdi-cached</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('components.PayablesTable.page.syncAccount') }} </span>
                </v-tooltip>
              </v-col>
            </v-row>
            <v-checkbox
              v-model="value.confirmation"
              class="pa-2 font-weight-medium"
              :label="$t('components.PayablesTable.page.confirmation')"
            />
          </v-col>
        </v-row>
      </v-container>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          v-t="'components.appConfirmationDialog.cancel'"
          text
          color="grey"
          @click="$emit('close')"
        />
        <v-btn
          v-t="'components.appConfirmationDialog.confirm'"
          color="primary"
          depressed
          :loading="isActive"
          @click="$emit('confirm')"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import type { AccountCode } from '@/client/invoices'

@Component
export default class PaymentConfirmationDialog extends Vue {
  @Prop({ required: true })value!: any
  @Prop({ required: true })payFromAccountCode!: AccountCode[]
  @Prop() shouldShow!: boolean
  @Prop({ default: false }) isActive!: boolean
  @Prop({ default: 'components.appConfirmationDialog.confirm' }) title!: string
  @Prop({ default: 'components.PayablesTable.page.confirmText' }) details!: string
}
</script>
