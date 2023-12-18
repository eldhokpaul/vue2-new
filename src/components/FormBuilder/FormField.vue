<template>
  <div :data-fieldid="formInput.model">
    <!-- Change function can either be called with { value: string } on select or just string on text -->
    <v-combobox
      v-if="formInput.type === 'combo'"
      :value="getModelData(formInput.model)"
      v-bind="props"
      :class="fieldClass"
      dense
      outlined
      @change="(newVal) => handleChange(newVal.value || newVal, formInput.model)"
    />
    <!-- @change="(newVal) => handleChange(newVal, formInput.model)"
    v-text-field action event changed from @change to @input for mutate
    -->

    <v-text-field
      v-if="formInput.type === 'text'"
      v-mask="formInput.mask ? formInput.mask : null"
      v-bind="props"
      :value="getModelData(formInput.model)"
      :class="fieldClass"
      outlined
      dense
      @input="(newVal) => handleChange(newVal, formInput.model)"
    />
    <v-textarea
      v-else-if="formInput.type === 'textarea'"
      :value="getModelData(formInput.model)"
      v-bind="props"
      :class="fieldClass"
      outlined
      dense
      @change="(newVal) => handleChange(newVal, formInput.model)"
    />
    <v-autocomplete
      v-else-if="formInput.type === 'select' && !formInput.variant"
      :value="getModelData(formInput.model)"
      v-bind="props"
      :class="fieldClass"
      item-text="label"
      item-value="value"
      outlined
      dense
      @change="(newVal) => handleChange(newVal, formInput.model)"
    />
    <v-select
      v-else-if="formInput.type === 'select' && formInput.variant === 'chip'"
      :value="getModelData(formInput.model)"
      :class="fieldClass"
      v-bind="props"
      item-text="label"
      item-value="value"
      outlined
      dense
      @change="(newVal) => handleChange(newVal, formInput.model)"
    >
      <template #item="{item}">
        <app-chip
          :type="item.type || 'invoice'"
          :item="item"
        />
      </template>
      <template #selection="{item}">
        <app-chip
          :type="item.type || 'invoice'"
          :item="item"
        />
      </template>
    </v-select>
    <v-select
      v-else-if="formInput.type === 'select' && formInput.variant === 'flag'"
      :value="getModelData(formInput.model)"
      :class="fieldClass"
      v-bind="props"
      item-text="label"
      item-value="value"
      outlined
      dense
      @change="(newVal) => handleChange(newVal, formInput.model)"
    >
      <template #selection="{ item }">
        <div class="d-flex align-center">
          <span :class="`fi fi-${item.flag}`" />
          <span class="pl-2 pt-1">{{ item.label }}</span>
        </div>
      </template>
      <template
        #item="{ item } "
      >
        <div class="d-flex align-center">
          <span :class="`fi fi-${item.flag}`" />
          <span class="pl-2 pt-1">{{ item.label }}</span>
        </div>
      </template>
    </v-select>
    <template v-else-if="formInput.type === 'datePicker' && !formInput.variant">
      <app-dialog-date-picker
        v-bind="props"
        :show-label="false"
        :input-class="fieldClass"
        :input-props="props"
        :date="datePickerValue(getModelData(formInput.model), formInput.model)"
        @update="val => handleDateChange(val, formInput.model)"
      />
    </template>
    <template v-else-if="formInput.type === 'datePicker' && formInput.variant === 'nullable'">
      <app-dialog-date-picker
        v-bind="props"
        :show-label="false"
        :input-class="fieldClass"
        :input-props="props"
        :date="nullableDatePickerValue(getModelData(formInput.model), formInput.model)"
        @update="val => handleDateChange(val, formInput.model)"
      />
    </template>
    <v-checkbox
      v-else-if="formInput.type === 'checkbox'"
      :class="fieldClass"
      v-bind="props"
      :input-value="data[formInput.model]"
      @change="(newVal) => handleChange(newVal, formInput.model)"
    />
    <v-switch
      v-else-if="formInput.type === 'switch'"
      :class="fieldClass"
      v-bind="props"
      :input-value="data[formInput.model]"
      @change="(newVal) => handleChange(newVal, formInput.model)"
    />
  </div>
</template>

<script lang="ts">
import get from 'lodash.get'
import set from 'lodash.set'
import { Component, Prop, Vue } from 'vue-property-decorator'

import AppChip from '@/components/AppChip.vue'
import AppDialogDatePicker from '@/components/AppDialogDatePicker.vue'
import { identity } from '@/utils/masks'

@Component({
  components: {
    AppChip,
    AppDialogDatePicker
  }
})
export default class FormField extends Vue {
    @Prop({ required: true })
    formInput: any

    @Prop({ required: true })
    data: any

    @Prop({ default: '' })
    fieldClass!: string

    identity = identity

    get props (): any {
      const disabled = this.formInput.disabled
        ? this.formInput.disabled(this.data)
        : this.formInput.props.disabled
      return {
        ...this.formInput.props,
        disabled
      }
    }

    datePickerValue (val: string, model: string) {
      if (!val) {
        this.handleChange(Date.now().toString(), model)
        this.$emit('change', Date.now(), model)
        return Date.now()
      }
      this.$emit('change', Number(val), model)
      return Number(val)
    }

    nullableDatePickerValue (val: string, model: string) {
      if (!val) {
        // this.handleChange(Date.now().toString(), model)
        // this.$emit('change', Date.now(), model)
        // return Date.now()
        this.handleChange('', model)
        this.$emit('change', '', model)
        return ''
      }
      this.$emit('change', Number(val), model)
      return Number(val)
    }

    handleChange (newValue: string, value: string) {
      set(this.data, value, newValue)
      this.$emit('change', newValue, value)
    }

    getModelData (value: string) {
      return get(this.data, value)
    }

    async handleDateChange (newDate: string, value: string) {
      set(this.data, value, newDate)
    }
}
</script>
