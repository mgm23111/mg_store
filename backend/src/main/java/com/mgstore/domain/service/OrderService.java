package com.mgstore.domain.service;

import com.mgstore.application.dto.request.CheckoutRequest;
import com.mgstore.application.dto.response.OrderResponse;
import com.mgstore.application.dto.response.OrderItemResponse;
import com.mgstore.application.dto.response.ShippingAddressResponse;
import com.mgstore.domain.entity.*;
import com.mgstore.domain.repository.*;
import com.mgstore.infrastructure.exception.InsufficientStockException;
import com.mgstore.infrastructure.exception.ResourceNotFoundException;
import com.mgstore.infrastructure.exception.BusinessException;
import com.mgstore.util.CodeGenerator;
import com.mgstore.util.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private ShippingMethodRepository shippingMethodRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CouponUsageRepository couponUsageRepository;

    @Autowired
    private GiftCardRepository giftCardRepository;

    @Autowired
    private GiftCardTransactionRepository giftCardTransactionRepository;

    @Autowired
    private ShippingRepository shippingRepository;

    /**
     * Create order from cart (checkout)
     * CRITICAL: Reserves stock but doesn't deduct until payment is approved
     */
    @Transactional
    public OrderResponse createOrder(CheckoutRequest request) {
        // 1. Get cart with items
        Cart cart = cartRepository.findBySessionIdWithItems(request.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "sessionId", request.getSessionId()));

        if (cart.getItems().isEmpty()) {
            throw new BusinessException("Cannot create order with empty cart");
        }

        // 2. Validate stock availability for all items
        for (CartItem item : cart.getItems()) {
            ProductVariant variant = item.getProductVariant();
            if (!variant.getIsActive()) {
                throw new BusinessException("Product variant " + variant.getSku() + " is not available");
            }
            if (variant.getAvailableStock() < item.getQuantity()) {
                throw new InsufficientStockException(
                        variant.getProduct().getName(),
                        item.getQuantity(),
                        variant.getAvailableStock()
                );
            }
        }

        // 3. RESERVE stock (critical - don't deduct yet)
        for (CartItem item : cart.getItems()) {
            ProductVariant variant = item.getProductVariant();
            variant.reserveStock(item.getQuantity());
            productVariantRepository.save(variant);
        }

        // 4. Calculate pricing
        BigDecimal subtotal = calculateSubtotal(cart);
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal shippingCost = getShippingCost(request.getShippingMethodId());

        // Apply coupon if provided
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            discountAmount = applyCoupon(request.getCouponCode(), subtotal);
        }

        // Apply gift card if provided (deducted from total)
        BigDecimal giftCardAmount = BigDecimal.ZERO;
        if (request.getGiftCardCode() != null && !request.getGiftCardCode().isBlank()) {
            giftCardAmount = applyGiftCard(request.getGiftCardCode(), subtotal.add(shippingCost).subtract(discountAmount));
        }

        BigDecimal totalAmount = subtotal.add(shippingCost).subtract(discountAmount).subtract(giftCardAmount);

        // 5. Determine order status based on payment method
        String orderStatus = request.getPaymentMethod().equalsIgnoreCase(Constants.PAYMENT_METHOD_YAPE)
                ? Constants.ORDER_STATUS_PENDING_YAPE
                : Constants.ORDER_STATUS_PENDING;

        // 6. Create order
        Order order = Order.builder()
                .orderNumber(CodeGenerator.generateOrderNumber())
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .customerPhone(request.getCustomerPhone())
                .customerDocumentType(request.getCustomerDocumentType())
                .customerDocumentNumber(request.getCustomerDocumentNumber())
                .status(orderStatus)
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .shippingCost(shippingCost)
                .totalAmount(totalAmount)
                .build();

        order = orderRepository.save(order);

        // 7. Create order items (snapshot of products at purchase time)
        for (CartItem cartItem : cart.getItems()) {
            createOrderItem(order, cartItem);
        }

        // 8. Create shipping address
        createShippingAddress(order, request);

        // 9. Create shipping record
        createShipping(order, request.getShippingMethodId());

        // 10. Create initial payment record
        createPayment(order, request.getPaymentMethod());

        // 11. Record coupon usage if applicable
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            recordCouponUsage(request.getCouponCode(), order);
        }

        // 12. Record gift card transaction if applicable
        if (request.getGiftCardCode() != null && !request.getGiftCardCode().isBlank() && giftCardAmount.compareTo(BigDecimal.ZERO) > 0) {
            recordGiftCardTransaction(request.getGiftCardCode(), order, giftCardAmount);
        }

        // 13. Clear cart
        cartItemRepository.deleteByCartId(cart.getId());

        // Reload order with all relationships
        final Long orderId = order.getId();
        order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        return mapToResponse(order);
    }

    /**
     * Approve payment - DEDUCT stock and update order status
     * Called when payment is successful (Culqi or manual Yape approval)
     */
    @Transactional
    public void approvePayment(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // DEDUCT stock and release reservations
        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getProductVariant();
            variant.deductStock(item.getQuantity());
            productVariantRepository.save(variant);
        }

        // Update order status
        order.setStatus(Constants.ORDER_STATUS_PAID);
        order.setPaidAt(LocalDateTime.now());
        orderRepository.save(order);

        // Update payment status
        Payment payment = paymentRepository.findByOrderId(orderId).stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", orderId));
        payment.setStatus(Constants.PAYMENT_STATUS_COMPLETED);
        payment.setCompletedAt(LocalDateTime.now());
        paymentRepository.save(payment);
    }

    /**
     * Cancel order - RELEASE reserved stock
     * Called when payment fails or order is cancelled
     */
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // RELEASE reserved stock
        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getProductVariant();
            variant.releaseReservedStock(item.getQuantity());
            productVariantRepository.save(variant);
        }

        // Update order status
        order.setStatus(Constants.ORDER_STATUS_CANCELLED);
        orderRepository.save(order);
    }

    /**
     * Get order by ID
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return mapToResponse(order);
    }

    /**
     * Get order by order number
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));
        return mapToResponse(order);
    }

    /**
     * Get all orders (admin)
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update order status (admin)
     */
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setStatus(status);

        if (status.equals(Constants.ORDER_STATUS_SHIPPED)) {
            order.setShippedAt(LocalDateTime.now());
        } else if (status.equals(Constants.ORDER_STATUS_DELIVERED)) {
            order.setDeliveredAt(LocalDateTime.now());
        }

        order = orderRepository.save(order);
        return mapToResponse(order);
    }

    // Helper methods

    private void createOrderItem(Order order, CartItem cartItem) {
        ProductVariant variant = cartItem.getProductVariant();
        Product product = variant.getProduct();

        BigDecimal unitPrice = getUnitPrice(product, cartItem.getQuantity());
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));

        OrderItem orderItem = OrderItem.builder()
                .order(order)
                .productVariant(variant)
                .productName(product.getName())
                .colorName(variant.getColor() != null ? variant.getColor().getName() : null)
                .sizeName(variant.getSize() != null ? variant.getSize().getName() : null)
                .sku(variant.getSku())
                .unitPrice(unitPrice)
                .quantity(cartItem.getQuantity())
                .subtotal(subtotal)
                .build();

        orderItemRepository.save(orderItem);
    }

    private void createShippingAddress(Order order, CheckoutRequest request) {
        ShippingAddress address = ShippingAddress.builder()
                .order(order)
                .fullName(request.getShippingAddress().getFullName())
                .phone(request.getShippingAddress().getPhone())
                .addressLine1(request.getShippingAddress().getAddressLine1())
                .addressLine2(request.getShippingAddress().getAddressLine2())
                .city(request.getShippingAddress().getCity())
                .state(request.getShippingAddress().getState())
                .postalCode(request.getShippingAddress().getPostalCode())
                .country(request.getShippingAddress().getCountry() != null ? request.getShippingAddress().getCountry() : "Perú")
                .notes(request.getShippingAddress().getNotes())
                .build();

        // Note: ShippingAddress will be automatically saved due to cascade relationship
        order.setShippingAddress(address);
    }

    private void createPayment(Order order, String paymentMethod) {
        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(paymentMethod)
                .amount(order.getTotalAmount())
                .status(Constants.PAYMENT_STATUS_PENDING)
                .build();

        paymentRepository.save(payment);
    }

    private void createShipping(Order order, Long shippingMethodId) {
        ShippingMethod shippingMethod = shippingMethodRepository.findById(shippingMethodId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipping method", "id", shippingMethodId));

        Shipping shipping = Shipping.builder()
                .order(order)
                .shippingMethod(shippingMethod)
                .shippingMethodName(shippingMethod.getName())
                .status("PENDING")
                .build();

        shippingRepository.save(shipping);
    }

    private BigDecimal calculateSubtotal(Cart cart) {
        return cart.getItems().stream()
                .map(item -> {
                    Product product = item.getProductVariant().getProduct();
                    BigDecimal unitPrice = getUnitPrice(product, item.getQuantity());
                    return unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal getUnitPrice(Product product, int quantity) {
        if (product.getWholesalePrice() == null) {
            return product.getRetailPrice();
        }

        int minQty = product.getWholesaleMinQuantity() != null ? product.getWholesaleMinQuantity() : 6;

        // Offer price (min qty = 1) can be scheduled by date range
        if (minQty <= 1) {
            if (isOfferScheduleActive(product, LocalDateTime.now())
                    && product.getWholesalePrice().compareTo(product.getRetailPrice()) < 0) {
                return product.getWholesalePrice();
            }
            return product.getRetailPrice();
        }

        // Standard wholesale by quantity
        if (quantity >= minQty) {
            return product.getWholesalePrice();
        }
        return product.getRetailPrice();
    }

    private boolean isOfferScheduleActive(Product product, LocalDateTime now) {
        if (product.getOfferStartAt() != null && now.isBefore(product.getOfferStartAt())) {
            return false;
        }
        if (product.getOfferEndAt() != null && now.isAfter(product.getOfferEndAt())) {
            return false;
        }
        return true;
    }

    private BigDecimal getShippingCost(Long shippingMethodId) {
        ShippingMethod method = shippingMethodRepository.findById(shippingMethodId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipping method", "id", shippingMethodId));
        return method.getBasePrice();
    }

    private BigDecimal applyCoupon(String couponCode, BigDecimal subtotal) {
        Coupon coupon = couponRepository.findByCode(couponCode)
                .orElseThrow(() -> new BusinessException("Invalid coupon code"));

        // Validate coupon
        if (!coupon.getIsActive()) {
            throw new BusinessException("Coupon is not active");
        }
        if (coupon.getValidUntil() != null && coupon.getValidUntil().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Coupon has expired");
        }
        if (coupon.getMaxUses() != null && coupon.getCurrentUses() >= coupon.getMaxUses()) {
            throw new BusinessException("Coupon usage limit reached");
        }
        if (subtotal.compareTo(coupon.getMinPurchaseAmount()) < 0) {
            throw new BusinessException("Minimum purchase amount not met for this coupon");
        }

        return coupon.calculateDiscount(subtotal);
    }

    private BigDecimal applyGiftCard(String giftCardCode, BigDecimal totalAmount) {
        GiftCard giftCard = giftCardRepository.findByCode(giftCardCode)
                .orElseThrow(() -> new BusinessException("Invalid gift card code"));

        // Validate gift card
        if (!giftCard.getIsActive()) {
            throw new BusinessException("Gift card is not active");
        }
        if (giftCard.getValidUntil() != null && giftCard.getValidUntil().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Gift card has expired");
        }
        if (giftCard.getCurrentBalance().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Gift card has no remaining balance");
        }

        // Apply gift card (use minimum of gift card balance or total amount)
        return giftCard.apply(totalAmount);
    }

    private void recordCouponUsage(String couponCode, Order order) {
        Coupon coupon = couponRepository.findByCode(couponCode)
                .orElseThrow(() -> new BusinessException("Invalid coupon code"));

        CouponUsage usage = CouponUsage.builder()
                .coupon(coupon)
                .order(order)
                .build();

        couponUsageRepository.save(usage);

        // Increment usage count
        coupon.setCurrentUses(coupon.getCurrentUses() + 1);
        couponRepository.save(coupon);
    }

    private void recordGiftCardTransaction(String giftCardCode, Order order, BigDecimal amount) {
        GiftCard giftCard = giftCardRepository.findByCode(giftCardCode)
                .orElseThrow(() -> new BusinessException("Invalid gift card code"));

        BigDecimal balanceBefore = giftCard.getCurrentBalance();
        BigDecimal balanceAfter = balanceBefore.subtract(amount);

        GiftCardTransaction transaction = GiftCardTransaction.builder()
                .giftCard(giftCard)
                .order(order)
                .type("USAGE")
                .amount(amount)
                .balanceAfter(balanceAfter)
                .build();

        giftCardTransactionRepository.save(transaction);

        // Deduct from gift card balance
        giftCard.setCurrentBalance(giftCard.getCurrentBalance().subtract(amount));
        giftCardRepository.save(giftCard);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::mapOrderItemToResponse)
                .collect(Collectors.toList());

        // Get payment info from first payment if exists
        Payment payment = order.getPayments() != null && !order.getPayments().isEmpty()
                ? order.getPayments().get(0)
                : null;

        String paymentStatus = payment != null ? payment.getStatus() : "PENDING";
        String paymentMethod = payment != null ? payment.getPaymentMethod() : null;

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerName(order.getCustomerName())
                .customerEmail(order.getCustomerEmail())
                .customerPhone(order.getCustomerPhone())
                .customerDocumentType(order.getCustomerDocumentType())
                .customerDocumentNumber(order.getCustomerDocumentNumber())
                .status(order.getStatus())
                .paymentStatus(paymentStatus)
                .paymentMethod(paymentMethod)
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .shippingCost(order.getShippingCost())
                .totalAmount(order.getTotalAmount())
                .items(items)
                .shippingAddress(order.getShippingAddress() != null ? mapShippingAddressToResponse(order.getShippingAddress()) : null)
                .createdAt(order.getCreatedAt())
                .paidAt(order.getPaidAt())
                .shippedAt(order.getShippedAt())
                .deliveredAt(order.getDeliveredAt())
                .build();
    }

    private OrderItemResponse mapOrderItemToResponse(OrderItem item) {
        // Build variantInfo string
        StringBuilder variantInfo = new StringBuilder();
        if (item.getColorName() != null && !item.getColorName().isEmpty()) {
            variantInfo.append("Color: ").append(item.getColorName());
        }
        if (item.getSizeName() != null && !item.getSizeName().isEmpty()) {
            if (variantInfo.length() > 0) variantInfo.append(", ");
            variantInfo.append("Size: ").append(item.getSizeName());
        }

        return OrderItemResponse.builder()
                .id(item.getId())
                .productName(item.getProductName())
                .colorName(item.getColorName())
                .sizeName(item.getSizeName())
                .variantInfo(variantInfo.toString())
                .sku(item.getSku())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .build();
    }

    private ShippingAddressResponse mapShippingAddressToResponse(ShippingAddress address) {
        return ShippingAddressResponse.builder()
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .notes(address.getNotes())
                .build();
    }
}
