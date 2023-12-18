<template>
  <div>
    <v-skeleton-loader
      v-if="isLoading"
      type="table"
    />
    <v-simple-table
      v-if="!isLoading"
      height="490px"
    >
      <template #default>
        <thead>
          <th class="text-left">
            Summary Report(USD)
          </th>
        </thead>
        <tbody>
          <tr>
            <td>Order Transactions</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.total) }}</td>
            <td />
            <td />
            <td />
          </tr>
          <tr>
            <td>Refund Transactions</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.refund.total) }}</td>
            <td />
            <td />
            <td />
          </tr>
          <tr>
            <td>Adjustment Transactions</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.adjustment.total) }}</td>
            <td />
            <td />
            <td />
          </tr>
          <tr>
            <td>Amazon Selling Expenses</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.fees.summary.total) }}</td>
            <td />
            <td />
            <td />
          </tr>
          <tr style="background:#C2D3E4">
            <th>Subtotal Account Profit & Loss</th>
            <th>{{ formatCurrency(currencySymbol,reportsummary.subtotal_p_and_l) }}</th>
            <td />
            <td />
            <td />
          </tr>
          <tr>
            <td>Advertising Expenses</td>
            <td>{{ formatCurrency(currencySymbol,0) }}</td>
            <td />
            <td />
            <td />
          </tr>
          <tr>
            <td>Cost of Goods Sold Expenses</td>
            <td>{{ formatCurrency(currencySymbol,0) }}</td>
            <td />
            <td />
            <td />
          </tr>
          <tr style="background:#C2D3E4">
            <th>Total Account Profit & Loss</th>
            <th>{{ formatCurrency(currencySymbol,reportsummary.total_p_and_l) }}</th>
            <td />
            <td />
            <td />
          </tr>

          <th class="text-left">
            Transaction Report(USD)
          </th>

          <tr>
            <th>orders</th>
            <th
              v-for="(value, key) in reportsummary.type_summaries"
              :key="key"
              class="text-left"
            >
              {{ key }}
            </th>
          </tr>
          <tr>
            <td>{{ Object.keys(reportsummary.type_summaries.order)[0] }} sold</td>
            <td>{{ reportsummary.type_summaries.order.quantity }}</td>
            <td>{{ reportsummary.type_summaries.refund.quantity }}</td>
            <td>{{ reportsummary.type_summaries.adjustment.quantity }}</td>
            <td>{{ reportsummary['net_qty_sold'] }}</td>
          </tr>
          <tr>
            <th>transactions</th>
            <th
              v-for="(value2, key2) in reportsummary.type_summaries"
              :key="key2"
              class="text-left"
            >
              {{ key2 }}
            </th>
          </tr>
          <tr>
            <td>{{ Object.keys(reportsummary.type_summaries.order)[1] }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.product_sales) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.refund.product_sales) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.adjustment.product_sales) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.total.product_sales) }}</td>
          </tr>
          <tr>
            <td>{{ Object.keys(reportsummary.type_summaries.order)[2] }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.shipping_credits) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.refund.shipping_credits) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.adjustment.shipping_credits) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.total.shipping_credits) }}</td>
          </tr>
          <tr>
            <td>{{ Object.keys(reportsummary.type_summaries.order)[3] }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.gift_wrap_credits) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.refund.gift_wrap_credits) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.adjustment.gift_wrap_credits) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.total.gift_wrap_credits) }}</td>
          </tr>
          <tr>
            <td>{{ Object.keys(reportsummary.type_summaries.order)[4] }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.promotional_rebates) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.refund.promotional_rebates) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.adjustment.promotional_rebates) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.total.promotional_rebates) }}</td>
          </tr>
          <tr>
            <td>{{ Object.keys(reportsummary.type_summaries.order)[5] }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.sales_tax_collected) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.refund.sales_tax_collected) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.adjustment.sales_tax_collected) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.total.sales_tax_collected) }}</td>
          </tr>
          <tr>
            <td>{{ Object.keys(reportsummary.type_summaries.order)[6] }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.marketplace_facilitator_tax) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.refund.marketplace_facilitator_tax) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.adjustment.marketplace_facilitator_tax) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.total.marketplace_facilitator_tax) }}</td>
          </tr>
          <tr>
            <td>{{ Object.keys(reportsummary.type_summaries.order)[7] }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.selling_fees) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.refund.selling_fees) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.adjustment.selling_fees) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.total.selling_fees) }}</td>
          </tr>
          <tr>
            <td>{{ Object.keys(reportsummary.type_summaries.order)[8] }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.fba_fees) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.refund.fba_fees) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.adjustment.fba_fees) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.total.fba_fees) }}</td>
          </tr>
          <tr>
            <td>{{ Object.keys(reportsummary.type_summaries.order)[9] }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.other_transaction_fees) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.refund.other_transaction_fees) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.adjustment.other_transaction_fees) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.total.other_transaction_fees) }}</td>
          </tr>
          <tr>
            <td>{{ Object.keys(reportsummary.type_summaries.order)[10] }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.other) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.refund.other) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.adjustment.other) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.total.other) }}</td>
          </tr>
          <tr style="background:#C2D3E4">
            <th>Subtotal Transactions</th>
            <th>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.total) }}</th>
            <th>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.refund.total) }}</th>
            <th>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.adjustment.total) }}</th>
            <th>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.total.total) }}</th>
          </tr>
          <tr width="auto">
            <th class="text-left">
              Other Amazon Expenses
            </th>
            <td />
            <td />
            <td />
            <td />
          </tr>

          <tr
            v-for="(value, key) in reportsummary.fees.summary"
            :key="key"
          >
            <td>{{ key }}</td>
            <td>{{ formatCurrency(currencySymbol,0) }}</td>
            <td>{{ formatCurrency(currencySymbol,0) }}</td>
            <td>{{ formatCurrency(currencySymbol,0) }}</td>
            <td>{{ formatCurrency(currencySymbol, value ) }}</td>
          </tr>
          <tr>
            <th>Advertising & COGS Expenses</th>
            <td />
            <td />
            <td />
            <td />
          </tr>
          <tr>
            <td>Advertising Expenses</td>
            <td>{{ formatCurrency(currencySymbol,0) }}</td>
            <td>{{ formatCurrency(currencySymbol,0) }}</td>
            <td>{{ formatCurrency(currencySymbol,0) }}</td>
            <td>{{ formatCurrency(currencySymbol,0) }}</td>
          </tr>
          <tr>
            <td>Cost of Goods Sold (*Exchange Rate Factored In)</td>
            <td>{{ formatCurrency(currencySymbol,0) }}</td>
            <td>{{ formatCurrency(currencySymbol,0) }}</td>
            <td>{{ formatCurrency(currencySymbol,0) }}</td>
            <td>{{ formatCurrency(currencySymbol,0) }}</td>
          </tr>
          <tr style="background:#C2D3E4">
            <th>Subtotal Advertising & COGS</th>
            <th>{{ formatCurrency(currencySymbol,0) }}</th>
            <th>{{ formatCurrency(currencySymbol,0) }}</th>
            <th>{{ formatCurrency(currencySymbol,0) }}</th>
            <th>{{ formatCurrency(currencySymbol,0) }}</th>
          </tr>
          <tr>
            <th>Gross Payment Receipts</th>
            <td />
            <td />
            <td />
            <td />
          </tr>
          <tr>
            <td>Cost of Advertising</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.other) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.other) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.other) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.cost_of_advertising.total) }}</td>
          </tr>
          <tr>
            <td>Payments/Transfers</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.other) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.other) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.other) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.total_transfers) }}</td>
          </tr>
          <tr>
            <td>Amazon Lending</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.other) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.other) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.type_summaries.order.other) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.amazon_lending.total) }}</td>
          </tr>
          <tr>
            <th>Subtotal Gross Payment Receipts</th>
            <td>{{ formatCurrency(currencySymbol,0) }}</td>
            <td>{{ formatCurrency(currencySymbol,0) }}</td>
            <td>{{ formatCurrency(currencySymbol,0) }}</td>
            <td>{{ formatCurrency(currencySymbol,reportsummary.subtotal_gross_payment_receipts) }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import { formatCurrency } from '@/utils/currency'
const namespaces = {
  accountSettings: 'accountSettings'
}
@Component
export default class SimpleTable extends Vue {
  @Getter('currencySymbol', { namespace: namespaces.accountSettings }) currencySymbol!: string
  @Prop({ required: true }) reportsummary!: any;
  isLoading = true
  formatCurrency = formatCurrency;
  @Watch('reportsummary', { immediate: true })
  onReportSummaryChange (newValue: any) {
    if (newValue) {
      this.isLoading = false
    }
  }
}
</script>
