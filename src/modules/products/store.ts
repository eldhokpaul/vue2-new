
import * as Sentry from '@sentry/vue'
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

import api from '@/api'
import type { Pageable, PageProductChangeLog, ProductDto } from '@/client/products'
import { MeasurementUnitsControllerApi, ProductControllerApi } from '@/client/products'
import { i18n } from '@/plugins/i18n'
import type { ICurrentPageOpts, ObjectKeyAsAny } from '@/types/app'

import { channels } from './data'
import type { IBrand, IProduct, IProducts } from './types'

const { VUE_APP_BASE_URL } = process.env
const BASE_URL = VUE_APP_BASE_URL.slice(0, VUE_APP_BASE_URL.length - 1)

const measurementUnitsControllerApi = new MeasurementUnitsControllerApi(undefined, BASE_URL)
const productControllerApi = new ProductControllerApi(undefined, BASE_URL)

@Module({
  namespaced: true
})

export class ProductsModule extends VuexModule {
  channels = channels
  dimensionUnits: any
  weightUnits: any

  products: IProducts | null = null
  product: IProduct | null = null
  plainProducts: IProduct[] | null = null
  changelogSources: ObjectKeyAsAny | null = null
  productChangeLog: PageProductChangeLog | null = null

  @Mutation
  setChangelog (productChangeLog: PageProductChangeLog) {
    this.productChangeLog = productChangeLog
  }

  @Mutation
  setChangelogSources (changelogSources: Array<string>) {
    this.changelogSources = changelogSources
  }

  @Mutation
  setPlainProducts (products: IProduct[]) {
    this.plainProducts = products
  }

  @Mutation
  setProducts (products: IProducts) {
    this.products = products
  }

  @Mutation
  setProduct (product: IProduct) {
    this.product = product
  }

  @Mutation
  setDimensionUnits (dimensions: any) {
    this.dimensionUnits = dimensions
  }

  @Mutation
  setWeightUnits (weightUnits: any) {
    this.weightUnits = weightUnits
  }

  get getNameById () {
    return (id: number): string | null => {
      if (!this.products) return null
      const expectedProduct = this.products.content.find(product => product.id === id)
      if (!expectedProduct) return null

      return expectedProduct.name
    }
  }

