<template>
  <div>
    <v-alert
      v-if="hasMaxItems"
      dense
      type="info"
      text
      class="mb-6"
    >
      <span>{{ $t('components.tableControls.labels.youCanAdd') }}<strong>{{ $t('components.tableControls.labels.maximum') }}</strong>{{ $t('components.tableControls.labels.of') }}{{ maxItems }}{{ $t('components.tableControls.labels.payments') }}</span>
    </v-alert>
    <v-data-table
      dense
      fixed-header
      hide-default-footer
      :mobile-breakpoint="0"
      :headers="headersWithDelete"
      :items="value"
      class="editable-table-wrapper"
      v-bind="dataTableProps"
      :items-per-page="-1"
      v-on="$listeners"
    >
      <template
        v-for="h in headers"
        #[`item.${h.value}`]="{ item, header }"
      >
        <form-field
          v-if="!header.isEditable || header.isEditable(item)"
          :key="h.value"
          :form-input="header.field"
          :data="item"
          field-class="wrap-control"
          @change="(newVal, model) => $emit('change:field', newVal, model, item)"
        />
        <template v-else>
          -
        </template>
      </template>
      <template
        v-if="!isViewer"
        #[`item.delete`]="{ item }"
      >
        <v-btn
          v-if="!addButton"
          color="primary"
          text
          icon
          @click="$emit('input', [...value, getDefaultObject()])"
        >
          <v-icon>
            mdi-plus-circle
          </v-icon>
        </v-btn>
        <v-btn
          v-if="addButton || value.length>1"
          color="error"
          text
          icon
          @click="$emit('input', value.filter(i => i !== item))"
        >
          <v-icon>
            mdi-close
          </v-icon>
        </v-btn>
      </template>
      <template
        v-if="!isViewer && addButton"
        #top
      >
        <div
          class="ma-2 text-center"
        >
          <v-btn
            depressed
            color="primary"
            :disabled="hasMaxItems"
            @click="$emit('input', [...value, getDefaultObject()])"
          >
            {{ buttonLabel }}
          </v-btn>
        </div>
        <v-divider />
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import set from 'lodash.set'
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import FormField from '@/components/FormBuilder/FormField.vue'

const namespaces = {
  user: 'user'
}

@Component({
  name: 'EditableTable',
  components: {
    FormField
  }
})
export default class EditableTable extends Vue {
  @Getter('isViewer', { namespace: namespaces.user }) isViewer!: boolean

  @Prop({ default: () => ({}) }) readonly dataTableProps!: any;
  @Prop({ default: -1 }) maxItems!: number;
  @Prop({ default: true }) addButton!: boolean;
  @Prop({ required: true }) headers!: any[]
  @Prop({ required: true }) value!: any[]
  @Prop({ default: 'Add row' }) buttonLabel!: string

  get hasMaxItems () {
    return this.value.length >= this.maxItems && this.maxItems !== -1
  }

  get headersWithDelete () {
    return [
      ...this.headers,
      {
        text: '',
        value: 'delete',
        sortable: false
      }
    ]
  }

  getDefaultObject () {
    return this.headers.reduce((acc, cur) => {
      set(acc, cur.field.model, null)
      return acc
    }, {})
  }

  mounted () {
    if (!this.value.length && !this.addButton) {
      this.$emit('input', [...this.value, this.getDefaultObject()])
    }
  }
}
</script>

<style lang="scss">
.editable-table-wrapper {
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    -moz-appearance: textfield;
    -webkit-appearance: textfield;
  }

  &.v-data-table > .v-data-table__wrapper > table > tbody > tr > td {
    height: 40px;
  }

  & .wrap-control {
    &.v-input {
      &.v-input--dense .v-input__slot,
      &.v-input--dense .v-input__slot .v-select__slot {
        height: 28px;
        min-height: 28px;
        padding-right: 0;

        & .v-input__append-inner {
          margin-top: 0;
        }
      }

      & input {
        height: 20px;
      }
    }
  }
}

.editable-table-wrapper.v-data-table--fixed-header > .v-data-table__wrapper {
  max-height: calc(100vh - 360px) !important;
}
</style>
