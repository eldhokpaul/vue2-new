<template>
  <span
    v-if="params.value"
  >
    <v-tooltip
      top
    >
      <template #activator="{ on, attrs }">
        <v-btn
          x-small
          fab
          v-bind="attrs"
          elevation="2"
          color="grey"
          class="white--text"
          :loading="loading"
          :disabled="loading"
          v-on="on"
          @click="download"
        >
          <v-icon dark>
            mdi-arrow-down-bold-box-outline
          </v-icon>
        </v-btn>
      </template>

      <span>{{ $t('components.PayablesTable.page.downloadInvoice') }}</span>
    </v-tooltip>
  </span>
  <span
    v-else
  >
    <v-btn
      x-small
      fab
      elevation="2"
      color="grey"
      class="white--text mt-1"
      disabled
    >
      <v-icon dark>
        mdi-arrow-down-bold-box-outline
      </v-icon>
    </v-btn>
  </span>
</template>

<script>
import { Vue } from 'vue-property-decorator'
export default Vue.extend({
  name: 'DownloadInvoice',
  data () {
    return {
      loading: false
    }
  },
  methods: {
    async download () {
      this.loading = true
      const FILE = await this.params.context.componentParent.getDocumentById(this.params.value)
      if (!FILE) {
        setTimeout(() => {
          this.loading = false
        }, 500)
        return
      }
      const downUrl = document.createElement('a')
      downUrl.href = FILE
      downUrl.setAttribute('download', `invoice_${this.params.value}.pdf`)
      document.body.appendChild(downUrl)
      downUrl.click()
      this.loading = false
    }
  }
})
</script>
