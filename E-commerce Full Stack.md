E-commerce Full Stack · UX Vendedor Senior · Producto Comercial Real
1️⃣ Visión del producto

Desarrollar una tienda online profesional de prendas de vestir, comparable en experiencia y funcionalidades a Shopify / Shopify Plus, pero completamente custom, enfocada en ventas, conversión, confianza y escalabilidad.

El sistema debe ser un producto comercial real, listo para producción, con frontend atractivo, backend robusto y panel administrativo completo.

2️⃣ Stack tecnológico obligatorio
Frontend (Storefront)

React 18

Vite

TypeScript

Tailwind CSS

React Router

Axios

Arquitectura por features

Mobile-first

SEO-friendly

Performance optimizada

Backend (Commerce Engine)

Java 21

Spring Boot 3

Spring Security (JWT)

Spring Data JPA

Hibernate

PostgreSQL

Maven

Infraestructura / Otros

Pagos: Culqi

Pagos manuales: Yape

WhatsApp Cloud API o proveedor equivalente

Variables de entorno

Arquitectura REST

Preparado para Docker y CI/CD

3️⃣ Roles del sistema
👤 Cliente / Usuario

Navega la tienda sin login

Busca y filtra productos

Visualiza productos con variantes (color, talla)

Agrega productos al carrito

Compra como invitado o registrado

Paga con Culqi o Yape

Consulta estado de su pedido

Recibe confirmaciones por WhatsApp

🛠️ Administrador (nivel Shopify Admin)

Login seguro

Gestión completa del catálogo

Gestión de pedidos

Consola de aprobación manual de pagos Yape

Gestión de envíos

Gestión de cupones y gift cards

Reportes y métricas de negocio

Control de precios retail y mayorista

4️⃣ Storefront – Website público (UX vendedor senior)
4.1 Home (landing de conversión)

Debe incluir:

Hero visual impactante

Propuesta de valor clara

CTA principal (“Comprar ahora”, “Ver colección”)

Productos destacados

Beneficios (envíos, calidad, garantía)

Secciones tipo Shopify:

Colecciones

Más vendidos

Novedades

UX:

Diseño emocional

Microinteracciones

Jerarquía visual clara

Alta velocidad de carga

4.2 Catálogo / Colecciones

Cada producto muestra:

Imagen

Nombre

Precio retail

Precio mayorista (condicional por cantidad)

Indicador de stock

Variantes disponibles

Filtros:

Categoría

Color

Talla

Precio

Disponibilidad

UX:

Grid profesional

Skeleton loaders

Filtros rápidos tipo Shopify

4.3 Página de producto (CRÍTICA)

Debe incluir:

Galería de imágenes

Selector de color

Selector de talla

Selector de cantidad

Precio dinámico

Indicadores de stock

Mensajes de urgencia (“Últimas unidades”)

Botón “Agregar al carrito”

Información de confianza

UX:

Copy vendedor

Feedback inmediato

Optimizada para mobile

5️⃣ Carrito de compras (nivel Shopify)

Persistente (localStorage + backend)

Edición de cantidades

Eliminación de ítems

Subtotal, descuentos, total

Visualización clara de variantes

UX:

Drawer lateral o página dedicada

CTA fuerte a checkout

Actualización en tiempo real

6️⃣ Checkout profesional

Flujo en pocos pasos

Datos solicitados:

Nombre

Email

Teléfono

Dirección de envío

Selección de método de envío

Resumen final del pedido

UX:

Sin fricción

Mensajes de seguridad

Diseño limpio y confiable

7️⃣ Pagos
7.1 Culqi (automático)

Integración completa

Confirmación inmediata

Estados:

PENDIENTE

PAGADO

FALLIDO

7.2 Yape (manual – CRÍTICO)

Flujo:

Usuario selecciona Yape

Se muestran:

Número Yape

Monto exacto

Código de pedido

Usuario realiza el pago

Pedido queda en estado:

PENDIENTE_YAPE

Administrador aprueba o rechaza el pago

Pedido pasa a:

PAGADO o CANCELADO

UX:

Instrucciones claras

Estado visible del pedido

Mensajes de confianza

8️⃣ Gestión de envíos (couriers locales)
Funcionalidades

Métodos de envío:

Olva Courier

Shalom

Envío estándar

Recojo en tienda (opcional)

Configuración de tarifas:

Precio fijo

Por zona

Por cantidad o peso

Estados de envío:

PENDIENTE

EN_PREPARACION

ENVIADO

ENTREGADO

Administrador puede:

Asignar courier

Registrar número de guía

Cambiar estado del envío

9️⃣ WhatsApp automático post-compra
Flujo

Cuando un pedido pasa a PAGADO, el sistema envía automáticamente un mensaje de WhatsApp con:

Confirmación de compra

Número de pedido

Resumen del pedido

Estado del envío

Información de contacto

Backend:

Servicio de notificaciones desacoplado

Templates configurables

Registro de mensajes enviados

10️⃣ Cupones de descuento

Administrador puede:

Crear cupones:

Código

Tipo (porcentaje / monto fijo)

Vigencia

Uso único o múltiple

Monto mínimo de compra

Activar / desactivar cupones

Frontend:

Campo para ingresar cupón

Validación en tiempo real

Total actualizado dinámicamente

11️⃣ Gift Cards

Administrador puede:

Crear gift cards con:

Código único

Monto

Fecha de expiración

Cliente puede:

Usar gift card en checkout

Aplicar saldo parcial o total

Reglas:

Saldo persistente

No reutilización indebida

12️⃣ Panel administrativo (nivel Shopify Plus)
Funcionalidades

Gestión de:

Categorías

Productos

Colores

Tallas

Stock por variante

Gestión de pedidos

Consola Yape

Gestión de envíos

Cupones y gift cards

Reportes y métricas

13️⃣ Reportes y métricas

Administrador puede ver:

Ventas totales

Ventas por período

Ventas por producto

Pagos Culqi vs Yape

Uso de cupones

Uso de gift cards

Costos de envío

Pedidos pendientes

14️⃣ Seguridad

JWT para admin

Protección de endpoints

Validación de inputs

CORS configurado

Control estricto de estados de pedido

15️⃣ UX / UI (REQUERIMIENTO CLAVE)

La tienda debe:

Verse moderna y confiable

Tener diseño vendedor senior

Usar copy persuasivo

Manejar estados:

Loading

Empty

Error

Success

Ser mobile-first

Optimizar conversión como Shopify

16️⃣ Testing

Tests básicos backend

Tests de componentes críticos frontend

17️⃣ Preparación para producción

Variables de entorno

Separación dev / prod

README profesional

Health check

Preparado para Docker y CI/CD

🧠 Instrucciones para Claude Code

Generar código real y ejecutable

No usar pseudocódigo

Separar frontend y backend

Explicar estructura de carpetas

Aplicar buenas prácticas

Pensar como plataforma e-commerce profesional tipo Shopify Plus

🎯 Resultado esperado

Una tienda online nivel Shopify Custom Plus, altamente vendedora, confiable, escalable, con UX senior, pagos locales, envíos reales, automatización por WhatsApp, promociones avanzadas y panel administrativo completo, lista para operar y escalar un negocio real.