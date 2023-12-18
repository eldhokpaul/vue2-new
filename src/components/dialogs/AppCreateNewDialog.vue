<template>
  <v-dialog
    v-model="shouldShow"
    max-width="740px"
  >
    <v-card>
      <v-toolbar
        flat
      >
        <v-btn
          icon
          color="primary"
          @click="shouldShow = false"
        >
          <v-icon>mdi-close </v-icon>
        </v-btn>
        <v-card-title v-t="'components.appCreateNewDialog.addNew?'" />
      </v-toolbar>
      <v-container fluid>
        <v-row>
          <v-col
            v-for="item in items"
            :key="item.name"
            :cols="isAdmin ? '3' : '4'"
          >
            <v-card
              outlined
              height="150px"
              class="d-flex flex-column justify-center align-center"
              @click="handleRouteChange(item.name)"
            >
              <v-icon
                color="primary"
              >
                {{ item.icon }}
              </v-icon>

              <span
                color="primary"
                class="subtitle"
                v-text="item.title"
              />
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

const namespaces = {
  user: 'user'
}

@Component
export default class AppCreateNewDialog extends Vue {
   @Prop()
   show!: boolean

  @Getter('isAdmin', { namespace: namespaces.user }) isAdmin!: boolean

  get shouldShow () {
    return this.show
  }

  set shouldShow (val: boolean) {
    this.$emit('set-show', val)
  }

  handleRouteChange (name: string) {
    this.$emit('set-show', false)
    this.$router.push({
      name
    })
  }

  get items () {
    return [
      {
        title: 'Contacts',
        name: 'addSupplier',
        icon: 'mdi-card-account-mail'
      },
      {
        title: 'Products',
        name: 'addProduct',
        icon: 'mdi-tag-multiple'
      },
      {
        title: 'Invoices',
        name: 'addInvoice',
        icon: 'mdi-receipt'
      },
      this.isAdmin
        ? {
            title: 'Users',
            name: 'users',
            icon: 'mdi-account-multiple'
          }
        : null,
      this.isAdmin
        ? {
            title: 'Integrations',
            name: 'integrations',
            icon: 'mdi-power-plug'
          }
        : null
    ].filter(Boolean)
  }
}
</script>
