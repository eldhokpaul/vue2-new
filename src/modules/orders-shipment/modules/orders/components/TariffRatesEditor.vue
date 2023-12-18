<template>
  <v-container fluid>
    <v-card outlined>
      <div class="ma-3">
        <v-chip
          v-for="(tag, index) in tariffRates"
          :key="index"
          close
          outlined
          color="primary"
          class="mb-3 mr-1"
          @click:close="removeTariffRate(index)"
        >
          {{ tag }}
        </v-chip>
        <v-text-field
          v-if="tariffRates.length < 5"
          v-model="tariffRate"
          label="Duties and Tariffs"
          dense
          :rules="rules.tariffRule"
          outlined
          append-icon="mdi-plus"
          @keydown="handleKeyDown"
          @click:append="addTariffRate"
        />
      </div>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { ICellEditor, ICellEditorParams } from 'ag-grid-enterprise'
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class TariffRatesEditor extends Vue implements ICellEditor {
  params!: ICellEditorParams
  tariffRate = '';
  tariffRates: string[] = [];

  rules = {
    tariffRule: [
      (v: string) => !v || /^\d+(\.?\d+)?%?$/.test(v) || 'Input must be valid'
    ]
  }

  beforeMount () {
    if (this.params.value) {
      this.tariffRates = this.params.value.split(', ')
    }
  }

  getValue () {
    return this.tariffRates.join(', ')
  }

  isPopup () {
    return true
  }

  handleKeyDown (event: any) {
    if (this.tariffRate) {
      if (event.key === 'Enter' || event.code === 'Enter') {
        event.stopPropagation()
        this.addTariffRate()
      }
    }
  }

  addTariffRate () {
    const regExp = /^\d+(\.?\d+)?%?$/
    if (this.tariffRate && regExp.test(this.tariffRate) && this.tariffRates.length < 5) {
      this.tariffRates.push(this.tariffRate)
      this.tariffRate = ''
    }
  }

  removeTariffRate (index: number) {
    this.tariffRates.splice(index, 1)
  }
}
</script>
