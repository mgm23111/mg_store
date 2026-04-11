package com.mgstore.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {

    private Long id;
    private String sessionId;
    private Long customerId;
    private List<CartItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal total;
    private Integer totalItems;
    private String appliedCouponCode;
    private String appliedGiftCardCode;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
