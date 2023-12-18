<template>
  <v-dialog
    v-model="shouldShow"
    width="600"
    @click:outside="$emit('update:close')"
  >
    <v-form
      ref="form"
      v-model="valid"
      @submit.prevent="validate"
    >
      <v-card>
        <v-card-title v-t="title" />
        <v-divider />
        <v-container>
          <v-row class="px-2">
            <v-card-text
              v-t="details"
              class="font-weight-medium"
            />
            <v-col
              cols="12"
            >
              <v-subheader class="ps-0">
                {{ 'Confirmation Email' }}
              </v-subheader>
              <form-builder
                :data="value"
                :form-inputs="formFeildEmail"
              />
              <v-subheader class="ps-0">
                {{ 'Confirmation CCEmails' }}
              </v-subheader>
              <div
                v-for="(email, key) in value.confirmationEmailCCAddresses"
                :key="key"
                class="d-flex justify-space-between"
                flat
                tile
              >
                <v-combobox
                  :key="key"
                  :value="value.confirmationEmailCCAddresses[key]"
                  dense
                  :rules="rules.email"
                  :items="suppliers.map((s) => ({
                    text: `${s.companyName}${s.email ? ' (' + s.email + ')' : ''}`,
                    value: s.email
                  }))"
                  label="Confirmation CCEmail"
                  :return-object="false"
                  outlined
                  @keydown="(newVal) => handleChange(newVal.target.value, `confirmationEmailCCAddresses[${key}]`)"
                  @change="(newVal) => handleChange(newVal.value || newVal, `confirmationEmailCCAddresses[${key}]`)"
                />
                <v-btn
                  v-if="value.confirmationEmailCCAddresses.length>1"
                  color="error"
                  text
                  icon
                  @click="value.confirmationEmailCCAddresses.splice(key, 1)"
                >
                  <v-icon>
                    mdi-close
                  </v-icon>
                </v-btn>
                <v-btn
                  v-if="value.confirmationEmailCCAddresses.length==(key+1) && value.confirmationEmailCCAddresses.length<5"
                  color="primary"
                  text
                  icon
                  @click="value.confirmationEmailCCAddresses.push('')"
                >
                  <v-icon>
                    mdi-plus-circle
                  </v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-container>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            color="grey"
            @click="$emit('close')"
          >
            NO
          </v-btn>
          <v-btn
            color="primary"
            depressed
            type="submit"
            :loading="isActive"
          >
            YES
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import get from 'lodash.get'
import set from 'lodash.set'
import { Component, Prop, Vue } from 'vue-property-decorator'

import EditableTable from '@/components/EditableTable.vue'
import FormBuilder from '@/components/FormBuilder/FormBuilder.vue'
import { ISupplier } from '@/modules/contacts/types'

@Component({
  components: {
    EditableTable,
    FormBuilder
  }
})
export default class EmailConfirmationDialog extends Vue {
  @Prop({ required: true })
  value!: any

  @Prop({ default: false }) isActive!: boolean

  @Prop() shouldShow!: boolean
  @Prop({ default: 'Payment Confirmation Email' }) title!: string

  @Prop({ required: true })
  suppliers!: ISupplier[]

  valid = false

  rules = {
    email: [
      (v: string) => /.+@.+\..+/.test(v) || !v || this.$t('pages.errors.rules.emailValid')
    ]
  }

  get formFeildEmail () {
    return [
      {
        model: 'confirmationEmailToAddresses[0]',
        type: 'select',
        props: {
          label: 'Confirmation Email',
          required: true,
          items: this.suppliers.map((s) => ({
            label: `${s.companyName}${s.email ? ' (' + s.email + ')' : ''}`,
            value: s.email
          }))
        }
      }
    ]
  }

  get headersCCmail () {
    return [
      {
        text: 'Confirmation CCEmail',
        field: {
          model: 'confirmationEmailCCAddresses',
          type: 'combo',
          sortable: false,
          props: {
            'hide-details': true,
            items: this.suppliers.map((s) => ({
              text: `${s.companyName}${s.email ? ' (' + s.email + ')' : ''}`,
              value: s.email
            }))
          }
        }
      }
    ]
  }

  get details () {
    if (this.suppliers.length) {
      const companyName = this.suppliers.find(s => s.email === this.value.confirmationEmailToAddresses[0])
      return `Do you wish to email payment confirmation to the ${companyName?.companyName ?? 'Supplier'}?`
    }
    return 'Do you wish to email payment confirmation to the Supplier?'
  }

  handleChange (newValue: string, value: string) {
    set(this.value, value, newValue)
    this.$emit('change', newValue, value)
  }

  getModelData (value: string) {
    return get(this.value, value)
  }

  validate () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.$refs.form.validate()
    if (this.valid) {
      this.$emit('confirm', this.value)
    }
  }
}
</script>
