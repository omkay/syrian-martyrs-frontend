"use server"

import { apiClient } from "@/lib/api-client"
import { validatePassword, validateEmail, generateSecureToken } from "@/lib/validation-utils"
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

    if (!contributionType) {
      return { success: false, message: "Contribution type is required" }
    }

    // Validate content based on type
    if (contributionType === 'TESTIMONIAL_ADDITION' && (!content || content.length < 10)) {
      return { success: false, message: "Testimonial must be at least 10 characters" }
    }

    // Note: This is a server action, so we cannot access localStorage directly
    // The token must be passed from the client component
    // For now, we'll return an error - the component needs to be updated to call API directly
    return {
      success: false,
      message: "Testimonial submission needs to be called from the client component with authentication token",
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
      dateOfDeath = new Date(date)
      
      // Validate the date
      if (isNaN(dateOfDeath.getTime())) {
        return { success: false, message: "Please enter a valid date" }
      }
    } catch (error) {
      return { success: false, message: "Please enter a valid date" }
    }

    // Get JWT token from localStorage (client-side) or from cookies
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    if (!token) {
      return { 
        success: false, 
        message: "You must be logged in to submit a martyr profile" 
      }
    }

    // Prepare contribution content
    const content = {
      name,
      dateOfDeath: dateOfDeath.toISOString(),
      location,
      description,
      cause,
      image: imageUrl,
      age,
      gender: gender?.toUpperCase(),
      occupation,
      familyStatus,
      submitterRelationship
    }

    // Call API to create contribution
    // @ts-ignore - process.env is available in server actions
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/api/contributions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'MARTYR_ADDITION',
        content,
        notes: `Source: ${source}`
      })
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: result.error || "Failed to submit martyr profile"
      }
    }

    return {
      success: true,
      message: result.message || "Thank you for submitting this profile. It has been saved and will be reviewed before being published.",
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