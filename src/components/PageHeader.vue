<template>
  <v-app-bar
    class="page-heading pa-0 text-no-wrap"
    color="background"
    elevate-on-scroll
  >
    <v-col class="ma-0 pa-0">
      <div class="d-flex flex-row justify-space-between align-center">
        <slot name="back" />
        <div class="page-heading_title-container align-center d-flex flex-grow-1">
          <h1 v-text="title" />
          <slot name="search" />
          <slot name="controls" />
        </div>
        <div
          class="d-flex"
        >
          <slot name="buttons" />
        </div>
      </div>
    </v-col>
  </v-app-bar>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component({
  name: 'PageHeading'
})
export default class PageHeading extends Vue {
  @State('darkMode', { namespace: 'app' }) darkMode?: boolean
  @Prop({ required: true })
  readonly title!: string
}
</script>

<style lang="scss" scoped>
.page-heading {
  top: 48px;
  position: sticky;
  z-index: 3;
  transition: background-color 0s;
  flex: 0;

  h1 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &_title-container {
    // Needs this for text overflow to functio
    // See: https://css-tricks.com/flexbox-truncated-text/
    min-width: 0;
  }

  &.v-app-bar--is-scrolled {
    box-shadow: none !important;

    &::after {
      content: ' ';
      width: calc(100% + 50px);
      display: block;
      height: 1px;
      position: absolute;
      left: -25px;
      background-color: map-get($material-light, 'dividers');
    }

    &.theme--dark {
      &::after {
        content: ' ';
        width: calc(100% + 50px);
        display: block;
        height: 1px;
        position: absolute;
        left: -25px;
        background-color: map-get($material-dark, 'dividers');
      }
    }
  }
}
</style>
