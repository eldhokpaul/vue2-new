<template>
  <v-container
    class="page-container"
    fluid
  >
    <page-header
      :title="$t('routes.addASupplier')"
    >
      <template #back>
        <v-btn
          icon
          text
          large
          class="mr-2"
          color="toolbar"
          :to="{
            name: 'suppliers'
          }"
          exact
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </template>
    </page-header>
    <v-row>
      <v-col md="6">
        <v-card outlined>
          <v-container fluid>
            <v-row>
              <v-col>
                <supplier-form
                  :supplier="supplier"
                  :is-viewer="isViewer"
                  :new-supplier="true"
                  :disabled="updateTask.isActive"
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
import { Action, Getter, State } from 'vuex-class'

import PageHeader from '@/components/PageHeader.vue'
import { Task } from '@/decorators/task'
import type { ISupplier, ISupplierFormData } from '@/modules/contacts/types'
import type { IUser } from '@/modules/user/types'

import SupplierForm from '../components/ContactForm.vue'

const namespaces = {
  suppliers: 'suppliers',
  user: 'user'
}

@Component({
  components: {
    PageHeader,
    SupplierForm
  }
})
export default class AddSupplier extends Vue {
  @Action('createSupplier', { namespace: namespaces.suppliers })
  createSupplier!: (supplier: ISupplierFormData) => Promise<void>

  @Getter('isViewer', { namespace: namespaces.user }) isViewer!: boolean
  @Action('patchSupplierAttributes', { namespace: namespaces.suppliers })
  patchSupplierAttributes: any

  @State('user', { namespace: namespaces.user })
  user!: IUser

  shouldShowSupplierModal = false

  supplier: ISupplierFormData = {
    telephoneNumber: '',
    companyName: '',
    email: '',
    userId: null,
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    zipOrPostCode: '',
    stateOrProvince: '',
    country: '',
    notes: ''
  }

  expectedSupplier: ISupplier | null = null

  @Task('updateTask')
  async submit (newParams: ISupplierFormData) {
    newParams.userId = this.user.id as number
    await this.createSupplier(newParams)

    this.$router.push({
      name: 'suppliers'
    })
  }
}
</script>
