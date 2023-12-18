<template>
  <v-container fluid>
    <v-card outlined>
      <div class="ma-3">
        <v-chip
          v-for="(tag, index) in hsCodes"
          :key="index"
          class="mb-3 mr-1"
          outlined
          color="primary"
          close
          @click:close="removeHsCode(index)"
        >
          {{ tag }}
        </v-chip>
        <v-text-field
          v-if="hsCodes.length < 5"
          v-model="hsCode"
          label="HS Codes"
          outlined
          dense
          append-icon="mdi-plus"
          @keydown="handleKeyDown"
          @click:append="addHsCode"
        />
      </div>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { ICellEditor, ICellEditorParams } from 'ag-grid-enterprise'
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class HsCodeEditor extends Vue implements ICellEditor {
  params!: ICellEditorParams
  hsCode = '';
  hsCodes: string[] = [];
  beforeMount () {
    if (this.params.value) {
      this.hsCodes = this.params.value.split(', ')
    }
  }

  getValue () {
    return this.hsCodes.join(', ')
  }

  isPopup () {
    return true
  }

  handleKeyDown (event: any) {
    if (this.hsCode) {
      if (event.key === 'Enter' || event.code === 'Enter') {
        event.stopPropagation()
        this.addHsCode()
      }
    }
  }

  addHsCode () {
    if (this.hsCode && this.hsCodes.length < 5) {
      this.hsCodes.push(this.hsCode)
      this.hsCode = ''
    }
  }

  removeHsCode (index: number) {
    this.hsCodes.splice(index, 1)
  }
}
</script>
