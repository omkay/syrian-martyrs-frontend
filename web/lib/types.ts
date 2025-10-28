export interface Martyr {
  id: string
  name: string
  dateOfDeath: Date
  location: string
  cause?: string
  description?: string
  image?: string
  age?: number
  gender?: "MALE" | "FEMALE" | "OTHER" | "UNKNOWN"
  occupation?: string
  familyStatus?: string
  isVerified?: boolean
  createdAt?: Date
  updatedAt?: Date
  testimonials?: Testimonial[]
  sources?: Source[]
}

export interface Testimonial {
  id: string
  content: string
  author: string
  relationship?: string
  date?: Date
  isVerified?: boolean
  createdAt?: Date
  updatedAt?: Date
  martyrId?: string
  userId?: string
}

export interface Source {
  id: string
  name: string
  url?: string
  date: Date
  type: "NEWS" | "REPORT" | "SOCIAL" | "OFFICIAL" | "OTHER"
  createdAt?: Date
  updatedAt?: Date
  martyrId?: string
}
