import type { IPaginable } from '@/types/app'

export type ICost = {
  id: number
  invoiceLineId: number
  product: {
    id: number
    name: string | null
    sku: string | null
  }
  payReference: string | null
  costType: string | null
  internalReference: string | null
  invoice: {
    invoiceNumber: string | null
    payReferenceNumber?: string | null
    unixDate?: string | null
    id: number
  }
  totalLandedCosts: number | null
  quantityOrdered: number | null
  factoryUnits: number | null
  factoryCosts: number | null
  inboundCosts: number | null
  totalCosts: number | null
  userId: number
  isExcludedFromGeneralCostsData: boolean | null
  isExcludedFromProductCostsData: boolean | null
}

export interface ILineCosts extends IPaginable {
    content: ICost[]
}

export type ICosts = {
  lineCosts: ILineCosts
  totalUnitsOrdered: number | null
  totalFactoryCosts: number | null
  totalInboundCosts: number | null
  totalLandedCosts: number | null
  totalCount: number | null
  averageCost: number | null
  costEntryCount: number | null
  userId: number | null
}

export type IFilterCostParams = {
  product?: string | null
  orderDates?: string | null
  desiredDateRanges?: string | null
  payReferenceNumber?: string | null
  costType?: string | null
  totalUnitsOrdered?: number | null
  totalFactoryCosts?: number | null
  totalInboundCosts?: number | null
  totalLandedCosts?: number | null
  freeText?: string | null
}
