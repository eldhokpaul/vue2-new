import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

import api from '@/api'
import type { ICurrentPageOpts, ObjectKeyAsAny } from '@/types/app'

import type { ICost, ICosts } from './types'

@Module({
  namespaced: true
})

export class CostsModule extends VuexModule {
  costs: ICosts | null = null
  cost: ICost | null = null
  costTypes: ObjectKeyAsAny | null = null

  @Mutation
  setCosts (costs: ICosts) {
    this.costs = costs
  }

  @Mutation
  setCostTypes (costTypes: Array<string>) {
    this.costTypes = costTypes
  }

  @Action({ rawError: true })
  async getCosts (opts: ICurrentPageOpts): Promise<void> {
    const res = await api.costs.getCosts(this.context.rootGetters['auth/jwt'], opts) as ICosts
    if (res && res.lineCosts) {
      this.context.commit('setCosts', res)
      return
    }

    this.context.commit('setCosts', null)
  }

  @Action({ rawError: true })
  async getCostsByProductId (opts: { productId: number} & ICurrentPageOpts): Promise<void> {
    const res = await api.costs.getCostsByProductId(this.context.rootGetters['auth/jwt'], opts) as ICosts
    if (res && res.lineCosts) {
      this.context.commit('setCosts', res)
      return
    }

    this.context.commit('setCosts', null)
  }

  @Action({ rawError: true })
  async getCostTypes (): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    const res = await api.costs.getCostTypes(token, this.context.rootGetters['user/id']) as Array<string>
    this.context.commit('setCostTypes', res)
  }

  @Action({ rawError: true })
  async alterCost (opts: { line: ICost}): Promise<void> {
    await api.costs.alterCost(
      this.context.rootGetters['auth/jwt'],
      {
        invoiceId: opts.line.invoice.id,
        id: opts.line.invoiceLineId,
        isExcludedFromGeneralCostsData: !!opts.line.isExcludedFromGeneralCostsData,
        userId: this.context.rootGetters['user/id']
      }
    )
  }

  @Action({ rawError: true })
  async excludeBatchCostLines (opts: { lines: ICost[] }): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const mapData = (line: ICost) => {
      return {
        id: line.invoiceLineId,
        isExcludedFromProductCostsData: !line.isExcludedFromProductCostsData
      }
    }

    await api.costs.excludeBatchProductCostLines(
      this.context.rootGetters['auth/jwt'],
      userId,
      opts.lines.map(mapData)
    )
  }
}
