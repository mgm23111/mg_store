package com.mgstore.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingMethodResponse {
    private Long id;
    private String name;
    private String code;
    private BigDecimal basePrice;
    private String estimatedDays;
    private Boolean isActive;
}
