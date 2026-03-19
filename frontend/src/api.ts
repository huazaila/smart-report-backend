import axios from 'axios'
import type { UploadData, ChartRule, ChartResult } from './types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const data = err.response?.data
    let msg =
      (typeof data?.detail === 'object' && data?.detail?.message) ??
      (typeof data?.detail === 'string' ? data.detail : null) ??
      data?.message ??
      null
    if (!msg) {
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || err.code === 'ERR_BAD_REQUEST') {
        msg = '无法连接后端，请确认已启动：conda run -n smart-report-backend uvicorn main:app --reload --port 8000'
      } else if (err.code === 'ECONNABORTED' || (err.message || '').includes('timeout')) {
        msg = '请求超时，请检查后端是否正常响应'
      } else {
        msg = err.message || '请求失败'
      }
    }
    err.message = msg
    return Promise.reject(err)
  }
)

export async function uploadFile(file: File): Promise<UploadData> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<UploadData & { success: boolean }>('/upload', formData, {
    timeout: 15000,
  })
  if (!data.success) throw new Error('Upload failed')
  return data
}

export async function generateCharts(fileId: string, rules: ChartRule[]): Promise<{ charts: ChartResult[] }> {
  const { data } = await api.post<{ success: boolean; charts: ChartResult[] }>('/generate-charts', {
    file_id: fileId,
    rules,
  })
  if (!data.success) throw new Error('Generate failed')
  return data
}
