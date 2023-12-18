<template>
  <v-card
    v-if="visible"
    outlined
  >
    <div class="d-flex flex-row justify-space-between align-start">
      <div>
        <v-card-title>
          {{ `Hello ${user.firstName}` }}
          <v-card-subtitle>
            {{ `Welcome to SellerVue - a new and better way for accurate, automated and trackable product costs. So that you can get to know your costs better, we suggest going through the steps below:` }}
          </v-card-subtitle>
        </v-card-title>
      </div>
      <div class="d-flex flex-row align-end">
        <v-btn
          color="primary"
          icon
          class="mt-2"
          @click="minimised = !minimised"
        >
          <v-icon>
            {{ minimised ? 'mdi-application' : 'mdi-minus' }}
          </v-icon>
        </v-btn>
        <v-btn
          color="primary"
          icon
          class="mt-2 mr-2"
          @click="visible = false"
        >
          <v-icon>
            mdi-close
          </v-icon>
        </v-btn>
      </div>
    </div>
    <v-divider />
    <v-btn
      v-if="minimised"
      block
      text
      color="primary"
      @click="minimised = !minimised"
    >
      {{ $t('pages.appOnboarding.onboardingSteps') }}
    </v-btn>
    <transition name="slide-y-transition">
      <v-stepper
        v-if="!minimised"
        v-model="step"
        vertical
        class="no-transition elevation-0"
      >
        <v-stepper-step
          complete
          editable
          edit-icon="mdi-account"
          step="1"
        >
          {{ $t('pages.appOnboarding.profileSetup') }}
        </v-stepper-step>

        <v-stepper-content step="1">
          <v-row>
            <v-col>
              <p>{{ $t('pages.appOnboarding.videoTutorial') }}</p>
              <p>
                {{ $t('pages.appOnboarding.review') }}
                <router-link
                  :to="{name: 'profile'}"
                >
                  {{ $t('pages.app.profileSettings') }}
                </router-link>
              </p>
              <p>
                {{ $t('pages.appOnboarding.visit') }}<a
                  href="https://help.sellervue.com/en/"
                  target="_blank"
                >{{ $t('pages.appOnboarding.selfHelp') }}</a>{{ $t('pages.appOnboarding.moreInfo') }}
              </p>
              <v-btn
                color="primary"
                depressed
                @click="step = 2"
              >
                {{ $t('pages.app.continue') }}
              </v-btn>
            </v-col>
            <v-col>
              <div
                class="wistia_responsive_padding"
                style="padding: 56.25% 0 0 0; position: relative;"
              >
                <div
                  class="wistia_responsive_wrapper"
                  style="height: 100%; left: 0; position: absolute; top: 0; width: 100%;"
                >
                  <iframe
                    src="https://fast.wistia.net/embed/iframe/l1lrxi7qrg?videoFoam=true"
                    title="01 - Setting up Your Profile (20210509) Video"
                    allow="autoplay; fullscreen"
                    allowtransparency="true"
                    frameborder="0"
                    scrolling="no"
                    class="wistia_embed"
                    name="wistia_embed"
                    allowfullscreen
                    msallowfullscreen
                    width="100%"
                    height="100%"
                  />
                </div>
              </div>
            </v-col>
          </v-row>
        </v-stepper-content>

        <v-stepper-step
          complete
          editable
          edit-icon="mdi-truck-delivery"
          step="2"
        >
          {{ $t('pages.appOnboarding.addContact') }}
        </v-stepper-step>

        <v-stepper-content step="2">
          <v-row>
            <v-col>
              <p>
                {{ $t('pages.appOnboarding.nextStep') }}
                <router-link
                  :to="{
                    name: 'addSupplier'
                  }"
                >
                  {{ $t('pages.appOnboarding.supplierContact') }}
                </router-link>
              </p>
              <v-alert
                icon="mdi-information"
                text
                color="primary"
              >
                <strong>{{ $t('pages.appOnboarding.tip') }}</strong>{{ $t('pages.appOnboarding.beforeAdd') }}<router-link
                  :to="{
                    name: 'addSupplier'
                  }"
                >
                  {{ $t('pages.appOnboarding.contact') }}
                </router-link>
                {{ $t('pages.appOnboarding.needsToAdd') }}
              </v-alert>
              <v-btn
                color="primary"
                depressed
                @click="step = 3"
              >
                {{ $t('pages.app.continue') }}
              </v-btn>
            </v-col>
            <v-col>
              <div
                class="wistia_responsive_padding"
                style="padding: 56.25% 0 0 0; position: relative;"
              >
                <div
                  class="wistia_responsive_wrapper"
                  style="height: 100%; left: 0; position: absolute; top: 0; width: 100%;"
                >
                  <iframe
                    src="https://fast.wistia.net/embed/iframe/cbix2wlook?videoFoam=true"
                    title="02 - Add a Supplier (20210509) Video"
                    allow="autoplay; fullscreen"
                    allowtransparency="true"
                    frameborder="0"
                    scrolling="no"
                    class="wistia_embed"
                    name="wistia_embed"
                    allowfullscreen
                    msallowfullscreen
                    width="100%"
                    height="100%"
                  />
                </div>
              </div>
            </v-col>
          </v-row>
        </v-stepper-content>

        <v-stepper-step
          complete
          editable
          edit-icon="mdi-tag-multiple"
          step="3"
        >
          {{ $t('pages.appOnboarding.addProducts') }}
        </v-stepper-step>

        <v-stepper-content step="3">
          <v-row>
            <v-col>
              <p>
                {{ $t('pages.appOnboarding.afterAdd') }} <router-link
                  :to="{
                    name: 'addProduct'
                  }"
                >
                  {{ $t('pages.appOnboarding.addProduct') }}
                </router-link>.
              </p>
              <p>{{ $t('pages.appOnboarding.tutorial') }}</p>
              <v-alert
                icon="mdi-information"
                text
                color="primary"
              >
                <strong>{{ $t('pages.appOnboarding.tip') }}</strong>{{ $t('pages.appOnboarding.beforeInvoice') }}
                <router-link
                  :to="{
                    name: 'addProduct'
                  }"
                >
                  {{ $t('pages.appOnboarding.product') }}
                </router-link>{{ $t('pages.appOnboarding.needsToBe') }}
              </v-alert>
              <v-btn
                color="primary"
                depressed
                @click="step = 4"
              >
                {{ $t('pages.app.continue') }}
              </v-btn>
            </v-col>
            <v-col>
              <div
                class="wistia_responsive_padding"
                style="padding: 56.25% 0 0 0; position: relative;"
              >
                <div
                  class="wistia_responsive_wrapper"
                  style="height: 100%; left: 0; position: absolute; top: 0; width: 100%;"
                >
                  <iframe
                    src="https://fast.wistia.net/embed/iframe/fz3en1iha7?videoFoam=true"
                    title="03 - Add a Product (20210509) Video"
                    allow="autoplay; fullscreen"
                    allowtransparency="true"
                    frameborder="0"
                    scrolling="no"
                    class="wistia_embed"
                    name="wistia_embed"
                    allowfullscreen
                    msallowfullscreen
                    width="100%"
                    height="100%"
                  />
                </div>
              </div>
            </v-col>
          </v-row>
        </v-stepper-content>

        <v-stepper-step
          complete
          editable
          edit-icon="mdi-receipt"
          step="4"
        >
          {{ $t('pages.appOnboarding.startAdding') }}
        </v-stepper-step>
        <v-stepper-content step="4">
          <v-row>
            <v-col>
              <p>
                {{ $t('pages.appOnboarding.tutorialAfterAdd') }}
                <router-link
                  :to="{
                    name: 'addInvoice'
                  }"
                >
                  {{ $t('pages.appOnboarding.addInvoice') }}
                </router-link>.
              </p>
              <v-alert
                icon="mdi-information"
                text
                color="primary"
              >
                <strong>{{ $t('pages.appOnboarding.tip') }}</strong>{{ $t('pages.appOnboarding.your') }}<router-link
                  :to="{
                    name: 'addInvoice'
                  }"
                >
                  {{ $t('pages.appOnboarding.invoices') }}
                </router-link>{{ $t('pages.appOnboarding.needToBeIn') }}<strong>{{ $t('pages.appOnboarding.pdf') }}</strong>{{ $t('pages.appOnboarding.format') }}
              </v-alert>
              <v-btn
                color="primary"
                depressed
                @click="step = 5"
              >
                {{ $t('pages.app.continue') }}
              </v-btn>
            </v-col>
            <v-col>
              <div
                class="wistia_responsive_padding"
                style="padding: 56.25% 0 0 0; position: relative;"
              >
                <div
                  class="wistia_responsive_wrapper"
                  style="height: 100%; left: 0; position: absolute; top: 0; width: 100%;"
                >
                  <iframe
                    src="https://fast.wistia.net/embed/iframe/rxyf9cqm7a?videoFoam=true"
                    title="04 - Add an Invoice (20210509) Video"
                    allow="autoplay; fullscreen"
                    allowtransparency="true"
                    frameborder="0"
                    scrolling="no"
                    class="wistia_embed"
                    name="wistia_embed"
                    allowfullscreen
                    msallowfullscreen
                    width="100%"
                    height="100%"
                  />
                </div>
              </div>
            </v-col>
          </v-row>
        </v-stepper-content>

        <v-stepper-step
          complete
          editable
          step="5"
          edit-icon="mdi-help"
        >
          {{ $t('pages.appOnboarding.learn') }}
        </v-stepper-step>
        <v-stepper-content step="5">
          <v-row>
            <v-col>
              <p>{{ $t('pages.appOnboarding.maximumAccuracy') }}</p>
              <v-alert
                icon="mdi-information"
                text
                color="primary"
              >
                {{ $t('pages.appOnboarding.forMoreTutorial') }}<a
                  href="https://help.sellervue.com/en/"
                  target="_blank"
                >{{ $t('pages.appOnboarding.sellervueHelpDesk') }}</a>{{ $t('pages.appOnboarding.emailUs') }}<a href="mailto:support@sellervue.com?subject=Help">{{ $t('pages.appOnboarding.support') }}</a>
              </v-alert>
              <v-btn
                color="primary"
                depressed
                @click="minimised = true"
              >
                {{ $t('pages.setupScheduleCall.done') }}
              </v-btn>
            </v-col>
            <v-col>
              <div
                class="wistia_responsive_padding"
                style="padding: 56.25% 0 0 0; position: relative;"
              >
                <div
                  class="wistia_responsive_wrapper"
                  style="height: 100%; left: 0; position: absolute; top: 0; width: 100%;"
                >
                  <iframe
                    src="https://fast.wistia.net/embed/iframe/t6nhdjsq0u?videoFoam=true"
                    title="05 - Learn to Use SellerVue (20210509) Video"
                    allow="autoplay; fullscreen"
                    allowtransparency="true"
                    frameborder="0"
                    scrolling="no"
                    class="wistia_embed"
                    name="wistia_embed"
                    allowfullscreen
                    msallowfullscreen
                    width="100%"
                    height="100%"
                  />
                </div>
              </div>
            </v-col>
          </v-row>
        </v-stepper-content>
      </v-stepper>
    </transition>
  </v-card>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import type { IUser } from '@/modules/user/types'

@Component
export default class AppOnboardingStepper extends Vue {
  @Prop()
  model!: number

  @Prop({
    required: true
  })
  user!: IUser

  @Prop({
    required: true
  })
  shouldShow!: boolean

  @Prop({
    required: true
  })
  shouldMinimise!: boolean

  get step () {
    return this.model
  }

  set step (val: number) {
    this.$emit('update:model', val)
  }

  get visible () {
    return this.shouldShow
  }

  set visible (val: boolean) {
    this.$emit('update:should-show', val)
  }

  get minimised () {
    return this.shouldMinimise
  }

  set minimised (val: boolean) {
    this.$emit('update:should-minimise', val)
  }
}
</script>

<style lang="scss">
.no-transition {
  .v-stepper__step--editable {
    &:hover {
      background-color: transparent !important;
    }

    .v-ripple__container {
      display: none !important;
    }
  }
}

.v-stepper__step__step .v-icon.v-icon {
  font-size: 1rem !important;
}

</style>
