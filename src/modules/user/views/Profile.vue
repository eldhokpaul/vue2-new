<template>
  <v-container
    class="page-container"
    fluid
  >
    <template v-if="initialLoadTask.isActive">
      <v-skeleton-loader type="table" />
    </template>
    <template v-else>
      <page-header :title="$t('routes.profile')" />
      <v-row>
        <v-col>
          <v-card
            class="pa-3"
            outlined
          >
            <v-container fluid>
              <v-row>
                <v-col
                  md="4"
                  cols="12"
                >
                  <v-card
                    elevation="0"
                    style="max-width: 240px;"
                    class="d-flex flex-column align-center"
                  >
                    <v-avatar
                      width="100%"
                      height="240px"
                      color="primary"
                      class="mb-4"
                      rounded
                    >
                      <v-icon
                        color="white"
                        size="240px"
                      >
                        mdi-account
                      </v-icon>
                    </v-avatar>
                    <!-- <v-btn
                      depressed
                      block
                      v-text="'Upload image'"
                    /> -->
                  </v-card>
                  <v-list>
                    <v-list-item class="mx-0 px-0">
                      <span>
                        <v-avatar
                          class="outlined mr-2"
                          outlined
                          size="32px"
                        >
                          <v-icon
                            size="18px"
                          >mdi-account</v-icon>
                        </v-avatar>
                        {{ user.firstName + ' ' + user.lastName || $t('components.userProfileForm.notSet') }}
                      </span>
                    </v-list-item>
                    <v-list-item class="mx-0 px-0">
                      <span>
                        <v-avatar
                          class="outlined mr-2"
                          outlined
                          size="32px"
                        >
                          <v-icon
                            size="18px"
                          >mdi-map-marker</v-icon>
                        </v-avatar>
                        {{ user.locationTimeZone || $t('components.userProfileForm.notSet') }}
                      </span>
                    </v-list-item>
                    <v-list-item class="mx-0 px-0">
                      <span>
                        <v-avatar
                          class="outlined mr-2"
                          outlined
                          size="32px"
                        >
                          <v-icon
                            size="18px"
                          >mdi-phone</v-icon>
                        </v-avatar>
                        <a
                          v-if="user.phone"
                          class="ml-1"
                          :href="`tel:${user.phone}`"
                          v-text="user.phone"
                        />
                        <template v-else>
                          {{ $t('components.userProfileForm.notSet') }}
                        </template>
                      </span>
                    </v-list-item>
                    <v-list-item class="mx-0 px-0">
                      <span>
                        <v-avatar
                          class="outlined mr-2"
                          outlined
                          size="32px"
                        >
                          <v-icon
                            size="18px"
                          >mdi-email</v-icon>
                        </v-avatar>
                        <a
                          v-if="user.email"
                          class="ml-1"
                          :href="`mailto:${user.email}`"
                          v-text="user.email"
                        />
                        <template v-else>
                          {{ $t('components.userProfileForm.notSet') }}
                        </template>
                      </span>
                    </v-list-item>
                    <v-list-item class="mx-0 px-0">
                      <span>
                        <v-avatar
                          class="outlined mr-2"
                          outlined
                          size="32px"
                        >
                          <v-icon
                            size="18px"
                          >mdi-calendar</v-icon>
                        </v-avatar>
                        {{ user.company || $t('components.userProfileForm.notSet') }}
                      </span>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col
                  cols="12"
                  md="8"
                >
                  <user-profile-form
                    :user="user"
                    :route-back="routeBack"
                    :disabled="updateTask.isActive"
                    @submit="submit"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import PageHeader from '@/components/PageHeader.vue'
import { Task } from '@/decorators/task'

import UserProfileForm from '../components/UserProfileForm.vue'
import type { IUser } from '../types'
const namespaces = {
  user: 'user'
}
@Component({
  components: {
    UserProfileForm,
    PageHeader
  }
})
export default class UserProfile extends Vue {
  @Action('getUser', { namespace: namespaces.user }) getUser: any
  @Action('patchUserAttributes', { namespace: namespaces.user }) patchUserAttributes: any
  @State('user', { namespace: namespaces.user }) user!: IUser
  @Prop() routeBack!: string
  @Task('initialLoadTask')
  async initialLoad () {
    await this.getUser()
  }

  @Task('updateTask')
  async submit (formData: IUser) {
    await this.patchUserAttributes(formData)
    this.$router.push({
      name: 'dashboard'
    })
  }

  async beforeMount () {
    await this.initialLoad()
  }
}
</script>

<style lang="scss" scoped>
.outlined {
  border: 1px solid rgb(216, 216, 216);
}
</style>
