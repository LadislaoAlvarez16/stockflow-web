<div align="center">

# StockFlow Web

**Interfaz de usuario moderna y headless para el control de inventario de StockFlow.**

Proyecto de portfolio técnico — Aplicación frontend SPA construida con enfoque en resiliencia, seguridad (RBAC) y experiencia de usuario optimizada (Skeletons, optimización de red).

[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

[Backend Repository](https://github.com/LadislaoAlvarez16/stockflow)

</div>

---

## 🎯 ¿Qué es StockFlow Web?

Es el cliente frontend del ecosistema StockFlow. Se conecta exclusivamente mediante API REST al backend central, demostrando una arquitectura verdaderamente **Headless**. 
Está diseñado para ser la herramienta diaria de los operarios y administradores de una distribuidora, garantizando que la interfaz sea rápida, clara y estrictamente segura.

---

## ✨ Características Principales (Fase 1)

- **Auth & Seguridad (RBAC UI):** Los componentes de la interfaz reaccionan criptográficamente al rol del usuario. Si un usuario es `VIEWER`, los botones de "Crear" o "Eliminar" ni siquiera se renderizan en el DOM, complementando la seguridad del backend.
- **Intercepción de Tokens:** Autenticación fluida mediante un Interceptor de Axios que inyecta automáticamente el JWT Bearer en cada petición segura.
- **Experiencia de Usuario (UX):** Uso de *Skeletons* de carga (shadcn/ui) para prevenir parpadeos feos mientras el cliente resuelve asincronía de la base de datos, logrando que la app se sienta instantánea.
- **Dashboards y Catálogos:** Vistas analíticas de movimientos y tablas de administración de Productos/Depósitos.

---

## 💻 Stack Tecnológico

| Tecnología | Rol en la arquitectura |
|------------|------------------------|
| **React + Vite** | Motor de renderizado SPA hiper-rápido con HMR en milisegundos. |
| **TypeScript** | Strict mode activado. Tipado de extremo a extremo compartiendo las mismas interfaces de DTO del backend. |
| **Tailwind CSS** | Sistema de diseño basado en utilidades, garantizando que el CSS final sea diminuto. |
| **shadcn/ui** | Componentes headless accesibles y hermosos, permitiendo el control absoluto sobre el DOM y el estilo sin dependencias ocultas. |
| **Axios** | Cliente HTTP robusto configurado con interceptores globales para inyección de JWT y captura centralizada de errores (HTTP 401/403). |
| **React Router v6** | Enrutamiento declarativo del lado del cliente y protección de rutas privadas. |

---

## 📁 Arquitectura del Cliente (Directorios)

Separación estricta de responsabilidades (Separation of Concerns) para escalabilidad:

- `/src/components` — Componentes reutilizables, UI core (botones, tablas, drawers) agnósticos de la lógica de negocio.
- `/src/pages` — Vistas ruteables que orquestan el estado, llaman a los servicios y ensamblan los componentes.
- `/src/services` — Capa de integración (`api.ts`). Aquí vive Axios y las firmas de las peticiones a la API externa.
- `/src/common` — Contextos globales (AuthContext), hooks personalizados (`useAuth`) y utilidades.

---

## 🚀 Guía de Inicio Rápido (Local)

### Requisitos previos
- Node.js (v20+ recomendado).
- El **Backend de StockFlow** levantado y corriendo localmente (por defecto en el puerto `3000`).

### Pasos de instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/stockflow-web.git
   cd stockflow-web
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar el entorno:**
   Crea un archivo `.env` en la raíz (si es necesario modificar el default de Vite):
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```

4. **Levantar el servidor de desarrollo Vite:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible instantáneamente en `http://localhost:5173`.

---

## 🗺️ Roadmap Frontend (Próximas Fases)
- **Fase 2:** Implementación de la vista de "Carga Masiva (ETL)" para la importación por CSV arrastrando archivos (Drag & Drop).
- **Fase 3:** WebSockets/Server-Sent Events (SSE) para reflejar cambios de stock en el dashboard en tiempo real sin recargar.
- **Fase 4:** Migración de llamadas de Axios simples a `TanStack Query` (React Query) para caché en memoria, deduplicación de requests y revalidación automática.
