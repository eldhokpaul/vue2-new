<template>
  <v-container>
    <v-form
      ref="form"
      v-model="valid"
      @submit.prevent="validate"
    >
      <!-- <form-builder
      :data="userDetails"
      :form-inputs="userFields"
    /> -->
      <v-row class="flex-sm-column flex-md-row">
        <v-col
          cols="12"
          md="6"
          class="text-md-start text-sm-center"
        >
          <h4
            class="mb-4"
          >
            {{ $t('components.usersForm.userDetails') }}
          </h4>
          <form-builder
            :data="userDetails"
            :form-inputs="userFields"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
          class="text-md-start text-sm-center"
        >
          <h4
            class="mb-4"
          >
            {{ $t('components.usersForm.accountDetails') }}
          </h4>
          <form-builder
            :data="userDetails"
            :form-inputs="accountFields"
          />
          <form-builder
            :data="passwordData"
            :form-inputs="passwordFields"
          />
          <v-card
            outlined
            tile
            class="pt-0 pb-4 mb-6"
            flat
          >
            <v-card-text>
              <form-builder
                :data="userDetails"
                class="d-sm-flex flex-row justify-start"
                :form-inputs="accountFieldsSwich"
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          class="text-md-start text-sm-center"
        >
          <h4
            class="mb-3"
          >
            {{ $t('components.usersForm.sellerAccount') }}
          </h4>
          <v-card
            outlined
            tile
            class="pt-0 pb-4 mb-6"
            flat
          >
            <v-card-text>
              <form-builder
                :data="accountSettings"
                class="d-sm-flex flex-row justify-start"
                :form-inputs="sellerVueAccountFieldsSwich"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <div class="d-flex justify-space-between align-center">
        <v-btn

          text
          :to="{
            name: 'userManagement'
          }"
          exact
          class="mr-2"
        >
          {{ $t('components.usersForm.cancel') }}
        </v-btn>
        <v-btn
          type="submit"
          color="primary"
          depressed
        >
          {{ $t('components.usersForm.updateUser') }}
        </v-btn>
      <!-- </div>
    </div> -->
      </div>
    </v-form>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import type { AccountSettingsDto, UserAdminPatchDto } from '@/client/users'
// AccountSettingsDto
import AppDeleteDialog from '@/components/dialogs/AppDeleteDialog.vue'
import FormBuilder from '@/components/FormBuilder/FormBuilder.vue'
import FormField from '@/components/FormBuilder/FormField.vue'
import type { ObjectKeyAsAny } from '@/types/app'

import { IPassword } from '../types'

const namespaces = {
  userManagement: 'userManagement'
}
@Component({
  components: {
    AppDeleteDialog,
    FormBuilder,
    FormField
  }
})
export default class UserForm extends Vue {
  @Prop({ required: true }) userDetails!: UserAdminPatchDto
  @Prop({ required: true }) accountSettingsByUser!: AccountSettingsDto
  @State('userTiers', { namespace: namespaces.userManagement }) userTiers!: ObjectKeyAsAny;
  accountSettings!:AccountSettingsDto
  passwordData: IPassword ={ password: '', confirmPassword: '' }
  valid = false
  rules = {
    required: [
      (v: string) => !!v || this.$t('pages.errors.rules.fieldRequired')
    ],
    confirmPasswordRules: [
      (v: string) =>
        v === this.passwordData.password || 'The password confirmation does not match.'
    ]
  }

  async validate () {
    const { form } = this.$refs as HTMLFormElement
    await form.validate()
    if (this.valid && (this.passwordData.password === this.passwordData.confirmPassword)) {
      Vue.delete(this.accountSettings, 'accountId')
      Vue.delete(this.accountSettings, 'accountName')
      Vue.delete(this.accountSettings, 'currency')
      const details: UserAdminPatchDto = {
        firstName: this.userDetails.firstName,
        lastName: this.userDetails.lastName,
        phone: this.userDetails.phone,
        company: this.userDetails.company,
        unixDateOfBirth: this.userDetails.unixDateOfBirth,
        password: this.passwordData.password,
        tier: this.userDetails.tier,
        unixTierExpiryDate: this.userDetails.unixTierExpiryDate,
        isActive: this.userDetails.isActive,
        isVerified: this.userDetails.isVerified,
        accountSettings: this.accountSettings
      }
      this.$emit('submit', details)
    }
  }

