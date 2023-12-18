import { format, formatDistance, getUnixTime, parseISO } from 'date-fns'

export const formatDate = (unixDate: number) => {
  return format(unixDate, 'MMM dd, yyyy')
}

export const formatDateString = (date: string) => {
  return format(parseISO(date), 'MMM dd, yyyy')
}

export const formatServerDate = (date: string) => {
  return format(parseISO(date), 'yyyy-MM-dd')
}

export const formatUnixDate = (date: string) => {
  return getUnixTime(parseISO(date))
}
export const formatUnixDateTime = (unixDate: number) => {
  return format(new Date(unixDate), 'MMM dd, yyyy hh:mm:aaa')
}
export const dateTimeDifference = (date: string) => {
  return formatDistance(new Date(date), new Date())
}
