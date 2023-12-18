
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

@Module({
  namespaced: true
})
export class GridModule extends VuexModule {
  productState = { colState: [], filterModel: {}, rowPerPage: null }
  amazonState = { colState: [], filterModel: {}, rowPerPage: null }
  costState = { colState: [], filterModel: {}, rowPerPage: null }
  productCostState = { colState: [], filterModel: {}, rowPerPage: null }
  billState = { colState: [], filterModel: {}, rowPerPage: null }
  payableState = { colState: [], filterModel: {}, rowPerPage: null }
  supplierState = { colState: [], filterModel: {}, rowPerPage: null }
  invoicesState = { colState: [], filterModel: {}, rowPerPage: null }
  ordersState = { colState: [], filterModel: {}, rowPerPage: null }
  shipmentState = { colState: [], filterModel: {}, rowPerPage: null }
  userState = { colState: [], filterModel: {}, rowPerPage: null }

  @Mutation
  setAmazonState (amazonState: any) {
    if (!this.amazonState) {
      this.amazonState = { ...amazonState }
      return
    }
    this.amazonState = { ...this.amazonState, ...amazonState }
  }

  @Mutation
  setCostState (costState: any) {
    if (!this.costState) {
      this.costState = { ...costState }
      return
    }
    this.costState = { ...this.costState, ...costState }
  }

  @Mutation
  setProductCostState (productCostState: any) {
    if (!this.productCostState) {
      this.productCostState = { ...productCostState }
      return
    }
    this.productCostState = { ...this.productCostState, ...productCostState }
  }

  @Mutation
  setBillState (billState: any) {
    if (!this.billState) {
      this.billState = { ...billState }
      return
    }
    this.billState = { ...this.billState, ...billState }
  }

  @Mutation
  setPayableState (payableState: any) {
    if (!this.payableState) {
      this.payableState = { ...payableState }
      return
    }
    this.payableState = { ...this.payableState, ...payableState }
  }

  @Mutation
  setProductState (productState: any) {
    if (!this.productState) {
      this.productState = { ...productState }
      return
    }
    this.productState = { ...this.productState, ...productState }
  }

  @Mutation
  setSupplierState (supplierState: any) {
    if (!this.supplierState) {
      this.supplierState = { ...supplierState }
      return
    }
    this.supplierState = { ...this.supplierState, ...supplierState }
  }

  @Mutation
  setInvoicesState (invoicesState: any) {
    if (!this.invoicesState) {
      this.invoicesState = { ...invoicesState }
      return
    }
    this.invoicesState = { ...this.invoicesState, ...invoicesState }
  }

  @Mutation
  setOrdersState (ordersState: any) {
    if (!this.ordersState) {
      this.ordersState = { ...ordersState }
      return
    }
    this.ordersState = { ...this.ordersState, ...ordersState }
  }

  @Mutation
  setShipmentState (shipmentState: any) {
    if (!this.shipmentState) {
      this.shipmentState = { ...shipmentState }
      return
    }
    this.shipmentState = { ...this.shipmentState, ...shipmentState }
  }

  @Mutation
  setUserState (userState: any) {
    if (!this.userState) {
      this.userState = { ...userState }
      return
    }
    this.userState = { ...this.userState, ...userState }
  }

  @Action
  getUserState (userState: any) {
    this.context.commit('setUserState', userState)
  }

  @Action
  getProductState (productState: any) {
    this.context.commit('setProductState', productState)
  }

  @Action
  getSupplierState (supplierState: any) {
    this.context.commit('setSupplierState', supplierState)
  }

  @Action
  getInvoicesState (invoicesState: any) {
    this.context.commit('setInvoicesState', invoicesState)
  }

  @Action
  getOrdersState (ordersState: any) {
    this.context.commit('setOrdersState', ordersState)
  }

  @Action
  getShipmentState (ordersState: any) {
    this.context.commit('setShipmentState', ordersState)
  }

  @Action
  getAmazonState (amazonState: any) {
    this.context.commit('setAmazonState', amazonState)
  }

  @Action
  getCostState (costState: any) {
    this.context.commit('setCostState', costState)
  }

  @Action
  getProductCostState (productCostState: any) {
    this.context.commit('setProductCostState', productCostState)
  }

  @Action
  getBillState (billState: any) {
    this.context.commit('setBillState', billState)
  }

  @Action
  getPayableState (payableState: any) {
    this.context.commit('setPayableState', payableState)
  }
}
