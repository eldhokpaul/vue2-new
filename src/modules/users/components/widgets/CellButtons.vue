<template>
  <span v-if="!params.data.isOwner">
    <span>
      <v-btn
        class="ma-2"
        outlined
        x-small
        color="orange darken-2"
        @click="editClick()"
      >
        <v-icon x-small>mdi-cached</v-icon>
        {{ $t('pages.users.editUser') }}
      </v-btn>
      <v-btn
        class="ma-2"
        outlined
        x-small
        color="orange darken-2"
        @click="deleteClick()"
      >
        <v-icon x-small>mdi-delete</v-icon>
        {{ $t('pages.users.delete') }}
      </v-btn>
    </span>
    <span v-if="params.data.accountUser.invitationStatus==='INVITED'">
      <v-btn
        class="ma-2"
        depressed
        small
        color="error"
        @click="revokeClick()"
      >
        {{ $t('pages.users.revokeInvite') }}
      </v-btn>
      <v-btn
        class="ma-2"
        depressed
        small
        color="primary"
        @click="resendClick()"
      >
        {{ $t('pages.users.resendInvite') }}
      </v-btn>
    </span>

  </span>
</template>

<script>
import { Vue } from 'vue-property-decorator'

export default Vue.extend({
  name: 'CellButtons',
  methods: {
    editClick () {
      this.params.context.componentParent.editClick(this.params.data)
    },
    deleteClick () {
      this.params.context.componentParent.deleteClick(this.params.data)
    },
    revokeClick () {
      this.params.context.componentParent.revokeClick(this.params.data)
    },
    resendClick () {
      this.params.context.componentParent.resendClick(this.params.data)
    }
  }
})
</script>
