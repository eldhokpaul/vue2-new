<template>
  <div
    v-if="packlist && packlist.length"
    class="alert-wrapper"
  >
    <v-alert
      border="top"
      colored-border
      dense
      tile
      max-width="800"
      elevation="10"
      color="primary"
      class="alert-selected-packlist"
    >
      <v-card-text>
        <v-row
          align="center"
          justify="space-around"
        >
          <v-avatar
            color="primary"
            tile
            rounded
            class="mr-3"
          >
            <span class="white--text text-h4">{{
              packlist.length
            }}</span>
          </v-avatar>
          <div class="mr-3">
            <span
              v-t="'pages.orders.itemSelected'"
              class="text-h6 grey--text"
            />
          </div>
          <v-combobox
            :search-input.sync="shipingPlan"
            :items="shipmentPlanSummary"
            class="mr-2"
            dense
            item-value="id"
            item-text="name"
            :return-object="true"
            :loading="loading"
            :persistent-hint="true"
            :hide-details="true"
            label="Shipment Plan"
            solo
            outlined
          />
          <v-btn
            large
            tile
            plain
            :loading="loading"
            text
            @click="moveToShipmentPlan"
          >
            <template #default>
              <div class="d-flex flex-column align-center ">
                <v-icon size="25">
                  mdi-arrow-right-bold-circle-outline
                </v-icon>
                <span
                  v-t="'pages.orders.moveTo'"
                  class="text-caption"
                />
              </div>
            </template>
            <template #loader>
              <v-progress-circular
                color="primary"
                indeterminate
              />
            </template>
          </v-btn>
          <v-divider
            vertical
            class="mx-4"
          />
          <v-btn
            icon
            depressed
            color="primary"
            @click="$emit('close:remove-packlists')"
          >
            <v-icon>mdi-close-thick</v-icon>
          </v-btn>
        </v-row>
      </v-card-text>
    </v-alert>
  </div>
</template>

<script lang="ts">
// import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import type { ShipmentPlanPackListsDto, ShipmentPlanSummaryDto } from '@/client/orders'
const namespaces = {
  accountSettings: 'accountSettings',
  orders: 'orders'
}
const newShipmentPlan = 'New shipment plan'
@Component
export default class MoveToShipmentPlanPopUp extends Vue {
  @Prop({ default: [] }) packlist!: Array<number>
  @Prop() readonly loading!: boolean
  @State('shipmentPlanSummaries', { namespace: namespaces.orders }) shipmentPlanSummaries!: ShipmentPlanSummaryDto[];

  shipingPlan=''

  get shipmentPlanSummary () {
    return ([
      {
        name: newShipmentPlan,
        id: null
      },
      ...this.shipmentPlanSummaries
        .filter((item: ShipmentPlanSummaryDto) => item.shipmentPlanStatus !== 'IN_TRANSIT')
        .map((item: ShipmentPlanSummaryDto) => ({
          name: item.name,
          id: item.name
        }))
    ]

    )
  }

  async moveToShipmentPlan () {
    const selectedShipingPlan = this.shipmentPlanSummaries.filter((item: ShipmentPlanSummaryDto) => item.shipmentPlanStatus !== 'IN_TRANSIT').find(
      item => item.name === this.shipingPlan
    )
    const newShipingPlan = this.shipingPlan === newShipmentPlan ? '' : this.shipingPlan
    const ShipmentPlanPackLists = {
      ...(selectedShipingPlan || { name: newShipingPlan }),
      packListIds: this.packlist
    }
    this.$emit('update:move-to-shipment', ShipmentPlanPackLists as ShipmentPlanPackListsDto)
  }
}
</script>
<style lang="scss">
.alert-wrapper {
  position: absolute;
  left: 50%;
  bottom: 0;

  .alert-selected-packlist {
    position: relative;
    left: -50%;
  }
}
</style>
