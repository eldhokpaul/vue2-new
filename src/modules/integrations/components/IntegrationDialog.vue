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
        v-text="integration.description"
      />
      <v-btn
        depressed
        color="primary"
        @click="openConnect"
      >
        {{ integration.dialogButton }}
      </v-btn>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class IntegrationDialog extends Vue {
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

  openConnect () {
    location.href = this.integration.url
  }
}
</script>
