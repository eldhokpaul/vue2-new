export const formatNumber = (numberVal: number) => {
  return numberVal < 0
    ? `-${Math.abs(numberVal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `${numberVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
