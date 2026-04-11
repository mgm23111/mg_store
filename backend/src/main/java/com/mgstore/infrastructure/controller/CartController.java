package com.mgstore.infrastructure.controller;

import com.mgstore.application.dto.request.AddToCartRequest;
import com.mgstore.application.dto.request.UpdateCartItemRequest;
import com.mgstore.application.dto.response.ApiResponse;
import com.mgstore.application.dto.response.CartResponse;
import com.mgstore.domain.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;

    /**
     * Get or create cart by session ID
     */
    @GetMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@PathVariable String sessionId) {
        CartResponse cart = cartService.getOrCreateCart(sessionId);
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    /**
     * Add item to cart
     */
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(@Valid @RequestBody AddToCartRequest request) {
        CartResponse cart = cartService.addToCart(request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    /**
     * Update cart item quantity
     */
    @PutMapping("/{sessionId}/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @PathVariable String sessionId,
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request) {

        CartResponse cart = cartService.updateCartItem(sessionId, cartItemId, request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success("Cart updated", cart));
    }

    /**
     * Remove item from cart
     */
    @DeleteMapping("/{sessionId}/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeCartItem(
            @PathVariable String sessionId,
            @PathVariable Long cartItemId) {

        CartResponse cart = cartService.removeCartItem(sessionId, cartItemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    /**
     * Clear cart
     */
    @DeleteMapping("/{sessionId}/clear")
    public ResponseEntity<ApiResponse<Void>> clearCart(@PathVariable String sessionId) {
        cartService.clearCart(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}
