package com.mgstore.domain.service;

import com.mgstore.application.dto.request.CheckoutRequest;
import com.mgstore.application.dto.request.ShippingAddressRequest;
import com.mgstore.application.dto.response.OrderResponse;
import com.mgstore.domain.entity.*;
import com.mgstore.domain.repository.*;
import com.mgstore.infrastructure.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartService cartService;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ShippingMethodRepository shippingMethodRepository;

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private GiftCardRepository giftCardRepository;

    @Mock
    private ShippingRepository shippingRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ProductVariantRepository productVariantRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private ShippingAddressRepository shippingAddressRepository;

    @Mock
    private CouponUsageRepository couponUsageRepository;

    @Mock
    private GiftCardTransactionRepository giftCardTransactionRepository;

    @InjectMocks
    private OrderService orderService;

    private CheckoutRequest checkoutRequest;
    private Cart cart;
    private ShippingMethod shippingMethod;
    private Product product;
    private ProductVariant variant;
    private Size size;
    private Color color;

    @BeforeEach
    void setUp() {
        // Setup Size and Color
        size = Size.builder().id(1L).name("M").sortOrder(1).build();
        color = Color.builder().id(1L).name("Blue").hexCode("#0000FF").build();

        // Setup Product
        product = Product.builder()
                .id(1L)
                .name("Test Product")
                .retailPrice(BigDecimal.valueOf(100))
                .wholesalePrice(BigDecimal.valueOf(80))
                .wholesaleMinQuantity(6)
                .isActive(true)
                .variants(new ArrayList<>())
                .images(new ArrayList<>())
                .build();

        // Setup Variant
        variant = ProductVariant.builder()
                .id(1L)
                .product(product)
                .size(size)
                .color(color)
                .sku("TEST-001-M-BLUE")
                .stockQuantity(10)
                .reservedQuantity(0)
                .isActive(true)
                .build();

        // Setup Cart
        cart = new Cart();
        cart.setId(1L);
        cart.setSessionId("test-session");
        cart.setItems(new ArrayList<>());

        CartItem item = CartItem.builder()
                .id(1L)
                .cart(cart)
                .productVariant(variant)
                .quantity(2)
                .build();
        cart.getItems().add(item);

        // Setup Shipping Method
        shippingMethod = new ShippingMethod();
        shippingMethod.setId(1L);
        shippingMethod.setName("Standard Shipping");
        shippingMethod.setBasePrice(BigDecimal.valueOf(10));

        // Setup Checkout Request
        ShippingAddressRequest address = new ShippingAddressRequest();
        address.setFullName("John Doe");
        address.setPhone("+51999999999");
        address.setAddressLine1("Test Address");
        address.setCity("Lima");
        address.setState("Lima");
        address.setPostalCode("15001");
        address.setCountry("Peru");

        checkoutRequest = new CheckoutRequest();
        checkoutRequest.setSessionId("test-session");
        checkoutRequest.setCustomerName("John Doe");
        checkoutRequest.setCustomerEmail("john@example.com");
        checkoutRequest.setCustomerPhone("+51999999999");
        checkoutRequest.setShippingAddress(address);
        checkoutRequest.setShippingMethodId(1L);
        checkoutRequest.setPaymentMethod("CULQI");
    }

    @Test
    void testCreateOrder_Success() {
        // Arrange
        Order savedOrder = Order.builder()
                .id(1L)
                .orderNumber("ORD-TEST-001")
                .customerName("John Doe")
                .customerEmail("john@example.com")
                .customerPhone("+51999999999")
                .status("PENDING")
                .subtotal(BigDecimal.valueOf(200))
                .discountAmount(BigDecimal.ZERO)
                .shippingCost(BigDecimal.valueOf(10))
                .totalAmount(BigDecimal.valueOf(210))
                .items(new ArrayList<>())
                .build();

        when(cartRepository.findBySessionIdWithItems("test-session")).thenReturn(Optional.of(cart));
        when(shippingMethodRepository.findById(1L)).thenReturn(Optional.of(shippingMethod));
        when(productVariantRepository.save(any(ProductVariant.class))).thenReturn(variant);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(1L);
            return order;
        });
        when(orderRepository.findById(1L)).thenReturn(Optional.of(savedOrder));
        when(orderItemRepository.save(any(OrderItem.class))).thenReturn(new OrderItem());
        when(paymentRepository.save(any(Payment.class))).thenReturn(new Payment());

        // Act
        OrderResponse result = orderService.createOrder(checkoutRequest);

        // Assert
        assertNotNull(result);
        assertEquals("John Doe", result.getCustomerName());
        assertEquals("john@example.com", result.getCustomerEmail());
        verify(orderRepository, times(1)).save(any(Order.class));
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    void testCreateOrder_EmptyCart() {
        // Arrange
        cart.getItems().clear();
        when(cartRepository.findBySessionIdWithItems("test-session")).thenReturn(Optional.of(cart));

        // Act & Assert
        assertThrows(Exception.class, () -> {
            orderService.createOrder(checkoutRequest);
        });
    }

    @Test
    void testCreateOrder_CartNotFound() {
        // Arrange
        when(cartRepository.findBySessionIdWithItems("test-session")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            orderService.createOrder(checkoutRequest);
        });
    }

    @Test
    void testCreateOrder_WithCoupon() {
        // Arrange
        Coupon coupon = Coupon.builder()
                .id(1L)
                .code("DISCOUNT10")
                .type("PERCENTAGE")
                .value(BigDecimal.valueOf(10))
                .isActive(true)
                .minPurchaseAmount(BigDecimal.ZERO)
                .currentUses(0)
                .validFrom(java.time.LocalDateTime.now().minusDays(1))
                .validUntil(java.time.LocalDateTime.now().plusDays(30))
                .build();

        Order savedOrder = Order.builder()
                .id(1L)
                .orderNumber("ORD-TEST-002")
                .customerName("John Doe")
                .customerEmail("john@example.com")
                .customerPhone("+51999999999")
                .status("PENDING")
                .subtotal(BigDecimal.valueOf(200))
                .discountAmount(BigDecimal.valueOf(20))
                .shippingCost(BigDecimal.valueOf(10))
                .totalAmount(BigDecimal.valueOf(190))
                .items(new ArrayList<>())
                .build();

        checkoutRequest.setCouponCode("DISCOUNT10");

        when(cartRepository.findBySessionIdWithItems("test-session")).thenReturn(Optional.of(cart));
        when(shippingMethodRepository.findById(1L)).thenReturn(Optional.of(shippingMethod));
        when(productVariantRepository.save(any(ProductVariant.class))).thenReturn(variant);
        when(couponRepository.findByCode("DISCOUNT10")).thenReturn(Optional.of(coupon));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(1L);
            return order;
        });
        when(orderRepository.findById(1L)).thenReturn(Optional.of(savedOrder));
        when(orderItemRepository.save(any(OrderItem.class))).thenReturn(new OrderItem());
        when(paymentRepository.save(any(Payment.class))).thenReturn(new Payment());
        when(couponUsageRepository.save(any(CouponUsage.class))).thenReturn(new CouponUsage());

        // Act
        OrderResponse result = orderService.createOrder(checkoutRequest);

        // Assert
        assertNotNull(result);
        assertTrue(result.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void testGetOrderById_Success() {
        // Arrange
        Order order = Order.builder()
                .id(1L)
                .orderNumber("ORD-TEST-001")
                .customerName("John Doe")
                .customerEmail("john@example.com")
                .customerPhone("+51999999999")
                .status("PENDING")
                .subtotal(BigDecimal.valueOf(200))
                .discountAmount(BigDecimal.ZERO)
                .shippingCost(BigDecimal.valueOf(10))
                .totalAmount(BigDecimal.valueOf(210))
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        // Act
        OrderResponse result = orderService.getOrderById(1L);

        // Assert
        assertNotNull(result);
        assertEquals("John Doe", result.getCustomerName());
        verify(orderRepository, times(1)).findById(1L);
    }

    @Test
    void testGetOrderById_NotFound() {
        // Arrange
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            orderService.getOrderById(999L);
        });
    }

    @Test
    void testUpdateOrderStatus() {
        // Arrange
        Order order = Order.builder()
                .id(1L)
                .orderNumber("ORD-TEST-001")
                .customerName("John Doe")
                .customerEmail("john@example.com")
                .customerPhone("+51999999999")
                .status("PENDING")
                .subtotal(BigDecimal.valueOf(200))
                .discountAmount(BigDecimal.ZERO)
                .shippingCost(BigDecimal.valueOf(10))
                .totalAmount(BigDecimal.valueOf(210))
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        // Act
        OrderResponse result = orderService.updateOrderStatus(1L, "CONFIRMED");

        // Assert
        assertNotNull(result);
        assertEquals("CONFIRMED", order.getStatus());
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    void testGetAllOrders() {
        // Arrange
        Order order1 = Order.builder()
                .id(1L)
                .orderNumber("ORD-001")
                .customerName("John Doe")
                .customerEmail("john@example.com")
                .customerPhone("+51999999999")
                .status("PENDING")
                .subtotal(BigDecimal.valueOf(200))
                .discountAmount(BigDecimal.ZERO)
                .shippingCost(BigDecimal.valueOf(10))
                .totalAmount(BigDecimal.valueOf(210))
                .items(new ArrayList<>())
                .build();

        Order order2 = Order.builder()
                .id(2L)
                .orderNumber("ORD-002")
                .customerName("Jane Smith")
                .customerEmail("jane@example.com")
                .customerPhone("+51999999998")
                .status("CONFIRMED")
                .subtotal(BigDecimal.valueOf(150))
                .discountAmount(BigDecimal.ZERO)
                .shippingCost(BigDecimal.valueOf(10))
                .totalAmount(BigDecimal.valueOf(160))
                .items(new ArrayList<>())
                .build();

        List<Order> orders = List.of(order1, order2);
        when(orderRepository.findAll()).thenReturn(orders);

        // Act
        List<OrderResponse> result = orderService.getAllOrders();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(orderRepository, times(1)).findAll();
    }
}
