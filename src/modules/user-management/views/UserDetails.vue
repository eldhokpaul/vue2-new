<template>
  <v-container
    class="page-container"
    fluid
  >
    <page-header
      :title="userDetails && userDetails.email || userDetails && userDetails.id"
    >
      <template #back>
        <v-btn
          icon
          text
          large
          class="mr-2"
          color="toolbar"
          :to="{
            name: 'userManagement'
          }"
          exact
        >
          <v-icon>
            mdi-arrow-left
          </v-icon>
        </v-btn>
      </template>
    </page-header>
    <v-row>
      <v-col md="12">
        <v-card outlined>
          <v-container fluid>
            <v-row>
              <v-col>
                <!-- v-if="userDetails && userDetails.id && !accountSettingsByUser.accountId" -->
                <v-skeleton-loader
                  v-if="initialLoadTask.isActive"
                  type="table"
                />
                <user-form
                  v-else
                  :user-details="userDetails"
                  :account-settings-by-user="accountSettingsByUser"
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

import type { AccountSettingsDto, User, UserAdminPatchDto } from '@/client/users'
import PageHeader from '@/components/PageHeader.vue'
import { Task } from '@/decorators/task'

import UserForm from '../components/UserForm.vue'

const namespaces = {
  userManagement: 'userManagement',
  user: 'user'
}

@Component({
  components: {
    PageHeader,
    UserForm
  }
})
export default class UserDetails extends Vue {
  @Action('getUserById', { namespace: namespaces.userManagement })
  getUserById!: (id: number) => Promise<void>

  @Action('updateUser', { namespace: namespaces.userManagement })
  updateUser!: (options: {userId: number, userData: UserAdminPatchDto}) => Promise<void>

  @Action('getUserTiers', { namespace: namespaces.userManagement })
  getUserTiers!: (userId: number) => Promise<void>

  @Action('getOwnedAccountSettingsByUserId', { namespace: namespaces.userManagement })
  getOwnedAccountSettingsByUserId!: (userId: number) => Promise<void>

  @Getter('isViewer', { namespace: namespaces.user }) isViewer!: boolean

  @State('userDetails', { namespace: namespaces.userManagement })
  userDetails!: User

  @State('accountSettingsByUser', { namespace: namespaces.userManagement })
  accountSettingsByUser!: AccountSettingsDto

  @Prop() readonly id!: number

  beforeMount () {
    this.initialLoad()
  }

  async onDelete () {
    // await this.deleteSupplier(this.id)

    // this.$router.push({
    //   name: 'suppliers'
    // })
  }

  @Task('initialLoadTask')
  async initialLoad () {
    await Promise.all([this.getUserTiers(this.id),
      this.getUserById(this.id),
      this.getOwnedAccountSettingsByUserId(this.id)]
    )
  }

  @Task('updateTask')
  async submit (userData: UserAdminPatchDto) {
    await this.updateUser({ userId: this.id, userData: userData })
    this.$router.push({
      name: 'userManagement'
    })
  }
}
</script>
