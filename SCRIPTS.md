# Scripts y Comandos Útiles

Colección de scripts y comandos frecuentes para el desarrollo del proyecto MG Store.

## 📦 Gestión de Dependencias

### Backend (Maven)

```bash
# Limpiar y compilar
mvn clean install

# Compilar sin ejecutar tests
mvn clean install -DskipTests

# Actualizar dependencias
mvn versions:display-dependency-updates

# Ver árbol de dependencias
mvn dependency:tree
```

### Frontend (NPM)

```bash
# Instalar dependencias
npm install

# Actualizar dependencias
npm update

# Ver dependencias outdated
npm outdated

# Limpiar cache
npm cache clean --force
```

## 🗄️ Base de Datos

### PostgreSQL - Comandos Útiles

```bash
# Conectar a PostgreSQL
psql -U postgres

# Conectar a base de datos mgstore
psql -U mgstore_user -d mgstore

# Listar bases de datos
\l

# Conectar a una base de datos
\c mgstore

# Listar tablas
\dt

# Describir tabla
\d orders

# Ver queries en ejecución
SELECT * FROM pg_stat_activity;

# Matar query
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = 12345;

# Backup database
pg_dump -U mgstore_user mgstore > backup.sql

# Restore database
psql -U mgstore_user mgstore < backup.sql

# Reset database (CUIDADO!)
DROP DATABASE mgstore;
CREATE DATABASE mgstore;
```

### Queries Útiles

```sql
-- Ver todas las tablas y número de registros
SELECT
    schemaname,
    tablename,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = schemaname AND table_name = tablename) as num_rows
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Ver tamaño de tablas
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Ver últimos pedidos
SELECT
    o.order_number,
    o.customer_name,
    o.total_amount,
    o.status,
    o.created_at
FROM orders o
ORDER BY o.created_at DESC
LIMIT 10;

-- Ver stock de productos
SELECT
    p.name as product_name,
    c.name as color,
    s.name as size,
    pv.stock_quantity,
    pv.reserved_quantity,
    (pv.stock_quantity - pv.reserved_quantity) as available_stock
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
LEFT JOIN colors c ON pv.color_id = c.id
LEFT JOIN sizes s ON pv.size_id = s.id
ORDER BY p.name, c.name, s.sort_order;

-- Ver pedidos pendientes de Yape
SELECT
    o.order_number,
    o.customer_name,
    o.customer_phone,
    o.total_amount,
    o.created_at
FROM orders o
WHERE o.status = 'PENDING_YAPE'
ORDER BY o.created_at ASC;

-- Ver uso de cupones
SELECT
    c.code,
    c.type,
    c.value,
    c.current_uses,
    c.max_uses,
    COUNT(cu.id) as times_used,
    SUM(cu.discount_amount) as total_discount
FROM coupons c
LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
GROUP BY c.id
ORDER BY times_used DESC;
```

## 🚀 Ejecución del Proyecto

### Backend

```bash
# Ejecutar en modo desarrollo
cd backend
mvn spring-boot:run

# Ejecutar con perfil específico
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Ejecutar con debug
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005"

# Compilar JAR y ejecutar
mvn clean package -DskipTests
java -jar target/mgstore-backend-1.0.0.jar
```

### Frontend

```bash
# Desarrollo
cd frontend
npm run dev

# Build para producción
npm run build

# Preview build
npm run preview

# Lint code
npm run lint
```

## 🧪 Testing

### Backend Tests

```bash
# Ejecutar todos los tests
mvn test

# Ejecutar tests específicos
mvn test -Dtest=AuthServiceTest
mvn test -Dtest=ProductServiceTest
mvn test -Dtest="*Service*"

# Ejecutar tests con cobertura
mvn test jacoco:report

# Ver reporte de cobertura
# Abrir: target/site/jacoco/index.html
```

### Frontend Tests

```bash
# Ejecutar tests (cuando estén implementados)
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## 🔍 Debugging

### Ver Logs del Backend

```bash
# En tiempo real
tail -f logs/spring-boot-application.log

# Últimas 100 líneas
tail -n 100 logs/spring-boot-application.log

# Buscar errores
grep ERROR logs/spring-boot-application.log

# Buscar por palabra clave
grep -i "payment" logs/spring-boot-application.log
```

### Probar Endpoints

```bash
# Login admin
curl -X POST http://localhost:8080/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mgstore.com","password":"admin123"}'

# Guardar token en variable (Linux/Mac)
TOKEN=$(curl -s -X POST http://localhost:8080/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mgstore.com","password":"admin123"}' \
  | jq -r '.data.token')

# Guardar token en variable (Windows PowerShell)
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/auth/login" `
  -Method Post -ContentType "application/json" `
  -Body '{"email":"admin@mgstore.com","password":"admin123"}'
$TOKEN = $response.data.token

# Usar token en request (Linux/Mac)
curl -X GET http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer $TOKEN"

# Usar token en request (Windows PowerShell)
Invoke-RestMethod -Uri "http://localhost:8080/api/admin/products" `
  -Method Get -Headers @{"Authorization"="Bearer $TOKEN"}
