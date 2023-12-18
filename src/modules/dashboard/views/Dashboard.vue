<template>
  <v-container
    class="page-container"
    fluid
  >
    <page-header :title="$t('routes.dashboard')" />
    <v-row>
      <v-col md="8">
        <div>
          <app-onboarding-stepper
            v-if="user"
            class="mb-6"
            :user="user"
            :should-show="shouldShowOnboarding"
            :should-minimise="shouldOnboardingMinimised"
            :model="onboardingStep"
            @update:should-show="setOnboarding"
            @update:should-minimise="setOnboardingMinimised"
            @update:model="setOnboardingStep"
          />
          <v-card
            class="pt-4"
            outlined
            height="600px"
          >
            <h2
              v-t="'pages.dashboard.recentlyUpdated'"
              class="pl-4 pb-5"
            />
            <div style="height: 482px">
              <dashboard-recent-invoices
                v-model="selectedInvoices"
                style="height: 100%"
                :columns="headers"
                @grid-ready="initialFunction"
                @rowClicked="
                  ({ data: { id } }) => {
                    $router.push({
                      name: 'invoice',
                      params: { id },
                    });
                  }
                "
              />
              <v-btn
                v-t="'pages.dashboard.viewAllInvoices'"
                large
                text
                block
                color="primary"
                @click=" $router.push({
                  name: 'invoices',
                })"
              />
            </div>
          </v-card>
          <v-container
            v-if="!invoices"
            fluid
            fill-height
          >
            <v-row>
              <v-col>
                <div class="d-flex flex-column align-center justify-center">
                  <h2
                    v-t="'pages.invoices.noInvoices'"
                    class="text-center"
                  />
                  <v-btn
                    v-if="!isViewer"
                    v-t="'pages.invoices.upload'"
                    text
                    :to="{
                      name: 'addInvoice',
                    }"
                  />
                </div>
              </v-col>
            </v-row>
          </v-container>
        </div>
      </v-col>
      <v-col md="4">
        <v-card
          class="pa-4"
          outlined
        >
          <h2
            v-t="'routes.addAnInvoice'"
            class="pb-5"
          />
          <invoice-upload-form
            :invoice="invoice"
            :should-show-cancel="false"
            @submit="submit"
          />
        </v-card>
      </v-col>
    </v-row>
    <app-set-user-name-dialog
      :title="'pages.dashboard.dialogTitle'"
      :details="'pages.dashboard.dialogDescription'"
      :should-show="dialog"
      :user="user"
    />
  </v-container>
</template>

<script lang="ts">
import * as Sentry from '@sentry/vue'
import get from 'lodash.get'
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { Action, Getter, Mutation, State } from 'vuex-class'

import type { AccountSettingsDto } from '@/client/users'
import AppOnboardingStepper from '@/components/AppOnboardingStepper.vue'
import AppSetUserNameDialog from '@/components/dialogs/AppSetUserNameDialog.vue'
import PageHeader from '@/components/PageHeader.vue'
import DashboardRecentInvoices from '@/components/VueDataGrid.vue'
import InvoiceUploadForm from '@/modules/invoices/components/InvoiceUploadForm.vue'
import type {
  IInvoice,
  IInvoices,
  IInvoiceUploadFormData
} from '@/modules/invoices/types'
import type { IUser } from '@/modules/user/types'
import type {
  ICurrentPageOpts,
  ObjectKeyAsAny
} from '@/types/app'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { EventBus } from '@/utils/event-bus'

const namespaces = {
  app: 'app',
  invoices: 'invoices',
  user: 'user',
  toasts: 'toasts',
  accountSettings: 'accountSettings'
}
const dashDefault = (params: any) => {
  if (!params.value) return '-'
  return params.value
}
const dateFilterParams = {
  filterOptions: ['lessThanOrEqual', 'greaterThanOrEqual'],
  debounceMs: 200,
  suppressAndOrCondition: true
}

