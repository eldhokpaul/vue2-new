export type ObjectKeyAsAny = {
  [key: string]: any
}

export type IToken = {
  id: number | null | undefined
  accessToken: string | null | undefined
  expiresIn: Date | null
  refreshExpiresIn: number | null
  refreshToken: string | null
  scope: string | null
  sessionState: string | null
}

export type IDateRange = {
  from: Date | string | null
  to: Date | string | null
}
export type IPageable = {
  pageNumber: number
  pageSize: number
  sort?: {
    sorted: boolean
    unsorted: boolean
    empty: boolean
  }
  paged?: boolean
  unpaged?: boolean
  offset?: number
}
export type IPaginable = {
  totalPages: number
  totalElements: number
  pageable: IPageable
  sort: {
    sorted: boolean
    unsorted: boolean
    empty: boolean
  }
  first: boolean
  last: boolean
  number: number
  numberOfElements: number
  size: number
  empty: boolean
}

export type ICurrentPageOpts = {
  userId: number
  page?: number
  size?: number
  sort?: Array<any>
  search?: string
  offset?: number
}
