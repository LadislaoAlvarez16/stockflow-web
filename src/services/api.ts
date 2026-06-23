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
