# Sistema de Gestión de Inventarios

Aplicación web integral para el control de stock, compras, ventas y administración de catálogo, clientes, proveedores y personal.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React, Vite, React Router, Context API (Autenticación).
- **Backend:** Node.js, Express.
- **Base de Datos & ORM:** Prisma ORM (SQLite / PostgreSQL).
- **Autenticación:** JWT / Sesiones con rutas protegidas.

---

## 📦 Estructura del Proyecto

```text
sistema-inventario/
├── backend/
│   ├── prisma/            # Esquema y migraciones de la base de datos
│   ├── src/
│   │   ├── auth.js        # Lógica y middlewares de autenticación
│   │   ├── server.js      # Servidor Express y endpoints
│   │   └── seed.js        # Población inicial de datos
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/    # Layout, Navbar, formularios y guardias de ruta
    │   ├── context/       # AuthContext para sesión global
    │   └── pages/         # Vistas: Dashboard, Stock, Ventas, Compras, etc.
    └── package.json
🚀 Módulos del Sistema
Autenticación y Seguridad: Inicio de sesión y protección de rutas según estado de autenticación.

Catálogo & Inventario: Gestión de productos, categorías, control de stock y registro de movimientos de almacén.

Transacciones: Módulo de compras a proveedores y registro de ventas a clientes.

Administración: Gestión de clientes, proveedores y empleados.

Dashboard: Vista consolidada de métricas clave del negocio.

⚙️ Instalación y Puesta en Marcha
Prerrequisitos
Node.js (versión 18 o superior recomendada)

Git

1. Configuración del Backend
Abre una terminal y dirígete a la carpeta del servidor:

Bash
cd backend
npm install
Crea un archivo .env en la raíz de backend/ con las variables necesarias (ejemplo):

Fragmento de código
PORT=4000
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu_clave_secreta_aqui"
Aplica las migraciones y opcionalmente ejecuta el seed:

Bash
npx prisma migrate dev
node src/seed.js
Inicia el servidor backend:

Bash
npm run dev
# o bien: node src/server.js
2. Configuración del Frontend
Abre otra pestaña de la terminal y entra a la carpeta de la interfaz:

Bash
cd frontend
npm install
Inicia el servidor de desarrollo con Vite:

Bash
npm run dev
La aplicación estará accesible en el navegador en http://localhost:5173 (o el puerto indicado por Vite).
```
