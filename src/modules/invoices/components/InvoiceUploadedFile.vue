<template>
  <iframe
    v-if="document!==''"
    :src="document"
    type="application/pdf"
    frameBorder="0"
    scrolling="auto"
    width="100%"
    height="100%"
    style="min-height: 500px; max-height: 100%;"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class InvoiceUploadedFile extends Vue {
  @Prop({ required: true })
  readonly document!: string
}
</script>
