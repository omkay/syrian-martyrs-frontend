"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { loginUser } from "@/app/actions"

type User = {
  id: string
  name: string | null
  email: string
  role: "USER" | "ADMIN" | "MODERATOR"
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
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

  // Real login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const result = await loginUser(email, password)
      
      if (result.success && result.user) {
        setUser(result.user)
        try {
          localStorage.setItem("user", JSON.stringify(result.user))
        } catch (e) {
          console.error("Failed to store user in localStorage:", e)
        }
      }
      
      setIsLoading(false)
      return { success: result.success, message: result.message }
    } catch (error) {
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

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
