package com.mgstore.application.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Slug is required")
    private String slug;

    private String description;

    private Long categoryId;

    @NotNull(message = "Retail price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal retailPrice;

    @DecimalMin(value = "0.01", message = "Wholesale price must be greater than 0")
    private BigDecimal wholesalePrice;

    private Integer wholesaleMinQuantity;

    private Boolean isActive;

    private Boolean isFeatured;

    private String metaTitle;

    private String metaDescription;
}
