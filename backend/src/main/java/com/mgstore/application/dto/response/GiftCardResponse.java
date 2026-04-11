package com.mgstore.application.dto.response;

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
public class GiftCardResponse {

    private Long id;
    private String code;
    private BigDecimal initialBalance;
    private BigDecimal currentBalance;
    private LocalDateTime validUntil;
    private Boolean isActive;
    private Boolean isValid;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
