import axios from 'axios'

const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/proxy' : 'http://localhost:5000'),
})

// Request interceptor: attach bearer token when present.
http.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Response interceptor: on 401 for protected endpoints, clear auth state and redirect to signin.
http.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || ''
        const isLoginAttempt = url.includes('/api/auth/login')

        if (error.response && error.response.status === 401 && !isLoginAttempt) {
            localStorage.removeItem('token')
            localStorage.removeItem('role')
            localStorage.removeItem('userId')
            localStorage.removeItem('user')
            localStorage.removeItem('userEmail')
            localStorage.removeItem('userName')
            window.location.href = '/signin'
        }
        return Promise.reject(error)
    }
)

export default http
