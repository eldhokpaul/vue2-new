<template>
  <div v-if="!params.value">
    <v-icon
      color="green"
    >
      mdi-check
    </v-icon>
  </div>
  <div v-else>
    <v-icon
      color="red"
    >
      mdi-alert
    </v-icon>
    <span class="fee-change">{{
      $t("components.amazonProductsTable.feeChange")
    }}</span>
  </div>
</template>

<script>
import { Vue } from 'vue-property-decorator'

export default Vue.extend({
  name: 'FeeTracker'
})
</script>
<style lang="scss" scoped>
  .fee-change {
    font-size: 0.75rem !important;
  }
</style>
