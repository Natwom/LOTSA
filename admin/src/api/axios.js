import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://lotsa-api.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto-redirect to login on 401
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/#/admin/login'
    }
    return Promise.reject(error)
  }
)

export default instance