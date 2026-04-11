package com.mgstore.application.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateShippingRequest {
    private String courierName;
    private String trackingNumber;
    private String status; // PENDING, PREPARING, SHIPPED, DELIVERED, CANCELLED
    private String notes;
}
