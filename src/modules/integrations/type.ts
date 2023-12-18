export type IAmazonClientDetails = {
  clientId: string
  clientSecret: string
  clientRedirectUrl: string
  sessionState: number
  applicationId: string
}

export type IAmazonAuth = {
  state: string
  sellingPartnerId: string
  authToken: string
  code: string
}