  @Action({ rawError: true })
  async getChangelogSources (): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await productControllerApi.fetchProductChangeLogSources(userId, requestOpts)
      this.context.commit('setChangelogSources', res.data)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
  }

  @Action({ rawError: true })
  async getCountries (): Promise<ObjectKeyAsAny|null> {
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    const { data } = await productControllerApi.getProductCountryOfOriginOptions(userId, requestOpts)
    return data
  }

  @Action({ rawError: true })
  async getChangelog (opts: {productId: number, pagination: Pageable& { sort: Array<any>, search?: any }}): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    try {
      const res = await api.products.getChangelogs(token, {
        userId,
        productId: opts.productId,
        pageNumber: opts.pagination?.pageNumber,
        pageSize: opts.pagination?.pageSize,
        sort: opts.pagination?.sort,
        search: opts.pagination?.search
      })
      this.context.commit('setChangelog', res)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
  }

  @Action({ rawError: true })
  async getProducts (pagination?: Pageable & { sort: Array<any>, search: string }): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const res = await api.products.getProducts(token, {
        userId,
        page: pagination?.pageNumber,
        size: pagination?.pageSize,
        sort: pagination?.sort,
        search: pagination?.search
      })
      this.context.commit('setProducts', res)
    } catch (err) {
      Sentry.captureException(err)
      this.context.commit('setProducts', null)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw err
    }
  }

  @Action({ rawError: true })
  async getBulkUploadTemplate (userId: number): Promise<any> {
    try {
      const res = await api.products.getBulkUploadTemplate(this.context.rootGetters['auth/jwt'], userId)
      return res
    } catch (err) {
      Sentry.captureException(err)
    }
  }

  @Action({ rawError: true })
  async bulkUpload (args: {userId: number, file: File}): Promise<any> {
    try {
      const res = await api.products.bulkUpload(this.context.rootGetters['auth/jwt'], args.userId, args.file)
      return res
    } catch (err) {
      Sentry.captureException(err)
    }
  }

  @Action({ rawError: true })
  async getPlaneProducts (opts: ICurrentPageOpts): Promise<void> {
    const res = await api.products.getPlaneProducts(this.context.rootGetters['auth/jwt'], opts)
    if (res.ok) {
      const jsonResult = await res.json()
      this.context.commit('setPlainProducts', jsonResult.content.reverse())
      return jsonResult
    }

    await this.context.dispatch(
      'toasts/addError',
      i18n.t('pages.errors.422.description'),
      { root: true }
    )
  }

  @Action({ rawError: true })
  async getProductBySku (opts: { sku: string, userId: number }): Promise<void> {
    const { sku, userId } = opts
    const res = await api.products.getProductBySku(this.context.rootGetters['auth/jwt'], sku, userId)
    this.context.commit('setProduct', res.content[0])
  }

  @Action({ rawError: true })
  async getProductWithStatsById (opts: { id: number, userId: number }): Promise<IProduct | null> {
    const { id } = opts
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const res = await api.products.getProductWithStatsById(token, id, userId)
      return await res.json()
    } catch (e) {
      Sentry.captureException(e)
      await this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      return Promise.resolve(null)
    }
  }

  @Action({ rawError: true })
  async getProductById (id: number): Promise<void> {
    this.context.commit('setProduct', await api.products.getProductById(this.context.rootGetters['auth/jwt'], id, this.context.rootGetters['user/id']))
  }

  @Action({ rawError: true })
  async createProduct (product: ProductDto): Promise<void> {
    // await api.products.createProduct(this.context.rootGetters['auth/jwt'], product, this.context.rootGetters['user/id'])

    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    try {
      const requestOpts = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      const res = await productControllerApi.createProduct(userId, product, requestOpts)
      this.context.commit('setDimensionUnits', res.data)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
  }

  @Action({ rawError: true })
  async getBrands (): Promise<IBrand[] | null> {
    const res = await api.products.getBrands(this.context.rootGetters['auth/jwt'], this.context.rootGetters['user/id'])
    return (res && res.content) ? res.content : null
  }

  @Action({ rawError: true })
  async getAllShippingMethods (): Promise<ObjectKeyAsAny|null> {
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    const requestOpts = {
      headers: { Authorization: `Bearer ${token}` }
    }
    const { data } = await productControllerApi.getAllShippingMethods(userId, requestOpts)
    return data
  }

  @Action({ rawError: true })
  async deleteProduct (opts: { id: number }): Promise<void> {
    const { id } = opts
    const userId = this.context.rootGetters['user/id']
    await api.products.delete(this.context.rootGetters['auth/jwt'], id, userId)
    await this.context.dispatch('getProducts', { userId })
  }

  @Action({ rawError: true })
  async patchProductAttributes (opts: { formData: IProduct }) {
    const { formData } = opts
    const { id } = formData
    try {
      await api.products.patchProductAttributes(this.context.rootGetters['auth/jwt'], id, formData, this.context.rootGetters['user/id'])
    } catch (e) {
      Sentry.captureException(e)
      await this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
    await this.context.dispatch('getProductById', id)
  }

  @Action
  async getDimensionUnit (): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await measurementUnitsControllerApi.getAllDimensionUnits(userId, requestOpts)
      this.context.commit('setDimensionUnits', res.data)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
  }

  @Action
  async getWeightUnit (): Promise<void> {
    const token = this.context.rootGetters['auth/jwt']
    const userId = this.context.rootGetters['user/id']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const res = await measurementUnitsControllerApi.getAllWeightUnits(userId, requestOpts)
      this.context.commit('setWeightUnits', res.data)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
    }
  }
}
export type ProductsStore = Pick<ProductsModule, 'products'>
