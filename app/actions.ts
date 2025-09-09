"use server"

import { getMartyrsWithRelations, searchMartyrs, createMartyr, createContribution, getUserByEmail, createUser, getMartyrById, prisma } from "@/lib/db"
import { hashPassword, verifyPassword, validatePassword, validateEmail, generateSecureToken } from "@/lib/auth-utils"
import type { Martyr } from "@/lib/types"

// Helper function to get or create a user for anonymous submissions
async function getOrCreateAnonymousUser(email: string, name: string) {
  try {
    // First try to find existing user
    let user = await getUserByEmail(email)
    
    if (!user) {
      // Create a new user for anonymous submissions
      user = await createUser({
        email,
        name,
        password: 'anonymous_user', // In production, this should be handled differently
        role: 'USER'
      }) as any
    }
    
    return user
  } catch (error) {
    console.error('Error getting or creating user:', error)
    return null
  }
}

export async function getMartyrs(limit?: number, offset?: number): Promise<Martyr[]> {
  try {
    const martyrs = await getMartyrsWithRelations(limit, offset)
    return martyrs as Martyr[]
  } catch (error) {
    console.error("Error fetching martyrs:", error)
    return []
  }
}

export async function getMartyrByIdAction(id: string): Promise<Martyr | null> {
  try {
    const martyr = await getMartyrById(id)
    return martyr as Martyr | null
  } catch (error) {
    console.error("Error fetching martyr:", error)
    return null
  }
}

export async function searchMartyrsAction(query: string): Promise<Martyr[]> {
  try {
    if (!query || query.trim().length === 0) {
      return await getMartyrs()
    }
    const martyrs = await searchMartyrs(query)
    return martyrs as Martyr[]
  } catch (error) {
    console.error("Error searching martyrs:", error)
    return []
  }
}

export async function submitContribution(formData: FormData) {
  try {
    // Extract form data
    const martyrId = formData.get("martyrId") as string
    const contributionType = formData.get("contributionType") as string
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const relationship = formData.get("relationship") as string
    const content = formData.get("content") as string
    const url = formData.get("url") as string

    // Simple validation
    if (!name || name.length < 2) {
      return { success: false, message: "Name must be at least 2 characters" }
    }

    if (!email || !email.includes("@")) {
      return { success: false, message: "Please enter a valid email" }
    }

    if (!content || content.length < 10) {
      return { success: false, message: "Content must be at least 10 characters" }
    }

    // Get or create user for this submission
    const user = await getOrCreateAnonymousUser(email, name)
    if (!user) {
      return { success: false, message: "Failed to create user account" }
    }

    // Create contribution record
    await createContribution({
      type: contributionType || "OTHER",
      userId: user.id,
      martyrId: martyrId || undefined,
      content: {
        name,
        email,
        relationship,
        content,
        url,
        contributionType
      },
      notes: `Contribution submitted by ${name} (${email})`
    })

    return {
      success: true,
      message: "Thank you for your contribution. It has been submitted for review.",
    }
  } catch (error) {
    console.error("Error submitting contribution:", error)
    return {
      success: false,
      message: "An error occurred while submitting your contribution. Please try again.",
    }
  }
}

