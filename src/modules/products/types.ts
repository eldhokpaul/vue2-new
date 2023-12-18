import type { ISupplier } from '@/modules/contacts/types'
import type { IPaginable } from '@/types/app'

export type IBrand = {
  id?: number
  name: string
  userId: number
}
export type IProductSupplier = {
  id?: number | null
  supplier: ISupplier | null
  shippingMethod?: string | null
  packagingLongestSideDimensionUnit?: string|null
  packagingMedianSideDimensionUnit?: string|null
  packagingShortSideDimensionUnit?: string|null
  packagingUnitWeightUnit?: string|null
  caseLongestSideDimensionUnit?: string|null
  caseMedianSideDimensionUnit?: string|null
  caseShortSideDimensionUnit?: string|null
  caseGrossWeightUnit?: string|null
  leadTime?: number | null
  totalLeadTimeInDays: number | null
  uuid?: string | null
  hsCodes?: string | null
  tariffRates?: string | null
}
export type IProductFormData = {
  sku: string
  name: string
  tag?: string | null
  notes?: string
  status?: string
  thumbnail?: string
  filledBy?: string
  totalFactoryCosts?: number
  longestSideDimensionUnit?: string | null
  medianSideDimensionUnit?: string | null
  shortSideDimensionUnit?: string | null
  unitWeightUnit?: string | null
  longestSideDimension?: number| null
  medianSideDimension?: number| null
  shortSideDimension?: number| null
  perUnitWeight?: number| null
  productSizeTier?: number| null
  totalInboundCosts?: number
  totalUnitsOrdered?: number
  totalLandedCosts?: number
  totalFactoryUnitCosts?: number
  totalInboundUnitCosts?: number
  totalLandedUnitCosts?: number
  costEntryCount?: number // not money
  lastCostUpdateDate?: string | null
  group?: null
  brand?: IBrand | null
  reBrand?: null
  fnSku: string
  asin: string
  productSuppliers?: IProductSupplier[] | null
  isBundle: boolean
  products?: {id: number}[]
  amazonProductStatus?: string
  amazonFees?: number | null
}
export interface IProduct extends IProductFormData {
  products: any[]
  id: number
}

export type ICostValue = {
  value: number | undefined
  change: number | undefined | null
}

export type IProductStatsDifference = {
  totalUnitsOrdered: ICostValue
  totalLandedCosts: ICostValue
  totalFactoryUnitCosts: ICostValue
  totalInboundUnitCosts: ICostValue
  totalLandedUnitCosts: ICostValue
  sku: string
  name: string
}

export interface IProducts extends IPaginable {
  content: IProduct[]
}

export interface IBrands extends IPaginable {
  content: IBrand[]
}

export type IFilterProductParams = {
  tag?: string | null
  status?: string | null
  group?: string | null
  brand?: string | null
  reBrand?: string | null
  shippingMethod?: string | null
  productSuppliers?: string | null
  freeText?: string | null
}

export type IProductAcceptRejectRequest = {
  productIds: number[]
  action: string
}
