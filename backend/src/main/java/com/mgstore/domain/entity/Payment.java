package com.mgstore.domain.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference("order-payments")
    private Order order;

    // Payment Method: CULQI, YAPE
    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    // Status: PENDING, COMPLETED, FAILED, REFUNDED
    @Column(nullable = false, length = 50)
    private String status;

    // Culqi Specific Fields
    @Column(name = "culqi_charge_id", length = 100)
    private String culqiChargeId;

    @Column(name = "culqi_transaction_id", length = 100)
    private String culqiTransactionId;

    // Yape Specific Fields
    @Column(name = "yape_transaction_image_url", length = 500)
    private String yapeTransactionImageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "yape_approved_by_admin_id")
    private Admin yapeApprovedByAdmin;

    @Column(name = "yape_approval_notes", columnDefinition = "TEXT")
    private String yapeApprovalNotes;

    // Metadata (JSON for additional data)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    // Timestamps
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
