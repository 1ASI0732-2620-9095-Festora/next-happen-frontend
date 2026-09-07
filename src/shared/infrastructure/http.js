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

// Response interceptor: on 401, clear auth state and redirect to sign-in.
http.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('role')
            localStorage.removeItem('userId')
            localStorage.removeItem('user')
            window.location.href = '/sign-in'
        }
        return Promise.reject(error)
    }
)

export default http
