<template>
  <v-dialog
    v-model="value"
    persistent
  >
    <v-card
      outlined
      class="px-5 pb-5"
    >
      <v-row>
        <v-col
          cols="12"
        >
          <v-btn
            icon
            exact
            large
            class="float-right mx-1 mt-2 mb-n4"
            :disabled="loading"
            @click="$emit('close-action', false)"
          >
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <v-form
        ref="shipmentPlanForm"
        v-model="validShipmentPlanForm"
        :readonly="isViewer"
        @submit.prevent="$emit('update:submit')"
      >
        <template v-if="value && !initialLoadTask.isActive && shipmentPlanDetails">
          <v-row class="py-0 my-0">
            <v-col
              cols="12"
              class="my-0 py-0 mx-0 px-0"
            >
              <v-card-title
                v-t="'components.shipmentPlanForm.shipmentPlan'"
              />
            </v-col>

            <v-col
              v-for="(input, key) in shipmentPlanInputs"
              :key="'shipmentPlanInputs'+key"
              cols="12"
              md="4"
              class="my-0 py-0"
            >
              <v-tooltip
                :key="key"
                top
                left
                max-width="480px"
              >
                <template #activator="{ on, attrs }">
                  <div
                    v-bind="attrs"
                    v-on="on"
                  >
                    <form-field
                      :class="input.class"
                      :form-input="input"
                      :data="shipmentPlanDetails"
                    />
                  </div>
                </template>
                <span v-text="input.hint" />
              </v-tooltip>
            </v-col>
            <v-col
              cols="12"
              class="my-0 py-0 mx-0 px-0"
            >
              <v-card-title v-t="'components.shipmentPlanForm.shippingFrom'" />
            </v-col>
            <v-col
              v-for="(input, key) in shipmentFromInputs"
              :key="'shipmentFromInputs'+key"
              cols="12"
              md="4"
              class="my-0 py-0"
            >
              <v-tooltip
                :key="key"
                top
                left
                max-width="480px"
              >
                <template #activator="{ on, attrs }">
                  <div
                    v-bind="attrs"
                    v-on="on"
                  >
                    <form-field
                      :class="input.class"
                      :form-input="input"
                      :data="shipmentPlanDetails"
                    />
                  </div>
                </template>
                <span v-text="input.hint" />
              </v-tooltip>
            </v-col>
            <v-col
              cols="12"
              class="my-0 py-0 mx-0 px-0"
            >
              <v-card-title v-t="'components.shipmentPlanForm.shippingTo'" />
            </v-col>
            <v-col
              v-for="(input, key) in shipmentToInputs"
              :key="'shipmentToInputs'+key"
              cols="12"
              md="4"
              class="my-0 py-0"
            >
              <v-tooltip
                :key="key"
                top
                left
                max-width="480px"
              >
                <template #activator="{ on, attrs }">
                  <div
                    v-bind="attrs"
                    v-on="on"
                  >
                    <form-field
                      :class="input.class"
                      :form-input="input"
                      :data="shipmentPlanDetails"
                    />
                  </div>
                </template>
                <span v-text="input.hint" />
              </v-tooltip>
            </v-col>
            <v-col
              cols="12"
              class="my-0 py-0 mx-0 px-0"
            >
              <v-card-title v-t="'components.shipmentPlanForm.shipping'" />
            </v-col>
            <v-col
              v-for="(input, key) in shipmentInputs"
              :key="'shipmentInputs'+key"
              cols="12"
              md="4"
              class="my-0 py-0"
            >
              <v-tooltip
                :key="key"
                top
                left
                max-width="480px"
              >
                <template #activator="{ on, attrs }">
                  <div
                    v-bind="attrs"
                    v-on="on"
                  >
                    <form-field
                      :class="input.class"
                      :form-input="input"
                      :data="shipmentPlanDetails"
                    />
                  </div>
                </template>
                <span v-text="input.hint" />
              </v-tooltip>
            </v-col>
            <v-col
              cols="12"
              class="my-0 py-0 mx-0 px-0"
            >
              <v-card-title v-t="'components.shipmentPlanForm.otherShipment'" />
            </v-col>
            <v-col
              v-for="(input, key) in otherShipmentDetailsInputs"
              :key="'otherShipmentDetailsInputs'+key"
              cols="12"
              md="4"
              class="my-0 py-0"
            >
              <v-tooltip
                :key="key"
                top
                left
                max-width="480px"
              >
                <template #activator="{ on, attrs }">
                  <div
                    v-bind="attrs"
                    v-on="on"
                  >
                    <form-field
                      :class="input.class"
                      :form-input="input"
                      :data="shipmentPlanDetails"
                    />
                  </div>
                </template>
                <span v-text="input.hint" />
              </v-tooltip>
            </v-col>
          </v-row>
          <v-card-actions>
            <v-spacer />
            <v-btn
              v-t="'components.shipmentPlanForm.close'"
              depressed
              color="default"
              :disabled="loading"
              class="mr-2"
              @click="$emit('close-action', false)"
            />
            <v-btn
              v-t="'components.shipmentPlanForm.update'"
              depressed
              :loading="loading"
              color="primary"
              @click="updateShipmentPlan"
            />
          </v-card-actions>
        </template>
        <template v-else>
          <v-skeleton-loader type="list-item" />
          <v-skeleton-loader type="list-item" />
          <v-skeleton-loader type="list-item" />
          <v-skeleton-loader type="table" />
          <v-skeleton-loader type="list-item" />
          <v-skeleton-loader type="list-item" />
        </template>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'

