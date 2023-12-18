<template>
  <span
    v-if="!params.value || params.value==='PAY' || params.value==='OVERDUE'"
  >
    <v-tooltip
      top
    >
      <template #activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          class="ma-2 text-capitalize white--text"
          depressed
          small
          :color="getStatusColor(params.value)"
          elevation="2"
          v-on="on"
          @click="payClick('pay')"
        >
          {{ params.value }}
        </v-btn>
      </template>

      <span>{{ $t('components.PayablesTable.page.updatePayment') }}</span>
    </v-tooltip>
  </span>
  <span
    v-else-if="params.value==='PAID'"
  >
    <v-tooltip
      top
    >
      <template #activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          class="ma-2 text-capitalize white--text"
          depressed
          small
          :color="getStatusColor(params.value)"
          elevation="2"
          v-on="on"
          @click="payClick('undo')"
        >
          {{ params.value }}
        </v-btn>
      </template>

      <span>{{ $t('components.PayablesTable.page.undoPayment') }}</span>
    </v-tooltip>
  </span>
  <span
    v-else-if="params.value"
  >
    <v-btn
      class="ma-2 text-capitalize white--text"
      depressed
      small
      elevation="2"
      :color="getStatusColor(params.value)"
    >
      {{ params.value }}
    </v-btn>
  </span>
</template>

<script>
import { Vue } from 'vue-property-decorator'

export default Vue.extend({
  name: 'PayButton',
  methods: {
    payClick (action) {
      this.params.context.componentParent.updatePaymentStatus(this.params.data.id, action)
    },
    getStatusColor (status) {
      const state = status.toLowerCase()
      if (state === 'paid') return 'green'
      else if (state === 'pay') return 'blue'
      else if (state === 'pending') return 'orange'
      else if (state === 'overdue') return 'error'
    }
  }
})
</script>