export async function addMartyr(formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string
    const date = formData.get("date") as string
    const location = formData.get("location") as string
    const description = formData.get("description") as string
    const source = formData.get("source") as string

    // Optional fields
    const age = formData.get("age") ? Number.parseInt(formData.get("age") as string) : undefined
    const gender = (formData.get("gender") as string) || undefined
    const occupation = (formData.get("occupation") as string) || undefined
    const familyStatus = (formData.get("familyStatus") as string) || undefined
    const cause = (formData.get("cause") as string) || undefined
    const imageUrl = (formData.get("imageUrl") as string) || undefined
    const submitterRelationship = (formData.get("submitterRelationship") as string) || undefined

    // Simple validation
    if (!name || name.length < 2) {
      return { success: false, message: "Name must be at least 2 characters" }
    }

    if (!date) {
      return { success: false, message: "Date is required" }
    }

    if (!location) {
      return { success: false, message: "Location is required" }
    }

    if (!description || description.length < 20) {
      return { success: false, message: "Description must be at least 20 characters" }
    }

    if (!source || source.length < 10) {
      return { success: false, message: "Source information must be at least 10 characters" }
    }

    // Parse the date - handle various formats
    let dateOfDeath: Date
    try {
      // Try to parse as ISO date first
      if (date.includes('-') || date.includes('/')) {
        dateOfDeath = new Date(date)
      } else {
        // For text dates like "March 15, 2011", we'll use a more flexible approach
        // For now, let's use a default date if parsing fails
        dateOfDeath = new Date(date) || new Date('2011-03-15') // Default to March 15, 2011
      }
      
      // Validate the date
      if (isNaN(dateOfDeath.getTime())) {
        return { success: false, message: "Please enter a valid date" }
      }
    } catch (error) {
      return { success: false, message: "Please enter a valid date" }
    }

    // Get the admin user ID for submissions
    // In a real app, this would come from the authenticated user
    const adminUser = await getUserByEmail('admin@syrianmartyrs.com')
    if (!adminUser) {
      return { success: false, message: "System error: Admin user not found" }
    }
    const userId = adminUser.id

    // Create the martyr in the database
    const martyr = await createMartyr({
      name,
      dateOfDeath,
      location,
      cause,
      description,
      image: imageUrl,
      age,
      gender: gender ? gender.toUpperCase() : undefined,
      occupation,
      familyStatus,
      isVerified: false // New submissions need verification
    })

    // Create a contribution record for tracking
    await createContribution({
      type: "MARTYR_ADDITION",
      userId,
      martyrId: martyr.id,
      content: {
        martyrData: {
          name,
          dateOfDeath,
          location,
          cause,
          description,
          age,
          gender,
          occupation,
          familyStatus,
          imageUrl
        },
        source,
        submitterRelationship
      },
      notes: `New martyr profile submitted. Source: ${source}`
    })

    return {
      success: true,
      message: "Thank you for submitting this profile. It has been saved and will be reviewed before being published.",
    }
  } catch (error) {
    console.error("Error creating martyr:", error)
    return {
      success: false,
      message: "An error occurred while submitting the profile. Please try again.",
    }
  }
}

// User registration action
export async function signup(formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Validation
    if (!name || name.trim().length < 2) {
      return { success: false, message: "Name must be at least 2 characters long" }
    }

    if (!email || !validateEmail(email)) {
      return { success: false, message: "Please enter a valid email address" }
    }

    if (!password) {
      return { success: false, message: "Password is required" }
    }

    if (password !== confirmPassword) {
      return { success: false, message: "Passwords do not match" }
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return { 
        success: false, 
        message: `Password requirements not met: ${passwordValidation.errors.join(", ")}` 
      }
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return { success: false, message: "An account with this email already exists" }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Check if email verification is required
    const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === "true"

    // Create user with appropriate verification status
    const user = await createUser({
      email,
      name: name.trim(),
      password: hashedPassword,
      role: "USER" // Default role for new users
    })

    if (requireEmailVerification) {
      // Generate email verification token
      const emailVerificationToken = generateSecureToken()
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Update user with verification token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken,
          emailVerificationExpires
        }
      })

      // TODO: Send verification email here
      // For now, we'll just return success
      // In production, you would send an email with the verification token

      return {
        success: true,
        message: "Account created successfully! Please check your email to verify your account.",
        userId: user.id,
        requiresVerification: true
      }
    } else {
      // Skip email verification - mark user as verified immediately
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true
        }
      })

      return {
        success: true,
        message: "Account created successfully! You can now log in.",
        userId: user.id,
        requiresVerification: false
      }
    }
  } catch (error) {
    console.error("Error during signup:", error)
    return {
      success: false,
      message: "An error occurred while creating your account. Please try again.",
    }
  }
}

// User login action
export async function loginUser(email: string, password: string) {
  try {
    // Find user by email
    const user = await getUserByEmail(email)
    if (!user) {
      return { success: false, message: "Invalid email or password" }
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      return { success: false, message: "Invalid email or password" }
    }

    // Check if email verification is required and user is not verified
    const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === "true"
    if (requireEmailVerification && !user.isVerified) {
      return { 
        success: false, 
        message: "Please verify your email address before logging in. Check your email for a verification link." 
      }
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user
    return {
      success: true,
      message: "Login successful",
      user: userWithoutPassword
    }
  } catch (error) {
    console.error("Error during login:", error)
    return {
      success: false,
      message: "An error occurred during login. Please try again.",
    }
  }
}

// Email verification action
export async function verifyEmail(token: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return { success: false, message: "Invalid or expired verification token" }
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    })

    return {
      success: true,
      message: "Email verified successfully! You can now log in."
    }
  } catch (error) {
    console.error("Error verifying email:", error)
    return {
      success: false,
      message: "An error occurred while verifying your email. Please try again.",
    }
  }
}