@Component({
  name: 'Dashboard',
  components: {
    AppOnboardingStepper,
    AppSetUserNameDialog,
    InvoiceUploadForm,
    DashboardRecentInvoices,
    PageHeader
  }
})
export default class Dashboard extends Vue {
  @State('user', { namespace: namespaces.user })
  user!: IUser;

  @State('onboardingStep', { namespace: namespaces.app })
  onboardingStep!: number;

  @Mutation('setOnboardingStep', { namespace: namespaces.app })
  setOnboardingStep!: (val: number) => void;

  @State('shouldShowOnboarding', { namespace: namespaces.app })
  shouldShowOnboarding!: boolean;

  @Mutation('setOnboarding', { namespace: namespaces.app })
  setOnboarding!: (val: boolean) => void;

  @State('shouldOnboardingMinimised', { namespace: namespaces.app })
  shouldOnboardingMinimised!: boolean;

  @Mutation('setOnboardingMinimised', { namespace: namespaces.app })
  setOnboardingMinimised!: (val: boolean) => void;

  @Getter('id', { namespace: namespaces.user })
  userId!: number;

  @State('content', { namespace: namespaces.invoices })
  invoices!: IInvoices;

  // @Action('getInvoices', { namespace: namespaces.invoices })
  // getInvoices!: any

  @Action('getInvoices', { namespace: namespaces.invoices }) getInvoices!: (
    params: ICurrentPageOpts
  ) => any;

  @Getter('isViewer', { namespace: namespaces.user }) isViewer!: boolean

  @Action('uploadInvoice', { namespace: namespaces.invoices })
  uploadInvoice: any;

  @Action('getCostTypes', { namespace: namespaces.invoices })
  getCostTypes!: any;

  @State('costTypes', { namespace: namespaces.invoices })
  costTypes!: ObjectKeyAsAny;

  @State('accountSettings', { namespace: namespaces.accountSettings })
  accountSettings!: AccountSettingsDto;

  @Action('addSuccess', { namespace: namespaces.toasts })
  addSuccess!: (text: string) => Promise<any>;

  @Action('addError', { namespace: namespaces.toasts })
  addError!: (text: string) => Promise<any>;

  selectedInvoices: IInvoice[] = [];
  headers = [...this.allHeaders];
  agApi!: any;
  invoice = {
    file: null
  };

  dialog = false;
  invoiceData = false;

  async initialFunction (param: any) {
    this.agApi = param
    await this.initialLoad()
  }

  async initialLoad () {
    await this.agApi.api.setServerSideDatasource(this.dataSource)
  }

  async mounted () {
    this.dialog = !this.user.firstName && !this.user.lastName
    await this.getCostTypes()
    EventBus.$on('switch-user-event', this.initialLoad)
  }

  beforeDestroy () {
    // Remember to remove the event listener when the component is destroyed
    EventBus.$off('switch-user-event')
  }

  async submit () {
    const { file } = this.invoice
    let res = null

    const invoiceParams: IInvoiceUploadFormData = {
      file,
      userId: this.userId
    }

    try {
      res = await this.uploadInvoice(invoiceParams)
    } catch (e) {
      Sentry.captureException(e)
    }

    await this.createDialog(res)
    if (res) {
      this.$router.push({
        name: 'invoice',
        params: {
          id: res.id
        }
      })
    }
  }

  async createDialog (success: boolean) {
    if (success) {
      await this.addSuccess(
        this.$t('pages.invoices.actions.success') as string
      )
    } else {
      await this.addError(this.$t('pages.invoices.actions.error') as string)
    }
  }

