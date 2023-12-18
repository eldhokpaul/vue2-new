import createNumberMask from 'text-mask-addons/dist/createNumberMask'

export const currencyMask = createNumberMask({
  prefix: '$',
  allowDecimal: true,
  includeThousandsSeparator: true,
  allowNegative: false
})

export const identity = (value: any) => value
