<template>
  <v-menu
    v-model="open"
    :close-on-content-click="false"
    bottom
    left
    offset-y
    origin="top right"
    transition="slide-y-transition"
    max-width="400px"
    min-width="350px"
  >
    <template #activator="{ on: onNotifications }">
      <v-btn
        icon
        v-on="{ ...onNotifications }"
      >
        <v-badge
          :content="notificatiosCount"
          :value="notificatiosCount"
          class="my-2"
          color="green"
          overlap
        >
          <v-icon
            :size="28"
          >
            mdi-bell-outline
          </v-icon>
        </v-badge>
      </v-btn>
    </template>
    <v-card v-if="loading">
      <v-skeleton-loader type="table" />
    </v-card>
    <v-card v-else-if="notificationsQueue && notificationsQueue.length && !loading">
      <v-card-actions class="my-n3">
        <!-- <v-chip
          v-if="notificatiosCount"
          small
          class="text-center"
          color="primary"
          outlined
        >
          {{ `${notificatiosCount} unread notification` }}
        </v-chip> -->
        <v-spacer />
        <v-btn
          x-small
          class="ma-2"
          text
          link
          color="primary"
          @click="navigate"
        >
          {{ $t('components.notification.seeAll') }}
        </v-btn>
      </v-card-actions>
      <v-divider />
      <v-virtual-scroll
        :items="notificationList"
        height="350"
        min-height="200"
        class="notification-list"
        item-height="75"
      >
        <template #default="{ item,index }">
          <v-list-item
            :key="index"
          >
            <v-list-item-icon class="py-5">
              <v-icon
                size="30"
                :color="getStatusColor(item.notificationType)"
              >
                mdi-bell-circle
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content
              class="mr-2"
              @click="openNotification(item)"
            >
              <v-list-item-title
                class="font-weight-medium"
                :class="item.notificationStatus==='UNREAD'?'font-weight-black':''"
              >
                {{ item.summary }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-subtitle-2">
                <!-- eslint-disable vue/no-v-html -->
                <div v-html="item.message" />
              </v-list-item-subtitle>
              <v-list-item-subtitle class="text-subtitle-2">
                {{ dateFormatter(item.messageDateTime) }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-icon
              class="text-center"
            >
              <v-btn
                icon
                class="my-6"
                color="blue"
                x-small
                @click="updateNotificationStatus(item.id,'DISMISSED')"
              >
                <v-icon>
                  mdi-close-circle-outline
                </v-icon>
              </v-btn>
            </v-list-item-icon>
          </v-list-item>
        </template>
      </v-virtual-scroll>
      <notification-viewer-dialog
        :open="notificationsViewerOpen"
        :notification="selectedNotification"
        @setDialogOpen="val => (notificationsViewerOpen = val)"
      />
    </v-card>
    <v-card
      v-else
      tile
    >
      <v-card-text class="text-center">
        <v-icon
          color="grey"
          size="100"
        >
          mdi-bell-off
        </v-icon>
        <p> {{ $t('components.notification.noNotification') }}</p>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action, Mutation, State } from 'vuex-class'

import type { NotificationUpdateStatusDto } from '@/client/notifications'
import { NotificationUpdateStatusDtoNotificationStatusEnum } from '@/client/notifications'
import { dateTimeDifference } from '@/utils/date'

import { INotification } from '../types'
import NotificationViewerDialog from './NotificationViewerDialog.vue'

const namespaces = {
  app: 'app',
  auth: 'auth',
  user: 'user',
  toasts: 'toasts',
  notifications: 'notifications'
}

@Component({
  components: {
    NotificationViewerDialog
  }
})
export default class Notifications extends Vue {
@Action('updateNotifications', { namespace: namespaces.notifications })
updateNotifications!: (opts: {notificationId: number, notificationUpdateStatus?: NotificationUpdateStatusDto}) => Promise<any>;

// @Action('getPageNotificationsQueue', { namespace: namespaces.notifications })
// getPageNotificationsQueue!: (pageable: Pageable) => Promise<void>;

@State('notificationsQueue', { namespace: namespaces.notifications })
notificationsQueue?: INotification[]

@Mutation('setNotifications', { namespace: namespaces.notifications })
setNotifications!: (notifications: INotification[]) => void

@Prop({ default: false })
readonly loading!: boolean

open = false;
dateTimeDifference=dateTimeDifference
notificationsViewerOpen=false
selectedNotification?: INotification ={}

async updateNotificationStatus (notificationId: number, notificationStatus: NotificationUpdateStatusDtoNotificationStatusEnum) {
  const notificationUpdateStatus = {
    id: notificationId,
    notificationStatus: notificationStatus
  }
  await this.updateNotifications({ notificationId, notificationUpdateStatus: notificationUpdateStatus })
  const notifications = this.notificationsQueue?.filter((n) => { return n.id !== notificationId })
  this.setNotifications(notifications as INotification[])
}

get notificationList () {
  return this.notificationsQueue?.slice(0, 10)
}

dateFormatter (date: string) {
  return dateTimeDifference(date)
}

getStatusColor (status: string) {
  if (status === 'ERROR') return 'error'
  else if (status === 'INFO') return 'blue'
  else if (status === 'ACTION_NEEDED') return 'orange'
}

get notificatiosCount () {
  if (this.notificationsQueue?.length) {
    return this.notificationsQueue.filter(x => x?.notificationStatus === 'UNREAD').length
  } else return 0
}

async openNotification (notification: INotification) {
  this.selectedNotification = notification
  this.notificationsViewerOpen = true
  const notificationUpdateStatus = {
    id: this.selectedNotification.id,
    notificationStatus: NotificationUpdateStatusDtoNotificationStatusEnum.Read
  }
  await this.updateNotifications({ notificationId: this.selectedNotification.id as number, notificationUpdateStatus: notificationUpdateStatus })
}

navigate () {
  this.open = false
  this.$router.push({
    name: 'notifications'
  })
}
}
</script>

<style>
.v-application--is-ltr .v-list-group--sub-group .v-list-group__header {
  padding-left: 16px !important;
}
.v-list-group.v-list-group--active.v-list-group--no-action.v-list-group--sub-group.primary--text
  .v-list-group__items {
  width: 100%;
}
.v-application--is-ltr
  .v-list-group--no-action.v-list-group--sub-group
  > .v-list-group__items
  > .v-list-item {
  padding-left: 16px !important;
}
</style>
