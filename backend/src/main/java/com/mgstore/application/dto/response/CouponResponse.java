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
public class CouponResponse {

    private Long id;
    private String code;
    private String type;
    private BigDecimal value;
    private BigDecimal minPurchaseAmount;
    private Integer maxUses;
    private Integer currentUses;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private Boolean isActive;
    private Boolean isValid;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
