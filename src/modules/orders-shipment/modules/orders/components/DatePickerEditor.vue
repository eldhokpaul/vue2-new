<template>
  <v-date-picker
    v-model="date"
    @input="onDateSelected"
  />
</template>

<script lang="ts">
import { ICellEditor, ICellEditorParams } from 'ag-grid-enterprise'
import { addMinutes, format } from 'date-fns'
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class DatePickerEditor extends Vue implements ICellEditor {
  params!: ICellEditorParams
  selectedDate=''
  beforeMount () {
    this.selectedDate = this.params.value
  }

  get date () {
    const date = this.params.value ? Number(this.params.value) : ''
    return date ? format(date, 'yyyy-MM-dd') : ''
  }

  set date (val) {
    if (val) {
      const newDate = new Date(val)
      const timeAdjustedDate = addMinutes(newDate, newDate.getTimezoneOffset())
      this.selectedDate = timeAdjustedDate.getTime().toString()
    }
  }

  onDateSelected () {
    this.params.api.stopEditing()
  }

  getValue () {
    return this.selectedDate
  }

  isPopup () {
    return true
  }
}
</script>