  beforeMount () {
    this.accountSettings = { ...this.accountSettingsByUser }
  }

  get userTiersValues () {
    if (!this.userTiers) return []
    return Object.keys(this.userTiers).map(key => {
      return { label: this.userTiers[key], value: key }
    }).sort((a, b) => a.label.localeCompare(b.label))
  }

  get userFields () {
    return [
      {
        model: 'email',
        type: 'text',
        props: {
          label: 'Email',
          required: false,
          readonly: true,
          type: 'email'
        }
      },
      {
        model: 'firstName',
        type: 'text',
        props: {
          autofocus: true,
          label: 'First name'
          // required: true,
          // rules: this.rules.required
        }
      },
      {
        model: 'lastName',
        type: 'text',
        props: {
          label: 'Last Name'
          // required: true,
          // rules: this.rules.required
        }
      },
      {
        model: 'phone',
        type: 'text',
        props: {
          label: 'Phone number',
          // required: true,
          // rules: this.rules.required,
          type: 'tel'
        }
      },
      {
        model: 'company',
        type: 'text',
        props: {
          label: 'Company'
          // required: true,
          // rules: this.rules.required
        }
      },
      {
        model: 'unixDateOfBirth',
        type: 'datePicker',
        hint: 'Date of birth',
        variant: 'nullable',
        props: {
          label: 'Date of birth',
          clearable: true
        }
      }
    ].filter(Boolean)
  }

  get passwordFields () {
    return [
      {
        model: 'password',
        type: 'text',
        props: {
          label: 'Password',
          required: false,
          type: 'password'
        }
      },
      {
        model: 'confirmPassword',
        type: 'text',
        props: {
          label: 'Password confirmation',
          rules: this.rules.confirmPasswordRules,
          required: false,
          type: 'password'
        }
      }
    ]
  }

  get accountFields () {
    return [
      {
        model: 'tier',
        type: 'select',
        class: 'mb-6',
        props: {
          label: 'Tier',
          'hide-details': true,
          // rules: this.rules.required,
          // required: true,
          clearable: true,
          items: this.userTiersValues
        }
      },
      {
        model: 'unixTierExpiryDate',
        type: 'datePicker',
        hint: 'Tier expiry date',
        variant: 'nullable',
        props: {
          clearable: true,
          label: 'Tier expiry date'
        }
      }
    ].filter(Boolean)
  }

  get accountFieldsSwich () {
    return [
      {
        model: 'isActive',
        type: 'switch',
        class: 'mx-6',
        props: {
          label: 'Active',
          inset: true,
          'hide-details': true
        }
      },
      {
        model: 'isVerified',
        type: 'switch',
        class: 'mx-6',
        props: {
          label: 'Verified',
          'hide-details': true,
          inset: true
        }
      }
    ].filter(Boolean)
  }

  get sellerVueAccountFieldsSwich () {
    return [
      {
        model: 'isOrdersAndShippingEnabled',
        type: 'switch',
        class: 'mx-6',
        props: {
          label: 'Orders & Shipping',
          inset: true,
          'hide-details': true
        }
      },
      {
        model: 'isXeroConnectivityEnabled',
        type: 'switch',
        class: 'mx-6',
        props: {
          label: 'Xero',
          'hide-details': true,
          inset: true
        }
      },
      {
        model: 'isDemoAccount',
        type: 'switch',
        class: 'mx-6',
        props: {
          label: 'Demo Account',
          'hide-details': true,
          inset: true
        }
      },
      {
        model: 'isManagementSectionEnabled',
        type: 'switch',
        class: 'mx-6',
        props: {
          label: 'SellerVue Management',
          'hide-details': true,
          inset: true
        }
      },
      this.accountSettingsByUser.isFeeTrackerActive
        ? {
            model: 'isFeeTrackerActive',
            type: 'switch',
            class: 'mx-6',
            props: {
              label: 'Fee Tracker',
              'hide-details': true,
              inset: true
            }
          }
        : false
    ].filter(Boolean)
  }
}
</script>
