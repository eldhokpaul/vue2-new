<template>
  <section>
    <template v-for="(input, key) in formInputs">
      <form-field
        :key="key"
        :class="input.class"
        :form-input="input"
        :data="data"
      />
    </template>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import FormField from './FormField.vue'

@Component({
  components: {
    FormField
  }
})
export default class FormBuilder extends Vue {
    @Prop({ required: true })
    formInputs: any

    @Prop({ required: true })
    data: any
}
</script>
