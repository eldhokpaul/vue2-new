<template>
  <v-dialog
    v-model="shouldShow"
    width="500"
    persistent
  >
    <v-card>
      <v-card-title v-t="title" />

      <v-card-text>
        <p v-t="details" />
        <v-form
          ref="form"
          v-model="valid"
          @submit.prevent="validate"
        >
          <v-select
            v-model="role"
            :items="roles"
            item-text="displayName"
            item-value="id"
            required
            :rules="rules.select"
            return-object
            :label="$t('pages.users.labelUserRole')"
            dense
            outlined
          />

          <div class="text-right">
            <v-btn
              v-t="'Update Role'"
              color="primary"
              depressed
              type="submit"
            />
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action } from 'vuex-class'

const namespaces = {
  user: 'user'
}
@Component
export default class AppSetUserNameDialog extends Vue {
  @Action('getUser', { namespace: namespaces.user }) getUser: any
  @Prop() shouldShow!: boolean
  @Prop() title!: string
  @Prop() details!: string
  @Prop() roles!: any

  email: string|undefined = '';
  role: any | null = null;
  valid = false

  get rules () {
    return {
      required: [
        (v: string) => !!v || this.$t('pages.errors.rules.fieldRequired')
      ],
      select: [(v: string) => !!v || this.$t('pages.errors.rules.required')]
    }
  }

  validate () {
    const { form } = this.$refs as HTMLFormElement
    form.validate()
    if (this.valid) {
      this.$emit('confirm', this.role)
    }
  }
}
</script>
