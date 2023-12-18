<template>
  <v-menu
    v-model="dialog"
    scrollable
    offset-y
    max-width="300px"
    :close-on-content-click="false"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        color="primary"
        icon
        v-bind="attrs"
        @click="$emit('column','columns')"
        v-on="on"
      >
        <v-icon>
          mdi-eye-off
        </v-icon>
      </v-btn>
    </template>
    <v-card
      width="300px"
      max-height="400px"
    >
      <v-list>
        <v-list-item>
          <v-btn
            v-t="'components.tableControls.labels.clearAll'"
            class="ma-2"
            small
            outlined
            :disabled="viewSavedColumn"
            @click="$emit('clear:column')"
          />
          <v-btn
            v-t="'components.tableControls.labels.saveToThisView'"
            outlined
            color="blue"
            small
            @click="$emit('save:column')"
          />
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class FilterOptions extends Vue {
  @Prop({ required: true })
  viewSavedColumn!: boolean

  dialog = false
}
</script>
