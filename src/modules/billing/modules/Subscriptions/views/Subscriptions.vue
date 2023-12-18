<template>
  <v-container
    class="pa-0"
    style="height: 100%; display: flex; flex-direction: column"
    fluid
  >
    <billing-table
      style=" --ag-borders-critical: none;"
      :columns="headers"
      :floating-filter="false"
      :side-bar="false"
      @grid-ready="initialLoad"
    />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import type { Pageable, PagePaddleSubscriptionHistory } from '@/client/users'
import BillingTable from '@/components/VueDataGrid.vue'
// import { Task } from '@/decorators/task'
// import type { Subscription } from '@/modules/billing/types/Subscription'
import type { IUser } from '@/modules/user/types'
import { formatServerDate } from '@/utils/date'
const dashDefault = (params: any) => {
  if (!params.value) return '-'
  return params.value
}
@Component({
  components: {
    BillingTable
  }
})
export default class BillingSubscriptions extends Vue {
  @State('user', { namespace: 'user' }) user!: IUser
  // @State('subscription', { namespace: 'user' }) subscription!: Subscription
  @State('subscriptionHistory', { namespace: 'user' }) subscriptionHistory!: PagePaddleSubscriptionHistory
  // @Action('getUserSubscriptionByUserId', { namespace: 'user' }) getUserSubscriptionByUserId!: (userId: number) => Promise<any>
  @Action('getUserSubscriptionHistoryByUserId', { namespace: 'user' }) getUserSubscriptionHistoryByUserId!: (pagination: Pageable & {sort?: Array<any>}) => Promise<any>

  formatServerDate = formatServerDate
  agApi!: any;

  // @Task('initialLoadTask')

  async initialLoad (param: any) {
    this.agApi = param
    await this.agApi.api.setServerSideDatasource(this.dataSource)
    // await this.getUserSubscriptionByUserId(this.user.id)
    // await this.getUserSubscriptionHistoryByUserId(this.user.id)
  }

  // get nextBillDate (): string {
  //   if (this.subscription) { return formatServerDate(this.subscription.nextBillDate) } else {
  //     return ''
  //   }
  // }

  get dataSource () {
    return {
      getRows: async (params: any) => {
        const sort = params.request.sortModel || []
        // const filterModel = params.request.filterModel || {}
        const pageSize = params.api.paginationGetPageSize()
        // const rowGroupCols = params.request.rowGroupCols || []
        // const groupKeys = params.request.groupKeys || []
        // const valueCols = params.request.valueCols || []
        const page = params.api.paginationGetCurrentPage()
        try {
          params.api.showLoadingOverlay()
          await this.getUserSubscriptionHistoryByUserId({
            pageSize: pageSize,
            pageNumber: page + 1,
            sort: sort
          })
          if (this.subscriptionHistory?.content?.length) {
            params.api.hideOverlay()
            params.success({
              rowData: this.subscriptionHistory?.content,
              rowCount: this.subscriptionHistory?.totalElements
            })
          } else {
            params.api.hideOverlay()
            params.api.showNoRowsOverlay()
            params.success({
              rowData: [],
              rowCount: 0
            })
          }
        } catch (e) {
          params.fail()
        }
      }
    }
  }

  dateFormatter (params: any) {
    if (params.value) {
      return formatServerDate(params.value)
    } else {
      return '-'
    }
  }

  get headers () {
    return [
      {
        headerName: this.$t('pages.billingSubscriptions.headers.date'),
        field: 'eventTime',
        filter: false,
        valueFormatter: this.dateFormatter,
        sortable: true
      },
      {
        headerName: this.$t('pages.billingSubscriptions.headers.orderId'),
        field: 'orderId',
        valueFormatter: dashDefault,
        filter: false,
        sortable: true
      },
      {
        headerName: this.$t('pages.billingSubscriptions.headers.subscriptionId'),
        field: 'subscriptionId',
        valueFormatter: dashDefault,
        filter: false,
        sortable: true
      },
      {
        headerName: this.$t('pages.billingSubscriptions.headers.subscriptionPlanId'),
        field: 'subscriptionPlanId',
        valueFormatter: dashDefault,
        filter: false,
        sortable: true
      },
      {
        headerName: this.$t('pages.billingSubscriptions.headers.status'),
        field: 'status',
        valueFormatter: dashDefault,
        filter: false,
        sortable: true
      },
      {
        headerName: this.$t('pages.billingSubscriptions.headers.amount'),
        field: 'amount',
        valueFormatter: dashDefault,
        filter: false,
        sortable: true
      },
      {
        headerName: this.$t('pages.billingSubscriptions.headers.nextBillDate'),
        field: 'nextBillDate',
        valueFormatter: this.dateFormatter,
        filter: false,
        sortable: true
      },
      {
        headerName: this.$t('pages.billingSubscriptions.headers.retryPaymentDate'),
        field: 'retryPaymentDate',
        valueFormatter: this.dateFormatter,
        filter: false,
        sortable: true
      }
    ]
  }
}
</script>
