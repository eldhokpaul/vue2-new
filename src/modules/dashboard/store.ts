import { sub } from 'date-fns'
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

import type { IDashboard } from '@/modules/dashboard/types'
import type { IDateRange } from '@/types/app'

import { stats } from './data'

@Module({
  namespaced: true
})

export class DashboardModule extends VuexModule {
  content: IDashboard = {}

  @Mutation
  setContent (content: IDashboard) {
    this.content = { ...this.content, ...content }
  }

  @Action({ rawError: true })
  async getAvailableDates () {
    const payload: IDateRange = { from: sub(new Date(), { years: 1 }), to: new Date() }
    // const res = await api.dashboard.getAvailableDates()
    this.context.commit('setContent', { availableDates: payload })
  }

  @Action({ rawError: true })
  async getStats () {
    // const res = await api.dashboard.getStats()

    this.context.commit('setContent', { stats })
  }
}
