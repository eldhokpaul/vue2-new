
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

import { getUniqueId } from '@/utils/uuid'

import type { IToast } from './types'

@Module({
  namespaced: true
})

export class ToastModule extends VuexModule {
  content: IToast[] | null = null

  @Mutation
  setContent (toasts: IToast[] | null) {
    this.content = toasts
  }

  @Action({ rawError: true })
  async deleteToast (id: string): Promise<void> {
    if (!this.content) return
    const targetToasts = this.content.filter(toast => toast.id !== id)
    this.context.commit('setContent', targetToasts)
  }

  @Action({ rawError: true })
  async clearToasts (): Promise<void> {
    this.context.commit('setContent', null)
  }

  @Action({ rawError: true })
  async addSuccess (text: string): Promise<void> {
    const toast: IToast = { id: getUniqueId(), text, type: 'SUCCESS' }
    const toasts: IToast[] = this.content ? [...this.content, toast] : [toast]

    this.context.commit('setContent', toasts)
  }

  @Action({ rawError: true })
  async addInfo (text: string): Promise<void> {
    const toast: IToast = { id: getUniqueId(), text, type: 'INFO' }
    const toasts: IToast[] = this.content ? [...this.content, toast] : [toast]

    this.context.commit('setContent', toasts)
  }

  @Action({ rawError: true })
  async addError (text: string): Promise<void> {
    const toast: IToast = { id: getUniqueId(), text, type: 'ERROR' }
    const toasts: IToast[] = this.content ? [...this.content, toast] : [toast]

    this.context.commit('setContent', toasts)
  }

  @Action({ rawError: true })
  async showAlert (text: string): Promise<void> {
    const toast: IToast = { id: getUniqueId(), text, type: 'ALERT' }
    const toasts: IToast[] = this.content ? [...this.content, toast] : [toast]

    this.context.commit('setContent', toasts)
  }
}
