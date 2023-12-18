<template>
  <div>
    <v-btn
      v-t="'pages.products.bulkUploadProduct'"
      color="primary"
      class="mr-3"
      depressed
      exact
      @click="shouldShow = true"
    />
    <v-dialog
      v-model="shouldShow"
      width="500"
      @click:outside="$emit('update:close')"
    >
      <v-card class="pa-5">
        <h1 v-t="'pages.products.bulkUploadProduct'" />
        <template v-if="!bulkUploadTask.isActive">
          <p><a @click="handleGetBulkUploadTemplate">Download the template</a> and enter your products then upload it using the form below:</p>
          <v-file-input
            v-model="file"
            :label="$t('components.invoiceUploadForm.placeholder')"
            prepend-icon=""
            dense
            accept=".csv"
            outlined
            :rules="rules.required"
          />
          <v-card-actions class="pa-0 ma-0">
            <v-btn
              v-t="'pages.products.cancel'"
              color="default"
              depressed
              exact
              @click="shouldShow = false"
            />
            <v-spacer />
            <v-btn
              v-t="'pages.products.bulkUploadProduct'"
              color="primary"
              :disabled="!file"
              depressed
              exact
              @click="handleBulkUpload"
            />
          </v-card-actions>
        </template>
        <template v-else>
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </template>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import { Task } from '@/decorators/task'
import type { IUser } from '@/modules/user/types'

const namespaces = {
  products: 'products',
  user: 'user'
}
@Component
export default class BulkUploadDialog extends Vue {
  @Action('bulkUpload', { namespace: namespaces.products }) bulkUpload!: (args: { userId: number, file: File }) => Promise<any>
  @Action('getBulkUploadTemplate', { namespace: namespaces.products }) getBulkUploadTemplate!: (userId: number) => Promise<any>
  @State('user', { namespace: namespaces.user }) user!: IUser
  shouldShow = false
  file: File | null = null

  get rules () {
    return {
      required: [
        (v: string) => !!v || this.$t('pages.errors.rules.fieldRequired')
      ]
    }
  }

  @Task('bulkUploadTask')
  async handleBulkUpload () {
    if (this.file) { await this.bulkUpload({ userId: this.user?.id, file: this.file }) }
    this.$emit('on-success')
    this.shouldShow = false
  }

  async handleGetBulkUploadTemplate () {
    const res = await this.getBulkUploadTemplate(this.user.id)
    const blob = await res.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'product-template.csv'
    link.click()
    setTimeout(() => URL.revokeObjectURL(link.href), 0)
  }
}
</script>
