import { http, type ApiResponse } from './http'

export interface HealthStatus {
  service: string
  status: string
  timestamp: string
}

export async function getSystemHealth(): Promise<ApiResponse<HealthStatus>> {
  const response = await http.get<ApiResponse<HealthStatus>>('/system/health')
  return response.data
}
