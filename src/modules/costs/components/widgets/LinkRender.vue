<template>
  <span
    v-if="params.value"
  >
    <router-link
      class="text-decoration-none"
      :to="{ name: params.name, params: { [params.id]: params.data[params.field][params.id], goBack: params.goBack, preselectedTab:params.tab}}"
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
  name: 'LinkRender',
  methods: {
    // Write your function here
  }
})
</script>
