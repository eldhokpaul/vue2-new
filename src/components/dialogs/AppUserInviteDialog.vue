<template>
  <v-dialog
    v-model="shouldShow"
    width="500"
    @click:outside="$emit('update:close')"
  >
    <v-card>
      <v-card-title v-t="title" />

      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn
          v-t="'Accept'"
          color="green"
          depressed
          @click="$emit('success', 'ACCEPT')"
        />
        <v-btn
          v-t="'Reject'"
          color="red"
          depressed
          @click="$emit('reject', 'REJECT')"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import type { User } from '@/client/users'

@Component
export default class AppUserInviteDialog extends Vue {
  @Prop() shouldShow!: boolean
  @Prop({ default: 'components.appConfirmationDialog.confirm' }) title!: string
  @Prop() user!: User
}
</script>
<style>
.switchcontainer{
    display: flex;
}
</style>
