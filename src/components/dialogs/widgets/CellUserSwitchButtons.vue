<template>
  <span>
    <span v-if="!params.data.isCurrent">
      <v-btn
        class="ma-2"
        outlined
        x-small
        color="primary"
        @click="editClick(params.data)"
      >
        <v-icon
          x-small
          style="margin-right: 5px"
        >mdi-account-convert</v-icon>
        Switch
      </v-btn>
    </span>
    <span v-else>
      <v-btn
        class="ma-2"
        outlined
        x-small
        color="green"
        depressed
      >
        <v-icon
          x-small
          style="margin-right: 5px"
        >mdi-account</v-icon>
        Active
      </v-btn>
    </span>
  </span>
</template>

<script>
import { Vue } from 'vue-property-decorator'

export default Vue.extend({
  name: 'CellUserSwitchButtons',
  methods: {
    editClick (data) {
      this.params.self.switchUserFn(data)
    }
  }
})
</script>
