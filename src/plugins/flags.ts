import type { VueConstructor } from 'vue'

import flags from '@/utils/flags'

export default {
  install (vue: VueConstructor) {
    vue.prototype.$flags = flags
  }
}
