// Shared types between web and api services

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Profile {
  id: string
  userId: string
  bio?: string
  avatar?: string
  location?: string
  address?: string
  phone?: string
  website?: string
  socialLinks?: any
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Martyr {
  id: string
  name: string
  dateOfDeath: string
  location: string
  cause?: string
  description?: string
  image?: string
  age?: number
  gender?: Gender
  occupation?: string
  familyStatus?: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
  testimonials?: Testimonial[]
  sources?: Source[]
}

export interface Testimonial {
  id: string
  content: string
  author: string
  relationship?: string
  date?: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
  martyrId?: string
  userId?: string
}

export interface Source {
  id: string
  name: string
  url?: string
  date: string
  type: SourceType
  createdAt: string
  updatedAt: string
  martyrId?: string
}

export interface Contribution {
  id: string
  type: ContributionType
  status: ContributionStatus
  content: any
  notes?: string
  createdAt: string
  updatedAt: string
  userId: string
  martyrId?: string
  profileId?: string
  user?: User
  martyr?: Martyr
  profile?: Profile
}

export interface Notification {
  id: string
  type: NotificationType
  userId: string
  title: string
  message: string
  metadata?: any
  isRead: boolean
  createdAt: string
  updatedAt: string
}

// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'USER'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN'
}

export enum SourceType {
  NEWS = 'NEWS',
  REPORT = 'REPORT',
  SOCIAL = 'SOCIAL',
  OFFICIAL = 'OFFICIAL',
  OTHER = 'OTHER'
}

export enum ContributionType {
  MARTYR_ADDITION = 'MARTYR_ADDITION',
  MARTYR_UPDATE = 'MARTYR_UPDATE',
  TESTIMONIAL_ADDITION = 'TESTIMONIAL_ADDITION',
  SOURCE_ADDITION = 'SOURCE_ADDITION',
  PHOTO_ADDITION = 'PHOTO_ADDITION',
  DOCUMENT_ADDITION = 'DOCUMENT_ADDITION',
  PROFILE_CREATION = 'PROFILE_CREATION',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  PROFILE_VERIFICATION = 'PROFILE_VERIFICATION',
  CORRECTION = 'CORRECTION',
  OTHER = 'OTHER'
}

export enum ContributionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  UNDER_REVIEW = 'UNDER_REVIEW'
}

export enum NotificationType {
  CONTRIBUTION_APPROVED = 'CONTRIBUTION_APPROVED',
  CONTRIBUTION_REJECTED = 'CONTRIBUTION_REJECTED',
  MARTYR_VERIFIED = 'MARTYR_VERIFIED',
  MARTYR_UNVERIFIED = 'MARTYR_UNVERIFIED'
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Request types
export interface CreateContributionRequest {
  type: ContributionType
  content: any
  notes?: string
  martyrId?: string
  profileId?: string
}

export interface UpdateContributionStatusRequest {
  status: ContributionStatus
}

export interface CreateMartyrRequest {
  name: string
  dateOfDeath: string
  location: string
  cause?: string
  description?: string
  image?: string
  age?: number
  gender?: Gender
  occupation?: string
  familyStatus?: string
}

export interface CreateTestimonialRequest {
  content: string
  author: string
  relationship?: string
  date?: string
  martyrId?: string
}

export interface CreateSourceRequest {
  name: string
  url?: string
  date: string
  type: SourceType
  martyrId?: string
}

