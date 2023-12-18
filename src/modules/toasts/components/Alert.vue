<template>
  <v-snackbar
    v-model="show[toast.type]"
    color="green"
    app
    bottom
    right
    :timeout="timeout"
  >
    {{ toast.text }}
  </v-snackbar>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import type { ObjectKeyAsAny } from '@/types/app'

import type { IToast } from '../types'

@Component
export default class Alert extends Vue {
  @Prop() readonly toast!: IToast
  @Prop() readonly show!: ObjectKeyAsAny
  @Prop() readonly timeout!: number
}
</script>
