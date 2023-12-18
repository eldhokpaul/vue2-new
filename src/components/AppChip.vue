<template>
  <v-chip
    v-if="item.status"
    :color="getStatusColor(item.status)"
    small
    :text-color="getStatusColor(item.status) !=='default' ? 'white' : 'black'"
    class="text-capitalize font-weight-bold"
  >
    {{ item.status.replace(/_/g, ' ').toLowerCase() }}
  </v-chip>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class AppChip extends Vue {
  @Prop()
  readonly item!: any

  @Prop()
  readonly type!: string

  getStatusColor (status: string) {
    const state = status.toLowerCase()
    if (this.type === 'invoice') {
      if (state === 'pending' || state === 'open' || state === 'review') return 'error'
      else if (state === 'paid' || state === 'working') return 'orange'
      else if (state === 'closed') return 'grey'
    } else if (this.type === 'product') {
      if (state === 'discontinued' || state === 'inactive') return 'grey'
      else if (state === 'active' || state === 'no_change' || state === 'accepted') return 'green'
      else if (state === 'under_review' || state === 'closed_listing' || state === 'top_seller') return 'blue'
      else if (state === 'in_review' || state === 'new_change') return 'error'
    } else if (this.type === 'costs') {
      if (state === 'discontinued' || state === 'inactive') return 'grey'
      else if (state === 'paid') return 'green'
      else if (state === 'pay') return 'blue'
      else if (state === 'pending') return 'orange'
      else if (state === 'overdue') return 'error'
    } else if (this.type === 'shipment') {
      if (state === 'open') return 'error'
      else if (state === 'in_transit') return 'blue'
      else if (state === 'received') return 'orange'
      else if (state === 'closed') return 'green'
      else if (state === 'in_shipment_planning') return 'teal'
      else if (state === 'archived') return 'grey'
    }
  }
}
</script>
