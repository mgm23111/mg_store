package com.mgstore.infrastructure.controller;

import com.mgstore.application.dto.request.UpdateShippingRequest;
import com.mgstore.application.dto.response.ApiResponse;
import com.mgstore.application.dto.response.OrderResponse;
import com.mgstore.application.dto.response.ShippingMethodResponse;
import com.mgstore.application.dto.response.ShippingResponse;
import com.mgstore.domain.entity.ShippingMethod;
import com.mgstore.domain.service.OrderService;
import com.mgstore.domain.service.ShippingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@CrossOrigin(origins = "*")
public class ShippingController {

    @Autowired
    private ShippingService shippingService;

    @Autowired
    private OrderService orderService;

    // ==================== PUBLIC ENDPOINTS ====================

    /**
     * Get all active shipping methods (for checkout)
     */
    @GetMapping("/shipping-methods")
    public ResponseEntity<ApiResponse<List<ShippingMethodResponse>>> getActiveShippingMethods() {
        List<ShippingMethodResponse> methods = shippingService.getActiveShippingMethods();
        return ResponseEntity.ok(ApiResponse.success(methods));
    }

    /**
     * Get shipping method by ID
     */
    @GetMapping("/shipping-methods/{id}")
    public ResponseEntity<ApiResponse<ShippingMethodResponse>> getShippingMethodById(@PathVariable Long id) {
        ShippingMethodResponse method = shippingService.getShippingMethodById(id);
        return ResponseEntity.ok(ApiResponse.success(method));
    }

    /**
     * Get shipping info by order number (public - for order confirmation page)
     */
    @GetMapping("/orders/track/{orderNumber}/shipping")
    public ResponseEntity<ApiResponse<ShippingResponse>> getShippingByOrderNumber(@PathVariable String orderNumber) {
        OrderResponse order = orderService.getOrderByOrderNumber(orderNumber);
        ShippingResponse shipping = shippingService.getShippingByOrderId(order.getId());
        return ResponseEntity.ok(ApiResponse.success(shipping));
    }

    // ==================== ADMIN ENDPOINTS - SHIPPING METHODS ====================

    /**
     * Get all shipping methods (admin)
     */
    @GetMapping("/admin/shipping-methods")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ShippingMethodResponse>>> getAllShippingMethods() {
        List<ShippingMethodResponse> methods = shippingService.getAllShippingMethods();
        return ResponseEntity.ok(ApiResponse.success(methods));
    }

    /**
     * Update shipping method (admin)
     */
    @PutMapping("/admin/shipping-methods/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShippingMethodResponse>> updateShippingMethod(
            @PathVariable Long id,
            @Valid @RequestBody ShippingMethod request) {
        ShippingMethodResponse method = shippingService.updateShippingMethod(id, request);
        return ResponseEntity.ok(ApiResponse.success("Shipping method updated successfully", method));
    }

    // ==================== ADMIN ENDPOINTS - SHIPPING MANAGEMENT ====================

    /**
     * Get all shippings (admin)
     */
    @GetMapping("/admin/shippings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ShippingResponse>>> getAllShippings() {
        List<ShippingResponse> shippings = shippingService.getAllShippings();
        return ResponseEntity.ok(ApiResponse.success(shippings));
    }

    /**
     * Get pending shippings (admin)
     */
    @GetMapping("/admin/shippings/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ShippingResponse>>> getPendingShippings() {
        List<ShippingResponse> shippings = shippingService.getPendingShippings();
        return ResponseEntity.ok(ApiResponse.success(shippings));
    }

    /**
     * Get shipping by order ID (admin)
     */
    @GetMapping("/admin/orders/{orderId}/shipping")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShippingResponse>> getShippingByOrderId(@PathVariable Long orderId) {
        ShippingResponse shipping = shippingService.getShippingByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(shipping));
    }

    /**
     * Update shipping details (admin)
     * Can update: courier, tracking number, status, notes
     */
    @PutMapping("/admin/orders/{orderId}/shipping")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShippingResponse>> updateShipping(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateShippingRequest request) {
        ShippingResponse shipping = shippingService.updateShipping(orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Shipping updated successfully", shipping));
    }

    /**
     * Update only shipping status (admin)
     */
    @PutMapping("/admin/orders/{orderId}/shipping/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShippingResponse>> updateShippingStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        String status = request.get("status");
        ShippingResponse shipping = shippingService.updateShippingStatus(orderId, status);
        return ResponseEntity.ok(ApiResponse.success("Shipping status updated successfully", shipping));
    }
}
