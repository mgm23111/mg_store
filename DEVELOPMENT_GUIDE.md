# Guía de Desarrollo - MG Store

Esta guía te ayudará a continuar el desarrollo del sistema e-commerce siguiendo los patrones y arquitectura establecidos.

## 📐 Arquitectura del Sistema

### Backend: Arquitectura en Capas

```
Controller (HTTP) → Service (Business Logic) → Repository (Data Access) → Entity (JPA)
                         ↓
                    DTO Mappers
```

### Flujo de Request Típico

1. **Controller** recibe HTTP request
2. Valida datos con `@Valid`
3. Llama al **Service**
4. **Service** ejecuta lógica de negocio:
   - Llama a **Repository** para datos
   - Aplica reglas de negocio
   - Usa `@Transactional` para atomicidad
5. **Service** retorna DTO
6. **Controller** envuelve en `ApiResponse` y retorna HTTP response

## 🔨 Guía Paso a Paso: Implementar una Feature

### Ejemplo: Implementar ProductService y ProductController

#### Paso 1: Crear el Service

```java
// backend/src/main/java/com/mgstore/domain/service/ProductService.java
package com.mgstore.domain.service;

import com.mgstore.application.dto.request.ProductRequest;
import com.mgstore.application.dto.response.ProductResponse;
import com.mgstore.domain.entity.Product;
import com.mgstore.domain.entity.Category;
import com.mgstore.domain.repository.ProductRepository;
import com.mgstore.domain.repository.CategoryRepository;
import com.mgstore.infrastructure.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlugWithDetails(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));

        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        // Validate category if provided
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        }

        // Create product
        Product product = Product.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .category(category)
                .retailPrice(request.getRetailPrice())
                .wholesalePrice(request.getWholesalePrice())
                .wholesaleMinQuantity(request.getWholesaleMinQuantity())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .metaTitle(request.getMetaTitle())
                .metaDescription(request.getMetaDescription())
                .build();

        product = productRepository.save(product);

        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // Update fields
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setRetailPrice(request.getRetailPrice());
        product.setWholesalePrice(request.getWholesalePrice());
        product.setWholesaleMinQuantity(request.getWholesaleMinQuantity());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }

        if (request.getIsFeatured() != null) {
            product.setIsFeatured(request.getIsFeatured());
        }

        product = productRepository.save(product);

        return mapToResponse(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        productRepository.delete(product);
    }

    // Helper method to map Entity to DTO
    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .retailPrice(product.getRetailPrice())
                .wholesalePrice(product.getWholesalePrice())
                .wholesaleMinQuantity(product.getWholesaleMinQuantity())
                .isActive(product.getIsActive())
                .isFeatured(product.getIsFeatured())
                .metaTitle(product.getMetaTitle())
                .metaDescription(product.getMetaDescription())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
```

#### Paso 2: Crear el Controller

```java
// backend/src/main/java/com/mgstore/infrastructure/controller/ProductController.java
package com.mgstore.infrastructure.controller;

import com.mgstore.application.dto.request.ProductRequest;
import com.mgstore.application.dto.response.ApiResponse;
import com.mgstore.application.dto.response.ProductResponse;
import com.mgstore.domain.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    // PUBLIC ENDPOINTS

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts() {
        List<ProductResponse> products = productService.getAllProducts();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/products/{slug}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySlug(@PathVariable String slug) {
        ProductResponse product = productService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    // ADMIN ENDPOINTS

    @PostMapping("/admin/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created successfully", product));
    }

    @PutMapping("/admin/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {

        ProductResponse product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
    }

    @DeleteMapping("/admin/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }
}
```

#### Paso 3: Probar los Endpoints

```bash
# 1. Obtener todos los productos (público)
curl http://localhost:8080/api/products

# 2. Login admin para obtener token
curl -X POST http://localhost:8080/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mgstore.com","password":"admin123"}'

# Guardar el token de la respuesta

# 3. Crear producto (requiere token)
curl -X POST http://localhost:8080/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TU_TOKEN}" \
  -d '{
    "name": "Camiseta Básica",
    "slug": "camiseta-basica",
    "description": "Camiseta de algodón 100%",
    "categoryId": 1,
    "retailPrice": 50.00,
    "wholesalePrice": 35.00,
    "wholesaleMinQuantity": 6,
    "isActive": true,
    "isFeatured": false
  }'
```

