import * as Sentry from '@sentry/vue'
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

import api from '@/api'
import type { Order, OrderPatchPostDto, OrdersListDto, PackList, PackListMultipleDeleteDto, PackListPatchPostDto, Pageable, PageShipmentPlan, ShipmentPlan, ShipmentPlanPackListsDto, ShipmentPlanPatchDto, ShipmentPlanSummaryDto } from '@/client/orders'
import { OrdersControllerApi, OrdersShipmentControllerApi } from '@/client/orders'
import { i18n } from '@/plugins/i18n'
import type { ObjectKeyAsAny } from '@/types/app'

const { VUE_APP_BASE_URL } = process.env
const BASE_URL = VUE_APP_BASE_URL.slice(0, VUE_APP_BASE_URL.length - 1)

const ordersControllerApi = new OrdersControllerApi(undefined, BASE_URL)
const ordersShipmentControllerApi = new OrdersShipmentControllerApi(undefined, BASE_URL)
@Module({
  namespaced: true
})
export class OrdersModule extends VuexModule {
  orders: OrdersListDto | null = null
  shipmentPlans: PageShipmentPlan | null = null
  shipmentPlan: ShipmentPlan | null = null
  shipmentPlanSummaries: ShipmentPlanSummaryDto | null=null
  addressTypes: ObjectKeyAsAny | null = null
  calculateByOptions: ObjectKeyAsAny | null = null
  containerTypes: ObjectKeyAsAny | null = null
  goodsTimelineOptions: ObjectKeyAsAny | null = null

  @Mutation
  setGoodsTimelineOptions (content: ObjectKeyAsAny) {
    this.goodsTimelineOptions = content
  }

  @Mutation
  setAddressTypes (content: ObjectKeyAsAny) {
    this.addressTypes = content
  }

  @Mutation
  setCalculateByOptions (content: ObjectKeyAsAny) {
    this.calculateByOptions = content
  }

  @Mutation
  setContainerTypes (content: ObjectKeyAsAny) {
    this.containerTypes = content
  }

  @Mutation
  setOrders (orders: OrdersListDto) {
    this.orders = orders
  }

  @Mutation
  setShipmentPlans (shipmentPlans: PageShipmentPlan) {
    this.shipmentPlans = shipmentPlans
  }

  @Mutation
  setShipmentPlan (shipmentPlan: ShipmentPlan) {
    this.shipmentPlan = shipmentPlan
  }

  @Mutation
  setShipmentPlanSummaries (shipmentPlanSummaries: ShipmentPlanSummaryDto) {
    this.shipmentPlanSummaries = shipmentPlanSummaries
  }

