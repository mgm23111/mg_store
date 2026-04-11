# Funcionalidades Faltantes - MG Store

**Fecha**: 2026-01-23
**Análisis**: Identificación de features pendientes

---

## 🔴 CRÍTICO - Páginas Admin Faltantes

El menú admin tiene links pero las páginas NO existen:

### 1. ❌ `/admin/coupons` - Gestión de Cupones
**Estado**: Página no implementada (404)
**Backend**: ✅ Controller existe
**Frontend**: ❌ Página falta
**Necesita**:
- Crear `frontend/src/pages/admin/Coupons.tsx`
- Agregar ruta en `App.tsx`
- Tabla de cupones con CRUD
- Formulario para crear/editar cupones

### 2. ❌ `/admin/gift-cards` - Gestión de Gift Cards
**Estado**: Página no implementada (404)
**Backend**: ✅ Controller existe
**Frontend**: ❌ Página falta
**Necesita**:
- Crear `frontend/src/pages/admin/GiftCards.tsx`
- Agregar ruta en `App.tsx`
- Tabla de gift cards con CRUD
- Formulario para crear/editar gift cards

---

## ⚠️ IMPORTANTE - Funcionalidades Parciales

### 3. ⚠️ Checkout - Aplicar Cupones
**Estado**: Comentado en código (TODO)
**Archivo**: `frontend/src/pages/storefront/Checkout.tsx` línea 69-81
**Backend**: ✅ Endpoint existe
**Frontend**: ⚠️ Código comentado
**Necesita**:
- Descomentar y conectar con backend
- Validación de cupones
- Actualización de totales

### 4. ⚠️ Checkout - Aplicar Gift Cards
**Estado**: Comentado en código (TODO)
**Archivo**: `frontend/src/pages/storefront/Checkout.tsx` línea 83-95
**Backend**: ✅ Endpoint existe
**Frontend**: ⚠️ Código comentado
**Necesita**:
- Descomentar y conectar con backend
- Validación de saldo
- Actualización de totales

### 5. ⚠️ Checkout - Pago Yape
**Estado**: Parcialmente implementado
**Archivo**: `frontend/src/pages/storefront/Checkout.tsx` línea 152-157
**Backend**: ⚠️ Método no existe (createYape)
**Frontend**: ⚠️ Código comentado
**Necesita**:
- Implementar flujo de pago Yape en frontend
- Mostrar instrucciones al usuario
- Estado de espera de aprobación

---

## 🟡 OPCIONALES - Mejoras UX

### 6. 🟡 Página de Confirmación de Pedido
**Estado**: No existe
**Necesita**:
- Crear `frontend/src/pages/storefront/OrderConfirmation.tsx`
- Mostrar resumen del pedido
- Número de tracking
- Próximos pasos

### 7. 🟡 Seguimiento de Pedido
**Estado**: Endpoint existe, página no
**Backend**: ✅ `/api/orders/:orderNumber/track`
**Frontend**: ❌ Página falta
**Necesita**:
- Crear `frontend/src/pages/storefront/OrderTracking.tsx`
- Buscar por número de orden
- Mostrar estado del envío

### 8. 🟡 Gestión de Categorías (Admin)
**Estado**: Backend existe, admin sin UI
**Backend**: ✅ CategoryController completo
**Frontend**: ❌ Página admin falta
**Necesita**:
- Crear `frontend/src/pages/admin/Categories.tsx`
- CRUD de categorías
- Agregar al menú admin

---

## 🔵 INTEGRACIONES - Configuración Requerida

### 9. 🔵 Culqi Payment Gateway
**Estado**: Código existe, requiere configuración
**Archivo**: `backend/src/main/java/com/mgstore/domain/service/CulqiService.java`
**Necesita**:
- Configurar API keys reales en `application.properties`
- Probar integración en sandbox
- Configurar webhook para confirmaciones

### 10. 🔵 WhatsApp Cloud API
**Estado**: Código existe, requiere configuración
**Archivo**: `backend/src/main/java/com/mgstore/domain/service/WhatsAppService.java`
**Necesita**:
- Configurar Meta Business Account
- Obtener tokens de acceso
- Configurar plantillas de mensajes
- Probar envío de notificaciones

---

## 📋 RESUMEN DE PRIORIDADES

### 🔴 Alta Prioridad (Bloqueantes)
1. ✅ Página Admin Coupons
2. ✅ Página Admin Gift Cards
3. ✅ Funcionalidad aplicar cupones en checkout
4. ✅ Funcionalidad aplicar gift cards en checkout

### 🟡 Media Prioridad (Mejoran experiencia)
5. Página de confirmación de pedido
6. Página de seguimiento de pedido
7. Flujo completo de pago Yape
8. Gestión de categorías en admin

### 🔵 Baja Prioridad (Para producción)
9. Configuración Culqi producción
10. Configuración WhatsApp producción
11. Modo oscuro
12. PWA
13. Analytics

---

## 🎯 PLAN DE IMPLEMENTACIÓN SUGERIDO

### Fase 1: Completar Admin Panel (2-3 horas)
- [ ] Crear página Admin Coupons
- [ ] Crear página Admin Gift Cards
- [ ] Agregar rutas en App.tsx
- [ ] Probar CRUD completo

### Fase 2: Completar Checkout (1-2 horas)
- [ ] Implementar aplicación de cupones
- [ ] Implementar aplicación de gift cards
- [ ] Actualizar cálculo de totales
- [ ] Probar flujo completo de compra

### Fase 3: Páginas Storefront (1-2 horas)
- [ ] Página de confirmación de pedido
- [ ] Página de seguimiento
- [ ] Mejorar UX de pago Yape

### Fase 4: Integraciones Producción (variable)
- [ ] Configurar Culqi producción
- [ ] Configurar WhatsApp
- [ ] Testing end-to-end

---

**Generado por**: Claude Code
**Última actualización**: 2026-01-23
