import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
});

// ✅ Attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ Handle 401 responses — clear token and redirect to login, except for auth requests
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRoute = error.config?.url?.includes('/auth/login') || 
                            error.config?.url?.includes('/auth/google') || 
                            error.config?.url?.includes('/auth/register');

        if (error.response?.status === 401 && !isAuthRoute) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;