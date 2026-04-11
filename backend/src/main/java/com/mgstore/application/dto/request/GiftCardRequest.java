package com.mgstore.application.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GiftCardRequest {

    private String code; // Optional, will be generated if not provided

    @NotNull(message = "Initial balance is required")
    @DecimalMin(value = "0.01", message = "Initial balance must be greater than 0")
    private BigDecimal initialBalance;

    private LocalDateTime validUntil;

    private Boolean isActive;
}
