<template>
  <v-layout
    class="app-drawer"
    :dark="darkMode"
    column
  >
    <div>
      <v-list
        class="pa-0"
        tile
      >
        <v-list-item
          v-if="$vuetify.breakpoint.mdAndDown"
          exact
          :to="{
            name: isManagementSectionEnabled?'dashboard':'feeTrackerPro'
          }"
        >
          <v-list-item-content>
            <v-list-item-title
              class="d-flex align-center"
            >
              <app-logo
                width="128px"
                :primary="!darkMode"
              />
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-list
        class="pa-0"
        dense
        tile
        expand
      >
        <v-divider v-if="$vuetify.breakpoint.mdAndDown" />
        <div
          class="d-flex flex-row justify-start align-center"
          style="padding: 14px;"
        >
          <v-btn
            exact
            color="toolbar"
            style="min-width: auto; width: 40px;"
            text
            :to="{
              name: isManagementSectionEnabled?'dashboard':'feeTrackerPro'
            }"
          >
            <v-icon
              class="pa-0"
              size="36"
            >
              mdi-home
            </v-icon>
          </v-btn>
          <v-divider
            vertical
            class="mx-5"
          />
          <div
            v-if="isManagementSectionEnabled"
            class="d-flex flex-row justify-start align-center"
          >
            <v-btn
              color="toolbar"
              rounded
              :disabled="!isManagementSectionEnabled"
              outlined
              depressed
              @click="showCreateDialog = true"
            >
              <v-icon
                :size="isManagementSectionEnabled?28:25"
              >
                {{ isManagementSectionEnabled?'mdi-plus':'mdi-lock' }}
              </v-icon>
              {{ $t('pages.billing.addNew') }}
            </v-btn>
            <app-create-new-dialog
              :show="showCreateDialog"
              @set-show="(val) => showCreateDialog = val"
            />
          </div>
          <div
            v-else
            class="d-flex flex-row justify-start align-center"
          >
            <v-btn
              color="primary"
              outlined
              depressed
              :to="{name:'billing'}"
            >
              <v-icon>mdi-cart</v-icon>
              {{ $t('pages.billing.upgrade') }}
            </v-btn>
          </div>
        </div>
        <v-divider />
        <template v-for="item in navigationItems">
          <v-list-item
            v-if="!item.subItems"
            :key="item.name"
            v-bind="item"
            active-class="sub-item toolbar--text"
            dense
            :to="!item.disabled ? item : ''"
            :disabled="item.disabled"
          >
            <v-list-item-content>
              <v-list-item-title
                v-t="`routes.${item.name}`"
              />
            </v-list-item-content>
          </v-list-item>
          <v-list-group
            v-else-if="item.subItems && item.subItems.length"
            :key="item.name"
            v-model="item.active"
            class="v-list-item--dense hide-active"
            no-action
          >
            <template #activator>
              <v-list-item-content class="py-7">
                <v-list-item-title v-t="`routes.${item.name}`" />
                <v-list-item-subtitle>
                  {{ item.subItems.map((subItem) => $t(`routes.${subItem.name}`)).join(', ') }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </template>
            <span
              v-for="subItem in item.subItems"
              :key="subItem.title"
            >
              <v-list-item
                v-if="!subItem.external"
                :data-testid="subItem.name"
                class="pl-6 py-2"
                dense
                :to="!subItem.disabled ? subItem : ''"
                :disabled="subItem.disabled"
              >
                <v-list-item-icon class="mr-4">
                  <v-icon
                    size="24"
                  >{{ `${subItem.icon}` }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title
                    class="body-text"
                  >
                    {{ $t(`routes.${subItem.name}` ) }}
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-icon v-if="item.upgrade">
                  <v-icon
                    size="20"
                  >mdi-lock</v-icon>
                </v-list-item-icon>
              </v-list-item>

              <v-list-item
                v-else
                :data-testid="subItem.name"
                class="pl-6 py-2"
                dense
                :href="!subItem.disabled ? subItem.external : ''"
                target="_blank"
                :disabled="subItem.disabled"
              >
                <v-list-item-icon class="mr-4">
                  <v-icon
                    size="24"
                  >
                    {{ `${subItem.icon}` }}
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title
                    class="body-text"
                  >
                    {{ $t(`routes.${subItem.name}` ) }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </span>
          </v-list-group>
          <v-divider :key="item.key" />
        </template>
      </v-list>
    </div>
    <div
      class="d-flex flex-column align-center text-center py-8"
    >
      <v-img
        src="@/assets/support.png"
        max-width="80%"
      />
      <p
        class="caption mt-4 px-4 text--secondary text-center"
        v-text="$t('components.appDrawer.supportMessage')"
      />
      <v-btn
        v-t="'components.appDrawer.supportCenter'"
        color="primary"
        outlined
        depressed
        small
        href="https://help.sellervue.com"
        target="_blank"
      />
    </div>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'

import type { Account, AccountSettings } from '@/client/users'
import { AccountAccountTierEnum } from '@/client/users'
import type { Subscription } from '@/modules/billing/types/Subscription'
import type { IUser } from '@/modules/user/types'

import AppLogo from './AppLogo.vue'
import AppCreateNewDialog from './dialogs/AppCreateNewDialog.vue'

const namespaces = {
  user: 'user',
  accountSettings: 'accountSettings',
  app: 'app'
}

@Component({
  components: {
    AppLogo,
    AppCreateNewDialog
  }
})
export default class AppDrawer extends Vue {
  @State('darkMode', { namespace: namespaces.app }) darkMode?: boolean
  @State('subscription', { namespace: 'user' }) subscription!: Subscription
  @State('user', { namespace: namespaces.user }) user!: IUser;
  @Getter('isAdmin', { namespace: namespaces.user }) isAdmin!: boolean
  @Getter('isViewer', { namespace: namespaces.user }) isViewer!: boolean
  @Getter('isSysAdmin', { namespace: namespaces.user }) isSysAdmin!: boolean
  @Getter('currentAccount', { namespace: namespaces.user }) currentAccount!: Account
  @State('accountSettings', { namespace: namespaces.accountSettings }) accountSettings!: AccountSettings
  @Action('getAccountSettings', { namespace: namespaces.accountSettings }) getAccountSettings!: () => Promise<void>

  showCreateDialog = false
  async beforeMount () {
    await Promise.all([this.accountSettings ? null : this.getAccountSettings()])
  }

  get managementMenu () {
    return [
      {
        name: 'management',
        active: this.isManagementSectionEnabled,
        upgrade: !this.isManagementSectionEnabled,
        subItems: [
          { name: 'suppliers', icon: 'mdi-card-account-mail', disabled: !this.isManagementSectionEnabled },
          { name: 'products', icon: 'mdi-tag-multiple', disabled: !this.isManagementSectionEnabled },
          { name: 'invoices', icon: 'mdi-receipt', disabled: !this.isManagementSectionEnabled },
          this.isOrdersAndShippingEnabled ? { name: 'orders', icon: 'mdi-package-variant', disabled: !this.isManagementSectionEnabled } : null,
          { name: 'bills', icon: 'mdi-currency-usd', disabled: !this.isManagementSectionEnabled }
        ].filter(Boolean)
      }
    ]
  }

  get reportingMenu () {
    return [
      {
        name: 'reporting',
        active: false,
        subItems: [
          { name: 'profit', icon: 'mdi-cash-multiple', disabled: true },
          { name: 'revenue', icon: 'mdi-finance', disabled: true },
          { name: 'turnover', icon: 'mdi-chart-pie', disabled: true },
          { name: 'statistics', icon: 'mdi-poll', disabled: true },
          { name: 'trends', icon: 'mdi-chart-line-variant', disabled: true }
        ]
      }
    ]
  }

  get settingsMenu () {
    return [
      {
        name: 'settings',
        active: false,
        subItems: [
          { name: 'profile', icon: 'mdi-account' },
          (this.isAdmin && !this.isBillingLifetime) ? { name: 'billing', icon: 'mdi-credit-card' } : null,
          this.isAdmin ? { name: 'users', icon: 'mdi-account-multiple' } : null,
          this.isAdmin ? { name: 'integrations', icon: 'mdi-power-plug' } : null,
          this.isAdmin ? { name: 'accountSettings', icon: 'mdi-cog' } : null,
          { name: 'notifications', icon: 'mdi-bell-outline' },
          { name: 'support', icon: 'mdi-lifebuoy', external: 'mailto:support@sellervue.com' }
        ].filter(Boolean)
      }
    ]
  }

  get system () {
    return [
      {
        name: 'system',
        active: false,
        subItems: [
          this.isSysAdmin ? { name: 'userManagement', icon: 'mdi-account-group' } : null
          // { name: 'notifications', icon: 'mdi-bell-outline' }
        ].filter(Boolean)
      }
    ]
  }

  get marketplacesMenu () {
    return [
      {
        name: 'marketplaces',
        active: !this.isManagementSectionEnabled,
        subItems: [
          this.isFeeTrackerActive ? { name: 'feeTrackerPro', icon: 'mdi-chart-line' } : null,
          { name: 'marketplaceOverview1', icon: 'mdi-chart-line' },
          { name: 'marketplaceOverview2', icon: 'mdi-chart-line' },
          { name: 'marketplaceFees', icon: 'mdi-chart-line' }
        ].filter(Boolean)
      }
    ]
  }

  get navigationItems () {
    return [
      ...this.managementMenu,
      ...this.marketplacesMenu,
      ...this.settingsMenu,
      ...this.system
    ]
  }

  get isOrdersAndShippingEnabled (): boolean {
    return this.accountSettings?.isOrdersAndShippingEnabled || false
  }

  get isBillingLifetime (): boolean {
    return this.currentAccount.accountTier === AccountAccountTierEnum.Lifetime || false
  }

  get isManagementSectionEnabled (): boolean {
    return this.accountSettings?.isManagementSectionEnabled || false
  }

  get isFeeTrackerActive (): boolean {
    return this.accountSettings?.isFeeTrackerActive || false
  }
}

</script>

<style scoped lang="scss">
@import '~vuetify/src/styles/styles.sass';

.inactive::before {
  opacity: 0;
}

.v-list-group.v-list-group--active.hide-active {
  color: unset !important;
}

.sub-item,
.body-text {
  font-family: 'Roboto', sans-serif !important;
}
</style>
