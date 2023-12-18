export type IUser = {
  id: number
  firstName?: string | null
  lastName?: string | null
  verificationToken?: string | null
  password?: string | null
  isVerified?: boolean | null
  isActive?: boolean | null
  dob?: Date | string | null
  email: string
  company?: string | null
  locationTimeZone?: string | null
  bio?: string | null
  phone?: string | null
  tierExpiryDate: string
  accountRoles: any[]
};
