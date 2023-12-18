<template>
  <div>
    <v-form
      ref="form"
      v-model="valid"
      @submit.prevent="validate"
    >
      <form-builder
        :data="accountSettingsFormData"
        :form-inputs="accountSettingsInput"
      />
      <!-- <v-subheader
        v-t="'components.accountSettingsForm.ordersAndShipments'"
      /> -->

      <h4
        v-t="'components.accountSettingsForm.ordersAndShipments'"
        class="subtitle-1"
      />
      <v-checkbox
        v-model="archiveWhenClosed"
        :label="$t('components.accountSettingsForm.archieveClosed')"
      />
      <v-text-field
        v-model="accountSettingsFormData.archiveClosedOrdersAndShipmentPlansInDays"
        outlined
        :disabled="archiveWhenClosed"
        dense
        type="number"
        :label="$t('components.accountSettingsForm.archieveDays')"
      />
      <div class="d-flex justify-end align-center">
        <v-btn
          v-t="'components.accountSettingsForm.saveSettings'"
          type="submit"
          color="primary"
          depressed
        />
      </div>
    </v-form>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import type { AccountSettingsDto } from '@/client/users'
import FormBuilder from '@/components/FormBuilder/FormBuilder.vue'

import { ICurrency } from '../types'

@Component({
  components: {
    FormBuilder
  }
})

export default class AccountSettingsForm extends Vue {
  @Prop({ required: true }) accountSettings!: AccountSettingsDto
  @Prop({ required: true }) currencies!: ICurrency[]

  valid = false
  accountSettingsFormData!:AccountSettingsDto
  archiveWhenClosed=false
  // accountSettingsFormData = { ...this.accountSettings }
  // archiveWhenClosed=!this.accountSettingsFormData.archiveClosedOrdersAndShipmentPlansInDays

  validate () {
    const { form } = this.$refs as HTMLFormElement
    form.validate()
    if (this.valid) {
      this.$emit('submit', { ...this.accountSettingsFormData, archiveClosedOrdersAndShipmentPlansInDays: this.archiveWhenClosed ? 0 : this.accountSettingsFormData.archiveClosedOrdersAndShipmentPlansInDays })
    }
  }

  async beforeMount () {
    this.accountSettingsFormData = { ...this.accountSettings }
    this.archiveWhenClosed = !this.accountSettingsFormData.archiveClosedOrdersAndShipmentPlansInDays
  }

  get rules () {
    return {
      required: [
        (v: string) => !!v || this.$t('pages.errors.rules.fieldRequired')
      ]
    }
  }

  get accountSettingsInput () {
    return [
      {
        model: 'accountName',
        type: 'text',
        props: {
          label: this.$t('components.accountSettingsForm.accountName'),
          autofocus: true,
          required: true,
          rules: this.rules.required
        }
      },
      {
        model: 'currency.id',
        type: 'select',
        props: {
          rules: this.rules.required,
          label: this.$t('components.accountSettingsForm.currency'),
          required: true,
          items: this.currencies?.map((c) => ({
            label: c.currencyName,
            value: c.id
          }))
        }
      }
    ]
  }
}
</script>
