<template>
  <v-snackbar
    v-model="show[toast.type]"
    color="error"
    app
    bottom
    outlined
    :timeout="timeout"
    :multi-line="multiLine"
  >
    {{ toast.text }}
    <template #action="{ attrs }">
      <v-btn
        icon
        color="error"
        v-bind="attrs"
        @click="show[toast.type] = false"
      >
        <v-icon>
          mdi-close
        </v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import type { IToast } from '@/modules/toasts/types'
import type { ObjectKeyAsAny } from '@/types/app'

@Component
export default class ErrorToast extends Vue {
  @Prop() readonly toast!: IToast
  @Prop() readonly show!: ObjectKeyAsAny
  @Prop() readonly timeout!: number
  @Prop() readonly multiLine!: boolean
}
</script>
