<div align="center">

# StockFlow Web

**Interfaz web (SPA) para el sistema de control de inventario StockFlow, desacoplada del backend y conectada solo por API REST.**

Proyecto personal de portfolio técnico, construido para practicar autenticación con roles en el cliente, manejo de estado asíncrono y una experiencia de usuario fluida con React y TypeScript.

[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

[Repositorio del backend](https://github.com/LadislaoAlvarez16/stockflow)

</div>

---

## 🎯 ¿Qué es StockFlow Web?

Es el cliente web del ecosistema StockFlow. Se comunica con el backend **únicamente por API REST**, por lo que ambos proyectos están completamente desacoplados y pueden desplegarse por separado.

Está pensado como la herramienta diaria de operarios y administradores de una distribuidora: rápida, clara y con permisos según el rol de cada usuario.

---

## 📸 Capturas

<!-- Agregá acá 3 o 4 capturas: login, dashboard, carga masiva (ETL) y panel de webhooks. -->
<!-- Ejemplo: ![Dashboard](./docs/screenshots/dashboard.png) -->

---

## ✨ Características

- **Interfaz según el rol (RBAC en UI):** los botones de acciones sensibles ("Crear", "Eliminar") no se renderizan para usuarios con rol `VIEWER`. Es una mejora de experiencia: la seguridad real la aplica el backend.
- **Autenticación con JWT:** un interceptor de Axios agrega el token Bearer en cada petición protegida y centraliza el manejo de errores 401/403.
- **Rutas protegidas:** React Router v6 con rutas privadas según el estado de sesión.
- **Carga masiva (ETL):** importación de catálogos por CSV con arrastrar y soltar (drag & drop), conectada al motor de importación del backend.
- **Panel de webhooks:** administración de los webhooks del backend desde la interfaz.
- **Catálogos y movimientos:** tablas de administración de productos y depósitos, y vistas de movimientos de stock.
- **Experiencia de carga:** *skeletons* (shadcn/ui) mientras se resuelven las peticiones, para evitar saltos visuales.
- **Contenedor:** build multi-stage de Docker servido con nginx (fallback de SPA y headers de seguridad).

---

## 💻 Stack

| Tecnología | Rol |
|------------|-----|
| **React + Vite** | SPA con entorno de desarrollo rápido (HMR). |
| **TypeScript** | Modo estricto. Tipos de las respuestas alineados con los DTO del backend. |
| **Tailwind CSS** | Estilos basados en utilidades. |
| **shadcn/ui** | Componentes accesibles, con el código dentro del proyecto para poder personalizarlos. |
| **Axios** | Cliente HTTP con interceptores para JWT y errores 401/403. |
| **React Router v6** | Enrutamiento del lado del cliente y rutas privadas. |

---

## 📁 Estructura del proyecto

- `/src/components`: componentes reutilizables de UI (botones, tablas, drawers), sin lógica de negocio.
- `/src/pages`: vistas ruteables que orquestan el estado, llaman a los servicios y ensamblan los componentes.
- `/src/services`: capa de integración con la API (`api.ts`), donde vive la configuración de Axios.
- `/src/common`: contextos globales (`AuthContext`), hooks personalizados (`useAuth`) y utilidades.

---

## 🔒 Decisión de seguridad conocida

**Almacenamiento del token:** por ahora el frontend guarda el JWT en `localStorage`, para simplificar el desarrollo y la evaluación con frontend y backend en entornos separados. Esto expone el token a ataques **XSS**, y es un riesgo que asumo conscientemente en esta etapa.

**Plan:** migrar a sesión basada en **cookies `httpOnly`**, como cambio coordinado entre frontend y backend, antes de cualquier uso en producción.

---

## 🧠 Qué aprendí

- Separar la capa de integración (servicios) de las vistas y los componentes para mantener el código ordenado.
- Centralizar autenticación y errores con interceptores en vez de repetir lógica en cada pantalla.
- Que ocultar botones por rol mejora la experiencia, pero la autorización real tiene que vivir en el servidor.
- Los compromisos de seguridad (como `localStorage` vs. cookies `httpOnly`) conviene documentarlos y planificarlos, no esconderlos.

---

## ⚠️ Estado

Proyecto personal de aprendizaje: **todavía no está desplegado** y se ejecuta en local junto con el backend.

---

## 🚀 Inicio rápido (local)

### Requisitos
- Node.js v20+
- El **backend de StockFlow** corriendo en local (por defecto en el puerto `3000`).

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/LadislaoAlvarez16/stockflow-web.git
   cd stockflow-web
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar el entorno** (opcional, si querés cambiar la URL por defecto)
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```

4. **Levantar el servidor de desarrollo**
   ```bash
   npm run dev
   ```
   La aplicación queda disponible en `http://localhost:5173`.

---

## 🗺️ Roadmap

- ✅ **Fase 1:** autenticación, RBAC en UI, catálogos y movimientos.
- ✅ **Fase 2:** carga masiva por CSV (drag & drop) y panel de webhooks.
- **Fase 3:** actualizaciones en tiempo real con WebSockets o Server-Sent Events.
- **Fase 4:** migración a TanStack Query (caché, deduplicación de requests y revalidación automática).
- **Seguridad:** migración del token a cookies `httpOnly`.
