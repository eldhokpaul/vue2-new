<template>
  <div
    v-if="initialLoadTask.isActive"
    class="app-integration-wrapper"
  >
    <slot name="loading" />
  </div>
  <div v-else-if="!initialLoadTask.isActive && userIntegrationData.length">
    <slot :integration-data="userIntegrationData" />
  </div>
  <div
    v-else-if="!initialLoadTask.isActive && !userIntegrationData.length"
  >
    <slot name="no-data" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import { Task } from '@/decorators/task'
const namespace = 'integrations'
@Component
export default class AppIntegrationWrapper extends Vue {
  @Action('getUserXeroIntegrationDetails', { namespace }) getUserXeroIntegrationDetails!: () => Promise<any>
  @State('userXeroIntegrationDetails', { namespace }) userXeroIntegrationDetails!: any[]
  @Prop({
    required: true
  })
  readonly integrationId!: 'xero'

  error: Error | null = null

  get userIntegrationData () {
    switch (this.integrationId) {
      case 'xero':
        return this.userXeroIntegrationDetails || []
    }
  }

  beforeMount () {
    this.initialLoad()
  }

  @Task('initialLoadTask')
  async initialLoad () {
    switch (this.integrationId) {
      case 'xero':
        await this.getUserXeroIntegrationDetails()
    }
  }
}
</script>
