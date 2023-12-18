<template>
  <v-menu
    ref="dialog"
    v-model="modal"
    :close-on-content-click="false"
    transition="fade-transition"
    offset-y
    min-width="auto"
    content-class="elevation-0 v-sheet--outlined"
  >
    <template #activator="{ on, attrs }">
      <v-text-field
        v-model="prettyDate"
        :class="inputClass"
        :label="$t(label)"
        readonly
        v-bind="{...attrs, ...inputProps}"
        outlined
        dense
        v-on="on"
        @click:clear="value = null"
      />
    </template>
    <v-date-picker
      v-model="value"
      scrollable
      @input="menu2 = false"
    >
      <v-spacer />
      <v-btn
        v-t="'components.appDialogDatePicker.cancel'"
        text
        color="primary"
        @click="modal = false"
      />
      <v-btn
        v-t="'components.appDialogDatePicker.ok'"
        text
        color="primary"
        @click="$refs.dialog.save(value)"
      />
    </v-date-picker>
  </v-menu>
</template>
<script lang="ts">
import { addMinutes, format } from 'date-fns'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class AppDialogDatePicker extends Vue {
  modal= false

  @Prop({ default: '' })
  label!: string

  @Prop({
    default: ''
  })
  hint!: string

  @Prop({ required: false })
  date!: number

  @Prop({ required: false, default: {} })
  inputProps!: Record<string, any>

  @Prop({ default: '' })
  inputClass!: string

  get value () {
    return this.date ? format(this.date, 'yyyy-MM-dd') : ''
  }

  set value (val) {
    if (val) {
      const newDate = new Date(val)
      const timeAdjustedDate = addMinutes(newDate, newDate.getTimezoneOffset())
      this.$emit('update', Number(timeAdjustedDate.getTime()))
    } else {
      this.$emit('update', '')
    }
  }

  get prettyDate (): string {
    return this.date ? format(this.date, 'dd MMM yyyy') : ''
  }

  set prettyDate (val) {
    // return this.date ? format(this.date, 'dd MMM yyyy') : ''
  }
}
</script>

<style lang="scss" scoped>
.menuable__content__active {
  margin-top: -16px;
  contain: initial;
  overflow: visible;
}

.menuable__content__active::before {
  position: absolute;
  content: "";
  top: 4px;
  left: 0;
  right: 0;
  margin: auto;
  transform: translateY(-100%);
  width: 10px;
  height: 13px;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 13px solid $primary;
}
</style>
