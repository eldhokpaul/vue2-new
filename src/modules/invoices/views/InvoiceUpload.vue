<template>
  <v-container
    class="page-container"
    fluid
  >
    <page-header
      :title="$t('routes.addAnInvoice')"
    >
      <template #back>
        <v-btn
          icon
          text
          class="mr-2"
          color="toolbar"
          :to="{ name: 'invoices' }"
          exact
          large
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </template>
    </page-header>
    <v-row>
      <v-col>
        <v-card outlined>
          <v-container fluid>
            <v-row>
              <v-col>
                <invoice-upload-form
                  :invoice="invoice"
                  @submit="submit"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import PageHeader from '@/components/PageHeader.vue'
import InvoiceUploadForm from '@/modules/invoices/components/InvoiceUploadForm.vue'
import type { IInvoiceUploadFormData } from '@/modules/invoices/types'
import type { IUser } from '@/modules/user/types'

const namespaces = {
  invoices: 'invoices',
  user: 'user'
}
@Component({
  components: {
    InvoiceUploadForm,
    PageHeader
  }
})
export default class InvoiceUpload extends Vue {
  @Action('uploadInvoice', { namespace: namespaces.invoices }) uploadInvoice: any
  @State('user', { namespace: namespaces.user }) user!: IUser

  invoice = {
    file: null
  }

  async submit () {
    const invoiceParams: IInvoiceUploadFormData = {
      file: this.invoice.file,
      userId: this.user.id as number
    }

    const invoice = await this.uploadInvoice(invoiceParams)
    this.$router.push({
      name: 'invoice',
      params: {
        id: invoice.id
      }
    })
  }
}
</script>
