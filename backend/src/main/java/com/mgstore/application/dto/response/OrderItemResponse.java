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
public class OrderItemResponse {

    private Long id;
    private String productName;
    private String colorName;
    private String sizeName;
    private String variantInfo; // "Color: Red, Size: M"
    private String sku;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subtotal;
}
