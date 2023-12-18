import type { IDateRange } from '@/types/app'

export type IDashboardDataItem = {
  key: string
  values: {
    time: string
    value: number
  }[]
}

export type IDashboardTopSellers = {
  id: number
  sku: string
  time: string
  sold: number
  percentageChange: number
}

export type IDashboardStats = {
  title: string
  value: number | string
  percentageChange?: number
  cta: {
    name: string
    text: string
  }
}

export type IDashboard = {
  availableDates?: IDateRange
  topSellers?: IDashboardTopSellers
  stats?: IDashboardStats
  chartData?: IDashboardDataItem[]
}
