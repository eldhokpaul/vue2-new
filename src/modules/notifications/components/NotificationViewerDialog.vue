<template>
  <v-dialog
    v-model="dialogOpen"
    max-width="680px"
  >
    <v-card
      v-if="!isEmpty(notification)"
      outlined
      flat
      class="pa-3"
    >
      <div class="d-flex">
        <v-icon
          x-large
          class="mr-5 mb-4"
          :color="getStatusColor(notification.notificationType)"
        >
          mdi-bell-circle
        </v-icon>
        <div class="d-flex flex-column">
          <h3
            class="font-weight-medium"
            v-text="notification.summary"
          />
          <p class="secondary--text">
            {{ dateFormatter(notification.messageDateTime) }}
          </p>
        </div>
      </div>
      <!-- eslint-disable vue/no-v-html -->
      <p
        class="pa-4"
        v-html="notification.message"
      />
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn
          depressed
          color="default"
          class="mr-2"
          @click="dialogOpen = false"
        >
          {{ $t('components.notification.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import isEmpty from 'lodash/isEmpty'
import { Component, Prop, Vue } from 'vue-property-decorator'

import type { Notification } from '@/client/notifications'
import { dateTimeDifference } from '@/utils/date'

@Component
export default class NotificationViewerDialog extends Vue {
  @Prop({ default: false })
  open!: boolean

  @Prop({ required: true })
  notification!: Notification

  isEmpty=isEmpty
  dateTimeDifference=dateTimeDifference

  get dialogOpen () {
    return this.open
  }

  set dialogOpen (val: boolean) {
    this.$emit('setDialogOpen', val)
  }

  dateFormatter (date: string) {
    return dateTimeDifference(date)
  }

  getStatusColor (status: string) {
    if (status === 'ERROR') return 'error'
    else if (status === 'INFO') return 'blue'
    else if (status === 'ACTION_NEEDED') return 'orange'
  }
}
</script>