import type { ShipmentPlan, ShipmentPlanPatchDto } from '@/client/orders'
import FormField from '@/components/FormBuilder/FormField.vue'
import { Task } from '@/decorators/task'
import { ICurrency } from '@/modules/account-settings/types'
import { ICountry } from '@/modules/contacts/types'
import type { ObjectKeyAsAny } from '@/types/app'
enum InputType {
  datePicker = 'datePicker',
  select = 'select',
  text = 'text',
  number = 'number',
  email = 'email',
  checkbox = 'checkbox'
}
const namespaces = {
  user: 'user',
  accountSettings: 'accountSettings',
  orders: 'orders'
}
enum ShipmentPlanShipmentPlanStatusEnum {
    Open = 'OPEN',
    InTransit = 'IN_TRANSIT',
    Received = 'RECEIVED',
    Closed = 'CLOSED',
    Archived = 'ARCHIVED'
}
@Component({
  components: {
    FormField
  }
})
export default class ShipmentPlanEdit extends Vue {
  @Prop({ required: true }) value!: number
  // @Prop({ required: true }) id!: number
  @Prop() readonly loading!: boolean
  @Prop({ default: [] }) countries!: ICountry[]
  @State('addressTypes', { namespace: namespaces.orders }) addressTypes!: ObjectKeyAsAny
  @State('calculateByOptions', { namespace: namespaces.orders }) calculateByOptions!: ObjectKeyAsAny
  @State('containerTypes', { namespace: namespaces.orders }) containerTypes!: ObjectKeyAsAny
  @State('goodsTimelineOptions', { namespace: namespaces.orders }) goodsTimelineOptions!: ObjectKeyAsAny
  @Getter('currencySymbol', { namespace: namespaces.accountSettings }) currencySymbol!: string
  @Getter('isViewer', { namespace: namespaces.user }) isViewer!: boolean
  @Action('fetchFullShipmentPlanForUser', { namespace: namespaces.orders }) fetchFullShipmentPlanForUser!: (shipmentPlanId: number) => Promise<void>;
  @State('shipmentPlan', { namespace: namespaces.orders }) shipmentPlan!: ShipmentPlan
  @State('currencies', { namespace: namespaces.accountSettings }) currencies!: ICurrency[]
  @Action('patchShipmentPlanDetailsForUser', { namespace: namespaces.orders }) patchShipmentPlanDetailsForUser!: (params: { shipmentPlanId: number, shipmentPlanPatchDto?: ShipmentPlanPatchDto }) => Promise<void>;