## 🎯 Implementar OrderService (Lógica Crítica)

### Componentes Necesarios

1. **CartItemRequest.java** (DTO)
2. **CartService.java** (gestión de carrito)
3. **OrderService.java** (lógica de órdenes)
4. **OrderController.java** (checkout endpoint)

### Lógica de Stock Crítica

```java
@Transactional
public OrderResponse createOrder(CheckoutRequest request) {
    // 1. Obtener carrito
    Cart cart = getCart(request.getSessionId());

    // 2. Validar stock disponible para todos los items
    for (CartItem item : cart.getItems()) {
        ProductVariant variant = item.getProductVariant();
        if (variant.getAvailableStock() < item.getQuantity()) {
            throw new InsufficientStockException(
                variant.getProduct().getName(),
                item.getQuantity(),
                variant.getAvailableStock()
            );
        }
    }

    // 3. RESERVAR stock (NO deducir aún)
    for (CartItem item : cart.getItems()) {
        ProductVariant variant = item.getProductVariant();
        variant.reserveStock(item.getQuantity());
        productVariantRepository.save(variant);
    }

    // 4. Crear orden con status PENDING o PENDING_YAPE
    String status = request.getPaymentMethod().equals("YAPE")
        ? Constants.ORDER_STATUS_PENDING_YAPE
        : Constants.ORDER_STATUS_PENDING;

    Order order = Order.builder()
        .orderNumber(CodeGenerator.generateOrderNumber())
        .customerName(request.getCustomerName())
        .customerEmail(request.getCustomerEmail())
        .customerPhone(request.getCustomerPhone())
        .status(status)
        .subtotal(calculateSubtotal(cart))
        .shippingCost(getShippingCost(request.getShippingMethodId()))
        .totalAmount(calculateTotal(...))
        .build();

    order = orderRepository.save(order);

    // 5. Crear order items (snapshot de productos)
    for (CartItem item : cart.getItems()) {
        createOrderItem(order, item);
    }

    // 6. Crear shipping address
    createShippingAddress(order, request.getShippingAddress());

    // 7. Crear payment record
    createPayment(order, request.getPaymentMethod());

    // 8. Limpiar carrito
    cartItemRepository.deleteByCartId(cart.getId());

    return mapToResponse(order);
}

// Cuando el pago es aprobado (Culqi o Yape)
@Transactional
public void approvePayment(Long orderId) {
    Order order = orderRepository.findById(orderId)
        .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

    // DEDUCIR stock y liberar reservas
    for (OrderItem item : order.getItems()) {
        ProductVariant variant = item.getProductVariant();
        variant.deductStock(item.getQuantity()); // Deduce stock Y libera reserva
        productVariantRepository.save(variant);
    }

    // Actualizar estado de orden
    order.setStatus(Constants.ORDER_STATUS_PAID);
    order.setPaidAt(LocalDateTime.now());
    orderRepository.save(order);

    // ENVIAR WHATSAPP
    whatsAppService.sendOrderConfirmation(order);
}

// Si el pago es rechazado o cancelado
@Transactional
public void cancelOrder(Long orderId) {
    Order order = orderRepository.findById(orderId)
        .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

    // LIBERAR stock reservado
    for (OrderItem item : order.getItems()) {
        ProductVariant variant = item.getProductVariant();
        variant.releaseReservedStock(item.getQuantity());
        productVariantRepository.save(variant);
    }

    // Actualizar estado
    order.setStatus(Constants.ORDER_STATUS_CANCELLED);
    orderRepository.save(order);
}
```

## 🔌 Implementar Integración Culqi

### Paso 1: Crear DTOs de Culqi

```java
// CulqiChargeRequest.java
@Data
@Builder
public class CulqiChargeRequest {
    private Integer amount;           // En centavos (100 = S/ 1.00)
    private String currency_code;     // "PEN"
    private String email;
    private String source_id;         // Token del frontend
    private Map<String, String> metadata;
}

// CulqiChargeResponse.java
@Data
public class CulqiChargeResponse {
    private String id;
    private String object;
    private Integer amount;
    private String currency_code;
    private String email;
    private String outcome;
    private Map<String, Object> metadata;
}
```

