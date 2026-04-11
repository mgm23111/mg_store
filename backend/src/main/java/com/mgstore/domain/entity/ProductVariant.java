package com.mgstore.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_variants", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"product_id", "color_id", "size_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "color_id")
    private Color color;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "size_id")
    private Size size;

    @Column(unique = true, length = 50)
    private String sku;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "reserved_quantity", nullable = false)
    private Integer reservedQuantity = 0;

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
     * Get available stock (stock not reserved)
     */
    public Integer getAvailableStock() {
        return stockQuantity - reservedQuantity;
    }

    /**
     * Reserve stock for an order
     */
    public void reserveStock(Integer quantity) {
        if (getAvailableStock() < quantity) {
            throw new IllegalStateException("Insufficient stock available");
        }
        this.reservedQuantity += quantity;
    }

    /**
     * Release reserved stock (e.g., when order is cancelled)
     */
    public void releaseReservedStock(Integer quantity) {
        this.reservedQuantity = Math.max(0, this.reservedQuantity - quantity);
    }

    /**
     * Deduct stock when order is paid
     */
    public void deductStock(Integer quantity) {
        if (this.reservedQuantity < quantity) {
            throw new IllegalStateException("Cannot deduct more than reserved quantity");
        }
        this.stockQuantity -= quantity;
        this.reservedQuantity -= quantity;
    }
}
