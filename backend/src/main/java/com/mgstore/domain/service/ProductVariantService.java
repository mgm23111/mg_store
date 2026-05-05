package com.mgstore.domain.service;

import com.mgstore.application.dto.request.ProductVariantRequest;
import com.mgstore.application.dto.response.ColorResponse;
import com.mgstore.application.dto.response.ProductVariantResponse;
import com.mgstore.application.dto.response.SizeResponse;
import com.mgstore.domain.entity.Color;
import com.mgstore.domain.entity.Product;
import com.mgstore.domain.entity.ProductVariant;
import com.mgstore.domain.entity.Size;
import com.mgstore.domain.repository.ColorRepository;
import com.mgstore.domain.repository.ProductRepository;
import com.mgstore.domain.repository.ProductVariantRepository;
import com.mgstore.domain.repository.SizeRepository;
import com.mgstore.infrastructure.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductVariantService {

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ColorRepository colorRepository;

    @Autowired
    private SizeRepository sizeRepository;

    @Transactional
    public ProductVariant addProductVariant(Long productId, ProductVariantRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Color color = colorRepository.findById(request.getColorId())
                .orElseThrow(() -> new ResourceNotFoundException("Color", "id", request.getColorId()));

        Size size = sizeRepository.findById(request.getSizeId())
                .orElseThrow(() -> new ResourceNotFoundException("Size", "id", request.getSizeId()));

        // Check if variant already exists
        boolean exists = productVariantRepository.existsByProductAndColorAndSize(product, color, size);
        if (exists) {
            throw new IllegalArgumentException("Variant with this color and size combination already exists");
        }

        // Generate SKU if not provided
        String sku = request.getSku();
        if (sku == null || sku.isEmpty()) {
            sku = generateSku(product, color, size);
        }

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .color(color)
                .size(size)
                .sku(sku)
                .stockQuantity(request.getStockQuantity())
                .reservedQuantity(0)
                .isActive(request.getIsActive())
                .build();

        return productVariantRepository.save(variant);
    }

    @Transactional(readOnly = true)
    public List<ProductVariant> getProductVariants(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        return productVariantRepository.findByProduct(product);
    }

    @Transactional
    public void deleteProductVariant(Long variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", variantId));

        if (variant.getReservedQuantity() > 0) {
            throw new IllegalStateException("Cannot delete variant with reserved stock");
        }

        productVariantRepository.delete(variant);
    }

    @Transactional
    public ProductVariant updateProductVariant(Long variantId, ProductVariantRequest request) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", variantId));

        if (request.getSku() != null && !request.getSku().isEmpty()) {
            variant.setSku(request.getSku());
        }
        variant.setStockQuantity(request.getStockQuantity());
        variant.setIsActive(request.getIsActive());

        return productVariantRepository.save(variant);
    }

    public ProductVariantResponse toResponse(ProductVariant variant) {
        return ProductVariantResponse.builder()
                .id(variant.getId())
                .sku(variant.getSku())
                .color(variant.getColor() != null ? mapColorToResponse(variant.getColor()) : null)
                .size(variant.getSize() != null ? mapSizeToResponse(variant.getSize()) : null)
                .stockQuantity(variant.getStockQuantity())
                .reservedQuantity(variant.getReservedQuantity())
                .availableStock(variant.getAvailableStock())
                .isActive(variant.getIsActive())
                .build();
    }

    private ColorResponse mapColorToResponse(Color color) {
        return ColorResponse.builder()
                .id(color.getId())
                .name(color.getName())
                .hexCode(color.getHexCode())
                .build();
    }

    private SizeResponse mapSizeToResponse(Size size) {
        return SizeResponse.builder()
                .id(size.getId())
                .name(size.getName())
                .sortOrder(size.getSortOrder())
                .build();
    }

    private String generateSku(Product product, Color color, Size size) {
        String productCode = product.getSlug().substring(0, Math.min(4, product.getSlug().length())).toUpperCase();
        String colorCode = color.getName().substring(0, Math.min(3, color.getName().length())).toUpperCase();
        String sizeCode = size.getName().toUpperCase();

        return String.format("%s-%s-%s", productCode, colorCode, sizeCode);
    }
}
