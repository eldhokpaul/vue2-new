<template>
  <span>
    <v-container
      fluid
    >
      <v-checkbox
        v-model="params.data.isExcludedFromProductCostsData"
        :disabled="params.data.isBundle"
        :readonly="params.context.componentParent.isViewer"
        class=" my-n2"
        @change="invokeParentMethod()"
      />
    </v-container>
  </span>
</template>
<script>
import { Vue } from 'vue-property-decorator'

export default Vue.extend({
  name: 'CheckboxRenderProduct',
  methods: {
    invokeParentMethod () {
      this.params.context.componentParent.costExclude(this.params.data)
    }
  }
})
</script>
