package com.mgstore.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantResponse {

    private Long id;
    private String sku;
    private ColorResponse color;
    private SizeResponse size;
    private Integer stockQuantity;
    private Integer reservedQuantity;
    private Integer availableStock;
    private Boolean isActive;
}
