import axios from 'axios';

// Configuración de Axios usando VITE_API_URL (BR-ENV)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si la request falla con 401 y no fue reintentada aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // Llamada directa con axios sin interceptores para evitar loops
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
            refreshToken,
          });

          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          // Actualizamos el header y reintentamos
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // BR-AUTH: Si el refresh falla, limpiamos y redirigimos
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No hay refresh token disponible
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    // BR-AUTH: Si ya reintentó y vuelve a dar 401 (loop escape)
    if (error.response?.status === 401 && originalRequest._retry) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Funciones del Dashboard
export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary').then(res => res.data),
  getRecentMovements: () => api.get('/dashboard/movements/recent').then(res => res.data),
  getLowStock: () => api.get('/dashboard/low-stock').then(res => res.data),
};

export const stockApi = {
  getStocks: (params?: any) => api.get('/stock', { params }).then(res => res.data),
  createMovement: (data: any) => api.post('/stock/movement', data).then(res => res.data),
  createTransfer: (data: any) => api.post('/stock/transfer', data).then(res => res.data),
  getMovements: (params?: any) => api.get('/stock/movements', { params }).then(res => res.data),
};

export const alertsApi = {
  getAlerts: (params?: any) => api.get('/alerts', { params }).then(res => res.data),
  resolveAlert: (id: string) => api.patch(`/alerts/${id}/resolve`).then(res => res.data),
};

export const warehousesApi = {
  getWarehouses: (params?: any) => api.get('/warehouses', { params }).then(res => res.data),
  createWarehouse: (data: any) => api.post('/warehouses', data).then(res => res.data),
  deactivateWarehouse: (id: string) => api.patch(`/warehouses/${id}/deactivate`).then(res => res.data),
};

export const productsApi = {
  getProducts: (params?: any) => api.get('/products', { params }).then(res => res.data),
  createProduct: (data: any) => api.post('/products', data).then(res => res.data),
  deactivateProduct: (id: string) => api.patch(`/products/${id}/deactivate`).then(res => res.data),
};
