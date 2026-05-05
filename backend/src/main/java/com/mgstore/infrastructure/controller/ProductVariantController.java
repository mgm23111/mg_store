package com.mgstore.infrastructure.controller;

import com.mgstore.application.dto.request.ProductVariantRequest;
import com.mgstore.application.dto.response.ApiResponse;
import com.mgstore.application.dto.response.ProductVariantResponse;
import com.mgstore.domain.entity.ProductVariant;
import com.mgstore.domain.service.ProductVariantService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/products")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class ProductVariantController {

    @Autowired
    private ProductVariantService productVariantService;

    /**
     * Add variant to product
     */
    @PostMapping("/{productId}/variants")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> addProductVariant(
            @PathVariable Long productId,
            @Valid @RequestBody ProductVariantRequest request) {

        ProductVariant variant = productVariantService.addProductVariant(productId, request);
        ProductVariantResponse response = productVariantService.toResponse(variant);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Variant added successfully", response));
    }

    /**
     * Get all variants for a product
     */
    @GetMapping("/{productId}/variants")
    public ResponseEntity<ApiResponse<List<ProductVariantResponse>>> getProductVariants(
            @PathVariable Long productId) {

        List<ProductVariantResponse> variants = productVariantService.getProductVariants(productId).stream()
                .map(productVariantService::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(variants));
    }

    /**
     * Update product variant
     */
    @PutMapping("/variants/{variantId}")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> updateProductVariant(
            @PathVariable Long variantId,
            @Valid @RequestBody ProductVariantRequest request) {

        ProductVariant variant = productVariantService.updateProductVariant(variantId, request);
        ProductVariantResponse response = productVariantService.toResponse(variant);
        return ResponseEntity.ok(ApiResponse.success("Variant updated successfully", response));
    }

    /**
     * Delete product variant
     */
    @DeleteMapping("/variants/{variantId}")
    public ResponseEntity<ApiResponse<Void>> deleteProductVariant(@PathVariable Long variantId) {
        productVariantService.deleteProductVariant(variantId);
        return ResponseEntity.ok(ApiResponse.success("Variant deleted successfully", null));
    }
}
