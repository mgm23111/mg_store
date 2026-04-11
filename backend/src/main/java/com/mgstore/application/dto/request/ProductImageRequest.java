package com.mgstore.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageRequest {

    @NotBlank(message = "Image URL is required")
    private String url;

    private String altText;

    private Boolean isPrimary = false;

    private Integer sortOrder = 0;

    private Long colorId;
}
