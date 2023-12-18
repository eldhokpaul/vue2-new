<template>
  <div>
    <v-alert
      v-if="hasMaxItems"
      dense
      type="info"
      text
      class="mb-6"
    >
      <span>You can add a <strong>maximum</strong> of {{ maxItems }} payments</span>
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
        #[`header.paidFromAccount`]="{ header }"
      >
        {{ header.text }}
        <v-tooltip
          v-if="!isViewer"
          top
        >
          <template #activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              color="primary"
              icon
              @click="syncClick"
              v-on="on"
            >
              <v-icon>mdi-cached</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('components.PayablesTable.page.syncAccount') }}</span>
        </v-tooltip>
      </template>
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
        #[`item.status`]="{ item }"
      >
        <v-tooltip
          v-if="item.paymentStatus==='PAY' || item.paymentStatus==='OVERDUE'"
          top
        >
          <template #activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              class="pa-2 text-capitalize white--text"
              :disabled="isViewer"
              depressed
              small
              :color="getStatusColor(item.paymentStatus)"
              v-on="on"
              @click="payClick('pay',item.id)"
            >
              {{ item.paymentStatus }}
            </v-btn>
          </template>

          <span>{{ $t('components.PayablesTable.page.updatePayment') }}</span>
        </v-tooltip>

        <v-tooltip
          v-else-if="item.paymentStatus==='PAID'"
          :disabled="isViewer"
          top
        >
          <template #activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              class="pa-2 text-capitalize white--text"
              depressed
              :disabled="isViewer"
              small
              :color="getStatusColor(item.paymentStatus)"
              v-on="on"
              @click="payClick('undo',item.id)"
            >
              {{ item.paymentStatus }}
            </v-btn>
          </template>

          <span>{{ $t('components.PayablesTable.page.undoPayment') }}</span>
        </v-tooltip>

        <v-btn
          v-else-if="item.paymentStatus"
          class="pa-2 text-capitalize white--text"
          depressed
          small
          :color="getStatusColor(item.paymentStatus)"
        >
          {{ item.paymentStatus }}
        </v-btn>

        <v-btn
          v-else
          class="pa-2 text-capitalize white--text"
          depressed
          small
          disabled
        >
          {{ 'PAY' }}
        </v-btn>
      </template>
      <template
        v-if="!isViewer"
        #[`item.delete`]="{ item }"
      >
        <v-btn
          color="primary"
          text
          :disabled="hasMaxItems"
          icon
          @click="$emit('input', [...value, getDefaultObject()]),$emit('add:row')"
        >
          <v-icon>
            mdi-plus-circle
          </v-icon>
        </v-btn>

        <v-tooltip
          v-if="item.orderId"
          top
        >
          <template #activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              color="grey lighten-1"
              text
              icon
              v-on="on"
            >
              <v-icon>
                mdi-close
              </v-icon>
            </v-btn>
          </template>
          <span>{{ $t('components.PayablesTable.page.alreadyassociated') }}</span>
        </v-tooltip>

        <v-btn
          v-else
          :disabled="value.length==1 || (item.paymentStatus==='PAID')"
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
  name: 'PaymentsTable',
  components: {
    FormField
  }
})
export default class PaymentsTable extends Vue {
  @Getter('isViewer', { namespace: namespaces.user }) isViewer!: boolean

  @Prop({ default: () => ({}) })
  readonly dataTableProps!: any;

  @Prop({ default: -1 })
  maxItems!: number;

  @Prop({ required: true })
  headers!: any[]

  @Prop({ required: true })
  value!: any[]

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

  getStatusColor (status: string) {
    const state = status.toLowerCase()
    if (state === 'paid') return 'green'
    else if (state === 'pay') return 'blue'
    else if (state === 'pending') return 'orange'
    else if (state === 'overdue') return 'error'
  }

  payClick (action: string, id: number) {
    this.$emit('payment:action', id, action)
  }

  syncClick () {
    this.$emit('sync:account-code')
  }

  mounted () {
    if (!this.value.length) {
      this.$emit('input', [...this.value, this.getDefaultObject()])
      this.$emit('add:row')
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
