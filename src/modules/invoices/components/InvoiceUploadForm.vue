<template>
  <v-form
    ref="invoiceUploadForm"
    v-model="valid"
    @submit.prevent="validate"
  >
    <v-file-input
      v-model="invoice.file"
      :label="$t('components.invoiceUploadForm.placeholder')"
      prepend-icon=""
      dense
      accept=".pdf, .doc, .docx"
      outlined
      :rules="rules.required"
    />
    <div class="d-flex justify-end align-center">
      <v-btn
        v-if="shouldShowCancel"
        v-t="'components.productForm.cancel'"
        text
        :to="{
          name: 'invoices'
        }"
        exact
        class="mr-2"
      />
      <v-btn
        v-t="'components.invoiceUploadForm.upload'"
        type="submit"
        color="primary"
        depressed
      />
    </div>
  </v-form>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import type { IInvoiceUploadFormData } from '../types'

@Component
export default class InvoiceUploadForm extends Vue {
  @Prop()
  invoice!: IInvoiceUploadFormData

  @Prop({ default: true })
  shouldShowCancel!: boolean

  valid = false

  get rules () {
    return {
      required: [
        (v: string) => !!v || this.$t('pages.errors.rules.fieldRequired')
      ]
    }
  }

  validate () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.$refs.invoiceUploadForm.validate()
    if (this.valid) {
      this.$emit('submit')
    }
  }
}
</script>
