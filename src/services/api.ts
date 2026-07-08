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
  getStockByBatch: (params?: { productId?: string; warehouseId?: string; batchId?: string; includeEmpty?: boolean }) => 
    api.get('/stock/by-batch', { params }).then(res => res.data),
  getFefoSuggestion: (params: { productId: string; warehouseId: string; quantity: number }) => 
    api.get('/stock/fefo-suggestion', { params }).then(res => res.data),
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

export const batchesApi = {
  getBatches: (params?: any) => api.get('/batches', { params }).then(res => res.data),
  getExpiringBatches: (daysThreshold?: number) => 
    api.get('/batches/expiring-soon', { params: { daysThreshold } }).then(res => res.data),
  getBatchDetails: (id: string) => api.get(`/batches/${id}`).then(res => res.data),
  getBatchMovements: (id: string, params?: { page?: number; limit?: number }) => 
    api.get(`/batches/${id}/movements`, { params }).then(res => res.data),
  getBatchSerialNumbers: (id: string, params?: { page?: number; limit?: number; status?: string }) => 
    api.get(`/batches/${id}/serial-numbers`, { params }).then(res => res.data),
};

export const serialNumbersApi = {
  getHistory: (serialNumber: string) => 
    api.get(`/serial-numbers/${serialNumber}/history`).then(res => res.data),
};

export const physicalInventoryApi = {
  getSessions: () => api.get('/physical-inventory').then(res => res.data),
  uploadSession: (warehouseId: string, file: File) => {
    const formData = new FormData();
    formData.append('warehouseId', warehouseId);
    formData.append('file', file);
    return api.post('/physical-inventory', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },
  downloadSessionReport: (sessionId: string) => {
    return reportsApi.downloadReport(`/physical-inventory/${sessionId}/report`);
  }
};

export const reportsApi = {
  getDirectory: () => api.get('/reports').then(res => res.data),
  downloadReport: async (url: string, params?: any) => {
    try {
      const response = await api.get(url, {
        params,
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      
      // Intentar extraer el nombre del archivo del header Content-Disposition si existe
      let filename = `reporte-${Date.now()}.pdf`;
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Timeout para asegurar que la descarga inicie antes de limpiar la URL
      setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
      }, 100);
      
    } catch (error: any) {
      if (error.response && error.response.data instanceof Blob) {
        // Parsear el Blob para leer el JSON de error
        const text = await error.response.data.text();
        try {
          const errorData = JSON.parse(text);
          error.response.data = errorData; // Inyectar el JSON de nuevo para que sea atrapado por el Toast o manejador
        } catch (e) {
          // Si no es JSON válido, no hacemos nada extra
        }
      }
      throw error;
    }
  },
};
