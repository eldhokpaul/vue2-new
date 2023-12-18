/* eslint-disable camelcase */

export type IRawToken = {
  access_token: string | null | undefined
  expires_in: number | null
  refresh_expires_in: number | null
  refresh_token: string | null
  scope: string | null
  session_state: string | null
}

export type ILoginFormData = {
  login: string
  password: string
};
