<template v-if="toasts">
  <div>
    <template v-for="(toast, index) in toasts">
      <template v-if="toast.type">
        <error
          v-if="toast.type === 'ERROR'"
          :key="index"
          :toast="toast"
          :show="show"
          :timeout="timeout"
          :multi-line="multiLine"
        />

        <success
          v-if="toast.type === 'SUCCESS'"
          :key="index"
          :toast="toast"
          :show="show"
          :timeout="timeout"
          :multi-line="multiLine"
        />

        <info
          v-if="toast.type === 'INFO'"
          :key="index"
          :toast="toast"
          :show="show"
          :timeout="timeout"
          :multi-line="multiLine"
        />

        <alert
          v-if="toast.type === 'ALERT'"
          :key="index"
          :toast="toast"
          :show="show"
          :timeout="timeout"
        />
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import Alert from '@/modules/toasts/components/Alert.vue'
import Error from '@/modules/toasts/components/Error.vue'
import Info from '@/modules/toasts/components/Info.vue'
import Success from '@/modules/toasts/components/Success.vue'
import { IToast } from '@/modules/toasts/types'
import type { ObjectKeyAsAny } from '@/types/app'

const namespace = 'toasts'
@Component({
  components: { Success, Error, Info, Alert }
})
export default class ToastPopup extends Vue {
  @State('content', { namespace }) toasts?: IToast[] | null
  @Action('deleteToast', { namespace }) deleteToast!: (id: string) => Promise<any>

  @Prop({ default: false })
  readonly isSnackbar!: boolean

  @Prop({ required: false, default: false })
  readonly multiLine!: boolean

  @Prop({ required: false, default: 2500 })
  readonly timeout!: number

  show = {
    SUCCESS: false,
    ERROR: false,
    INFO: false,
    ALERT: false
  }

  async removeFromStore () {
    if (!this.toasts || !this.toasts.length) return

    const lastToast = this.toasts[this.toasts.length - 1]
    if (!lastToast || this.show[lastToast.type]) return

    await this.deleteToast(lastToast.id as string)
    // show toasts that were hidden or overlapped
    if (this.toasts.length) this.toasts.forEach(toast => this.showHiddenToast(toast.type))
  }

  showHiddenToast (type: string) {
    setTimeout(() => {
      (this.show as ObjectKeyAsAny)[type] = true
    }, 750)
  }

  @Watch('show', { deep: true })
  async onShowChange (val: { SUCCESS: boolean, ERROR: boolean, INFO: boolean, ALERT: boolean }) {
    if (!val.SUCCESS || !val.ERROR || !val.INFO || !val.ALERT) await this.removeFromStore()
  }

  @Watch('toasts')
  onToastsAdd (toasts: IToast[]) {
    if (toasts && toasts.length) {
      toasts.forEach(toast => {
        this.show[toast.type] = true
      })
    }
  }
}
</script>
