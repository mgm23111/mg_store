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
public class ProductResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private Long categoryId;
    private String categoryName;
    private BigDecimal retailPrice;
    private BigDecimal wholesalePrice;
    private Integer wholesaleMinQuantity;
    private BigDecimal discountPercentage; // Calculated field
    private Integer totalStock; // Sum of all variants stock
    private Boolean isActive;
    private Boolean isFeatured;
    private LocalDateTime offerStartAt;
    private LocalDateTime offerEndAt;
    private Boolean offerActive;
    private String metaTitle;
    private String metaDescription;
    private List<ProductImageResponse> images;
    private List<ProductVariantResponse> variants;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
