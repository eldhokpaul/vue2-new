<template>
  <v-menu
    ref="menu"
    v-model="modal"
    :close-on-content-click="false"
    :return-value.sync="value"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template #activator="{ on, attrs }">
      <v-text-field
        v-model="dateRangeText"
        label="Date Range"
        readonly
        outlined
        prepend-inner-icon="mdi-calendar"
        dense
        hide-details
        v-bind="attrs"
        v-on="on"
      />
    </template>
    <v-date-picker
      v-model="value"
      range
      scrollable
      @change="onDatePickerChange"
    >
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="setDateRange"
      >
        OK
      </v-btn>
      <v-btn
        text
        color="primary"
        @click="modal = false"
      >
        Cancel
      </v-btn>
    </v-date-picker>
  </v-menu>
</template>

<script lang="ts">
import { format } from 'date-fns'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class DateRange extends Vue {
  @Prop({ default: [format(new Date(), 'yyyy-MM-dd'), format(new Date().setDate(new Date().getDate() + 1), 'yyyy-MM-dd')] })
  dates!: string[];

  modal = false;
  value: string[] = [];

  beforeMount () {
    this.value = [...this.dates]
  }

  get dateRangeText ():string {
    return `${this.dates[0] ? format(new Date(this.dates[0]), 'dd MMM yyyy') : ''}, ${this.dates[1] ? format(new Date(this.dates[1]), 'dd MMM yyyy') : ''}`
  }

  onDatePickerChange (value: string[]) {
    this.value = value
    return this.dates
  }

  setDateRange () {
    this.$emit('update', this.value)
    this.modal = false
  }
}
</script>
