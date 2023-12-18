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
          mdi-format-columns
        </v-icon>
      </v-btn>
    </template>
    <v-card
      width="250px"
      max-height="400px"
    >
      <v-list>
        <v-list-item>
          <template #default>
            <v-list-item-content>
              <v-list-item-title>{{ $t('components.tableControls.labels.selectAll') }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-switch
                :input-value="allSelected"
                @change="selectAll"
              />
            </v-list-item-action>
          </template>
        </v-list-item>
        <v-list-item-group
          v-model="selectedItems"
          multiple
          @change="headersChanged"
        >
          <template v-for="(item, i) in items">
            <v-list-item
              :key="`item-${i}`"
              :value="item.value"
            >
              <template #default="{ active }">
                <v-list-item-content>
                  <v-list-item-title>{{ item.text }}</v-list-item-title>
                </v-list-item-content>

                <v-list-item-action>
                  <v-checkbox
                    :input-value="active"
                  />
                </v-list-item-action>
              </template>
            </v-list-item>
          </template>
        </v-list-item-group>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { DataTableHeader } from 'vuetify'

interface HeaderItem {
  value: string
  text: string
}

@Component
export default class ColumnSelector extends Vue {
  @Prop({ required: true })
  headers!: DataTableHeader[]

  dialog = false

  get allSelected () {
    return this.items.length === this.selectedItems.length
  }

  get items (): HeaderItem[] {
    return this.headers.map((h: DataTableHeader) => ({
      value: h.value,
      text: h.text
    }))
  }

  selectedItems: string[] = this.headers.map((h: HeaderItem) => h.value)

  selectAll (val: boolean) {
    if (val) {
      this.selectedItems = this.items.map((h: HeaderItem) => h.value)
    } else {
      this.selectedItems = []
    }
    this.headersChanged()
  }

  headersChanged () {
    this.$emit('update', this.headers.filter(
      (h) => this.selectedItems.includes(h.value)
    ))
  }
}
</script>
