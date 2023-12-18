<template>
  <v-form
    ref="form"
    v-model="valid"
    @submit.prevent="validate"
  >
    <form-builder
      :data="editingUser"
      :form-inputs="userInputs"
    />
    <form-builder
      :data="passwordData"
      :form-inputs="passwordFields"
    />
    <div class="d-flex justify-end align-center">
      <v-btn
        v-if="routeBack"
        v-t="'pages.app.back'"
        text
        class="mr-3"
        @click="$router.push({name: routeBack})"
      />
      <v-btn
        v-t="'components.userProfileForm.saveProfile'"
        type="submit"
        color="primary"
        depressed
      />
    </div>
  </v-form>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import type { User } from '@/client/users'
import FormBuilder from '@/components/FormBuilder/FormBuilder.vue'
import { IPassword } from '@/modules/user-management/types'

import timezones from '../data/timezones.json'
// import type { IUser } from '../types'

@Component({
  components: {
    FormBuilder
  }
})
export default class UserProfileForm extends Vue {
  timezones = timezones

  @Prop({ required: true })
  user!: User

  @Prop() routeBack!: string

  passwordData: IPassword ={ password: '', confirmPassword: '' }
  valid = false
  editingUser!: User
  get timezoneOptions () {
    return this.timezones.map((t: any) => {
      return {
        value: t.text,
        label: t.text
      }
    })
  }

  get rules () {
    return {
      required: [
        (v: string) => !!v || this.$t('pages.errors.rules.fieldRequired')
      ],
      confirmPasswordRules: [
        (v: string) =>
          v === this.passwordData.password || 'The password confirmation does not match.'
      ]
    }
  }

  validate () {
    const { form } = this.$refs as HTMLFormElement
    form.validate()
    if (this.valid && (this.passwordData.password === this.passwordData.confirmPassword)) {
      this.editingUser.password = this.passwordData.password
      this.$emit('submit', this.editingUser)
    }
  }

  beforeMount () {
    this.editingUser = Object.assign({
      ...this.user
    })
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

  get userInputs () {
    return [{
      model: 'firstName',
      type: 'text',
      props: {
        label: this.$t('components.userProfileForm.firstName'),
        rules: this.rules.required,
        autofocus: true,
        required: true
      }
    },
    {
      model: 'lastName',
      type: 'text',
      props: {
        label: this.$t('components.userProfileForm.lastName'),
        rules: this.rules.required,
        autofocus: true,
        required: true
      }
    },
    {
      model: 'email',
      type: 'text',
      props: {
        type: 'email',
        label: this.$t('components.userProfileForm.email'),
        rules: this.rules.required,
        autofocus: true,
        required: true
      }
    },
    {
      model: 'phone',
      type: 'text',
      props: {
        type: 'phone',
        label: this.$t('components.userProfileForm.phone')
      }
    },
    {
      model: 'locationTimeZone',
      type: 'select',
      props: {
        label: this.$t('components.userProfileForm.locationTimeZone'),
        items: this.timezoneOptions
      }
    },
    {
      model: 'company',
      type: 'text',
      props: {
        label: this.$t('components.userProfileForm.company')
      }
    },
    {
      model: 'bio',
      type: 'textarea',
      props: {
        label: this.$t('components.userProfileForm.briefBio')
      }
    }
    ]
  }
}
</script>
