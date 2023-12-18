<template>
  <v-container
    class="page-container"
    fluid
  >
    <page-header :title="$t('routes.demoSettings')" />
    <v-row>
      <v-col md="6">
        <v-card
          outlined
          class="my-2"
        >
          <v-container fluid>
            <v-row>
              <v-col>
                <v-btn
                  v-t="'routes.dailyCheck'"
                  type="button"
                  color="primary"
                  :loading="feeCheckTask.isActive"
                  :disabled="feeCheckTask.isActive"
                  depressed
                  @click="feeCheck"
                />
                <v-alert
                  v-if="feeCheckTask.lastCalled && feeCheckTask.lastCalled.isResolved"
                  color="success"
                  text
                  class="mt-2"
                >
                  {{ $t('pages.amazonProducts.success') }}
                </v-alert>
                <v-alert
                  v-if="feeCheckTask.lastCalled && feeCheckTask.lastCalled.isRejected"
                  color="error"
                  text
                  class="mt-2"
                >
                  {{ JSON.stringify(feeCheckTask.lastCalled.error, null, '\t') }}
                </v-alert>
              </v-col>
            </v-row>
          </v-container>
        </v-card>

        <v-card
          outlined
          class="my-2"
        >
          <v-container fluid>
            <v-row>
              <v-col>
                <v-btn
                  type="button"
                  color="primary"
                  :loading="sendEmailTask.isActive"
                  :disabled="sendEmailTask.isActive"
                  depressed
                  @click="sendEmail"
                >
                  {{ $t('pages.amazonProducts.sendEmail') }}
                </v-btn>
                <v-alert
                  v-if="sendEmailTask.lastCalled && sendEmailTask.lastCalled.isResolved"
                  color="success"
                  text
                  class="mt-2"
                >
                  {{ $t('pages.amazonProducts.success') }}
                </v-alert>
                <v-alert
                  v-if="sendEmailTask.lastCalled && sendEmailTask.lastCalled.isRejected"
                  color="error"
                  text
                  class="mt-2"
                >
                  {{ JSON.stringify(sendEmailTask.lastCalled.error, null, '\t') }}
                </v-alert>
              </v-col>
            </v-row>
          </v-container>
        </v-card>

        <v-card
          outlined
          class="my-2"
        >
          <v-container fluid>
            <v-row>
              <v-col>
                <v-form
                  ref="form"
                  v-model="valid"
                  @submit.prevent="validate"
                >
                  <form-builder
                    :data="notificationData"
                    :form-inputs="notificationFields"
                  />
                  <v-spacer />
                  <v-btn
                    type="submit"
                    color="primary"
                    :loading="sendNotificationTask.isActive"
                    :disabled="sendNotificationTask.isActive"
                    depressed
                  >
                    {{ $t('pages.amazonProducts.sendNotification') }}
                  </v-btn>
                </v-form>
                <v-alert
                  v-if="sendNotificationTask.lastCalled && sendNotificationTask.lastCalled.isResolved"
                  color="success"
                  text
                  class="mt-2"
                >
                  {{ $t('pages.amazonProducts.success') }}
                </v-alert>
                <v-alert
                  v-if="sendNotificationTask.lastCalled && sendNotificationTask.lastCalled.isRejected"
                  color="error"
                  text
                  class="mt-2"
                >
                  {{ JSON.stringify(sendNotificationTask.lastCalled.error, null, '\t') }}
                </v-alert>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import FormBuilder from '@/components/FormBuilder/FormBuilder.vue'
import PageHeader from '@/components/PageHeader.vue'
import { Task } from '@/decorators/task'

const namespaces = {
  products: 'products',
  user: 'user',
  toasts: 'toasts',
  accountSettings: 'accountSettings',
  marketplaceAccounts: 'marketplaceAccounts',
  notifications: 'notifications'
}

@Component({
  components: {
    PageHeader,
    FormBuilder
  }
})
export default class DemoSettings extends Vue {
  @State('accountSettings', { namespace: namespaces.accountSettings }) accountSettings!: any
  @Action('dailyCheck', { namespace: namespaces.marketplaceAccounts }) dailyCheck!: () => Promise<void>
  @Action('sendEmail', { namespace: namespaces.marketplaceAccounts }) sendEmailAction!: () => Promise<void>
  @Action('getAccountSettings', { namespace: namespaces.accountSettings }) getAccountSettings!: () => Promise<void>
  @Action('sendNotificationAction', { namespace: namespaces.notifications }) sendNotificationAction!: (opts: { serviceSource: string, notification: {summary: string, message: string, notificationType: string} }) => Promise<void>

  notificationData: {serviceSource: string, notification: {summary: string, message: string, notificationType: string}}={ serviceSource: '', notification: { summary: '', message: '', notificationType: '' } }
  valid = false

  async beforeMount () {
    await this.initialLoad()
  }

  @Task('initialLoadTask')
  async initialLoad () {
    await this.getAccountSettings()
    // if (!this.accountSettings?.isDemoAccount) {
    //   await this.$router.push({ name: '404' })
    // }
  }

  @Task('feeCheckTask')
  async feeCheck () {
    await this.dailyCheck()
  }

  @Task('sendEmailTask')
  async sendEmail () {
    await this.sendEmailAction()
  }

  @Task('sendNotificationTask')
  async sendNotifications () {
    await this.sendNotificationAction(this.notificationData)
  }

  get rules () {
    return {
      required: [
        (v: string) => !!v || this.$t('pages.errors.rules.fieldRequired')
      ]
    }
  }

  get notificationFields () {
    return [
      {
        model: 'notification.summary',
        type: 'text',
        props: {
          rules: this.rules.required,
          required: true,
          label: 'Summary'
        }
      },
      {
        model: 'notification.message',
        type: 'textarea',
        props: {
          rules: this.rules.required,
          required: true,
          label: 'Mesasage'
        }
      },
      {
        model: 'notification.notificationType',
        type: 'select',
        class: 'mb-4',
        props: {
          label: 'Message Type',
          'hide-details': true,
          rules: this.rules.required,
          required: true,
          items: [
            {
              label: 'INFO',
              value: 'INFO'
            },
            {
              label: 'ACTION NEEDED',
              value: 'ACTION_NEEDED'
            },
            {
              label: 'ERROR',
              value: 'ERROR'
            }
          ]
        }
      },
      {
        model: 'serviceSource',
        type: 'select',
        class: 'mb-4',
        props: {
          label: 'Service Source',
          'hide-details': true,
          rules: this.rules.required,
          required: true,
          items: [
            {
              label: 'Notifications',
              value: 'notifications'
            },
            {
              label: 'Invoices',
              value: 'invoices'
            },
            {
              label: 'Xero',
              value: 'xero'
            },
            {
              label: 'Users',
              value: 'users'
            },
            {
              label: 'Reporting',
              value: 'reporting'
            },
            {
              label: 'Suppliers',
              value: 'suppliers'
            },
            {
              label: 'Amazon',
              value: 'amazon'
            }
          ]
        }
      }
    ]
  }

  validate () {
    const { form } = this.$refs as HTMLFormElement
    form.validate()
    if (this.valid) {
      this.sendNotifications()
    }
  }
}
</script>
