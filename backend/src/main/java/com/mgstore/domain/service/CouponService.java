package com.mgstore.domain.service;

import com.mgstore.application.dto.request.CouponRequest;
import com.mgstore.application.dto.response.CouponResponse;
import com.mgstore.domain.entity.Coupon;
import com.mgstore.domain.repository.CouponRepository;
import com.mgstore.infrastructure.exception.BusinessException;
import com.mgstore.infrastructure.exception.ResourceNotFoundException;
import com.mgstore.util.CodeGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    /**
     * Get all coupons
     */
    @Transactional(readOnly = true)
    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get active coupons only
     */
    @Transactional(readOnly = true)
    public List<CouponResponse> getActiveCoupons() {
        return couponRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get coupon by ID
     */
    @Transactional(readOnly = true)
    public CouponResponse getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        return mapToResponse(coupon);
    }

    /**
     * Get coupon by code
     */
    @Transactional(readOnly = true)
    public CouponResponse getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "code", code));
        return mapToResponse(coupon);
    }

    /**
     * Validate coupon code (for checkout)
     */
    @Transactional(readOnly = true)
    public CouponResponse validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new BusinessException("Invalid coupon code"));

        if (!coupon.isValid()) {
            throw new BusinessException("Coupon is not valid or has expired");
        }

        return mapToResponse(coupon);
    }

    /**
     * Create new coupon
     */
    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        // Validate coupon type
        if (!request.getType().equals("PERCENTAGE") && !request.getType().equals("FIXED_AMOUNT")) {
            throw new BusinessException("Invalid coupon type. Must be PERCENTAGE or FIXED_AMOUNT");
        }

        // Validate percentage value
        if (request.getType().equals("PERCENTAGE") && request.getValue().doubleValue() > 100) {
            throw new BusinessException("Percentage value cannot exceed 100");
        }

        // Generate code if not provided
        String code = request.getCode();
        if (code == null || code.isBlank()) {
            code = CodeGenerator.generateCouponCode();
        } else {
            code = code.toUpperCase();
        }

        // Check if code already exists
        if (couponRepository.existsByCode(code)) {
            throw new BusinessException("Coupon code already exists");
        }

        // Validate dates
        if (request.getValidUntil().isBefore(request.getValidFrom())) {
            throw new BusinessException("Valid until date must be after valid from date");
        }

        Coupon coupon = Coupon.builder()
                .code(code)
                .type(request.getType())
                .value(request.getValue())
                .minPurchaseAmount(request.getMinPurchaseAmount() != null ? request.getMinPurchaseAmount() : java.math.BigDecimal.ZERO)
                .maxUses(request.getMaxUses())
                .currentUses(0)
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        coupon = couponRepository.save(coupon);
        return mapToResponse(coupon);
    }

    /**
     * Update coupon
     */
    @Transactional
    public CouponResponse updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));

        // Validate coupon type
        if (!request.getType().equals("PERCENTAGE") && !request.getType().equals("FIXED_AMOUNT")) {
            throw new BusinessException("Invalid coupon type. Must be PERCENTAGE or FIXED_AMOUNT");
        }

        // Validate percentage value
        if (request.getType().equals("PERCENTAGE") && request.getValue().doubleValue() > 100) {
            throw new BusinessException("Percentage value cannot exceed 100");
        }

        // Validate dates
        if (request.getValidUntil().isBefore(request.getValidFrom())) {
            throw new BusinessException("Valid until date must be after valid from date");
        }

        // Update fields (code cannot be changed)
        coupon.setType(request.getType());
        coupon.setValue(request.getValue());
        coupon.setMinPurchaseAmount(request.getMinPurchaseAmount() != null ? request.getMinPurchaseAmount() : java.math.BigDecimal.ZERO);
        coupon.setMaxUses(request.getMaxUses());
        coupon.setValidFrom(request.getValidFrom());
        coupon.setValidUntil(request.getValidUntil());

        if (request.getIsActive() != null) {
            coupon.setIsActive(request.getIsActive());
        }

        coupon = couponRepository.save(coupon);
        return mapToResponse(coupon);
    }

    /**
     * Deactivate coupon
     */
    @Transactional
    public void deactivateCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));

        coupon.setIsActive(false);
        couponRepository.save(coupon);
    }

    /**
     * Delete coupon permanently
     */
    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));

        // Check if coupon has been used
        if (coupon.getCurrentUses() > 0) {
            throw new BusinessException("Cannot delete coupon that has been used. Deactivate it instead.");
        }

        couponRepository.delete(coupon);
    }

    // Helper method
    private CouponResponse mapToResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .type(coupon.getType())
                .value(coupon.getValue())
                .minPurchaseAmount(coupon.getMinPurchaseAmount())
                .maxUses(coupon.getMaxUses())
                .currentUses(coupon.getCurrentUses())
                .validFrom(coupon.getValidFrom())
                .validUntil(coupon.getValidUntil())
                .isActive(coupon.getIsActive())
                .isValid(coupon.isValid())
                .createdAt(coupon.getCreatedAt())
                .updatedAt(coupon.getUpdatedAt())
                .build();
    }
}
