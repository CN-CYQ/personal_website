import axios from 'axios'

export interface ApiResponse<T> {
  code: string
  message: string
  data: T
  timestamp: string
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})
