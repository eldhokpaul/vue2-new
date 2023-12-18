<template>
  <div>
    <v-dialog
      v-model="showDialog"
      width="500"
      @click:outside="$emit('update:close')"
    >
      <v-card>
        <v-card-title v-t="isSuccess ? 'pages.invoices.actions.success': 'pages.invoices.actions.error'" />

        <v-card-text v-t="confirmationText" />

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            v-t="'components.appDialogDatePicker.ok'"
            depressed
            color="primary"
            @click="onOkClick"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class AppOkDialog extends Vue {
  @Prop() isSuccess!: boolean
  @Prop() showDialog!: boolean
  @Prop() params!: object
  @Prop() routeName!: string
  @Prop() confirmationText!: string

  onOkClick () {
    this.$emit('update:ok')
    if (!this.routeName) return

    this.$router.push({
      name: this.routeName,
      params: { ...this.params }
    })
  }
}
</script>
