package com.mgstore.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "gift_cards")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GiftCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "initial_balance", nullable = false, precision = 10, scale = 2)
    private BigDecimal initialBalance;

    @Column(name = "current_balance", nullable = false, precision = 10, scale = 2)
    private BigDecimal currentBalance;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_admin_id")
    private Admin createdByAdmin;

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
     * Check if gift card is valid
     */
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return isActive &&
               currentBalance.compareTo(BigDecimal.ZERO) > 0 &&
               (validUntil == null || now.isBefore(validUntil));
    }

    /**
     * Apply gift card to an amount
     */
    public BigDecimal apply(BigDecimal amount) {
        if (!isValid()) {
            return BigDecimal.ZERO;
        }

        BigDecimal amountToApply = amount.min(currentBalance);
        currentBalance = currentBalance.subtract(amountToApply);
        return amountToApply;
    }
}
