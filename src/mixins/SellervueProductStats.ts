import Vue from 'vue'
import { Component } from 'vue-property-decorator'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { targetStats } from '@/components/AppProductChangeStatsCard.vue'
import type { ICostValue, IProduct, IProductStatsDifference } from '@/modules/products/types'

@Component
export class SellervueProductStats extends Vue {
  // calculated stats for product
  statsForProduct (product: IProduct, cachedP?: IProduct | null) {
    const productStats = {} as IProductStatsDifference
    productStats.sku = product.sku
    productStats.name = product.name
    targetStats.forEach((stat: keyof IProductStatsDifference) => {
      const statValue = (product as any)[stat]
      const cachedStatValue = (cachedP as any)[stat]

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      productStats[stat] = {
        value: statValue,
        change: cachedP ? (statValue as number) - (cachedStatValue as number) : 0
      } as ICostValue
    })

    return productStats
  }
}