  // @Prop() readonly value!: number

  shipmentPlanDetails: ShipmentPlan={}
  validShipmentPlanForm=false
  shipmentPlanShipmentPlanStatus=ShipmentPlanShipmentPlanStatusEnum
  lockShipmentPlan=false
  rules = {
    required: [
      (v: string) => !!v || this.$t('pages.errors.rules.fieldRequired')
    ]
  }

  // beforeMount () {
  //   if (this.value) {
  //     this.initialLoad()
  //   }
  // }

  @Watch('value', { immediate: true, deep: true })
  onIdChanged () {
    this.initialLoad()
  }

  @Watch('shipmentPlanDetails.shipmentPlanStatus', { immediate: true, deep: true })
  onShipmentPlanStatusChanged (val: ShipmentPlanShipmentPlanStatusEnum) {
    const lockStatuses = [
      this.shipmentPlanShipmentPlanStatus.Open
    ]
    if (lockStatuses.includes(val)) {
      this.lockShipmentPlan = false
    } else {
      this.lockShipmentPlan = true
    }
  }

  // onShipmentPlanStatusChanged (val: string, oldVal: string) {
  //   if (val === this.shipmentPlanShipmentPlanStatus.InTransit && oldVal !== this.shipmentPlanShipmentPlanStatus.InTransit) {
  //     this.lockShipmentPlan = true
  //     if (this.shipmentPlan.currency?.id) {
  //       this.shipmentPlanDetails = { ...this.shipmentPlan, shipmentPlanStatus: this.shipmentPlanShipmentPlanStatus.InTransit }
  //     } else {
  //       const currency = this.currencies?.find(item => item.currencySymbol === this.currencySymbol)
  //       this.shipmentPlanDetails = { ...this.shipmentPlan, shipmentPlanStatus: this.shipmentPlanShipmentPlanStatus.InTransit, currency }
  //     }

  //   // } else if (oldVal === this.shipmentPlanShipmentPlanStatus.InTransit) { this.lockShipmentPlan = false }
  //   } else if (val !== this.shipmentPlanShipmentPlanStatus.InTransit) {
  //     this.lockShipmentPlan = false
  //   }
  // }

  @Task('initialLoadTask')
  async initialLoad () {
    await this.fetchShipmentPlan()
    if (this.shipmentPlan.currency?.id) {
      this.shipmentPlanDetails = { ...this.shipmentPlan }
    } else {
      const currency = this.currencies?.find(item => item.currencySymbol === this.currencySymbol)
      this.shipmentPlanDetails = { ...this.shipmentPlan, currency: { id: currency?.id } }
    }
  }

  get addressTypesValues () {
    if (!this.addressTypes) return []
    return Object.keys(this.addressTypes).map(costKey => {
      return { label: this.addressTypes[costKey], value: costKey }
    }).sort((a, b) => a.label.localeCompare(b.label))
  }

  get shipmentPlanStatusValues () {
    return [
      {
        label: this.$t('components.shipmentPlanForm.open'),
        status: this.$t('components.shipmentPlanForm.open'),
        value: this.shipmentPlanShipmentPlanStatus.Open,
        type: 'shipment',
        disabled: false
      },
      {
        label: this.$t('components.shipmentPlanForm.intransit'),
        status: this.$t('components.shipmentPlanForm.intransitStatus'),
        value: this.shipmentPlanShipmentPlanStatus.InTransit,
        type: 'shipment',
        disabled: false
      },
      {
        label: this.$t('components.shipmentPlanForm.received'),
        status: this.$t('components.shipmentPlanForm.received'),
        value: this.shipmentPlanShipmentPlanStatus.Received,
        type: 'shipment',
        disabled: false
      },
      {
        label: this.$t('components.shipmentPlanForm.closed'),
        status: this.$t('components.shipmentPlanForm.closed'),
        value: this.shipmentPlanShipmentPlanStatus.Closed,
        type: 'shipment',
        disabled: false
      }
      // {
      //   label: 'ARCHIVED',
      //   status: 'ARCHIVED',
      //   value: this.shipmentPlanShipmentPlanStatus.Archived,
      // type: 'shipment',
      //   disabled: true
      // }
    ]
  }

