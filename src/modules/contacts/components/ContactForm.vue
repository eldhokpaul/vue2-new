<template>
  <v-form
    ref="form"
    v-model="valid"
    :readonly="isViewer"
    @submit.prevent="validate"
  >
    <form-builder
      :data="supplier"
      :form-inputs="supplierFields"
    />
    <div class="d-flex justify-space-between align-center">
      <!-- Disabling Delete functionality for temp -->
      <!-- <div>
        <app-delete-dialog
          v-if="!newSupplier"
          v-show="!isViewer"
          :action-btn-text="'components.supplierForm.delete'"
          :confirm-text="'pages.suppliers.actions.confirmDeletion'"
          @confirm="$emit('delete')"
        />
      </div> -->
      <v-spacer />
      <div>
        <v-btn
          v-t="'components.supplierForm.cancel'"
          text
          :to="{
            name: 'suppliers'
          }"
          exact
          class="mr-2"
        />
        <v-btn
          v-show="!isViewer"
          v-t="'components.supplierForm.saveSupplier'"
          type="submit"
          color="primary"
          depressed
        />
      </div>
    </div>
  </v-form>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import AppDeleteDialog from '@/components/dialogs/AppDeleteDialog.vue'
import FormBuilder from '@/components/FormBuilder/FormBuilder.vue'

import type { ICountry, ISupplierFormData } from '../types'

const namespace = 'suppliers'
@Component({
  components: {
    AppDeleteDialog,
    FormBuilder
  }
})
export default class SupplierForm extends Vue {
  @Prop()
  supplier!: ISupplierFormData

  @Prop({ default: false })
  readonly newSupplier!: boolean

  @Prop()
  readonly id!: number

  @Prop({ default: true })
  readonly isViewer!: boolean

  @Action('getCountries', { namespace })
  getCountries!: any

  valid = false
  countries: ICountry[] | null = []

  rules = {
    required: [
      (v: string) => !!v || this.$t('pages.errors.rules.fieldRequired')
    ]
  }

  async mounted () {
    this.countries = await this.getCountries()
  }

  validate () {
    const { form } = this.$refs as HTMLFormElement
    form.validate()
    if (this.valid) {
      this.$emit('submit', this.supplier)
    }
  }

  get supplierFields () {
    return [
      // this.$flags.XERO_ENABLED ? {
      //   model: 'xeroId',
      //   type: 'text',
      //   props: {
      //     label: this.$t('components.suppliersTable.xeroId'),
      //     autofocus: true,
      //     required: false,
      //     disabled: true
      //   }
      // } : null,
      {
        model: 'companyName',
        type: 'text',
        props: {
          label: this.$t('components.suppliersTable.companyName'),
          autofocus: true,
          required: true,
          rules: this.rules.required
        }
      },
      {
        model: 'telephoneNumber',
        type: 'text',
        props: {
          label: this.$t('components.suppliersTable.telephoneNumber'),
          required: false,
          type: 'tel'
        }
      },
      {
        model: 'email',
        type: 'text',
        props: {
          label: this.$t('components.suppliersTable.headers.email'),
          required: false,
          type: 'email'
        }
      },
      {
        model: 'addressLine1',
        type: 'text',
        props: {
          label: this.$t('components.suppliersTable.addressLine1'),
          required: true,
          type: 'text'
        }
      },
      {
        model: 'addressLine2',
        type: 'text',
        props: {
          label: this.$t('components.suppliersTable.addressLine2'),
          required: true
        }
      },
      {
        model: 'addressLine3',
        type: 'text',
        props: {
          label: this.$t('components.suppliersTable.addressLine3'),
          required: true
        }
      },
      {
        model: 'city',
        type: 'text',
        props: {
          label: this.$t('components.suppliersTable.city'),
          required: false
        }
      },
      {
        model: 'zipOrPostCode',
        type: 'text',
        props: {
          label: this.$t('components.suppliersTable.zipOrPostCode'),
          required: false
        }
      },
      {
        model: 'stateOrProvince',
        type: 'text',
        props: {
          label: this.$t('components.suppliersTable.stateOrProvince'),
          required: false
        }
      },
      {
        model: 'country',
        type: 'select',
        props: {
          label: this.$t('components.suppliersTable.country'),
          required: true,
          rules: this.rules.required,
          items: this.countries?.map((c) => ({
            label: c.name,
            value: c.name
          }))
        }
      },
      {
        model: 'notes',
        type: 'textarea',
        props: {
          label: this.$t('components.suppliersTable.notes'),
          required: false
        }
      }
    ].filter(Boolean)
  }
}
</script>
