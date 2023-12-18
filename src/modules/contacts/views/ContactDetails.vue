<template>
  <v-container
    class="page-container"
    fluid
  >
    <page-header
      :title="supplier && supplier.companyName"
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
    <v-row v-if="supplier">
      <v-col md="6">
        <v-card outlined>
          <v-container fluid>
            <v-row>
              <v-col>
                <supplier-form
                  :supplier="supplier"
                  :disabled="updateTask.isActive"
                  :is-viewer="isViewer"
                  @submit="submit"
                  @delete="onDelete"
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
import { Component, Prop, Vue } from 'vue-property-decorator'
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
export default class SupplierDetails extends Vue {
  @Action('patchSupplierAttributes', { namespace: namespaces.suppliers })
  patchSupplierAttributes!: (supplier: ISupplierFormData) => Promise<void>

  @Action('getSupplierById', { namespace: namespaces.suppliers })
  getSupplierById!: (id: number) => Promise<void>

  @Action('deleteSupplier', { namespace: namespaces.suppliers })
  deleteSupplier!: (id: number) => Promise<void>

  @Getter('isViewer', { namespace: namespaces.user }) isViewer!: boolean

  @State('user', { namespace: namespaces.user })
  user!: IUser

  @Prop() readonly id!: number

  @State('supplier', { namespace: namespaces.suppliers })
  supplier!: ISupplier

  shouldShowSupplierModal = false

  expectedSupplier: ISupplier | null = null

  async beforeMount () {
    await this.initialLoad()
  }

  async onDelete () {
    await this.deleteSupplier(this.id)

    this.$router.push({
      name: 'suppliers'
    })
  }

  @Task('initialLoadTask')
  async initialLoad () {
    await this.getSupplierById(this.id)
  }

  @Task('updateTask')
  async submit (newParams: ISupplierFormData) {
    newParams.userId = this.user.id as number
    await this.patchSupplierAttributes(newParams)

    this.$router.push({
      name: 'suppliers'
    })
  }
}
</script>
