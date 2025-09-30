type MartyrProfile = {
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
  favorite: boolean
  has_identified_ceasar_image: boolean
  ceasar_image_url: string
}

// Current implementation uses local JSON file
export async function getMartyrsProfiles(): Promise<MartyrProfile[]> {
  try {
    const response = await fetch('/martyrs-profiles.json')
    
    if (!response.ok) {
      throw new Error('Failed to fetch martyrs profiles')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error loading martyrs profiles:', error)
    return []
  }
}

// Placeholder for future API implementation
// export async function getTeamMembers(): Promise<TeamMember[]> {
//   try {
//     const response = await fetch('https://api.example.com/team-members')
//     
//     if (!response.ok) {
//       throw new Error('Failed to fetch team members')
//     }
//     
//     const data = await response.json()
//     return data
//   } catch (error) {
//     console.error('Error loading team members:', error)
//     return []
//   }
// } 