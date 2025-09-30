const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.message || error.error || 'Request failed')
    }

    return response.json()
  }

  // Health check
  async getHealth() {
    return this.request('/api/health')
  }

  // Contributions
  async getContributions(userId?: string) {
    const params = userId ? `?userId=${userId}` : ''
    return this.request(`/api/contributions${params}`)
  }

  async createContribution(data: any) {
    return this.request('/api/contributions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request('/api/admin/stats')
  }

  async getAdminContributions(params?: {
    status?: string
    type?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    const query = searchParams.toString()
    return this.request(`/api/admin/contributions${query ? `?${query}` : ''}`)
  }

  async getAdminUsers(params?: {
    page?: number
    limit?: number
    role?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    const query = searchParams.toString()
    return this.request(`/api/admin/users${query ? `?${query}` : ''}`)
  }

  async getAdminMartyrs(params?: {
    page?: number
    limit?: number
    verified?: boolean
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    const query = searchParams.toString()
    return this.request(`/api/admin/martyrs${query ? `?${query}` : ''}`)
  }

  // Contribution actions
  async approveContribution(id: string) {
    return this.request(`/api/admin/contributions/${id}/approve`, {
      method: 'POST',
    })
  }

  async rejectContribution(id: string) {
    return this.request(`/api/admin/contributions/${id}/reject`, {
      method: 'POST',
    })
  }

  // Martyr actions
  async verifyMartyr(id: string) {
    return this.request(`/api/admin/martyrs/${id}/verify`, {
      method: 'POST',
    })
  }

  async unverifyMartyr(id: string) {
    return this.request(`/api/admin/martyrs/${id}/unverify`, {
      method: 'POST',
    })
  }
}

export const apiClient = new ApiClient()
export default apiClient

