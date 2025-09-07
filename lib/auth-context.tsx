"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type User = {
  id: string
  name: string
  email: string
  role: "user" | "admin" | "moderator"
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

  // Mock login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock validation
    if (!email || !password) {
      setIsLoading(false)
      return { success: false, message: "Email and password are required" }
    }

    // Mock credentials check
    if (email === "admin@example.com" && password === "password") {
      const user = {
        id: "1",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin" as const,
      }
      setUser(user)
      try {
        localStorage.setItem("user", JSON.stringify(user))
      } catch (e) {
        console.error("Failed to store user in localStorage:", e)
      }
      setIsLoading(false)
      return { success: true, message: "Login successful" }
    }

    if (email === "user@example.com" && password === "password") {
      const user = {
        id: "2",
        name: "Regular User",
        email: "user@example.com",
        role: "user" as const,
      }
      setUser(user)
      try {
        localStorage.setItem("user", JSON.stringify(user))
      } catch (e) {
        console.error("Failed to store user in localStorage:", e)
      }
      setIsLoading(false)
      return { success: true, message: "Login successful" }
    }

    setIsLoading(false)
    return { success: false, message: "Invalid email or password" }
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
