<template>
  <div>
    <v-btn
      v-t="actionBtnText"
      depressed
      exact
      color="error"
      text
      :block="block"
      @click.stop="open = true"
    />
    <v-dialog
      v-model="open"
      :max-width="maxWidth"
    >
      <v-card outlined>
        <v-card-title
          v-t="'components.appDeleteDialog.title'"
          color="danger"
        />
        <v-card-text
          v-t="confirmText"
          color="danger"
        />

        <v-card-actions>
          <v-spacer />
          <v-btn
            v-t="'components.appDeleteDialog.actions.cancel'"
            text
            color="grey"
            @click="open = false"
          />
          <v-btn
            v-t="'components.appDeleteDialog.actions.delete'"
            text
            color="red"
            @click="$emit('confirm')"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class AppDeleteDialog extends Vue {
  open = false
  @Prop({ default: 'components.appDeleteDialog.text' }) confirmText!: string
  @Prop({ default: 'components.appDeleteDialog.actions.delete' }) actionBtnText!: string
  @Prop({ default: false }) block!: boolean
  @Prop({ default: 380 }) maxWidth!: number
}
</script>