  @Action({ rawError: true })
  async fetchOrdersForUser (pagination?: Pageable & { sort?: Array<any>, search?: string, orderStatuses?: string }): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const res = await api.orders.fetchOrdersForUser(token, {
        userId,
        page: pagination?.pageNumber,
        size: pagination?.pageSize,
        sort: pagination?.sort,
        search: pagination?.search,
        orderStatuses: pagination?.orderStatuses
      })
      this.context.commit('setOrders', res)
    } catch (err) {
      this.context.commit('setOrders', null)
      Sentry.captureException(err)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw err
    }
  }

  @Action({ rawError: true })
  async fetchShipmentPlans (pagination?: Pageable & { sort?: Array<any>, search?: string, shipmentStatuses?: string }): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const res = await api.orders.fetchShipmentPlansForUser(token, {
        userId,
        page: pagination?.pageNumber,
        size: pagination?.pageSize,
        sort: pagination?.sort,
        search: pagination?.search,
        shipmentStatuses: pagination?.shipmentStatuses
      })
      this.context.commit('setShipmentPlans', res)
    } catch (err) {
      this.context.commit('setShipmentPlans', null)
      Sentry.captureException(err)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw err
    }
  }

  @Action({ rawError: true })
  async patchPackListForOrderAndUser (params: {orderId: number, packListId: number, packListPatchPostDto?: PackListPatchPostDto}): Promise<PackList|any> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const { data } = await ordersControllerApi.patchPackListForOrderAndUser(userId, params.orderId, params.packListId, params.packListPatchPostDto, requestOpts)
      return data
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw e
    }
  }

  @Action({ rawError: true })
  async fetchFullShipmentPlanForUser (shipmentPlanId: number): Promise<ShipmentPlan|null> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const { data } = await ordersShipmentControllerApi.fetchFullShipmentPlanForUser(userId, shipmentPlanId, requestOpts)
      this.context.commit('setShipmentPlan', data)
      return data
    } catch (e) {
      this.context.commit('setShipmentPlan', null)
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      // throw e
      return null
    }
  }

  @Action({ rawError: true })
  async patchShipmentPlanDetailsForUser (params: {shipmentPlanId: number, shipmentPlanPatchDto?: ShipmentPlanPatchDto}): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await ordersShipmentControllerApi.patchShipmentPlanDetailsForUser(userId, params.shipmentPlanId, params.shipmentPlanPatchDto, requestOpts)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw e
    }
  }

  @Action({ rawError: true })
  async fetchShipmentPlanAddressTypes (): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const { data } = await ordersShipmentControllerApi.fetchShipmentPlanAddressTypesForUser(userId, requestOpts)
      this.context.commit('setAddressTypes', data)
    } catch (e) {
      this.context.commit('setAddressTypes', null)
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw e
    }
  }

  @Action({ rawError: true })
  async fetchGoodsTimelineOptions (): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const { data } = await ordersShipmentControllerApi.fetchGoodsTimelineOptionsForUser(userId, requestOpts)
      this.context.commit('setGoodsTimelineOptions', data)
    } catch (e) {
      this.context.commit('setGoodsTimelineOptions', null)
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw e
    }
  }

  @Action({ rawError: true })
  async fetchShipmentCalculateByOptions (): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const { data } = await ordersShipmentControllerApi.fetchShipmentCalculateByOptionsForUser(userId, requestOpts)
      this.context.commit('setCalculateByOptions', data)
    } catch (e) {
      this.context.commit('setCalculateByOptions', null)
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw e
    }
  }

  @Action({ rawError: true })
  async fetchShipmentPlanContainerTypes (): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const { data } = await ordersShipmentControllerApi.fetchShipmentPlanContainerTypesForUser(userId, requestOpts)
      this.context.commit('setContainerTypes', data)
    } catch (e) {
      this.context.commit('setContainerTypes', null)
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw e
    }
  }

  @Action({ rawError: true })
  async patchOrderForUser (params: {orderId: number, orderPatchPostDto?: OrderPatchPostDto}): Promise<Order|any> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const { data } = await ordersControllerApi.patchOrderForUser(userId, params.orderId, params.orderPatchPostDto, requestOpts)
      return data
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw e
    }
  }

  @Action({ rawError: true })
  async fetchOrderByIdForUser (params: {orderId: number, orderPatchPostDto?: OrderPatchPostDto}): Promise<Order|any> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const { data } = await ordersControllerApi.fetchOrderByIdForUser(userId, params.orderId, requestOpts)
      return data
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw e
    }
  }

  @Action({ rawError: true })
  async postPackListToOrderForUser (params: {orderId: number, packListPatchPostDto?: PackListPatchPostDto}): Promise<PackList|any> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const { data } = await ordersControllerApi.postPackListToOrderForUser(userId, params.orderId, params.packListPatchPostDto, requestOpts)
      return data
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw e
    }
  }

  @Action({ rawError: true })
  async deletePackListForOrderAndUser (params: {orderId: number, packListId: number}): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await ordersControllerApi.deletePackListForOrderAndUser(userId, params.orderId, params.packListId, requestOpts)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw e
    }
  }

  @Action({ rawError: true })
  async deleteMultiplePackListsForOrderAndUser (params: {orderId: number, packListMultipleDeleteDto?: PackListMultipleDeleteDto}): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await ordersControllerApi.deleteMultiplePackListsForOrderAndUser(userId, params.orderId, params.packListMultipleDeleteDto, requestOpts)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw e
    }
  }

  @Action({ rawError: true })
  async fetchShipmentPlanSummaries (): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const { data } = await ordersShipmentControllerApi.fetchShipmentPlanSummariesForUser(userId, requestOpts)
      this.context.commit('setShipmentPlanSummaries', data)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw e
    }
  }

  @Action({ rawError: true })
  async setShipmentPlanPackListsForUser (shipmentPlanPackLists: ShipmentPlanPackListsDto): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await ordersShipmentControllerApi.setShipmentPlanPackListsForUser(userId, shipmentPlanPackLists, requestOpts)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw e
    }
  }

  @Action({ rawError: true })
  async removePackListsFromTheirShipmentPlans (packListMultipleDeleteDto?: PackListMultipleDeleteDto): Promise<void> {
    const userId = this.context.rootGetters['user/id']
    const token = this.context.rootGetters['auth/jwt']
    try {
      const requestOpts = {
        headers: { Authorization: `Bearer ${token}` }
      }
      await ordersShipmentControllerApi.removePackListsFromTheirShipmentPlans(userId, packListMultipleDeleteDto, requestOpts)
    } catch (e) {
      Sentry.captureException(e)
      this.context.dispatch(
        'toasts/addError',
        i18n.t('pages.errors.422.description'),
        { root: true }
      )
      throw e
    }
  }
}
