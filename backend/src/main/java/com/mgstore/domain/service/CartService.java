package com.mgstore.domain.service;

import com.mgstore.application.dto.request.AddToCartRequest;
import com.mgstore.application.dto.response.*;
import com.mgstore.domain.entity.*;
import com.mgstore.domain.repository.*;
import com.mgstore.infrastructure.exception.InsufficientStockException;
import com.mgstore.infrastructure.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    /**
     * Get or create cart by session ID
     */
    @Transactional
    public CartResponse getOrCreateCart(String sessionId) {
        Cart cart = cartRepository.findBySessionIdWithItems(sessionId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .sessionId(sessionId)
                            .build();
                    return cartRepository.save(newCart);
                });

        return mapToResponse(cart);
    }

    /**
     * Get cart by session ID
     */
    @Transactional(readOnly = true)
    public CartResponse getCartBySessionId(String sessionId) {
        Cart cart = cartRepository.findBySessionIdWithItems(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "sessionId", sessionId));

        return mapToResponse(cart);
    }

    /**
     * Add item to cart
     */
    @Transactional
    public CartResponse addToCart(AddToCartRequest request) {
        // Get or create cart
        Cart cart = cartRepository.findBySessionId(request.getSessionId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .sessionId(request.getSessionId())
                            .build();
                    return cartRepository.save(newCart);
                });

        // Get product variant
        ProductVariant variant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product variant", "id", request.getProductVariantId()));

        // Check if variant is active
        if (!variant.getIsActive()) {
            throw new IllegalArgumentException("Product variant is not available");
        }

        // Check stock availability
        if (variant.getAvailableStock() < request.getQuantity()) {
            throw new InsufficientStockException(
                    variant.getProduct().getName(),
                    request.getQuantity(),
                    variant.getAvailableStock()
            );
        }

        // Check if item already exists in cart
        CartItem cartItem = cartItemRepository.findByCartIdAndProductVariantId(cart.getId(), variant.getId())
                .orElse(null);

        if (cartItem != null) {
            // Update quantity
            int newQuantity = cartItem.getQuantity() + request.getQuantity();

            // Check stock for new quantity
            if (variant.getAvailableStock() < newQuantity) {
                throw new InsufficientStockException(
                        variant.getProduct().getName(),
                        newQuantity,
                        variant.getAvailableStock()
                );
            }

            cartItem.setQuantity(newQuantity);
            cartItemRepository.save(cartItem);
        } else {
            // Create new cart item
            cartItem = CartItem.builder()
                    .cart(cart)
                    .productVariant(variant)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(cartItem);
        }

        // Reload cart with items
        cart = cartRepository.findBySessionIdWithItems(request.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "sessionId", request.getSessionId()));

        return mapToResponse(cart);
    }

    /**
     * Update cart item quantity
     */
    @Transactional
    public CartResponse updateCartItem(String sessionId, Long cartItemId, Integer quantity) {
        Cart cart = cartRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "sessionId", sessionId));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", "id", cartItemId));

        // Verify cart item belongs to this cart
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Cart item does not belong to this cart");
        }

        // Check stock availability
        ProductVariant variant = cartItem.getProductVariant();
        if (variant.getAvailableStock() < quantity) {
            throw new InsufficientStockException(
                    variant.getProduct().getName(),
                    quantity,
                    variant.getAvailableStock()
            );
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        // Reload cart with items
        cart = cartRepository.findBySessionIdWithItems(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "sessionId", sessionId));

        return mapToResponse(cart);
    }

    /**
     * Remove item from cart
     */
    @Transactional
    public CartResponse removeCartItem(String sessionId, Long cartItemId) {
        Cart cart = cartRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "sessionId", sessionId));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", "id", cartItemId));

        // Verify cart item belongs to this cart
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Cart item does not belong to this cart");
        }

        cartItemRepository.delete(cartItem);

        // Reload cart with items
        cart = cartRepository.findBySessionIdWithItems(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "sessionId", sessionId));

        return mapToResponse(cart);
    }

    /**
     * Clear cart
     */
    @Transactional
    public void clearCart(String sessionId) {
        Cart cart = cartRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "sessionId", sessionId));

        cartItemRepository.deleteByCartId(cart.getId());
    }

    /**
     * Get cart by ID (internal use)
     */
    @Transactional(readOnly = true)
    public Cart getCartById(Long cartId) {
        return cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "id", cartId));
    }

    // Helper methods

    private CartResponse mapToResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(this::mapCartItemToResponse)
                .collect(Collectors.toList());

        BigDecimal subtotal = calculateSubtotal(cart);
        int totalItems = cart.getItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        // Calculate discount from applied coupons and gift cards
        BigDecimal discount = calculateCartDiscount(cart, subtotal);
        BigDecimal total = subtotal.subtract(discount);

        // Ensure total is not negative
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            total = BigDecimal.ZERO;
        }

        return CartResponse.builder()
                .id(cart.getId())
                .sessionId(cart.getSessionId())
                .customerId(cart.getCustomer() != null ? cart.getCustomer().getId() : null)
                .items(items)
                .subtotal(subtotal)
                .discount(discount)
                .total(total)
                .totalItems(totalItems)
                .appliedCouponCode(cart.getAppliedCoupon() != null ? cart.getAppliedCoupon().getCode() : null)
                .appliedGiftCardCode(cart.getAppliedGiftCard() != null ? cart.getAppliedGiftCard().getCode() : null)
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .build();
    }

    /**
     * Calculate total discount from applied coupon and gift card
     */
    private BigDecimal calculateCartDiscount(Cart cart, BigDecimal subtotal) {
        BigDecimal totalDiscount = BigDecimal.ZERO;

        // Apply coupon discount
        if (cart.getAppliedCoupon() != null) {
            Coupon coupon = cart.getAppliedCoupon();

            // Verify coupon is still valid
            if (coupon.isValid() && subtotal.compareTo(coupon.getMinPurchaseAmount()) >= 0) {
                if ("PERCENTAGE".equals(coupon.getType())) {
                    // Percentage discount
                    BigDecimal percentage = coupon.getValue().divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP);
                    totalDiscount = totalDiscount.add(subtotal.multiply(percentage));
                } else if ("FIXED_AMOUNT".equals(coupon.getType())) {
                    // Fixed amount discount
                    totalDiscount = totalDiscount.add(coupon.getValue());
                }
            }
        }

        // Apply gift card discount (up to available balance)
        if (cart.getAppliedGiftCard() != null) {
            GiftCard giftCard = cart.getAppliedGiftCard();

            // Verify gift card is still valid
            if (giftCard.isValid()) {
                BigDecimal remainingAmount = subtotal.subtract(totalDiscount);
                BigDecimal giftCardDiscount = giftCard.getCurrentBalance().min(remainingAmount);
                totalDiscount = totalDiscount.add(giftCardDiscount);
            }
        }

        return totalDiscount;
    }

    private CartItemResponse mapCartItemToResponse(CartItem item) {
        ProductVariant variant = item.getProductVariant();
        Product product = variant.getProduct();

        // Determine unit price based on quantity (retail vs wholesale)
        BigDecimal unitPrice = getUnitPrice(product, item.getQuantity());
        BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

        // Get primary image URL
        String imageUrl = product.getImages().stream()
                .filter(ProductImage::getIsPrimary)
                .findFirst()
                .map(ProductImage::getUrl)
                .orElse(product.getImages().isEmpty() ? null : product.getImages().get(0).getUrl());

        // Build variantInfo string
        StringBuilder variantInfo = new StringBuilder();
        if (variant.getColor() != null) {
            variantInfo.append("Color: ").append(variant.getColor().getName());
        }
        if (variant.getSize() != null) {
            if (variantInfo.length() > 0) variantInfo.append(", ");
            variantInfo.append("Size: ").append(variant.getSize().getName());
        }

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productSlug(product.getSlug())
                .variantId(variant.getId())
                .sku(variant.getSku())
                .color(variant.getColor() != null ? mapColorToResponse(variant.getColor()) : null)
                .size(variant.getSize() != null ? mapSizeToResponse(variant.getSize()) : null)
                .variantInfo(variantInfo.toString())
                .quantity(item.getQuantity())
                .unitPrice(unitPrice)
                .totalPrice(totalPrice)
                .subtotal(totalPrice) // Same as totalPrice
                .availableStock(variant.getAvailableStock())
                .imageUrl(imageUrl)
                .productImage(imageUrl) // Same as imageUrl
                .build();
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
        // Check if wholesale price applies
        if (product.getWholesalePrice() != null &&
                product.getWholesaleMinQuantity() != null &&
                quantity >= product.getWholesaleMinQuantity()) {
            return product.getWholesalePrice();
        }
        return product.getRetailPrice();
    }

    private ColorResponse mapColorToResponse(Color color) {
        return ColorResponse.builder()
                .id(color.getId())
                .name(color.getName())
                .hexCode(color.getHexCode())
                .build();
    }

    private SizeResponse mapSizeToResponse(Size size) {
        return SizeResponse.builder()
                .id(size.getId())
                .name(size.getName())
                .sortOrder(size.getSortOrder())
                .build();
    }
}
