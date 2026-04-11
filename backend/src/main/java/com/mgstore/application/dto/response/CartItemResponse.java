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
public class CartItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productSlug;
    private Long variantId;
    private String sku;
    private ColorResponse color;
    private SizeResponse size;
    private String variantInfo; // "Color: Red, Size: M"
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private BigDecimal subtotal; // Same as totalPrice for consistency
    private Integer availableStock;
    private String imageUrl;
    private String productImage; // Same as imageUrl for consistency
}
