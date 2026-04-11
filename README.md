# MG Store - E-commerce Full Stack

Sistema de e-commerce completo para venta de prendas con integración de pagos (Culqi, Yape), gestión de inventario, envíos, cupones y gift cards.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Ejecución](#-ejecución)
- [Testing](#-testing)
- [Deployment con Docker](#-deployment-con-docker)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Documentation](#-api-documentation)

## ✨ Características

### Storefront (Cliente)
- 🛍️ Catálogo de productos con filtros por categoría y búsqueda
- 📦 Carrito de compras persistente por sesión
- 💳 Checkout con múltiples métodos de pago (Culqi, Yape)
- 🎟️ Sistema de cupones de descuento
- 🎁 Gift cards aplicables en checkout
- 🚚 Múltiples opciones de envío con cálculo de costos
- 📱 Diseño responsive mobile-first
- ✉️ Confirmación de orden con instrucciones de pago

### Panel Admin
- 📊 Dashboard con métricas de ventas
- 🏷️ Gestión de productos (CRUD completo)
- 📋 Gestión de órdenes con actualización de estados
- 🎫 Administración de cupones
- 💝 Administración de gift cards
- 📦 Gestión de envíos con tracking
- 💰 Consola Yape para validación manual de pagos
- 🔐 Autenticación JWT

### Integraciones
- 💳 **Culqi**: Pagos con tarjeta de crédito/débito
- 📱 **Yape**: Transferencias con validación manual
- 📲 **WhatsApp Cloud API**: Notificaciones automáticas de pedidos y envíos

## 🛠 Tecnologías

### Backend
- **Framework**: Spring Boot 3.2.0
- **Lenguaje**: Java 21
- **Base de Datos**: PostgreSQL 16
- **Migraciones**: Flyway
- **Seguridad**: Spring Security + JWT
- **ORM**: Hibernate / JPA
- **Build**: Maven

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Routing**: React Router 6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS 3
- **Testing**: Vitest + React Testing Library

### DevOps
- **Containerización**: Docker + Docker Compose

## 📝 Requisitos Previos

- **Java**: JDK 21 o superior
- **Node.js**: v18 o superior
- **PostgreSQL**: 16 o superior
- **Maven**: 3.9+ (o usar el wrapper incluido)
- **Docker**: (opcional, para deployment)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
cd MG-Store-Prendas
```

### 2. Configurar Base de Datos

```bash
# Crear base de datos
psql -U postgres
CREATE DATABASE mgstore;
\q
```

### 3. Backend Setup

```bash
cd backend
./mvnw spring-boot:run
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## ⚙️ Configuración

### Perfiles de Spring

El backend soporta perfiles `dev` y `prod`:

```bash
# Desarrollo
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Producción
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

## 🏃 Ejecución

### Modo Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
./mvnw spring-boot:run
# Backend running on http://localhost:8891
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend running on http://localhost:5173
```

### Acceso

- **Storefront**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin/login
- **API**: http://localhost:8891/api

### Credenciales de Prueba

```
Admin Login:
Username: admin
Password: admin123
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
./mvnw test
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:coverage
npm run test:e2e
```

## 🐳 Deployment con Docker

### Construcción y Ejecución

```bash
# Copiar .env.example a .env y configurar variables
cp .env.example .env

# Construir y levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Servicios Docker

- **Backend**: http://localhost:8891
- **Frontend**: http://localhost:80
- **PostgreSQL**: localhost:5432

### Monitoreo (Opcional)

```bash
docker-compose --profile monitoring up -d
```

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001

## 📁 Estructura del Proyecto

```
MG-Store-Prendas/
├── backend/                  # Spring Boot API
│   ├── src/main/java/       # Código fuente
│   ├── src/main/resources/  # Configuración y migraciones
│   ├── src/test/            # Tests
│   └── Dockerfile
├── frontend/                # React App
│   ├── src/                 # Código fuente
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml       # Orquestación Docker
└── README.md
```

## 📚 API Documentation

### Endpoints Principales

#### Autenticación
```
POST   /auth/login         - Iniciar sesión
```

#### Productos
```
GET    /products                    - Listar productos
GET    /products/{slug}             - Detalle de producto
POST   /admin/products              - Crear producto
PUT    /admin/products/{id}         - Actualizar producto
DELETE /admin/products/{id}         - Eliminar producto
```

#### Carrito
```
GET    /cart/{sessionId}                    - Obtener carrito
POST   /cart/{sessionId}/items              - Agregar al carrito
PUT    /cart/{sessionId}/items/{itemId}     - Actualizar cantidad
DELETE /cart/{sessionId}/items/{itemId}     - Eliminar item
```

#### Órdenes
```
POST   /orders/checkout         - Crear orden (checkout)
GET    /admin/orders            - Listar órdenes
PUT    /admin/orders/{id}/status - Actualizar estado
```

#### Pagos
```
POST   /payments/culqi/{orderId}  - Procesar pago Culqi
POST   /payments/yape             - Crear pago Yape
```

#### Cupones & Gift Cards
```
POST   /coupons/validate         - Validar cupón
POST   /gift-cards/validate      - Validar gift card
GET    /admin/coupons            - Listar cupones
GET    /admin/gift-cards         - Listar gift cards
```

#### Envíos
```
GET    /shipping-methods                    - Métodos activos
GET    /admin/shippings                     - Listar envíos
PUT    /admin/orders/{orderId}/shipping     - Actualizar envío
```

---

**Sprint 1 Crítico ✅ Completado**

- ✅ Sistema de envíos completo
- ✅ Integración Culqi.js en checkout
- ✅ Página de confirmación de orden
- ✅ Dockerización completa
- ✅ Perfiles dev/prod
- ✅ Tests backend y frontend
- ✅ Documentación actualizada

© 2024 M2L Consulting SAC

## Environment Separation (Local vs GCP VM)

Use dedicated env files:

- Local: `.env.local`
- GCP VM: copy `.env.gcp.example` to `.env.gcp` and fill real values

Run with:

```bash
docker compose --env-file .env.local up -d --build
docker compose --env-file .env.gcp up -d --build
```

Detailed guide: `DEPLOY_ENVIRONMENTS.md`
