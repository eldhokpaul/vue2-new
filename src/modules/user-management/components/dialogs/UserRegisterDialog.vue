<template>
  <v-dialog
    v-model="shouldShow"
    width="600"
    @click:outside="$emit('update:close')"
  >
    <v-form
      ref="form"
      v-model="valid"
      @submit.prevent="validate"
    >
      <v-card>
        <v-card-title>{{ $t('components.usersDialogs.newUserRegistration') }}</v-card-title>
        <v-divider />
        <v-container>
          <v-row class="px-2">
            <!-- <v-card-text
              v-t="details"
              class="font-weight-medium"
            /> -->
            <v-col
              cols="12"
            >
              <v-subheader class="ps-0">
                {{ 'Customer Email' }}
              </v-subheader>
              <v-text-field
                v-model.trim="value"
                outlined
                required
                :rules="rules.email"
                type="email"
                dense
                placeholder="example@domain.com"
              />
            </v-col>
          </v-row>
        </v-container>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            color="grey"
            @click="$emit('close')"
          >
            {{ $t('components.usersDialogs.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            depressed
            type="submit"
          >
            {{ $t('components.usersDialogs.register') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import EditableTable from '@/components/EditableTable.vue'
import FormBuilder from '@/components/FormBuilder/FormBuilder.vue'

@Component({
  components: {
    EditableTable,
    FormBuilder
  }
})
export default class UserRegisterDialog extends Vue {
  @Prop({ required: true })
  value!: string

  @Prop() shouldShow!: boolean
  // @Prop({ default: 'Payment Confirmation Email' }) title!: string

  valid = false

  rules = {
    email: [
      (v: string) => /.+@.+\..+/.test(v) || !v || this.$t('pages.errors.rules.emailValid')
    ]
  }

  get formFeildEmail () {
    return [
      {
        model: 'email',
        type: 'text',
        props: {
          label: 'Email',
          required: true,
          rules: this.rules.email,
          type: 'email'
        }
      }
    ]
  }

  validate () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.$refs.form.validate()
    if (this.valid) {
      this.$emit('confirm', this.value)
    }
  }
}
</script>