### Paso 2: Crear CulqiService

```java
@Service
public class CulqiService {

    @Value("${culqi.secret.key}")
    private String secretKey;

    @Value("${culqi.api.url}")
    private String apiUrl;

    public CulqiChargeResponse createCharge(CulqiChargeRequest request) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + secretKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<CulqiChargeRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<CulqiChargeResponse> response = restTemplate.exchange(
                    apiUrl + "/charges",
                    HttpMethod.POST,
                    entity,
                    CulqiChargeResponse.class
            );

            return response.getBody();
        } catch (Exception e) {
            throw new PaymentException("Error processing Culqi payment: " + e.getMessage(), e);
        }
    }
}
```

### Paso 3: Usar en PaymentController

```java
@PostMapping("/payments/culqi")
public ResponseEntity<ApiResponse<PaymentResponse>> processCulqiPayment(
        @RequestBody CulqiPaymentRequest request) {

    // 1. Obtener orden
    Order order = orderService.getOrderById(request.getOrderId());

    // 2. Crear cargo en Culqi
    CulqiChargeRequest culqiRequest = CulqiChargeRequest.builder()
            .amount((int) (order.getTotalAmount().doubleValue() * 100))  // Convertir a centavos
            .currency_code("PEN")
            .email(order.getCustomerEmail())
            .source_id(request.getToken())  // Token del frontend
            .metadata(Map.of("order_id", order.getOrderNumber()))
            .build();

    CulqiChargeResponse culqiResponse = culqiService.createCharge(culqiRequest);

    // 3. Guardar payment
    Payment payment = Payment.builder()
            .order(order)
            .paymentMethod(Constants.PAYMENT_METHOD_CULQI)
            .amount(order.getTotalAmount())
            .status(Constants.PAYMENT_STATUS_COMPLETED)
            .culqiChargeId(culqiResponse.getId())
            .completedAt(LocalDateTime.now())
            .build();

    paymentRepository.save(payment);

    // 4. Aprobar pago (deducir stock, enviar WhatsApp)
    orderService.approvePayment(order.getId());

    return ResponseEntity.ok(ApiResponse.success("Payment processed successfully"));
}
```

## 📱 Frontend: Estructura de Componentes

### Ejemplo: ProductCard Component

```tsx
// frontend/src/features/products/components/ProductCard.tsx
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    retailPrice: number;
    wholesalePrice: number;
    images: Array<{ url: string; altText: string }>;
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];

  return (
    <Link to={`/producto/${product.slug}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        {/* Image */}
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
          <img
            src={primaryImage?.url || '/placeholder.jpg'}
            alt={primaryImage?.altText || product.name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
            {product.name}
          </h3>

          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-xl font-bold text-primary-600">
              S/ {product.retailPrice.toFixed(2)}
            </span>
            {product.wholesalePrice && (
              <span className="text-sm text-gray-500">
                S/ {product.wholesalePrice.toFixed(2)} (x6+)
              </span>
            )}
          </div>

          <button className="mt-4 w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
            Ver Detalles
          </button>
        </div>
      </div>
    </Link>
  );
};
```

### Ejemplo: useProducts Hook

```typescript
// frontend/src/features/products/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useProducts = (filters?: { categoryId?: number; search?: string }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/products', { params: filters });
        setProducts(response.data.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar productos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  return { products, loading, error };
};
```

## 🧪 Testing

### Backend: Service Test

```java
@SpringBootTest
class ProductServiceTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @Test
    void testCreateProduct() {
        ProductRequest request = ProductRequest.builder()
                .name("Test Product")
                .slug("test-product")
                .retailPrice(BigDecimal.valueOf(50.00))
                .build();

        ProductResponse response = productService.createProduct(request);

        assertNotNull(response.getId());
        assertEquals("Test Product", response.getName());
    }

    @Test
    void testGetProductBySlug() {
        ProductResponse response = productService.getProductBySlug("test-product");

        assertNotNull(response);
        assertEquals("Test Product", response.getName());
    }
}
```

## 📚 Recursos Adicionales

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [Culqi API Docs](https://docs.culqi.com/)
- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)

---

**Última actualización**: 2026-01-09
