<template>
  <v-container
    class="page-container"
    fluid
  >
    <page-header :title="$t('pages.marketplaceOverview1.name')">
      <template #buttons>
        <v-btn
          v-if="!initialTask.isActive && !dateRangeUpdateTask.isActive && resultArray"
          color="primary"
          outlined
          class="float-right mr-3"
          large
          @click="showDialog = true"
        >
          Upload report
        </v-btn>
        <upload-report-dialog v-model="showDialog" />
      </template>
    </page-header>
    <template
      v-if="initialTask.isActive || dateRangeUpdateTask.isActive|| !resultArray"
    >
      <v-skeleton-loader type="list-item, table-thead" />
      <v-skeleton-loader type="list-item" />
      <v-row>
        <v-col>
          <v-skeleton-loader
            type="table-tbody,table-tbody"
          />
        </v-col>
        <v-col>
          <v-skeleton-loader
            type="image,image,image"
          />
        </v-col>
      </v-row>
      <v-skeleton-loader type="list-item" />
    </template>
    <v-card
      v-else-if="resultArray"
      outlined
      tile
    >
      <v-container fluid>
        <v-row class="align-center">
          <v-col
            cols="12"
            md="3"
          >
            <date-range
              :dates="dateValue"
              @update="summaryUpdate"
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
            class="d-flex align-center justify-center"
          >
            <v-btn-toggle
              v-model="toggleSelection"
              dense
              mandatory
              @change="setDateRange"
            >
              <v-btn value="daily">
                Daily
              </v-btn>
              <v-btn value="weekly">
                Weekly
              </v-btn>
              <v-btn value="monthly">
                Monthly
              </v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <form-builder
              :data="value"
              :form-inputs="filterSwitches"
              class="row ml-1"
            />
          </v-col>
        </v-row>
        <v-row class="my-0 py-0">
          <v-col class="mb-0 pb-0">
            <summary-change-stats-card :product-stats="cardData" />
          </v-col>
        </v-row>
        <v-row class="d-flex">
          <v-col
            md="5"
            sm="12"
          >
            <v-card
              flat
              height="61vh"
            >
              <simple-table-ag-grid :row-data="resultArray" />
            </v-card>
          </v-col>
          <v-col
            md="7"
            sm="12"
          >
            <ag-charts-vue :options="chartOptions" />
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { AgChartsVue } from 'ag-charts-vue'
import { format, subDays } from 'date-fns'
import isEmpty from 'lodash/isEmpty'
import { Component, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import FormBuilder from '@/components/FormBuilder/FormBuilder.vue'
import PageHeader from '@/components/PageHeader.vue'
import { Task } from '@/decorators/task'

import DateRange from '../components/DateRange.vue'
import SimpleTableAgGrid from '../components/SimpleTableAgGrid.vue'
import SummaryChangeStatsCard from '../components/SummaryChangeStatsCard.vue'
import UploadReportDialog from '../components/UploadReportDialog.vue'
const namespaces = {
  marketplaceAccounts: 'marketplaceAccounts'
}

@Component({
  components: {
    PageHeader,
    FormBuilder,
    DateRange,
    SummaryChangeStatsCard,
    SimpleTableAgGrid,
    AgChartsVue,
    UploadReportDialog
  }
})
export default class marketplaceOverview1 extends Vue {
  @Action('getReportDateRange', { namespace: namespaces.marketplaceAccounts })
  getReportDateRange!: () => Promise<void>;

  @Action('getReportType', { namespace: namespaces.marketplaceAccounts })
  getReportType!: () => Promise<void>;

  @Action('getReportSummary', { namespace: namespaces.marketplaceAccounts })
  getReportSummary!: (params: {
    dateFrom: string
    dateTo: string
  }) => Promise<void>;

  @State('reportDateRange', { namespace: namespaces.marketplaceAccounts })
  reportDateRange!: any;

  @State('reportSummary', { namespace: namespaces.marketplaceAccounts })
  reportSummary!: any;

  value = { fromDate: '', todate: '' };
  toggleSelection = 'weekly';
  showDialog = false;

  dateValue: string[] = [];
  dataChart = [
    {
      quarter: 'Jul 2021',
      spending: 200,
      Revenue: 200
    },
    {
      quarter: 'Sep 2021',
      spending: 600,
      Revenue: 700
    },
    {
      quarter: 'Nov 2021',
      spending: 560,
      Revenue: 350
    },
    {
      quarter: 'Jan 2022',
      spending: 450,
      Revenue: 200
    },
    {
      quarter: 'Mar 2022',
      spending: 350,
      Revenue: 350
    },
    {
      quarter: 'May 2022',
      spending: 250,
      Revenue: 100
    },
    {
      quarter: 'Jul 2022',
      spending: 150,
      Revenue: 300
    }
  ];

  get resultArray () {
    if (isEmpty(this.reportSummary)) return
    return [
      {
        name: 'Quantity Sold',
        value: this.reportSummary.quantity_total,
        sub: [
          {
            name: 'Quantity Ordered',
            value: this.reportSummary.quantity_sold
          },
          {
            name: 'Quantity Refunded',
            value: this.reportSummary.quantity_refunded
          },
          {
            name: 'Quantity Adjustments',
            value: this.reportSummary.quantity_adjusted
          }
        ]
      },
      {
        name: 'Gross Revenue',
        value: this.reportSummary.type_summaries.total.product_sales,
        sub: [
          {
            name: 'Product Sales',
            value: this.reportSummary.type_summaries.order.product_sales
          },
          {
            name: 'Product Refunds',
            value: this.reportSummary.type_summaries.refund.product_sales
          },
          {
            name: 'Product Adjustments',
            value: this.reportSummary.type_summaries.adjustment.product_sales
          }
        ]
      },
      {
        name: 'Shipping Credits',
        value: this.reportSummary.type_summaries.total.shipping_credits
      },
      {
        name: 'Gift Wrap Credits',
        value: this.reportSummary.type_summaries.total.gift_wrap_credits
      },
      {
        name: 'Promotional Rebates',
        value: this.reportSummary.type_summaries.total.promotional_rebates
      },
      {
        name: 'Marketplace Tax Collected',
        value: this.reportSummary.type_summaries.total.sales_tax_collected,
        sub: [
          {
            name: 'Product Sales Tax',
            value: ''
          },
          {
            name: 'Shipping Credits Tax',
            value: ''
          },
          {
            name: 'Giftwrap Credits Tax',
            value: ''
          },
          {
            name: 'Regulatory Fee',
            value: ''
          },
          {
            name: 'Tax On Regulatory Fee',
            value: ''
          },
          {
            name: 'Promotional Rebates Tax',
            value: ''
          }
        ]
      },
      {
        name: 'Amazon Transaction Fees',
        value: this.reportSummary.type_summaries.total.total,
        sub: [
          {
            name: 'Marketplace Withheld Tax',
            value:
              this.reportSummary.type_summaries.total
                .marketplace_facilitator_tax
          },
          {
            name: 'Selling Fees',
            value: this.reportSummary.type_summaries.total.selling_fees
          },
          {
            name: 'FBA Fees',
            value: this.reportSummary.type_summaries.total.fba_fees
          },
          {
            name: 'Other Transaction Fees',
            value:
              this.reportSummary.type_summaries.total.other_transaction_fees
          },
          {
            name: 'Other',
            value: this.reportSummary.type_summaries.total.other
          }
        ]
      },
      {
        name: 'Amazon Variables Fees',
        value: this.reportSummary.fees.summary.total,
        sub: [
          {
            name: 'FBM Shipping Fees',
            value: this.reportSummary.fees.summary['FBM Shipping Fees']
          },
          {
            name: 'FBA Amazon-Partnered Carrier Shipment Fee',
            value:
              this.reportSummary.fees.summary[
                'FBA Amazon-Partnered Carrier Shipment Fee'
              ]
          },
          {
            name: 'FBA Transportation Fee',
            value: this.reportSummary.fees.summary['FBA Transportation Fee']
          },
          {
            name: 'FBA Inventory Storage Fee',
            value: this.reportSummary.fees.summary['FBA Inventory Storage Fee']
          },
          {
            name: 'FBA Inventory Placement Service Fee',
            value:
              this.reportSummary.fees.summary[
                'FBA Inventory Placement Service Fee'
              ]
          },
          {
            name: 'FBA Long-Term Storage Fee',
            value: this.reportSummary.fees.summary['FBA Long-Term Storage Fee']
          },
          {
            name: 'FBA Removal Order: Disposal Fee',
            value:
              this.reportSummary.fees.summary[
                'FBA Removal Order: Disposal Fee'
              ]
          },
          {
            name: 'Subscription Fee',
            value: this.reportSummary.fees.summary['Subscription Fee']
          },
          {
            name: 'Other (Balance Adj)',
            value: this.reportSummary.fees.summary['Other (Balance Adj)']
          },
          {
            name: 'Advertising Deals',
            value:
              this.reportSummary.fees.summary[
                'Advertising Deals (Lightning Deals/Coupons etc)'
              ]
          },
          {
            name: 'Other Variable Service Fees',
            value:
              this.reportSummary.fees.summary[
                'Other Variable Amazon Service Fees'
              ]
          }
        ]
      },
      {
        name: 'Sales Tax Balance',
        value: this.reportSummary.type_summaries.total.sales_tax_collected
      },
      {
        name: 'Advertising Cost',
        value: this.reportSummary.cost_of_advertising.total
      },
      {
        name: 'Marketplace Profit',
        value: this.reportSummary.net_profit
      },
      {
        name: 'Return On Investment',
        value: this.reportSummary.gross_profit
      }
    ]
  }

  get chartOptions () {
    return {
      autoSize: true,
      theme: this.$vuetify.theme.dark ? 'ag-default-dark' : 'ag-default',
      data: this.dataChart,
      series: [
        {
          xKey: 'quarter',
          yKey: 'spending',
          stroke: 'lightblue',
          marker: {
            stroke: 'lightblue',
            fill: 'white',
            size: 8,
            strokeWidth: 2
          },
          tooltip: {
            renderer: function (params: { xValue: any, yValue: any }) {
              return `
            <div class="ag-chart-tooltip-title">
                ${params.xValue}
            </div>
            <div class="ag-chart-tooltip-content">
               <span style="color:blue">Spending this Year: US$</span>${params.yValue}
            </div>`
            }
          }
        },
        {
          xKey: 'quarter',
          yKey: 'Revenue',
          stroke: 'lightblue',
          marker: {
            stroke: 'lightblue',
            fill: 'white',
            size: 8,
            strokeWidth: 2
          },
          lineDash: [4, 4],
          tooltip: {
            renderer: function (params: { xValue: any, yValue: any }) {
              return `
            <div class="ag-chart-tooltip-title">
                ${params.xValue}
            </div>
            <div class="ag-chart-tooltip-content">
               <span style="color:blue">Revenue this Year: US$</span>${params.yValue}
            </div>`
            }
          }
        }
      ],
      axes: [
        {
          type: 'category',
          position: 'bottom'
        },
        {
          type: 'number',
          position: 'left',
          label: {
            formatter: (params: { value: string }) => {
              return 'US$' + params.value
            }
          }
        }
      ]
    }
  }

  get cardData () {
    if (isEmpty(this.reportSummary)) return
    return {
      unitsOrdered: {
        value: this.reportSummary.net_qty_sold,
        name: 'Units Ordered',
        type: 'units',
        percentage: '-17.8'
      },
      avarageOrderValue: {
        value: this.reportSummary.average_sale_amount,
        name: 'Average Order Value',
        type: 'units',
        percentage: '1.6'
      },
      grossRevenue: {
        value: this.reportSummary.type_summaries.total.product_sales,
        name: 'Gross Revenue',
        type: 'units',
        percentage: '1.6'
      },
      amazonFees: {
        value: this.reportSummary.amazon_fees,
        name: 'Amazon Fees',
        type: 'units',
        percentage: '1.6'
      },
      productCosts: {
        value: this.reportSummary.avg_daily_sales,
        name: 'Product Costs',
        type: 'units',
        percentage: '-17.8'
      },
      advertisingCosts: {
        value: this.reportSummary.cost_of_advertising.total,
        name: 'Advertising Costs',
        type: 'units',
        percentage: '1.6'
      },
      marketplaceProfit: {
        value: this.reportSummary.net_profit,
        name: 'Marketplace Profit',
        type: 'units',
        percentage: '-17.8'
      }
    }
  }

  get filterSwitches () {
    return [
      {
        model: 'isActive',
        type: 'switch',
        class: 'pr-2',
        props: {
          label: 'This Year',
          inset: true
        }
      },
      {
        model: 'isVerified',
        type: 'switch',
        class: 'pr-2',
        props: {
          label: 'Last Year',
          inset: true
        }
      },
      {
        model: 'isActive',
        type: 'switch',
        class: 'pr-2',
        props: {
          label: 'Avarage Daily Trends',
          inset: true
        }
      },
      {
        model: 'isVerified',
        type: 'switch',
        props: {
          label: 'Marketplace Efficiency %',
          inset: true
        }
      }
    ]
  }

  beforeMount () {
    this.initialLoad()
  }

  @Task('initialTask')
  async initialLoad () {
    await this.getReportDateRange()
    await this.getReportType()
    // const firstDate = this.reportDateRange.first
    // const lastDate = this.reportDateRange.last
    // await this.getReportSummary({ dateFrom: firstDate, dateTo: lastDate })
    this.dateValue = [this.reportDateRange?.first || '', this.reportDateRange?.last || '']
    await this.getReportSummary({
      dateFrom: this.dateValue[0],
      dateTo: this.dateValue[1]
    })
  }

  async summaryUpdate (val: string[]) {
    if (val[0] !== this.dateValue[0] || val[1] !== this.dateValue[1]) {
      this.dateValue = val
      // if (val && val[0] && val[1]) {
      //   await this.getReportSummary({ dateFrom: val[0], dateTo: val[1] })
      // }
    }
    if (val && val[0] && val[1]) {
      await this.getSummary(this.dateValue)
    }
  }

@Task('dateRangeUpdateTask')
  async getSummary (dateValue: string[]) {
    if (dateValue && dateValue[0] && dateValue[1]) {
      await this.getReportSummary({ dateFrom: dateValue[0], dateTo: dateValue[1] })
    }
  }

async setDateRange () {
  const currentDate = new Date()
  if (this.toggleSelection === 'daily') {
    this.dateValue = [
      format(currentDate, 'yyyy-MM-dd'),
      format(currentDate, 'yyyy-MM-dd')
    ]
  } else if (this.toggleSelection === 'monthly') {
    this.dateValue = [
      format(subDays(currentDate, 30), 'yyyy-MM-dd'),
      format(currentDate, 'yyyy-MM-dd')
    ]
  } else if (this.toggleSelection === 'weekly') {
    this.dateValue = [
      format(subDays(currentDate, 7), 'yyyy-MM-dd'),
      format(currentDate, 'yyyy-MM-dd')
    ]
  }
  await this.getSummary(this.dateValue)
  // if (this.dateValue && this.dateValue[0] && this.dateValue[1]) {
  //   await this.getReportSummary({
  //     dateFrom: this.dateValue[0],
  //     dateTo: this.dateValue[1]
  //   })
  // }
}
}
</script>
