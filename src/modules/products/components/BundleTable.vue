<template>
  <section>
    <template v-if="!loading">
      <v-checkbox
        v-model="product.isBundle"
        :readonly="isViewer"
        :label="`This product is made up of existing products`"
        @change="$emit('bundle-change')"
      />
      <template v-if="product.isBundle">
        <editable-table
          v-model="product.products"
          :max-items="10"
          :headers="headers"
        />
        <v-divider />
      </template>
    </template>
    <template v-else>
      <v-skeleton-loader type="list-item" />
      <v-skeleton-loader type="list-item" />
      <v-skeleton-loader type="table" />
    </template>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import EditableTable from '@/components/EditableTable.vue'

import type { IProduct } from '../types'

@Component({
  components: {
    EditableTable
  }
})
export default class BundleTable extends Vue {
  @Prop({ required: true }) product!: IProduct
  @Prop({ required: false, default: false }) loading!: any
  @Prop({ required: true }) products!: { id: number, label: string }[]
  @Prop({ default: true }) readonly isViewer!: boolean

  get headers () {
    return [
      {
        text: 'Product',
        value: 'id',
        field: {
          model: 'id',
          type: 'select',
          props: {
            // label: 'Product',
            'hide-details': true,
            items: this.products.map((p) => ({
              label: p.label,
              value: p.id
            }))
          }
        }
      }
    ]
  }
}
</script>
