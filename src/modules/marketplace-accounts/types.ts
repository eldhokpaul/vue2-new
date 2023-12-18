import { IPaginable } from '@/types/app'

export type IProduct = {
  id: number
  sku: string
  userId: number | null
  name: string
  tag?: string | null
  notes: string
  status?: string
  thumbnail?: string
  filledBy?: string
  totalFactoryCosts?: number
  totalInboundCosts?: number
  totalUnitsOrdered?: number
  totalLandedCosts?: number
  totalFactoryUnitCosts?: number
  totalInboundUnitCosts?: number
  totalLandedUnitCosts?: number
  costEntryCount?: number
  lastCostUpdateDate?: string | null
  fnSku: string
  asin: string
  isBundle: boolean
  products?: {id: number}[]
  amazonProductStatus?: string
  amazonFees?: number
  listingPrice?: number
}

export interface IProducts extends IPaginable {
  content: IProduct[]
}

export type IReportUploadFormData = {
  file: File | null
  userId: number
  year:string
  month:string
  reportType:string
}
export type IProductAcceptRejectRequest = {
  productIds: number[]
  action: string
}
