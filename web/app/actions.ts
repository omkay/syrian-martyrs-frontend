"use server"

import { apiClient } from "@/lib/api-client"
import { hashPassword, verifyPassword, validatePassword, validateEmail, generateSecureToken, generateToken } from "@/lib/auth-utils"
import type { Martyr } from "@/lib/types"

// Helper function to get or create a user for anonymous submissions
async function getOrCreateAnonymousUser(email: string, name: string) {
  try {
    // For now, we'll create a simple user object
    // In a real implementation, this would call the API
    const user = {
      id: `temp_${Date.now()}`,
      email,
      name,
      role: 'USER'
    }
    
    return user
  } catch (error) {
    console.error('Error getting or creating user:', error)
    return null
  }
}

export async function getMartyrs(limit?: number, offset?: number): Promise<Martyr[]> {
  try {
    // For now, return empty array until API is fully implemented
    // This will be replaced with actual API calls
    return []
  } catch (error) {
    console.error("Error fetching martyrs:", error)
    return []
  }
}

export async function getMartyrByIdAction(id: string): Promise<Martyr | null> {
  try {
    // For now, return null until API is fully implemented
    return null
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
    // For now, return empty array until API is fully implemented
    return []
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

    // For now, just return success without calling API
    // This will be replaced with actual API calls
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

export async function addMartyr(formData: FormData, userId?: string) {
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

    // For now, just return success without calling API
    // This will be replaced with actual API calls
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

    // For now, just return success without calling API
    // This will be replaced with actual API calls
    return {
      success: true,
      message: "Account created successfully! You can now log in.",
      userId: "temp_user_id",
      requiresVerification: false
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
    // For now, just return success without calling API
    // This will be replaced with actual API calls
    return {
      success: true,
      message: "Login successful",
      user: {
        id: "temp_user_id",
        email,
        name: "Test User",
        role: "USER"
      },
      token: "temp_token"
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
    // For now, just return success without calling API
    // This will be replaced with actual API calls
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

// Update user profile action
export async function updateProfile(formData: FormData, userId: string) {
  try {
    // For now, just return success without calling API
    // This will be replaced with actual API calls
    return {
      success: true,
      message: "Profile updated successfully!"
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    return {
      success: false,
      message: "An error occurred while updating your profile. Please try again.",
    }
  }
}

// Profile contribution action
export async function submitProfileContribution(formData: FormData) {
  try {
    // For now, just return success without calling API
    // This will be replaced with actual API calls
    return {
      success: true,
      message: "Profile contribution submitted successfully! It will be reviewed before being published. You will be redirected to the martyrs page shortly.",
    }
  } catch (error) {
    console.error("Error submitting profile contribution:", error)
    return {
      success: false,
      message: "An error occurred while submitting your contribution. Please try again.",
    }
  }
}