```

## 🐳 Docker

### PostgreSQL en Docker

```bash
# Iniciar PostgreSQL
docker run --name mgstore-postgres \
  -e POSTGRES_DB=mgstore \
  -e POSTGRES_USER=mgstore_user \
  -e POSTGRES_PASSWORD=mgstore_password_2024 \
  -p 5432:5432 \
  -d postgres:16-alpine

# Ver logs
docker logs mgstore-postgres

# Conectar a PostgreSQL en Docker
docker exec -it mgstore-postgres psql -U mgstore_user -d mgstore

# Detener
docker stop mgstore-postgres

# Iniciar
docker start mgstore-postgres

# Eliminar
docker rm mgstore-postgres

# Backup desde Docker
docker exec mgstore-postgres pg_dump -U mgstore_user mgstore > backup.sql

# Restore en Docker
docker exec -i mgstore-postgres psql -U mgstore_user mgstore < backup.sql
```

### Docker Compose

```bash
# Iniciar todos los servicios
docker-compose up

# Iniciar en background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Detener
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Rebuild
docker-compose up --build
```

## 🔧 Utilidades

### Generar Password Hash

```bash
# Usando Spring Boot CLI (si está instalado)
spring encodepassword admin123

# Usando online tool
# https://bcrypt-generator.com/
```

### Limpiar Proyecto

```bash
# Backend
cd backend
mvn clean
rm -rf target/

# Frontend
cd frontend
npm run clean  # Si existe script
rm -rf node_modules/
rm -rf dist/
npm install
```

### Ver Puertos en Uso

```bash
# Windows
netstat -ano | findstr :8080
netstat -ano | findstr :5173
netstat -ano | findstr :5432

# Linux/Mac
lsof -i :8080
lsof -i :5173
lsof -i :5432
```

### Matar Proceso por Puerto

```bash
# Windows
# Primero encontrar PID
netstat -ano | findstr :8080
# Luego matar proceso
taskkill /PID <PID> /F

# Linux/Mac
kill -9 $(lsof -t -i:8080)
```

## 📊 Monitoreo

### Verificar Salud de la Aplicación

```bash
# Backend health check (implementar primero)
curl http://localhost:8080/api/health

# Ver métricas de Spring Boot Actuator (si está habilitado)
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/metrics
```

### Ver Uso de Recursos

```bash
# Windows
# Ver uso de CPU/RAM
tasklist | findstr "java.exe"

# Linux/Mac
# Ver procesos Java
ps aux | grep java

# Ver uso detallado
top -p $(pgrep -f "spring-boot")
```

## 🔄 Git Útil

```bash
# Estado del proyecto
git status

# Ver cambios
git diff

# Agregar cambios
git add .

# Commit
git commit -m "feat: Agregar ProductService"

# Ver historial
git log --oneline --graph --all

# Crear branch
git checkout -b feature/product-service

# Ver branches
git branch -a

# Cambiar de branch
git checkout main

# Merge branch
git merge feature/product-service

# Deshacer último commit (mantener cambios)
git reset --soft HEAD~1

# Deshacer último commit (eliminar cambios)
git reset --hard HEAD~1
```

## 🆘 Solución de Problemas Comunes

### Error: Port 8080 already in use

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
kill -9 $(lsof -t -i:8080)
```

### Error: Could not connect to database

```bash
# Verificar que PostgreSQL esté corriendo
# Windows
sc query postgresql-x64-16

# Linux/Mac
sudo systemctl status postgresql

# Verificar conexión
psql -U mgstore_user -d mgstore -h localhost -p 5432
```

### Error: Frontend no se conecta al backend

```bash
# Verificar que backend esté corriendo
curl http://localhost:8080/api/health

# Verificar CORS en backend
# application.properties debe tener:
cors.allowed.origins=http://localhost:5173
```

### Error: npm install falla

```bash
# Limpiar cache
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: Maven build falla

```bash
# Limpiar todo
mvn clean

# Actualizar repositorios
mvn dependency:purge-local-repository

# Rebuild
mvn clean install -DskipTests
```

## 📝 Scripts Personalizados

### Crear script de inicio rápido (start.sh - Linux/Mac)

```bash
#!/bin/bash

echo "Starting MG Store..."

# Iniciar PostgreSQL Docker
echo "Starting PostgreSQL..."
docker start mgstore-postgres || docker run --name mgstore-postgres \
  -e POSTGRES_DB=mgstore \
  -e POSTGRES_USER=mgstore_user \
  -e POSTGRES_PASSWORD=mgstore_password_2024 \
  -p 5432:5432 \
  -d postgres:16-alpine

sleep 3

# Iniciar Backend
echo "Starting Backend..."
cd backend
mvn spring-boot:run &
BACKEND_PID=$!

sleep 10

# Iniciar Frontend
echo "Starting Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "MG Store started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8080/api"
echo ""
echo "Press Ctrl+C to stop all services"

wait
```

### Crear script de inicio rápido (start.bat - Windows)

```batch
@echo off
echo Starting MG Store...

REM Iniciar PostgreSQL Docker
echo Starting PostgreSQL...
docker start mgstore-postgres

timeout /t 3

REM Iniciar Backend
echo Starting Backend...
cd backend
start "Backend" mvn spring-boot:run

timeout /t 10

REM Iniciar Frontend
echo Starting Frontend...
cd ..\frontend
start "Frontend" npm run dev

echo MG Store started!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8080/api
```

---

**Última actualización**: 2026-01-09
