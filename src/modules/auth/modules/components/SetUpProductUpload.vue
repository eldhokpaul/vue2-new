<template>
  <v-card
    tile
    flat
    width="100%"
  >
    <v-card-text>
      <v-alert
        icon="mdi-information"
        text
        dense
        prominent
        color="primary"
      >
        {{ $t('pages.setupProductUpload.downloadExcel') }}
      </v-alert>
      <v-alert
        icon="mdi-information"
        dense
        text
        prominent
        color="primary"
      >
        {{ $t('pages.setupProductUpload.productUpload') }}
      </v-alert>
      <v-list
        flat
        subheader
      >
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              <strong>
                {{ $t('pages.setupProductUpload.listing') }}
              </strong>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-for="(item, i) in listItems"
          :key="i"
          dense
        >
          <v-list-item-content>
            <v-list-item-subtitle>
              {{ item }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <!-- <v-card-text> -->
      <p><a @click="handleGetBulkUploadTemplate">{{ $t('pages.setupProductUpload.downloadTemplate') }}</a> </p>
      <v-file-input
        v-model="file"
        :label="$t('components.invoiceUploadForm.placeholder')"
        prepend-icon=""
        dense
        accept=".csv"
        outlined
        :rules="rules.required"
      />
      <!-- </v-card-text> -->
    </v-card-text>
    <v-card-actions class="pa-2">
      <v-btn
        plain
        :disabled="bulkUploadTask.isActive"
        @click="skipStep"
      >
        <v-icon>
          mdi-logout
        </v-icon>{{ $t('pages.setupProductUpload.skip') }}
      </v-btn>
      <v-spacer />
      <v-btn
        v-t="'pages.products.bulkUploadProduct'"
        color="primary"
        :disabled="!file"
        depressed
        :loading="bulkUploadTask.isActive"
        exact
        @click="handleBulkUpload"
      />
    </v-card-actions>
  </v-card>
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

export default class SetUpProductUpload extends Vue {
  @Action('bulkUpload', { namespace: namespaces.products }) bulkUpload!: (args: { userId: number, file: File }) => Promise<any>
  @Action('getBulkUploadTemplate', { namespace: namespaces.products }) getBulkUploadTemplate!: (userId: number) => Promise<any>
  @State('user', { namespace: namespaces.user }) user!: IUser
  file: File | null = null

  listItems= [
    'ProductName',
    'SKU',
    'ASIN',
    'FNSKU',
    'Product Length',
    'Product Length Unit(CM/MM/IN)',
    'Product Width',
    'Product Width Unit(CM/MM/IN)',
    'Product Height',
    'Product Height Unit(CM/MM/IN)',
    'Per Unit Weight',
    'Per Unit Weight(GR/KG/OZ/LB)',
    'Listing Price'
  ]

  e1= 1

  skipStep () {
    this.$emit('skip', this.e1)
  }

  get rules () {
    return {
      required: [
        (v: string) => !!v || this.$t('pages.errors.rules.fieldRequired')
      ]
    }
  }

  @Task('bulkUploadTask')
  async handleBulkUpload () {
    if (this.file) {
      await this.bulkUpload({ userId: this.user?.id, file: this.file })
      this.$emit('skip', this.e1)
    }
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
