package com.mgstore.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingResponse {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private Long shippingMethodId;
    private String shippingMethodName;
    private String courierName;
    private String trackingNumber;
    private BigDecimal shippingCost;
    private String status; // PENDING, PREPARING, SHIPPED, DELIVERED, CANCELLED
    private LocalDate estimatedDeliveryDate;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private String notes;
    private String recipientName;
    private String recipientPhone;
    private String address;
    private LocalDateTime createdAt;

    // Legacy field for backward compatibility
    @Deprecated
    private String carrier;
}
