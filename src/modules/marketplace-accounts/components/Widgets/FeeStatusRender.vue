<template>
  <span
    v-if="params.value"
    class="text-capitalize"
  >
    {{ params.value.replace(/_/g, ' ').toLowerCase() }}
  </span>
  <span
    v-else
    v-text="'-'"
  />
</template>

<script>
import { Vue } from 'vue-property-decorator'

export default Vue.extend({
  name: 'FeeStatusRender'
})
</script>
