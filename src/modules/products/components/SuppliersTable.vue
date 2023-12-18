<template>
  <section>
    <v-divider />
    <template v-if="!loading">
      <editable-table
        v-model="product.productSuppliers"
        :max-items="10"
        :headers="headers"
      />
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
import type { ISupplier } from '@/modules/contacts/types'

import type { IProduct } from '../types'

@Component({
  components: {
    EditableTable
  }
})
export default class ProductSuppliersTable extends Vue {
  @Prop({ required: true })
  product!: IProduct

  @Prop({ required: false, default: false })
  loading!: any

  @Prop({ required: true })
  suppliers!: ISupplier[]

  @Prop({ default: true })
  readonly isViewer!: boolean

  get headers () {
    return [
      {
        text: 'Shipping Method',
        value: 'shippingMethod',
        field: {
          model: 'shippingMethod',
          type: 'select',
          props: {
            readonly: this.isViewer,
            'hide-details': true,
            items: [
              {
                label: this.$t('components.productSuppliersForm.options.AIR'),
                value: 'AIR'
              },
              {
                label: this.$t('components.productSuppliersForm.options.SEA'),
                value: 'SEA'
              },
              {
                label: this.$t('components.productSuppliersForm.options.LAND'),
                value: 'LAND'
              }
            ]
          }
        }
      },
      {
        text: 'Lead Time',
        value: 'leadTime',
        field: {
          model: 'leadTime',
          type: 'text',
          props: {
            readonly: this.isViewer,
            'hide-details': true,
            type: 'number',
            min: 0,
            step: 1
          }
        }
      },
      {
        text: 'Company Name',
        value: 'supplier.id',
        field: {
          model: 'supplier.id',
          type: 'select',
          props: {
            readonly: this.isViewer,
            'hide-details': true,
            items: this.suppliers.map((s) => ({
              label: s.companyName,
              value: s.id
            }))
          }
        }
      }
    ]
  }
}
</script>
