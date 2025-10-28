"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type User = {
  id: string
  name: string | null
  email: string
  role: "USER" | "ADMIN" | "MODERATOR"
  isVerified: boolean
  profile?: {
    id: string
    bio: string | null
    avatar: string | null
    location: string | null
    address: string | null
    phone: string | null
    website: string | null
    socialLinks: any
    isVerified: boolean
  } | null
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error("Failed to parse stored user:", error)
      // Clear potentially corrupted data
      try {
        localStorage.removeItem("user")
      } catch (e) {
        console.error("Failed to remove item from localStorage:", e)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Real login function - calls API backend
  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()
      
      if (result.success && result.user) {
        const userWithToken = {
          ...result.user,
          token: result.token
        }
        setUser(userWithToken)
        try {
          localStorage.setItem("user", JSON.stringify(userWithToken))
        } catch (e) {
          console.error("Failed to store user in localStorage:", e)
        }
      }
      
      setIsLoading(false)
      return { success: result.success, message: result.message }
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return { success: false, message: "An unexpected error occurred. Please try again." }
    }
  }

  // Register function - calls API backend
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const result = await response.json()
      
      if (result.success && result.user) {
        const userWithToken = {
          ...result.user,
          token: result.token
        }
        setUser(userWithToken)
        try {
          localStorage.setItem("user", JSON.stringify(userWithToken))
        } catch (e) {
          console.error("Failed to store user in localStorage:", e)
        }
      }
      
      setIsLoading(false)
      return { success: result.success, message: result.message }
    } catch (error) {
      console.error("Registration error:", error)
      setIsLoading(false)
      return { success: false, message: "An unexpected error occurred. Please try again." }
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem("user")
    } catch (e) {
      console.error("Failed to remove user from localStorage:", e)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
