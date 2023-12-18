import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

@Component
export class SellervueConfirmationDialog extends Vue {
  @Prop({ default: 'pages.invoices.actions.success' })
  title!: string

  @Prop({ default: 'pages.invoice.actions.continueEditingDescription' })
  details!: string

  @Prop({ default: 'pages.invoice.actions.close' })
  closeAndNavigate!: string

  @Prop({ default: 'pages.invoice.actions.continueEditing' })
  continueEditing!: string

  @Prop() routeName!: string
  @Prop() routeBack?: string
  @Prop() shouldShow!: boolean

  onOkClick () {
    this.$emit('update:close')
    if (!this.routeName) return
    let params = {}
    if (this.routeBack) params = { routeBack: this.routeBack }
    this.$router.push({
      name: this.routeName,
      params
    })
  }
}
