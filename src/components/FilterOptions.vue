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
        v-on="on"
        @click="$emit('filter','filters')"
      >
        <v-icon>
          mdi-filter
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
            :disabled="viewSavedFilter"
            @click="$emit('clear:filter')"
          />
          <v-btn
            v-t="'components.tableControls.labels.saveToThisView'"
            outlined
            color="blue"
            small
            @click="$emit('save:filter')"
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
  viewSavedFilter!: boolean

  dialog = false
}
</script>
