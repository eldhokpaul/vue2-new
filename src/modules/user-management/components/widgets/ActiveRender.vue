<template>
  <span v-if="params.value">
    <app-chip
      :type="'product'"
      :item="{ status: 'Active' }"
    />
  </span>
  <span v-else>
    <app-chip
      :type="'product'"
      :item="{ status: 'Inactive' }"
    />
  </span>
</template>

<script>
import { Vue } from 'vue-property-decorator'

import AppChip from '@/components/AppChip.vue'

export default Vue.extend({
  name: 'ActiveRender',
  components: {
    AppChip
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  mounted () {},
  methods: {
    // Write your function here
  }
})
</script>
