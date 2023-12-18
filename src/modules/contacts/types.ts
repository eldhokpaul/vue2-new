import type { IPaginable } from '@/types/app'
export type ISupplierFormData = {
  telephoneNumber?: string | null
  email?: string | null
  companyName?: string | null
  userId?: number | null
  productSuppliers?: [null] | null
  addressLine1?: string | null
  addressLine2?: string | null
  addressLine3?: string | null
  city?: string | null
  zipOrPostCode?: string | null
  stateOrProvince?: string | null
  country?: string | null
  notes?: string | null
}
export interface ISupplier extends ISupplierFormData {
  id: number | null
  address?: string | null
  xeroId?: string | null
}

export type IFilterSupplierParams = {
  address: string | null
  telephoneNumber: string | null
  email: string | null
  companyName: string | null
}

export type ICountry = {
  id: number | null
  isoCode: string | null
  name: string | null
  sortField?: number | null
}

export interface ISuppliers extends IPaginable {
  content: ISupplier[]
}
