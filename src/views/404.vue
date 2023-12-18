<template>
  <v-container
    class="text-center"
    fill-height
  >
    <v-row align="center">
      <v-col>
        <h1
          class="display-4 primary--text"
          v-text="'404'"
        />

        <p v-t="'pages.errors.404.description'" />

        <v-btn
          v-t="'pages.errors.404.takeMeBack'"
          :to="{
            name: isManagementSectionEnabled?'dashboard':'feeTrackerPro'
          }"
          color="primary"
          depressed
          exact
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
const namespaces = {
  accountSettings: 'accountSettings'
}
@Component
export default class ClientError extends Vue {
@Getter('isManagementSectionEnabled', { namespace: namespaces.accountSettings }) isManagementSectionEnabled!: boolean
}
</script>
