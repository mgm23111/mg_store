package com.mgstore.infrastructure.controller;

import com.mgstore.application.dto.request.ProductImageRequest;
import com.mgstore.application.dto.response.ApiResponse;
import com.mgstore.domain.entity.ProductImage;
import com.mgstore.domain.service.ProductImageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/admin/products")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class ProductImageController {

    @Autowired
    private ProductImageService productImageService;

    /**
     * Add image to product
     */
    @PostMapping("/{productId}/images")
    public ResponseEntity<ApiResponse<ProductImage>> addProductImage(
            @PathVariable Long productId,
            @Valid @RequestBody ProductImageRequest request) {

        ProductImage image = productImageService.addProductImage(productId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Image added successfully", image));
    }

    /**
     * Upload image file and add it to product
     */
    @PostMapping("/{productId}/images/upload")
    public ResponseEntity<ApiResponse<ProductImage>> uploadProductImage(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "isPrimary", required = false) Boolean isPrimary,
            @RequestParam(value = "sortOrder", required = false) Integer sortOrder,
            @RequestParam(value = "colorId", required = false) Long colorId) {

        ProductImage image = productImageService.uploadProductImage(
                productId,
                file,
                altText,
                isPrimary,
                sortOrder,
                colorId
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Image uploaded successfully", image));
    }

    /**
     * Get all images for a product
     */
    @GetMapping("/{productId}/images")
    public ResponseEntity<ApiResponse<List<ProductImage>>> getProductImages(
            @PathVariable Long productId) {

        List<ProductImage> images = productImageService.getProductImages(productId);
        return ResponseEntity.ok(ApiResponse.success(images));
    }

    /**
     * Update product image
     */
    @PutMapping("/images/{imageId}")
    public ResponseEntity<ApiResponse<ProductImage>> updateProductImage(
            @PathVariable Long imageId,
            @Valid @RequestBody ProductImageRequest request) {

        ProductImage image = productImageService.updateProductImage(imageId, request);
        return ResponseEntity.ok(ApiResponse.success("Image updated successfully", image));
    }

    /**
     * Delete product image
     */
    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteProductImage(@PathVariable Long imageId) {
        productImageService.deleteProductImage(imageId);
        return ResponseEntity.ok(ApiResponse.success("Image deleted successfully", null));
    }
}
