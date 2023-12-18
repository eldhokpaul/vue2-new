<template>
  <v-dialog
    v-model="shouldShow"
    width="500"
    @click:outside="$emit('update:close')"
  >
    <v-card>
      <v-card-title v-t="title" />

      <v-card-text v-t="details" />

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          v-t="'components.appConfirmationDialog.cancel'"
          text
          color="grey"
          @click="$emit('close')"
        />
        <v-btn
          v-t="'components.appConfirmationDialog.confirm'"
          color="primary"
          depressed
          :loading="isActive"
          @click="$emit('confirm')"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class AppConfirmationDialog extends Vue {
  @Prop({ default: false }) isActive!: boolean
  @Prop() shouldShow!: boolean
  @Prop({ default: 'components.appConfirmationDialog.confirm' }) title!: string
  @Prop({ default: 'components.appConfirmationDialog.confirmText' }) details!: string
}
</script>