  get calculateByOptionsValues () {
    if (!this.calculateByOptions) return []
    return Object.keys(this.calculateByOptions).map(costKey => {
      return { label: this.calculateByOptions[costKey], value: costKey }
    }).sort((a, b) => a.label.localeCompare(b.label))
  }

  get containerTypesValues () {
    if (!this.containerTypes) return []
    return Object.keys(this.containerTypes).map(costKey => {
      return { label: this.containerTypes[costKey], value: costKey }
    }).sort((a, b) => a.label.localeCompare(b.label))
  }

  get goodsTimelineValues () {
    if (!this.goodsTimelineOptions) return []
    return Object.keys(this.goodsTimelineOptions).map(key => {
      return { label: this.goodsTimelineOptions[key], value: key }
    }).sort((a, b) => a.value.localeCompare(b.value))
  }

  get shipmentPlanInputs () {
    return [
      {
        model: 'name',
        type: InputType.text,
        hint: this.$t('components.shipmentPlanForm.shipmentPlanNumber'),
        props: {
          rules: this.rules.required,
          required: true,
          disabled: this.lockShipmentPlan,
          label: this.$t('components.shipmentPlanForm.shipmentPlanNumber')
        }
      },
      {
        model: 'shipmentPlanStatus',
        type: InputType.select,
        variant: 'chip',
        hint: this.$t('components.shipmentPlanForm.shipmentStatusHint'),
        props: {
          label: this.$t('components.shipmentPlanForm.shipmentStatus'),
          // rules: this.rules.required,
          items: this.shipmentPlanStatusValues
        }
      },
      {
        model: 'goodsTimeline',
        type: InputType.select,
        hint: this.$t('components.shipmentPlanForm.goodsTimeline'),
        props: {
          label: this.$t('components.shipmentPlanForm.goodsTimeline'),
          // rules: this.rules.required,
          items: this.goodsTimelineValues
        }
      },
      // {
      //   model: 'unixEstimatedReadyDate',
      //   type: InputType.datePicker,
      //   variant: 'nullable',
      //   hint: 'Estimated Ready Date',
      //   props: {
      //     disabled: this.lockShipmentPlan,
      //     label: 'Estimated Ready Date',
      //     clearable: true
      //   }
      // },
      {
        model: 'unixEstimatedShipDate',
        type: InputType.datePicker,
        variant: 'nullable',
        hint: this.$t('components.shipmentPlanForm.unixEstimatedShipDate'),
        props: {
          disabled: this.lockShipmentPlan,
          clearable: true,
          label: this.$t('components.shipmentPlanForm.unixEstimatedShipDate')
        }
      },
      {
        model: 'unixEstimatedDeliveryDate',
        type: InputType.datePicker,
        variant: 'nullable',
        hint: this.$t('components.shipmentPlanForm.unixEstimatedDeliveryDate'),
        props: {
          disabled: this.lockShipmentPlan,
          clearable: true,
          label: this.$t('components.shipmentPlanForm.unixEstimatedDeliveryDate')
        }
      }
    ]
  }

