package com.mgstore.infrastructure.controller;

import com.mgstore.application.dto.request.ProductVariantRequest;
import com.mgstore.application.dto.response.ApiResponse;
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
    public ResponseEntity<ApiResponse<ProductVariant>> addProductVariant(
            @PathVariable Long productId,
            @Valid @RequestBody ProductVariantRequest request) {

        ProductVariant variant = productVariantService.addProductVariant(productId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Variant added successfully", variant));
    }

    /**
     * Get all variants for a product
     */
    @GetMapping("/{productId}/variants")
    public ResponseEntity<ApiResponse<List<ProductVariant>>> getProductVariants(
            @PathVariable Long productId) {

        List<ProductVariant> variants = productVariantService.getProductVariants(productId);
        return ResponseEntity.ok(ApiResponse.success(variants));
    }

    /**
     * Update product variant
     */
    @PutMapping("/variants/{variantId}")
    public ResponseEntity<ApiResponse<ProductVariant>> updateProductVariant(
            @PathVariable Long variantId,
            @Valid @RequestBody ProductVariantRequest request) {

        ProductVariant variant = productVariantService.updateProductVariant(variantId, request);
        return ResponseEntity.ok(ApiResponse.success("Variant updated successfully", variant));
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
