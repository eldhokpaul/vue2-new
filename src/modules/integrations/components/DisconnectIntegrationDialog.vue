<template>
  <v-dialog
    v-model="dialogOpen"
    max-width="680px"
  >
    <v-card
      v-if="integration"
      class="pa-3"
    >
      <div class="d-flex">
        <v-avatar class="mr-2">
          <img
            :src="integration.icon"
          >
        </v-avatar>
        <div class="d-flex flex-column">
          <h3
            class="font-weight-medium"
            v-text="integration.name"
          />
          <p
            class="secondary--text"
            v-text="integration.category"
          />
        </div>
      </div>
      <p
        v-text="integration.disconnect"
      />

      <v-card-actions>
        <v-spacer />
        <v-btn
          depressed
          color="default"
          class="mr-2"
          @click="dialogOpen = false"
        >
          {{ $t('components.applications.cancel') }}
        </v-btn>
        <v-btn
          depressed
          color="error"
          @click="$emit('disconnectIntegration', integration)"
        >
          {{ $t('components.applications.disconnect') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class DisconnectIntegrationDialog extends Vue {
  @Prop({
    default: false
  })
  open!: boolean

  @Prop({ required: true })
  integration!: any

  get dialogOpen () {
    return this.open
  }

  set dialogOpen (val: boolean) {
    this.$emit('setDialogOpen', val)
  }
}
</script>