  get shipmentFromInputs () {
    return [
      {
        model: 'fromAddressType',
        type: InputType.select,
        hint: this.$t('components.shipmentPlanForm.fromAddressType'),
        props: {
          label: this.$t('components.shipmentPlanForm.fromAddressType'),
          // rules: this.rules.required,
          'prepend-inner-icon': 'mdi-factory',
          disabled: this.lockShipmentPlan,
          items: this.addressTypesValues
        }
      },
      {
        model: 'fromCountry',
        type: InputType.select,
        hint: this.$t('components.shipmentPlanForm.fromCountryHint'),
        variant: 'flag',
        props: {
          label: this.$t('components.shipmentPlanForm.fromCountry'),
          disabled: this.lockShipmentPlan,
          'prepend-item': 'mdi-abacus',
          // rules: this.rules.required,
          items: this.countries?.map((c) => ({
            label: c.name,
            value: c.isoCode,
            flag: c.isoCode?.toLowerCase()
          }))
        }
      },
      {
        model: 'fromAddress',
        type: InputType.text,
        hint: this.$t('components.shipmentPlanForm.fromAddressHint'),
        props: {
          disabled: this.lockShipmentPlan,
          // rules: this.rules.required,
          // required: true,
          label: this.$t('components.shipmentPlanForm.fromAddress')
        }
      }
    ]
  }

  get shipmentToInputs () {
    return [
      {
        model: 'toAddressType',
        type: InputType.select,
        hint: this.$t('components.shipmentPlanForm.toAddressType'),
        props: {
          label: this.$t('components.shipmentPlanForm.toAddressType'),
          'prepend-inner-icon': 'mdi-factory',
          // rules: this.rules.required,
          disabled: this.lockShipmentPlan,
          items: this.addressTypesValues
        }
      },
      {
        model: 'toCountry',
        type: InputType.select,
        hint: this.$t('components.shipmentPlanForm.toCountryHint'),
        variant: 'flag',
        props: {
          label: this.$t('components.shipmentPlanForm.toCountry'),
          disabled: this.lockShipmentPlan,
          // rules: this.rules.required,
          items: this.countries?.map((c) => ({
            label: c.name,
            value: c.isoCode,
            flag: c.isoCode?.toLowerCase()
          }))
        }
      },
      {
        model: 'toAddress',
        type: InputType.text,
        hint: this.$t('components.shipmentPlanForm.toAddressHint'),
        props: {
          // rules: this.rules.required,
          disabled: this.lockShipmentPlan,
          // required: true,
          label: this.$t('components.shipmentPlanForm.toAddress')
        }
      }
    ]
  }

  get shipmentInputs () {
    return [
      {
        model: 'containerType',
        type: InputType.select,
        hint: this.$t('components.shipmentPlanForm.containerType'),
        props: {
          label: this.$t('components.shipmentPlanForm.containerType'),
          'prepend-inner-icon': 'mdi-package-variant',
          disabled: this.lockShipmentPlan,
          // rules: this.rules.required,
          items: this.containerTypesValues
        }
      },
      {
        model: 'calculateBy',
        type: InputType.select,
        hint: this.$t('components.shipmentPlanForm.calculateByHint'),
        props: {
          label: this.$t('components.shipmentPlanForm.calculateBy'),
          disabled: this.lockShipmentPlan,
          // rules: this.rules.required,
          items: this.calculateByOptionsValues
        }
      },
      {
        model: 'shippingRateOrContainerEstimate',
        type: InputType.text,
        hint: this.$t('components.shipmentPlanForm.shippingRateOrContainerEstimate'),
        mask: createNumberMask({
          prefix: '',
          allowDecimal: true,
          includeThousandsSeparator: false,
          allowNegative: false
        }),
        props: {
          disabled: this.lockShipmentPlan,
          label: this.$t('components.shipmentPlanForm.shippingRateOrContainerEstimate')
        }
      },
      {
        model: 'estimatedShippingCost',
        type: InputType.text,
        hint: this.$t('components.shipmentPlanForm.estimatedShippingCost'),
        mask: createNumberMask({
          prefix: '',
          allowDecimal: true,
          includeThousandsSeparator: true,
          allowNegative: false
        }),
        props: {
          label: this.$t('components.shipmentPlanForm.estimatedShippingCost'),
          disabled: this.lockShipmentPlan
        }
      },
      {
        model: 'currency.id',
        type: InputType.select,
        variant: 'flag',
        hint: this.$t('components.accountSettingsForm.currency'),
        props: {
          label: this.$t('components.accountSettingsForm.currency'),
          disabled: this.lockShipmentPlan,
          items: this.currencies?.map((c) => ({
            label: c.currencyName,
            value: c.id,
            flag: c.country?.toLowerCase() || ''
          })),
          'return-object': false
        }
      },
      {
        model: 'containsHazardousGoods',
        type: InputType.checkbox,
        hint: this.$t('components.shipmentPlanForm.containsHazardousGoods'),
        props: {
          'hide-details': true,
          disabled: this.lockShipmentPlan,
          label: this.$t('components.shipmentPlanForm.containsHazardousGoods')
        }
      }
    ]
  }

