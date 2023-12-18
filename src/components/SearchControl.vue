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
      >
        <v-icon>
          mdi-magnify
        </v-icon>
      </v-btn>
    </template>
    <v-card
      width="300px"
    >
      <v-list>
        <v-list-item>
          <v-text-field
            v-model="search"
            label="Search"
            outlined
            dense
            hide-details
            prepend-icon="mdi-magnify"
            clearable
            @keydown="emitSearch"
            @click:clear="emitSearch"
          />
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { Bind, Debounce } from 'lodash-decorators'
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class SearchControl extends Vue {
  dialog = false

  search = ''

  @Debounce(200)
  @Bind()
  emitSearch () {
    this.$emit('change', this.search)
  }
}
</script>
