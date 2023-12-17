const { execSync } = require('child_process')

const models = [
  'invoices',
  'xero',
  'gateway',
  'suppliers',
  'reporting',
  'products',
  'users',
  'amazon',
  'notifications',
  'orders'
]

for (const model of models) {
  console.log('******', model)
  execSync(`curl 'https://sv2-dev.sellervue.com/api/v2/api-docs/${model}' -o ./swagger/${model}.json`)
  execSync(
    `yarn openapi-generator-cli generate -i ./swagger/${model}.json --generator-name typescript-axios -o ./src/client/${model} --skip-validate-spec;`
  )
}