  get otherShipmentDetailsInputs () {
    return [
      // Where are you shipping to?
      {
        model: 'jobNumber',
        type: InputType.text,
        hint: this.$t('components.shipmentPlanForm.jobNumber'),
        props: {
          disabled: this.lockShipmentPlan,
          label: this.$t('components.shipmentPlanForm.jobNumber')
        }
      },
      {
        model: 'carrierContact',
        type: InputType.text,
        hint: this.$t('components.shipmentPlanForm.carrierContact'),
        props: {
          disabled: this.lockShipmentPlan,
          label: this.$t('components.shipmentPlanForm.carrierContact')
        }
      },
      {
        model: 'trackingNumber',
        type: InputType.text,
        hint: this.$t('components.shipmentPlanForm.trackingNumber'),
        props: {
          disabled: this.lockShipmentPlan,
          label: this.$t('components.shipmentPlanForm.trackingNumber')
        }
      },
      {
        model: 'warehouseReference',
        type: InputType.text,
        hint: this.$t('components.shipmentPlanForm.warehouseReference'),
        props: {
          disabled: this.lockShipmentPlan,
          label: this.$t('components.shipmentPlanForm.warehouseReference')
        }
      },
      {
        model: 'chargeableWeight',
        type: InputType.text,
        hint: this.$t('components.shipmentPlanForm.chargeableWeight'),
        mask: createNumberMask({
          prefix: '',
          allowDecimal: true,
          includeThousandsSeparator: false,
          allowNegative: false
        }),
        props: {
          disabled: this.lockShipmentPlan,
          label: this.$t('components.shipmentPlanForm.chargeableWeight')
        }
      },
      {
        model: 'shippingRate',
        type: InputType.text,
        hint: this.$t('components.shipmentPlanForm.shippingRate'),
        mask: createNumberMask({
          prefix: '',
          allowDecimal: true,
          includeThousandsSeparator: false,
          allowNegative: false
        }),
        props: {
          disabled: this.lockShipmentPlan,
          label: this.$t('components.shipmentPlanForm.shippingRate')
        }
      }
    ]
  }

  async fetchShipmentPlan () {
    await this.fetchFullShipmentPlanForUser(this.value)
  }

  async updateShipmentPlan () {
    const { shipmentPlanForm } = this.$refs as HTMLFormElement
    await shipmentPlanForm.validate()
    if (this.validShipmentPlanForm) {
      const shipmentDetails = { ...this.shipmentPlanDetails }
      if (shipmentDetails.estimatedShippingCost) {
        shipmentDetails.estimatedShippingCost = Number(shipmentDetails.estimatedShippingCost?.toString().replace(/[^0-9.-]+/g, ''))
      }
      this.$emit('update-shipment-plan', shipmentDetails)
    }
  }
}
</script>
<style lang="scss">
.v-text-field__details {
  padding: 0 !important;
  margin: 0 !important;

  .v-messages__message {
    margin-top: 2px;
    line-height: 1rem;
  }
}
</style>
