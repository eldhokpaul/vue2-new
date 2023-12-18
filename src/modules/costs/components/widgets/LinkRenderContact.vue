<template>
  <span
    v-if="params.value"
  >

    <router-link
      v-if="params.field3"
      class="text-decoration-none"
      :to="{ name: params.name, params: { [params.id]: params.data[params.field1][params.field2][params.field3][params.id], goBack: params.goBack }}"
    >
      {{ params.value }}
    </router-link>
    <router-link
      v-else
      class="text-decoration-none"
      :to="{ name: params.name, params: { [params.id]: params.data[params.field1][params.field2][params.id], goBack: params.goBack, preselectedTab:params.tab }}"
    >
      {{ params.value }}
    </router-link>
  </span>
  <span
    v-else
    v-text="'-'"
  />
</template>

<script>
import { Vue } from 'vue-property-decorator'
export default Vue.extend({
  name: 'LinkRenderContact',
  methods: {
    // Write your function here
  }
})
</script>
