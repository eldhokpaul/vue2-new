<template>
  <app-ok-dialog
    :show-dialog="showConfirmDialog"
    :route-name="redirectTo"
    :is-success="isAccountValid"
    :params="pathParams"
    :confirmation-text="confirmationText"
    @update:ok="onOkClick"
    @update:close="onOkClick"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import AppOkDialog from '@/components/dialogs/AppOkDialog.vue'
import { IUser } from '@/modules/user/types'

const namespaces = {
  toasts: 'toasts',
  user: 'user',
  auth: 'auth'
}

@Component({
  components: { AppOkDialog }
})
export default class InviteNewUser extends Vue {
  @Prop()
  userId!: string

  @Prop()
  accountId!: string

  @Prop()
  verificationToken!: string

  @Prop()
  invitationAction!: string

  @Action('addError', { namespace: namespaces.toasts })
  addError!: (text: string) => Promise<any>

  @Action('acceptAccountInvite', { namespace: namespaces.auth })
  acceptAccountInvite!: (opts: { userId: string, accountId: string, verificationToken: string, invitationAction: string }) => Promise<IUser>

  showConfirmDialog = true
  isAccountValid: boolean | null | undefined = false
  redirectTo = 'authLogin'
  pathParams = {}

  async beforeMount () {
    await this.validateUser()
  }

  onOkClick () {
    this.showConfirmDialog = false
  }

  async validateUser () {
    if (!this.userId || !this.verificationToken) {
      this.isAccountValid = false
      return
    }
    this.pathParams = { userId: this.userId, verificationToken: this.verificationToken }

    try {
      const user = await this.acceptAccountInvite({ userId: this.userId, accountId: this.accountId, verificationToken: this.verificationToken, invitationAction: this.invitationAction })
      this.isAccountValid = user.isActive && user.isVerified
      if (this.isAccountValid) this.redirectTo = 'authAddNewPassword'
      if (this.invitationAction === 'REJECT') this.redirectTo = 'authLogin'
    } catch (e) {
      this.redirectTo = 'authLogin'
      this.isAccountValid = false
      await this.addError(this.$t('pages.errors.user.notValid') as string)
    }
  }

  get confirmationText () {
    return this.invitationAction === 'REJECT' ? 'pages.authVerification.rejectInvitationText' : this.isAccountValid ? 'pages.authVerification.successVerificationText' : 'pages.authVerification.errorVerificationText'
  }
}
</script>
