import type {
  IDashboardDataItem,
  IDashboardStats,
  IDashboardTopSellers
} from '@/modules/dashboard/types'

const chartData: IDashboardDataItem[] = [
  {
    key: 'revenue',
    values: [
      {
        time: '2020-08-1',
        value: 180
      },
      {
        time: '2020-08-2',
        value: 1890
      },
      {
        time: '2020-08-15',
        value: 600
      },
      {
        time: '2020-08-17',
        value: 778
      }
    ]
  },
  {
    key: 'cost',
    values: [
      {
        time: '2020-08-1',
        value: 111
      },
      {
        time: '2020-08-4',
        value: 22
      },
      {
        time: '2020-08-12',
        value: 650
      },
      {
        time: '2020-08-14',
        value: 778
      }
    ]
  }
]

const topSellers: IDashboardTopSellers[] = [
  {
    id: 0,
    sku: 'SKU-01',
    sold: 302,
    time: '2005-03-1',
    percentageChange: 80
  },
  {
    id: 1,
    sku: 'Product 2',
    sold: 99,
    time: '2005-03-1',
    percentageChange: -2.5
  },
  {
    id: 2,
    sku: 'Product 3',
    sold: 36,
    time: '2005-03-1',
    percentageChange: 3
  }
]

const stats: IDashboardStats[] = [
  {
    title: 'productsSold',
    value: 2,
    percentageChange: 11,
    cta: {
      name: 'products',
      text: 'viewAllProducts'
    }
  },
  {
    title: 'turnover',
    value: 2.65,
    percentageChange: -1.3,
    cta: {
      name: 'turnover',
      text: 'viewReport'
    }
  },
  {
    title: 'invoicesReconciled',
    value: 60,
    cta: {
      name: 'invoices',
      text: 'viewAllInvoices'
    }
  },
  {
    title: 'worstSellingProduct',
    value: 'SKU-01',
    cta: {
      name: 'products/SKU-01',
      text: 'viewProduct'
    }
  }
]

export {
  chartData,
  topSellers,
  stats
}
