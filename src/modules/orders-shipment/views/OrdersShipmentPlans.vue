<template>
  <v-container
    fluid
  >
    <!-- <page-header :title="'Transactions'" /> -->
    <v-row>
      <v-col>
        <v-card
          outlined
          height="88vh"
        >
          <v-tabs>
            <v-tab
              v-t="'pages.orders.orders'"
              exact
              :to="{name: 'orders'}"
            />
            <v-tab
              v-t="'pages.orders.shipmentPlans'"
              exact
              :to="{name: 'shipmentPlans'}"
            />
          </v-tabs>
          <v-divider />
          <router-view />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

// import PageHeader from '@/components/PageHeader.vue'

@Component({
  components: {
    // PageHeader
  }
})
export default class OrdersShipmentPlans extends Vue {
}
</script>
