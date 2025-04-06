import { useState, useEffect } from 'react'

export interface MartyrProfile {
  id: string
  name: string
  bio: string
  date_of_birth: string
  gender: string
  date_of_death: string
  city: string
  state: string
  cause_of_death: string
  place_of_death: string
  death_responsibility: string
  avatar: string
  role: string
  progress: number
  has_identified_ceasar_image: boolean
  ceasar_image_url: string
  favorite: boolean
}

export function useMartyrsProfiles() {
  const [martyrsProfiles, setMartyrsProfiles] = useState<MartyrProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('/martyrs-profiles.json')
        if (!response.ok) {
          throw new Error('Failed to fetch martyrs profiles')
        }
        const data = await response.json()
        setMartyrsProfiles(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  const toggleFavorite = (id: string) => {
    setMartyrsProfiles(prevProfiles =>
      prevProfiles.map(profile =>
        profile.id === id
          ? { ...profile, favorite: !profile.favorite }
          : profile
      )
    )
  }

  return { martyrsProfiles, isLoading, error, toggleFavorite }
} 