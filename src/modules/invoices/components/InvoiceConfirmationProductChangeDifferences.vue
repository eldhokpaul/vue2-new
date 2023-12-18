<template>
  <v-dialog
    v-model="shouldShow"
    :width="width"
    @click:outside="$emit('update:close')"
  >
    <v-card class="overflow-hidden">
      <v-card-title v-t="title" />

      <v-card-text v-t="'components.invoiceEdit.details'" />
      <v-card-text class="scroll-products">
        <template
          v-for="(productStat, key) in stats"
        >
          <v-card
            :key="key"
            outlined
          >
            <div class="d-flex align-center">
              <v-card-title>
                {{ productStat.name }}
              </v-card-title>
              <router-link
                v-t="'components.appProductChangeStatsCard.manageProductCosts'"
                class="blue--text"
                :to="productDetails(productStat.sku)"
              />
            </div>
            <v-card-text>
              <app-product-change-stats-card
                class="mb-6"
                :product-stats="productStat"
              />
            </v-card-text>
          </v-card>
        </template>
      </v-card-text>
      <v-divider />

      <v-card-actions>
        <v-spacer />

        <v-btn
          v-t="'components.invoiceEdit.continueedit'"
          text
          color="grey"
          @click="$emit('update:close')"
        />
        <v-btn
          v-t="'components.invoiceEdit.closeandnavigate'"
          color="primary"
          depressed
          @click="onOkClickNavigateBack"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import groupBy from 'lodash/groupBy'
import isEmpty from 'lodash/isEmpty'
import { mixins } from 'vue-class-component'
import { Component, Prop } from 'vue-property-decorator'

import AppProductChangeStatsCard from '@/components/AppProductChangeStatsCard.vue'
import { SellervueConfirmationDialog, SellervueProductStats } from '@/mixins'
import type { IProduct, IProductStatsDifference } from '@/modules/products/types'
import { Tab } from '@/modules/products/views/ProductDetails.vue'

export enum TTab {
  Bills = 'bills',
  Payables = 'payables',
  Costs = 'costs'
}
@Component({
  components: { AppProductChangeStatsCard }
})
export default class InvoiceConfirmationProductChangeDifferences extends mixins(SellervueProductStats, SellervueConfirmationDialog) {
  @Prop()
  readonly alteredProducts!: IProduct[]

  @Prop()
  readonly cachedProducts!: IProduct[]

  @Prop() goBack!: string

  productDetails (sku: string) {
    return {
      name: 'productDetails',
      params: {
        sku: sku,
        preselectedTab: Tab.Costs
      }
    }
  }

  get stats () {
    if (isEmpty(this.alteredProducts)) return

    const result: Array<IProductStatsDifference> = []
    const oldProducts = groupBy(this.cachedProducts, 'id')

    this.alteredProducts.forEach((product: IProduct) => {
      const cachedP = !isEmpty(oldProducts[product.id]) ? oldProducts[product.id][0] : null
      result.push(this.statsForProduct(product, cachedP))
    })
    return result
  }

  get width () {
    return !isEmpty(this.alteredProducts) ? '80%' : '500'
  }

  onOkClickNavigateBack () {
    this.$emit('update:close')
    if (this.goBack) {
      this.$router.push({
        name: this.goBack
      })
    } else {
      this.$router.push({
        name: this.routeName
      })
    }
  }
}
</script>
<style lang="scss">
.scroll-products {
  max-height: 500px;
  overflow-y: scroll;
}
</style>
