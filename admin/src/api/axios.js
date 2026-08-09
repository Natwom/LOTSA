import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://lotsa-api.onrender.com/api'

const instance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('[ADMIN API] Network Error:', error.message, error.config?.url)
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/#/admin/login'
    }
    return Promise.reject(error)
  }
)

export default instance