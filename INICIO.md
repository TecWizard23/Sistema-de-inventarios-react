# Sistema de Inventario - Ferretería 🏪

## Requisitos previos

- **Node.js 18+** instalado en tu máquina
- **npm** (viene con Node.js)

## Pasos para ejecutar el proyecto

### 1. Descomprime el RAR

Extrae el contenido del archivo `.rar` en una carpeta de tu elección.

### 2. Abre dos terminales en la carpeta del proyecto

#### Terminal 1 - Backend

```bash
cd backend
npm install
PORT=8001 npm run dev
```

**Resultado esperado:**

```
Server running on http://localhost:8001
```

#### Terminal 2 - Frontend

```bash
cd frontend
npm install
npm run dev
```

**Resultado esperado:**

```
VITE v5.0.0  ready in XXX ms
➜  Local:   http://localhost:5177/
```

### 3. Accede a la aplicación

Abre tu navegador en: **http://localhost:5177**

## Credenciales de acceso (admin)

- **Email:** `admin@local`
- **Contraseña:** `admin123`

## Funcionalidades principales

✅ **Autenticación:** Login y registro de usuarios  
✅ **Productos:** CRUD completo de productos y categorías  
✅ **Proveedores:** Gestión de proveedores  
✅ **Clientes:** Registro de clientes  
✅ **Compras:** Registro de órdenes de compra  
✅ **Ventas:** Registro de órdenes de venta  
✅ **Stock:** Control de inventario  
✅ **Movimientos:** Historial de movimientos  
✅ **Dashboard:** Panel de control operativo

## Puertos utilizados

- **Backend:** http://localhost:8001
- **Frontend:** http://localhost:5177 (o el siguiente disponible si este está ocupado)

## Tecnología utilizada

- **Frontend:** React 18 + Vite + React Router 6
- **Backend:** Node.js + Express + Prisma + SQLite
- **Base de datos:** SQLite (dev.db - se crea automáticamente)

## Nota importante

- El backend y frontend deben estar corriendo simultáneamente
- Si algún puerto está ocupado, Vite automáticamente intenta el siguiente
- La base de datos se crea automáticamente en la primera ejecución del backend

¡Listo! Disfruta usando el sistema de inventario 🎉
