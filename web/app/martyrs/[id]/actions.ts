"use server"

import type { Martyr } from "@/lib/types"

export async function getMartyrByIdAction(id: string): Promise<Martyr | null> {
  try {
    // Use API_URL for server-side calls (Docker internal network)
    // NEXT_PUBLIC_API_URL is for client-side only
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    
    const response = await fetch(`${apiUrl}/api/martyrs/${id}`, {
      cache: 'no-store' // Ensure fresh data
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const martyr = await response.json()
    return martyr as Martyr
  } catch (error) {
    console.error("Error fetching martyr:", error)
    return null
  }
}