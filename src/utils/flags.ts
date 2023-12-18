const truthyValues = ['1', 'true']

const flags = ['XERO_ENABLED', 'INTEGRATIONS', 'AMAZON_ENABLED']

export default flags.reduce((prev: Record<string, boolean>, cur: string) => {
  prev[cur] = truthyValues.includes(process.env[`VUE_APP_${cur}`])
  return prev
}, {})
