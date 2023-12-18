
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'

@Module({
  namespaced: true
})
export class AppModule extends VuexModule {
  name: string | null = 'SellerVue 2'
  darkMode = false
  theme = null
  shouldShowOnboarding = true
  shouldOnboardingMinimised = false
  onboardingStep = 1

  @Mutation
  setDarkMode (val: boolean): void {
    this.darkMode = val
  }

  @Mutation
  setTheme (theme: any): void {
    this.theme = theme
  }

  @Mutation
  setOnboarding (val: boolean): void {
    this.shouldShowOnboarding = val
  }

  @Mutation
  setOnboardingMinimised (val: boolean): void {
    this.shouldOnboardingMinimised = val
  }

  @Mutation
  setOnboardingStep (val: number): void {
    this.onboardingStep = val
  }

  @Action
  async toggleDarkMode () {
    await this.context.commit('setDarkMode', !this.darkMode)
  }
}
