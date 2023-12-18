export type SubscriptionPlan = {
  id: number
  userTier: string
  name: string
  paymentProviderPlanId: number | string
  crmTagId: number | string
  amount: number | string
  isActiveForUser: boolean
}

export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'PAUSED' | 'DELETED'
export type Subscription = {
  id: number
  paddleUserId: string
  subscriptionId: string
  status: SubscriptionStatus
  email: string
  alertName: string
  marketingConsent: boolean
  cancelUrl: string
  updateUrl: string
  subscriptionPlanId: string
  nextBillDate: string
  currency: string
  checkoutId: string
  source?: any
  linkedSubscriptions?: any
  quantity: number
  unitPrice?: number
  eventTime: string
  pausedAt?: string
  pausedFrom?: string
  cancellationEffectiveDate?: string
  pausedReason?: string
  subscriptionPlans: SubscriptionPlan[]
  orderId: string
  amount?: number
  retryPaymentDate?: string
}
