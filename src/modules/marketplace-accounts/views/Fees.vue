<template>
  <v-container
    class="page-container"
    fluid
  >
    <page-header :title="$t('pages.marketplaceFees.name')">
      <template #buttons>
        <v-btn
          v-if="!initialTask.isActive && !dateRangeUpdateTask.isActive && reportSummary"
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
      v-if="initialTask.isActive || dateRangeUpdateTask.isActive|| !reportSummary"
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
      v-else-if="reportSummary"
      outlined
      tile
    >
      <v-container
        fluid
      >
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
        <v-row
          v-if="cardData"
          class="my-0 py-0"
        >
          <v-col class="mb-0 pb-0">
            <fee-change-stats-card :product-stats="cardData" />
          </v-col>
        </v-row>
        <v-row class="d-flex">
          <v-col
            md="4"
            sm="12"
          >
            <div>
              <v-card
                flat
              >
                <h3>Variable Fees Summary</h3>
                <fees-table
                  v-if="reportSummary"
                  :row-data="reportSummary.fees.summary"
                />
              </v-card>
            </div>
          </v-col>
          <v-col
            md="8"
            sm="12"
          >
            <v-card
              flat
            >
              <data-table
                v-if="reportSummary"
                :row-data="reportSummary.fees.detail"
              />
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { AgChartsVue } from 'ag-charts-vue'
import { format, subDays } from 'date-fns'
import { Component, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import FormBuilder from '@/components/FormBuilder/FormBuilder.vue'
import PageHeader from '@/components/PageHeader.vue'
import { Task } from '@/decorators/task'

import dataTable from '../components/dataTable.vue'
import DateRange from '../components/DateRange.vue'
import FeeChangeStatsCard from '../components/FeeChangeStatsCard.vue'
import FeesTable from '../components/FeesTable.vue'
import UploadReportDialog from '../components/UploadReportDialog.vue'

const namespaces = {
  products: 'products',
  user: 'user',
  integrations: 'integrations',
  toasts: 'toasts',
  marketplaceAccounts: 'marketplaceAccounts',
  grid: 'grid',
  accountSettings: 'accountSettings'
}

@Component({
  components: {
    PageHeader,
    FormBuilder,
    DateRange,
    FeeChangeStatsCard,
    AgChartsVue,
    FeesTable,
    dataTable,
    UploadReportDialog
  }
})
export default class marketplaceFees extends Vue {
  // @Action('addError', { namespace: namespaces.toasts }) addError!: (text: string) => Promise<void>;
  // @Action('getAmazonIntegrationDetails', { namespace: namespaces.integrations }) getAmazonIntegrationDetails!: () => Promise<void>;

  // @State('accountSettings', { namespace: namespaces.accountSettings }) accountSettings!: AccountSettingsDto;
  // @State('userAmazonIntegrationDetails', { namespace: namespaces.integrations }) userAmazonIntegrationDetails!: any;

  // @Getter('isViewer', { namespace: namespaces.user }) isViewer!: boolean
  // @Getter('isAdmin', { namespace: namespaces.user }) isAdmin!: boolean
  @Action('getReportDateRange', { namespace: namespaces.marketplaceAccounts })getReportDateRange!:() => Promise<void>;

  @Action('getReportType', { namespace: namespaces.marketplaceAccounts })
  getReportType!: () => Promise<void>;

  @Action('getReportSummary', { namespace: namespaces.marketplaceAccounts })getReportSummary!: (params: {dateFrom: string, dateTo:string}) => Promise<void>;
  @State('reportDateRange', { namespace: namespaces.marketplaceAccounts }) reportDateRange!: any;
  @State('reportSummary', { namespace: namespaces.marketplaceAccounts }) reportSummary!: any[];
  value={ fromDate: '', todate: '' }
  toggleSelection='weekly'
  dateValue:string[] = []
  showDialog = false;
  details=[]

  get cardData () {
    return {
      totalVariableFees: { value: 8563.23, totalVariableFees: 'Total Variable Fees', type: 'units', percentage: '-17.8' },
      assignedFees: { value: 8363.00, assignedFees: 'Assigned Fees', type: 'units', percentage: '1.6' },
      unAssignedFees: { value: 200.23, unAssignedFees: 'Un-Assigned Fees', type: 'units', percentage: '1.6' }
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
