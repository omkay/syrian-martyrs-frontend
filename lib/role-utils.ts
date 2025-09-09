import { UserRole } from './generated/prisma'

export type UserRoleType = 'ADMIN' | 'MODERATOR' | 'USER'

// Role hierarchy - higher roles have more permissions
export const ROLE_HIERARCHY: Record<UserRoleType, number> = {
  USER: 1,
  MODERATOR: 2,
  ADMIN: 3
}

// Check if a user has a specific role or higher
export function hasRole(userRole: UserRoleType, requiredRole: UserRoleType): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

// Check if user is admin
export function isAdmin(userRole: UserRoleType): boolean {
  return userRole === 'ADMIN'
}

// Check if user is moderator or admin
export function isModerator(userRole: UserRoleType): boolean {
  return hasRole(userRole, 'MODERATOR')
}

// Check if user can manage users
export function canManageUsers(userRole: UserRoleType): boolean {
  return isModerator(userRole)
}

// Check if user can approve contributions
export function canApproveContributions(userRole: UserRoleType): boolean {
  return isModerator(userRole)
}

// Check if user can edit martyrs
export function canEditMartyrs(userRole: UserRoleType): boolean {
  return isModerator(userRole)
}

// Check if user can delete content
export function canDeleteContent(userRole: UserRoleType): boolean {
  return isModerator(userRole)
}

// Check if user can access admin panel
export function canAccessAdmin(userRole: UserRoleType): boolean {
  return isModerator(userRole)
}

// Check if user can submit contributions (all verified users)
export function canSubmitContributions(userRole: UserRoleType, isVerified: boolean): boolean {
  return isVerified
}

// Get role display name
export function getRoleDisplayName(role: UserRoleType): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrator'
    case 'MODERATOR':
      return 'Moderator'
    case 'USER':
      return 'User'
    default:
      return 'Unknown'
  }
}

// Get role description
export function getRoleDescription(role: UserRoleType): string {
  switch (role) {
    case 'ADMIN':
      return 'Full access to all features and administrative functions'
    case 'MODERATOR':
      return 'Can moderate content, approve contributions, and manage users'
    case 'USER':
      return 'Can submit contributions and view content'
    default:
      return 'Unknown role'
  }
}

// Get available roles for assignment (excludes higher roles)
export function getAvailableRoles(currentUserRole: UserRoleType): UserRoleType[] {
  const allRoles: UserRoleType[] = ['USER', 'MODERATOR', 'ADMIN']
  
  // Users can only assign roles that are lower than or equal to their own
  return allRoles.filter(role => ROLE_HIERARCHY[role] <= ROLE_HIERARCHY[currentUserRole])
}

// Check if user can assign a specific role
export function canAssignRole(currentUserRole: UserRoleType, targetRole: UserRoleType): boolean {
  // Users can only assign roles that are lower than their own
  return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[targetRole]
}

// Permission matrix for different actions
export const PERMISSIONS = {
  // User management
  VIEW_USERS: (role: UserRoleType) => isModerator(role),
  EDIT_USERS: (role: UserRoleType) => isModerator(role),
  DELETE_USERS: (role: UserRoleType) => isAdmin(role),
  ASSIGN_ROLES: (role: UserRoleType) => isModerator(role),
  
  // Content management
  VIEW_ALL_CONTRIBUTIONS: (role: UserRoleType) => isModerator(role),
  APPROVE_CONTRIBUTIONS: (role: UserRoleType) => isModerator(role),
  REJECT_CONTRIBUTIONS: (role: UserRoleType) => isModerator(role),
  EDIT_MARTYRS: (role: UserRoleType) => isModerator(role),
  DELETE_MARTYRS: (role: UserRoleType) => isAdmin(role),
  VERIFY_MARTYRS: (role: UserRoleType) => isModerator(role),
  
  // System administration
  ACCESS_ADMIN_PANEL: (role: UserRoleType) => isModerator(role),
  VIEW_ANALYTICS: (role: UserRoleType) => isModerator(role),
  MANAGE_SYSTEM_SETTINGS: (role: UserRoleType) => isAdmin(role),
  
  // User actions
  SUBMIT_CONTRIBUTIONS: (role: UserRoleType, isVerified: boolean) => isVerified,
  EDIT_OWN_PROFILE: (role: UserRoleType) => true, // All users can edit their own profile
  VIEW_OWN_CONTRIBUTIONS: (role: UserRoleType) => true, // All users can view their own contributions
} as const

// Helper function to check permissions
export function hasPermission(
  permission: keyof typeof PERMISSIONS,
  userRole: UserRoleType,
  isVerified: boolean = true
): boolean {
  const permissionFn = PERMISSIONS[permission]
  return permissionFn(userRole, isVerified)
}
