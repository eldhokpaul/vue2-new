<template>
  <span>
    <v-container
      fluid
    >
      <v-checkbox
        v-model="params.data.isExcludedFromGeneralCostsData"
        class=" my-n2"
        :disabled="params.context.componentParent.isViewer"
        @change="invokeParentMethod()"
      />
    </v-container>
  </span>
</template>
<script>
import { Vue } from 'vue-property-decorator'

export default Vue.extend({
  name: 'CheckboxRenderCost',
  methods: {
    invokeParentMethod () {
      this.params.context.componentParent.costExclude(this.params.data)
    }
  }
})
</script>
