import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors (like 401 Unauthorized or 403 Forbidden)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: async (username, password) => {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        const response = await api.post('auth/login/access-token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data;
    },
    getMe: async () => {
        const response = await api.get('users/me');
        return response.data;
    }
};

export const productsApi = {
    getAll: (params) => api.get('products/', { params }),
    getById: (id) => api.get(`products/${id}`),
    create: (data) => api.post('products/', data),
    update: (id, data) => api.put(`products/${id}`, data),
    delete: (id) => api.delete(`products/${id}`),
    archive: (id) => api.patch(`products/${id}/archive`),
    getLowStock: () => api.get('products/alerts/low-stock'),
    getExpiring: () => api.get('products/alerts/expiring'),
};

export const reportsApi = {
    getValuation: () => api.get('reports/valuation'),
    getSalesSummary: () => api.get('reports/sales-summary'),
    getTopProducts: () => api.get('reports/top-products'),
    getAlerts: () => api.get('reports/alerts'),
};

export const suppliersApi = {
    getAll: () => api.get('suppliers/'),
    create: (data) => api.post('suppliers/', data),
    update: (id, data) => api.put(`suppliers/${id}`, data),
    delete: (id) => api.delete(`suppliers/${id}`),
};

export const salesApi = {
    getAll: () => api.get('sales/'),
    create: (data) => api.post('sales/', data),
};

export const stockApi = {
    getAll: (params) => api.get('stock-movements/', { params }),
    getByProductId: (productId) => api.get(`stock-movements/${productId}`),
    createMovement: (data) => api.post('stock-movements/', data),
};

export const purchaseOrdersApi = {
    getAll: (params) => api.get('purchase-orders/', { params }),
    create: (data) => api.post('purchase-orders/', data),
    receive: (id) => api.patch(`purchase-orders/${id}/receive`),
    delete: (id) => api.delete(`purchase-orders/${id}`),
};

export default api;
