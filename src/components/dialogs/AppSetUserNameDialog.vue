<template>
  <v-dialog
    v-model="shouldShow"
    width="500"
    persistent
  >
    <v-card>
      <v-card-title v-t="title" />

      <v-card-text>
        <p v-t="details" />
        <v-form
          ref="form"
          v-model="valid"
          @submit.prevent="validate"
        >
          <v-text-field
            v-model="firstName"
            :label="$t('components.userProfileForm.firstName')"
            autofocus
            outlined
            required
            :rules="rules.required"
          />
          <v-text-field
            v-model="lastName"
            :label="$t('components.userProfileForm.lastName')"
            outlined
            required
            :rules="rules.required"
          />

          <div class="text-right">
            <v-btn
              v-t="'components.userProfileForm.saveProfile'"
              color="primary"
              depressed
              type="submit"
            />
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import { Task } from '@/decorators/task'
import type { IUser } from '@/modules/user/types'
const namespaces = {
  user: 'user'
}
@Component
export default class AppSetUserNameDialog extends Vue {
  @Action('getUser', { namespace: namespaces.user }) getUser: any
  @Action('patchUserAttributes', { namespace: namespaces.user }) patchUserAttributes: any
  @Prop() shouldShow!: boolean
  @Prop() title!: string
  @Prop() details!: string
  @Prop() user!: IUser

  firstName = ''
  lastName = ''

  valid = false

  get rules () {
    return {
      required: [
        (v: string) => !!v || this.$t('pages.errors.rules.fieldRequired')
      ]
    }
  }

  validate () {
    const { form } = this.$refs as HTMLFormElement
    form.validate()
    if (this.valid) {
      this.submit({ ...this.user, firstName: this.firstName, lastName: this.lastName })
    }
  }

  @Task('updateTask')
  async submit (formData: Partial<IUser>) {
    await Promise.all([
      await this.patchUserAttributes(formData),
      await this.getUser()
    ])
    this.shouldShow = false
  }
}
</script>
