package com.mgstore.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    // Type: PERCENTAGE, FIXED_AMOUNT
    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    @Column(name = "min_purchase_amount", precision = 10, scale = 2)
    private BigDecimal minPurchaseAmount = BigDecimal.ZERO;

    @Column(name = "max_uses")
    private Integer maxUses;

    @Column(name = "current_uses")
    private Integer currentUses = 0;

    @Column(name = "valid_from", nullable = false)
    private LocalDateTime validFrom;

    @Column(name = "valid_until", nullable = false)
    private LocalDateTime validUntil;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Check if coupon is valid
     */
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return isActive &&
               now.isAfter(validFrom) &&
               now.isBefore(validUntil) &&
               (maxUses == null || currentUses < maxUses);
    }

    /**
     * Calculate discount amount
     */
    public BigDecimal calculateDiscount(BigDecimal orderAmount) {
        if (!isValid() || orderAmount.compareTo(minPurchaseAmount) < 0) {
            return BigDecimal.ZERO;
        }

        if ("PERCENTAGE".equals(type)) {
            return orderAmount.multiply(value).divide(BigDecimal.valueOf(100));
        } else if ("FIXED_AMOUNT".equals(type)) {
            return value;
        }

        return BigDecimal.ZERO;
    }
}
