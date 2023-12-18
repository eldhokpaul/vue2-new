import type { ISupplier } from '@/modules/contacts/types'
import { IProduct } from '@/modules/products/types'
import type { IPaginable } from '@/types/app'

export type IInvoiceLineForm = {
  account: string
  internalReference: string | null
  costType: string | null
  quantity: number | null
  amount?: number | null
  userId?: number
  invoiceId: number | null
  product: IProduct
}
export interface IInvoiceLine extends IInvoiceLineForm {
  id?: number | string | null
  perUnitCost: number | null
}
export type IDocument = {
  url: string
  readable: boolean
  file: string
  uri: string
  filename: string
  description: string
  open: true
  inputStream: object
}
export type IInvoice = {
  id: number
  invoiceNumber: string | null
  status: string | null
  unixDate: number | null
  reconciled: boolean | null
  billToCompany: string | null
  payReferenceNumber?: string
  attention: string | null
  trackingNumber: string | null
  invoiceLines: Array<IInvoiceLine | IInvoiceLineForm>
  userId: number
  costType: string | null
  invoiceTotal: number | null
  supplier: ISupplier | null
  document?: IDocument | null
  valid?: boolean
  xeroId?: string
  invoicePaymentId: number | null
}
export interface IInvoices extends IPaginable {
  content: IInvoice[]
}
export type IInvoiceUploadFormData = {
  file: File | null
  userId: number
}
export type IFiltersData = {
  product?: string | null
  total?: {
    min: number | null
    max: number | null
  }
  status?: string | null
  costType?: string | null
  version?: string | null
  billToCompany?: string | null
}
