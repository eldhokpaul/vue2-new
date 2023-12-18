export type IToast = {
  id: string | null
  type: 'SUCCESS' | 'ERROR' | 'INFO' | 'ALERT'
  text: string | null
}