  get allHeaders () {
    return [
      {
        headerName: 'ID',
        valueFormatter: dashDefault,
        sortable: true,
        field: 'id'
      },
      {
        headerName: this.$t('components.invoicesTable.date'),
        field: 'unixDate',
        sortable: true,
        minWidth: 180,
        filter: 'agDateColumnFilter',
        filterParams: dateFilterParams,
        valueFormatter: this.dateFormatter
      },
      {
        headerName: this.$t('components.invoicesTable.status'),
        valueFormatter: dashDefault,
        field: 'status',
        cellRenderer: 'StatusRender',
        cellRendererParams: {
          type: 'invoice'
        }
      },
      {
        headerName: this.$t('components.invoicesTable.contact'),
        valueFormatter: dashDefault,
        sortable: true,
        field: 'supplier.companyName'
      },
      {
        headerName: this.$t('components.invoicesTable.invoiceNumber'),
        valueFormatter: dashDefault,
        sortable: true,
        field: 'invoiceNumber'
      },
      {
        headerName: this.$t('components.invoicesTable.payReferenceNumber'),
        valueFormatter: dashDefault,
        sortable: true,
        field: 'payReferenceNumber'
      },
      {
        headerName: this.$t('components.invoicesTable.costType'),
        valueFormatter: this.costTypesFormatter,
        sortable: true,
        field: 'costType'
      },
      {
        headerName: this.$t('components.invoicesTable.total'),
        valueFormatter: this.currencyFormatter,
        sortable: true,
        field: 'invoiceTotal'
      },
      {
        headerName: this.$t('components.invoicesTable.reconciled'),
        valueFormatter: dashDefault,
        field: 'reconciled',
        suppressFiltersToolPanel: true,
        filter: 'FilterModel',
        floatingFilterComponentParams: {
          suppressFilterButton: true
        },
        cellRenderer: 'ReconciledRender'
      }
    ]
  }

  get dataSource () {
    return {
      getRows: async (params: any) => {
        const sort = params.request.sortModel || []
        const filterModel = params.request.filterModel || {}
        const pageSize = params.api.paginationGetPageSize()
        const page = params.api.paginationGetCurrentPage()
        try {
          if (Object.keys(filterModel).length && this.invoices?.content) {
            const filteredList = await this.localFilter(
              this.invoices.content,
              filterModel
            )
            if (filteredList.length) {
              params.success({
                rowData: filteredList,
                rowCount: filteredList.length
              })
              params.columnApi.autoSizeAllColumns()
              return false
            }
            params.success({
              rowData: [],
              rowCount: 0
            })
            params.api.showNoRowsOverlay()
            return false
          }
          params.api.showLoadingOverlay()
          await this.getInvoices({
            userId: this.userId,
            size: pageSize,
            page: page + 1,
            sort: sort
          })
          if (this.invoices?.content.length) {
            params.api.hideOverlay()
            params.success({
              rowData: this.invoices?.content,
              rowCount: this.invoices?.totalElements
            })
            params.columnApi.autoSizeAllColumns()
          } else {
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

  async localFilter (
    filteredList: IInvoice[],
    filterModel: any
  ): Promise<IInvoice[] | []> {
    try {
      for (const item in filterModel) {
        let value = ''
        if (filterModel[item].filterType === 'date') {
          switch (filterModel[item].type) {
            case 'lessThanOrEqual':
              filteredList = filteredList.filter((cellValue: IInvoice) =>
                new Date(formatDate(get(cellValue, item))) <= new Date(filterModel[item].dateFrom)
              )
              break
            case 'greaterThanOrEqual':
              filteredList = filteredList.filter((cellValue: IInvoice) =>
                new Date(formatDate(get(cellValue, item))) >= new Date(filterModel[item].dateFrom)
              )
              break
          }
        } else {
          value = filterModel[item].filter.toString().toLowerCase()
          filteredList = filteredList.filter((cellValue: IInvoice) =>
            get(cellValue, item)
              ? get(cellValue, item)
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase())
              : ''
          )
        }
      }
      return filteredList
    } catch (error) {
      console.log(error)
      return []
    }
  }

  costTypesFormatter (params: any) {
    if (this.costTypes && params.value) {
      return this.costTypes[params.value]
    } else {
      return '-'
    }
  }

  dateFormatter (params: any) {
    if (params.value) {
      return formatDate(Number(params.value))
    } else {
      return '-'
    }
  }

  currencyFormatter (params: any) {
    if (this.accountSettings && params.value) {
      return formatCurrency(
        this.accountSettings?.currency?.currencySymbol,
        params.value
      )
    } else {
      return '-'
    }
  }
}
</script>
