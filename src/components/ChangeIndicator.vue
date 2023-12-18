<template>
  <span
    v-if="!isNeutral"
    :class="{'red--text': isNegative, 'green--text': isPositive}"
    v-text="formattedValue"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import { formatCurrency } from '@/utils/currency'

const namespaces = {
  accountSettings: 'accountSettings'
}

@Component
export default class ChangeIndicator extends Vue {
  @Getter('currencySymbol', { namespace: namespaces.accountSettings }) currencySymbol!: string

  @Prop() readonly value!: number

  @Prop({ default: true }) readonly isPercent!: boolean

  @Prop({ default: false }) readonly isUnit!: boolean

  formatCurrency = formatCurrency

  get isPositive () { return Math.sign(this.value) === 1 }
  get isNegative () { return Math.sign(this.value) === -1 }
  get isNeutral () { return Math.sign(this.value) === 0 }
  get formattedValue () {
    return this.isPercent ? this.percentValue : this.isUnit ? this.unitValue : this.moneyValue
  }

  get percentValue () {
    if (this.isPositive) {
      return `⬆ ${this.value}%`
    }
    if (this.isNegative) {
      return `⬇ ${Math.abs(this.value)}%`
    }
  }

  get moneyValue () {
    if (this.isPositive) {
      // return `⬆ $${this.value.toLocaleString()}`
      return `⬆ ${this.formatCurrency(this.currencySymbol, this.value)}`
    }
    if (this.isNegative) {
      return `⬇ ${this.formatCurrency(this.currencySymbol, Math.abs(this.value))}`
    }
  }

  get unitValue () {
    if (this.isPositive) {
      return `⬆ ${this.value}`
    }
    if (this.isNegative) {
      return `⬇ ${Math.abs(this.value)}`
    }
  }

  get sign () {
    return this.isPercent ? '%' : ''
  }
}
</script>
