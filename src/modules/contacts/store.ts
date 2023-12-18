import * as Sentry from '@sentry/vue'
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

import api from '@/api'
import type { Pageable, Supplier } from '@/client/suppliers'
import { i18n } from '@/plugins/i18n'

import type { ICountry, ISupplier } from './types'

@Module({
  namespaced: true
})
export class ContactsModule extends VuexModule {
  suppliers: Supplier[] | null = null
  supplier: ISupplier | null = null

  @Mutation
  setSuppliers (suppliers: Supplier[]) {
    this.suppliers = suppliers
  }

  @Mutation
  setSupplier (supplier: ISupplier) {
    this.supplier = supplier
  }

  @Action({ rawError: true })
  async getSuppliers (pagination?: Pageable & { sort: Array<any>, search: string }): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const res = await api.suppliers.getSuppliers(token, {
        userId,
        page: pagination?.pageNumber,
        size: pagination?.pageSize,
        search: pagination?.search,
        sort: pagination?.sort
      })
      this.context.commit('setSuppliers', res)
    } catch (e) {
      Sentry.captureException(e)
      this.context.commit('setSuppliers', null)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw e
    }
  }

  @Action({ rawError: true })
  async getCountries (): Promise<ICountry[] | null> {
    return await api.suppliers.getCountries(this.context.rootGetters['auth/jwt'], this.context.rootGetters['user/id'])
  }

  @Action({ rawError: true })
  async getSupplierById (id: number): Promise<void> {
    const res = await api.suppliers.getSupplierById(this.context.rootGetters['auth/jwt'], id, this.context.rootGetters['user/id'])
    await this.context.commit('setSupplier', res)
  }

  @Action({ rawError: true })
  async createSupplier (supplier: Partial<Supplier>): Promise<void> {
    await api.suppliers.create(this.context.rootGetters['auth/jwt'], supplier, this.context.rootGetters['user/id'])
    await this.context.dispatch('getSuppliers')
  }

  @Action({ rawError: true })
  async deleteSupplier (id: number): Promise<void> {
    await api.suppliers.delete(this.context.rootGetters['auth/jwt'], id, this.context.rootGetters['user/id'])
  }

  @Action({ rawError: true })
  async patchSupplierAttributes (formData: ISupplier): Promise<ISupplier | null> {
    const res = await api.suppliers.update(this.context.rootGetters['auth/jwt'], formData, this.context.rootGetters['user/id'])
    await this.context.dispatch('getSuppliers')

    return res
  }
}
