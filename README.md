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

## Retoma Rapida del Proyecto

Esta seccion esta pensada para retomar el proyecto en cualquier momento, sin depender de contexto previo.

### 1) Checklist rapido (2 minutos)

```bash
git status -sb
docker compose --env-file .env.local ps
```

Si estas en VM:

```bash
git status -sb
docker compose --env-file .env.gcp ps
```

Verifica:
- Rama correcta (`main` normalmente)
- Sin cambios locales inesperados
- Contenedores `mgstore-postgres`, `mgstore-backend`, `mgstore-frontend` en `Up`

### 2) Archivos de entorno

- Local: `.env.local`
- VM: `.env.gcp` (base en `.env.gcp.example`)
- Guia completa: `DEPLOY_ENVIRONMENTS.md`

### 3) Levantar local desde cero

```bash
docker compose --env-file .env.local down
docker compose --env-file .env.local up -d --build
docker compose --env-file .env.local ps
```

Accesos:
- Storefront: `http://localhost`
- Admin: `http://localhost/admin/login`
- API health: `http://localhost:8891/api/actuator/health`

### 4) Levantar en VM (produccion/staging)

```bash
docker compose --env-file .env.gcp down
docker compose --env-file .env.gcp up -d --build
docker compose --env-file .env.gcp ps
```

### 5) Desplegar cambios nuevos en VM

En tu maquina local:

```bash
git add .
git commit -m "mensaje claro del cambio"
git push origin main
```

En la VM:

```bash
cd ~/mg_store
git pull origin main
docker compose --env-file .env.gcp up -d --build backend frontend
docker compose --env-file .env.gcp ps
```

### 6) Validaciones despues de deploy

```bash
curl -I http://localhost:8082/
curl http://localhost:8891/api/actuator/health
docker compose --env-file .env.gcp logs --tail=120 frontend
docker compose --env-file .env.gcp logs --tail=120 backend
```

Si usas dominio con Caddy:

```bash
curl -I https://agrenova.style.34.61.3.232.sslip.io/
curl https://agrenova.style.34.61.3.232.sslip.io/api/actuator/health
```

### 7) Caddy (VM)

Bloque recomendado:

```caddy
agrenova.style.34.61.3.232.sslip.io {
  encode zstd gzip
  @api path /api/*
  reverse_proxy @api mgstore-backend:8891
  reverse_proxy mgstore-frontend:80
}
```

Aplicar cambios:

```bash
docker exec -it sbti-caddy caddy validate --config /etc/caddy/Caddyfile
docker exec -it sbti-caddy caddy reload --config /etc/caddy/Caddyfile
```

### 8) Estado funcional esperado

- Login admin operativo:
  - Email: `admin@mgstore.com`
  - Password: `admin123`
- Modulos operativos:
  - Productos (imagenes por URL/archivo y por color)
  - Empresa (`/admin/company-settings`)
  - Ofertas (`/admin/offers`, incluyendo programacion inicio/fin)
- Migraciones Flyway hasta `V11`

### 9) Troubleshooting rapido

- Frontend `unhealthy` pero pagina carga:
  - suele ser healthcheck; validar `curl -I http://localhost:8082/`
- `Mixed Content` en HTTPS:
  - usar `VITE_API_URL` y `APP_PUBLIC_API_BASE_URL` con `https://...`
- Cambios no aparecen en VM:
  - falto `git push` local o `git pull` en VM
- Cambios de BD no aplican:
  - reconstruir backend para ejecutar Flyway (`up -d --build backend`)
