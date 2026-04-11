package com.mgstore.domain.service;

import com.mgstore.application.dto.request.AddToCartRequest;
import com.mgstore.application.dto.response.CartResponse;
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
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductVariantRepository variantRepository;

    @InjectMocks
    private CartService cartService;

    private Cart cart;
    private Product product;
    private ProductVariant variant;
    private String sessionId;
    private Size size;
    private Color color;

    @BeforeEach
    void setUp() {
        sessionId = "test-session-123";

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
                .stockQuantity(5)
                .reservedQuantity(0)
                .isActive(true)
                .build();

        // Setup Cart
        cart = new Cart();
        cart.setId(1L);
        cart.setSessionId(sessionId);
        cart.setItems(new ArrayList<>());
    }

    @Test
    void testGetOrCreateCart_ExistingCart() {
        // Arrange
        when(cartRepository.findBySessionIdWithItems(sessionId)).thenReturn(Optional.of(cart));

        // Act
        CartResponse result = cartService.getOrCreateCart(sessionId);

        // Assert
        assertNotNull(result);
        verify(cartRepository, times(1)).findBySessionIdWithItems(sessionId);
        verify(cartRepository, never()).save(any(Cart.class));
    }

    @Test
    void testGetOrCreateCart_NewCart() {
        // Arrange
        when(cartRepository.findBySessionIdWithItems(sessionId)).thenReturn(Optional.empty());
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        // Act
        CartResponse result = cartService.getOrCreateCart(sessionId);

        // Assert
        assertNotNull(result);
        verify(cartRepository, times(1)).findBySessionIdWithItems(sessionId);
        verify(cartRepository, times(1)).save(any(Cart.class));
    }

    @Test
    void testAddToCart_NewItem() {
        // Arrange
        AddToCartRequest request = AddToCartRequest.builder()
                .sessionId(sessionId)
                .productVariantId(1L)
                .quantity(2)
                .build();

        when(cartRepository.findBySessionId(sessionId)).thenReturn(Optional.of(cart));
        when(variantRepository.findById(1L)).thenReturn(Optional.of(variant));
        when(cartItemRepository.findByCartIdAndProductVariantId(1L, 1L))
                .thenReturn(Optional.empty());
        when(cartRepository.findBySessionIdWithItems(sessionId)).thenReturn(Optional.of(cart));

        // Act
        CartResponse result = cartService.addToCart(request);

        // Assert
        assertNotNull(result);
        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }

    @Test
    void testAddToCart_UpdateExistingItem() {
        // Arrange
        AddToCartRequest request = AddToCartRequest.builder()
                .sessionId(sessionId)
                .productVariantId(1L)
                .quantity(2)
                .build();

        CartItem existingItem = CartItem.builder()
                .id(1L)
                .cart(cart)
                .productVariant(variant)
                .quantity(1)
                .build();
        cart.getItems().add(existingItem);

        when(cartRepository.findBySessionId(sessionId)).thenReturn(Optional.of(cart));
        when(variantRepository.findById(1L)).thenReturn(Optional.of(variant));
        when(cartItemRepository.findByCartIdAndProductVariantId(1L, 1L))
                .thenReturn(Optional.of(existingItem));
        when(cartRepository.findBySessionIdWithItems(sessionId)).thenReturn(Optional.of(cart));

        // Act
        CartResponse result = cartService.addToCart(request);

        // Assert
        assertNotNull(result);
        assertEquals(3, existingItem.getQuantity()); // 1 + 2
        verify(cartItemRepository, times(1)).save(existingItem);
    }

    @Test
    void testAddToCart_VariantNotFound() {
        // Arrange
        AddToCartRequest request = AddToCartRequest.builder()
                .sessionId(sessionId)
                .productVariantId(999L)
                .quantity(1)
                .build();

        when(cartRepository.findBySessionId(sessionId)).thenReturn(Optional.of(cart));
        when(variantRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            cartService.addToCart(request);
        });
    }

    @Test
    void testAddToCart_InsufficientStock() {
        // Arrange
        AddToCartRequest request = AddToCartRequest.builder()
                .sessionId(sessionId)
                .productVariantId(1L)
                .quantity(10) // More than available stock (5)
                .build();

        when(cartRepository.findBySessionId(sessionId)).thenReturn(Optional.of(cart));
        when(variantRepository.findById(1L)).thenReturn(Optional.of(variant));

        // Act & Assert
        assertThrows(Exception.class, () -> {
            cartService.addToCart(request);
        });
    }

    @Test
    void testRemoveCartItem() {
        // Arrange
        CartItem item = CartItem.builder()
                .id(1L)
                .cart(cart)
                .productVariant(variant)
                .quantity(2)
                .build();
        cart.getItems().add(item);

        when(cartRepository.findBySessionId(sessionId)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(cartRepository.findBySessionIdWithItems(sessionId)).thenReturn(Optional.of(cart));

        // Act
        CartResponse result = cartService.removeCartItem(sessionId, 1L);

        // Assert
        assertNotNull(result);
        verify(cartItemRepository, times(1)).delete(item);
    }

    @Test
    void testClearCart() {
        // Arrange
        CartItem item1 = CartItem.builder().id(1L).cart(cart).productVariant(variant).quantity(1).build();
        CartItem item2 = CartItem.builder().id(2L).cart(cart).productVariant(variant).quantity(1).build();
        cart.getItems().add(item1);
        cart.getItems().add(item2);

        when(cartRepository.findBySessionId(sessionId)).thenReturn(Optional.of(cart));

        // Act
        cartService.clearCart(sessionId);

        // Assert
        verify(cartItemRepository, times(1)).deleteByCartId(cart.getId());
    }
}
