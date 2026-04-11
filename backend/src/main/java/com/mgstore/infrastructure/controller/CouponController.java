package com.mgstore.infrastructure.controller;

import com.mgstore.application.dto.request.CouponRequest;
import com.mgstore.application.dto.response.ApiResponse;
import com.mgstore.application.dto.response.CouponResponse;
import com.mgstore.domain.service.CouponService;
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
public class CouponController {

    @Autowired
    private CouponService couponService;

    // ==================== PUBLIC ENDPOINTS ====================

    /**
     * Validate coupon code (for checkout)
     */
    @GetMapping("/coupons/validate/{code}")
    public ResponseEntity<ApiResponse<CouponResponse>> validateCoupon(@PathVariable String code) {
        CouponResponse coupon = couponService.validateCoupon(code);
        return ResponseEntity.ok(ApiResponse.success("Coupon is valid", coupon));
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Get all coupons (admin)
     */
    @GetMapping("/admin/coupons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAllCoupons() {
        List<CouponResponse> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(ApiResponse.success(coupons));
    }

    /**
     * Get active coupons (admin)
     */
    @GetMapping("/admin/coupons/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getActiveCoupons() {
        List<CouponResponse> coupons = couponService.getActiveCoupons();
        return ResponseEntity.ok(ApiResponse.success(coupons));
    }

    /**
     * Get coupon by ID (admin)
     */
    @GetMapping("/admin/coupons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CouponResponse>> getCouponById(@PathVariable Long id) {
        CouponResponse coupon = couponService.getCouponById(id);
        return ResponseEntity.ok(ApiResponse.success(coupon));
    }

    /**
     * Get coupon by code (admin)
     */
    @GetMapping("/admin/coupons/code/{code}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CouponResponse>> getCouponByCode(@PathVariable String code) {
        CouponResponse coupon = couponService.getCouponByCode(code);
        return ResponseEntity.ok(ApiResponse.success(coupon));
    }

    /**
     * Create new coupon (admin)
     */
    @PostMapping("/admin/coupons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(
            @Valid @RequestBody CouponRequest request) {
        CouponResponse coupon = couponService.createCoupon(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Coupon created successfully", coupon));
    }

    /**
     * Update coupon (admin)
     */
    @PutMapping("/admin/coupons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CouponResponse>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest request) {
        CouponResponse coupon = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(ApiResponse.success("Coupon updated successfully", coupon));
    }

    /**
     * Deactivate coupon (admin)
     */
    @PutMapping("/admin/coupons/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateCoupon(@PathVariable Long id) {
        couponService.deactivateCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deactivated successfully", null));
    }

    /**
     * Delete coupon permanently (admin)
     */
    @DeleteMapping("/admin/coupons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted successfully", null));
    }
}
