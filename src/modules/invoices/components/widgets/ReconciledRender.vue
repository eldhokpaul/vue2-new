<template>
  <span>
    <input
      v-model="params.value"
      style="width: 1rem;height: 1rem;"
      type="checkbox"
      disabled
    >
  </span>
</template>
<script>
import { Vue } from 'vue-property-decorator'

export default Vue.extend({
  name: 'ReconciledRender',
  methods: {
  }
})
</script>
