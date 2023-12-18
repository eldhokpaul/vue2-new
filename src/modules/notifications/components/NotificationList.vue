<template>
  <div v-if="notificationsLoading.isActive || notificationsClearTask.isActive">
    <v-skeleton-loader type="table" />
  </div>
  <div
    v-else-if="notifications && notifications.content && notifications.content.length"
  >
    <div class="d-flex justify-space-between">
      <div class="d-flex flex-column">
        <v-btn
          small
          color="primary"
          text
          @click="clearAllRead"
        >
          {{ $t('components.notification.dismissMessage') }}
        </v-btn>
      </div>
      <div class="d-flex flex-column">
        <v-btn
          small
          color="primary"
          text
          @click="clearAll"
        >
          {{ $t('components.notification.clearAll') }}
        </v-btn>
      </div>
    </div>
    <v-list
      subheader
      flat
    >
      <v-list-item-group
        color="primary"
      >
        <v-virtual-scroll
          :items="notifications.content"
          height="700"
          item-height="80"
        >
          <template #default="{ item,index }">
            <v-list-item
              :key="index"
              :value="item"
            >
              <v-list-item-icon @click="openNotification(item)">
                <v-icon
                  size="35"
                  class="py-1"
                  :color="getStatusColor(item.notificationType)"
                >
                  mdi-bell-circle
                </v-icon>
              </v-list-item-icon>
              <v-list-item-content @click="openNotification(item)">
                <v-list-item-title :class="item.notificationStatus==='UNREAD'?'font-weight-black':''">
                  {{ item.summary }}
                </v-list-item-title>
                <v-list-item-subtitle class="subtitle-2">
                  <!-- eslint-disable vue/no-v-html -->
                  <div v-html="item.message" />
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  {{
                    dateFormatter(item.messageDateTime)
                  }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-tooltip
                  v-if="item.notificationStatus==='UNREAD'"
                  top
                >
                  <template #activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      icon
                      class="my-4 mr-8"
                      color="primary"
                      x-small
                      v-on="on"
                      @click="updateNotificationStatus(item.id,'READ')"
                    >
                      <v-icon>mdi-email-open</v-icon>
                    </v-btn>
                  </template>
                  <span> {{ $t('components.notification.markAsRead') }}</span>
                </v-tooltip>
                <v-tooltip
                  v-else
                  top
                >
                  <template #activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      icon
                      class="my-4 mr-8"
                      color="primary"
                      x-small
                      v-on="on"
                      @click="updateNotificationStatus(item.id,'UNREAD')"
                    >
                      <v-icon>
                        mdi-email-mark-as-unread
                      </v-icon>
                    </v-btn>
                  </template>
                  <span> {{ $t('components.notification.markAsRead') }}</span>
                </v-tooltip>
              </v-list-item-action>
            </v-list-item>
          </template>
        </v-virtual-scroll>
      </v-list-item-group>
      <v-divider />
      <v-spacer />
      <v-pagination
        v-model="options.pageNumber"
        class="mt-4"
        total-visible="0"
        :length="notifications.totalPages"
        circle
        @input="pagination"
      />
    </v-list>
    <notification-viewer-dialog
      :open="notificationsViewerOpen"
      :notification="selectedNotification"
      @setDialogOpen="val => (notificationsViewerOpen = val,readOpenNotification())"
    />
  </div>
  <v-list
    v-else
    height="750"
    subheader
  >
    <v-container
      fill-height
      fluid
    >
      <v-row
        align="center"
        justify="center"
      >
        <v-col>
          <v-card-text class="text-center">
            <v-icon
              color="grey"
              size="100"
            >
              mdi-bell-off
            </v-icon>
            <p> {{ $t('components.notification.noNotification') }}</p>
            <v-btn
              color="primary"
              @click="pagination()"
            >
              {{ $t('components.notification.checkNotification') }}
            </v-btn>
          </v-card-text>
        </v-col>
      </v-row>
    </v-container>
  </v-list>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import type { DismissNotificationsDto, Notification, NotificationUpdateStatusDto, Pageable, PageNotification } from '@/client/notifications'
import { DismissNotificationsDtoStatusesEnum, NotificationUpdateStatusDtoNotificationStatusEnum } from '@/client/notifications'
import { Task } from '@/decorators/task'
import { dateTimeDifference } from '@/utils/date'

import NotificationViewerDialog from './NotificationViewerDialog.vue'

const namespaces = {
  notifications: 'notifications'
}

@Component({
  components: {
    NotificationViewerDialog
  }
})

export default class NotificationsList extends Vue {
@Action('getPageNotifications', { namespace: namespaces.notifications })
getPageNotifications!: (pageable: Pageable) => Promise<void>;

@Action('updateNotifications', { namespace: namespaces.notifications })
updateNotifications!: (opts: {notificationId: number, notificationUpdateStatus?: NotificationUpdateStatusDto}) => Promise<any>;

@Action('dismissNotifications', { namespace: namespaces.notifications })
dismissNotifications!: (dismissNotifications?: DismissNotificationsDto) => Promise<any>;

@State('notifications', { namespace: namespaces.notifications })
notifications?: PageNotification;

dateTimeDifference=dateTimeDifference

options: {pageNumber: number, pageSize: number}={ pageNumber: 1, pageSize: 10 }
loading=false
notificationsViewerOpen=false
selectedNotification?: Notification ={}

beforeMount () {
  this.pagination()
}

@Task('notificationsLoading')
async pagination () {
  await this.getPageNotifications(this.options)
}

async updateNotificationStatus (notificationId: number, notificationStatus: NotificationUpdateStatusDtoNotificationStatusEnum) {
  const notificationUpdateStatus = {
    id: notificationId,
    notificationStatus: notificationStatus
  }
  await this.updateNotifications({ notificationId, notificationUpdateStatus: notificationUpdateStatus })
  // this.options.pageNumber = 1
  await this.pagination()
}

async readOpenNotification () {
  await this.updateNotificationStatus(this.selectedNotification?.id as number, NotificationUpdateStatusDtoNotificationStatusEnum.Read)
}

async openNotification (notification: Notification) {
  this.selectedNotification = notification
  this.notificationsViewerOpen = true
}

@Task('notificationsClearTask')
async clearAll () {
  const dissmissStatus = { statuses: [DismissNotificationsDtoStatusesEnum.Read, DismissNotificationsDtoStatusesEnum.Unread] }
  await this.dismissNotifications(dissmissStatus)
  this.options.pageNumber = 1
  await this.pagination()
}

@Task('notificationsClearTask')
async clearAllRead () {
  const dissmissStatus = { statuses: [DismissNotificationsDtoStatusesEnum.Read] }
  await this.dismissNotifications(dissmissStatus)
  this.options.pageNumber = 1
  await this.pagination()
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
