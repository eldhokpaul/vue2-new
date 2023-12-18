export type IAccountSettings = {
  id: number
  userId: number
  currencyId: number
  currencyName?: string
  currencySymbol?: string
  enableEmail: boolean
  isDemoAccount?: boolean
}

export type ICurrency = {
  id?: number
  country?: string
  code?: string
  currencyName?: string
  currencySymbol?: string
  sortField?: number
}
