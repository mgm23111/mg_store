package com.mgstore.domain.service;

import com.mgstore.application.dto.request.ProductRequest;
import com.mgstore.application.dto.response.*;
import com.mgstore.domain.entity.*;
import com.mgstore.domain.repository.*;
import com.mgstore.infrastructure.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryIdAndIsActiveTrue(categoryId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(Long categoryId, String search) {
        return productRepository.findWithFilters(categoryId, search)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        // First fetch product with images
        Product product = productRepository.findBySlugWithImages(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));

        // Then fetch variants separately to avoid MultipleBagFetchException
        productRepository.findBySlugWithVariants(slug).ifPresent(p -> {
            product.setVariants(p.getVariants());
        });

        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        // Validate category if provided
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        }

        // Check if slug already exists
        if (productRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Product with slug '" + request.getSlug() + "' already exists");
        }

        // Create product
        Product product = Product.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .category(category)
                .retailPrice(request.getRetailPrice())
                .wholesalePrice(request.getWholesalePrice())
                .wholesaleMinQuantity(request.getWholesaleMinQuantity() != null ? request.getWholesaleMinQuantity() : 6)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .offerStartAt(request.getOfferStartAt())
                .offerEndAt(request.getOfferEndAt())
                .metaTitle(request.getMetaTitle())
                .metaDescription(request.getMetaDescription())
                .build();

        validatePricingRules(product.getRetailPrice(), product.getWholesalePrice(), product.getWholesaleMinQuantity());
        validateOfferSchedule(product.getOfferStartAt(), product.getOfferEndAt());

        product = productRepository.save(product);

        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // Check slug uniqueness (excluding current product)
        if (!product.getSlug().equals(request.getSlug()) && productRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Product with slug '" + request.getSlug() + "' already exists");
        }

        // Update fields
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setRetailPrice(request.getRetailPrice());
        product.setWholesalePrice(request.getWholesalePrice());

        if (request.getWholesaleMinQuantity() != null) {
            product.setWholesaleMinQuantity(request.getWholesaleMinQuantity());
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }

        if (request.getIsFeatured() != null) {
            product.setIsFeatured(request.getIsFeatured());
        }

        product.setOfferStartAt(request.getOfferStartAt());
        product.setOfferEndAt(request.getOfferEndAt());
        validatePricingRules(product.getRetailPrice(), product.getWholesalePrice(), product.getWholesaleMinQuantity());
        validateOfferSchedule(product.getOfferStartAt(), product.getOfferEndAt());

        product.setMetaTitle(request.getMetaTitle());
        product.setMetaDescription(request.getMetaDescription());

        product = productRepository.save(product);

        return mapToResponse(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // Soft delete - just set as inactive
        product.setIsActive(false);
        productRepository.save(product);
    }

    @Transactional
    public void hardDeleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        productRepository.delete(product);
    }

    // Helper method to map Entity to DTO
    private ProductResponse mapToResponse(Product product) {
        // Calculate total stock from all variants
        Integer totalStock = 0;
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            totalStock = product.getVariants().stream()
                    .mapToInt(ProductVariant::getStockQuantity)
                    .sum();
        }

        LocalDateTime now = LocalDateTime.now();
        boolean offerActive = isOfferActive(product, now);

        // Calculate discount percentage only for active offer pricing (min qty = 1)
        BigDecimal discountPercentage = null;
        if (offerActive &&
                product.getWholesalePrice() != null && product.getRetailPrice() != null
                && product.getWholesalePrice().compareTo(product.getRetailPrice()) < 0
                && product.getRetailPrice().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discount = product.getRetailPrice().subtract(product.getWholesalePrice());
            discountPercentage = discount.divide(product.getRetailPrice(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        ProductResponse.ProductResponseBuilder builder = ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .retailPrice(product.getRetailPrice())
                .wholesalePrice(product.getWholesalePrice())
                .wholesaleMinQuantity(product.getWholesaleMinQuantity())
                .discountPercentage(discountPercentage)
                .totalStock(totalStock)
                .isActive(product.getIsActive())
                .isFeatured(product.getIsFeatured())
                .offerStartAt(product.getOfferStartAt())
                .offerEndAt(product.getOfferEndAt())
                .offerActive(offerActive)
                .metaTitle(product.getMetaTitle())
                .metaDescription(product.getMetaDescription())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt());

        // Map images if loaded
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            List<ProductImageResponse> images = product.getImages().stream()
                    .map(this::mapImageToResponse)
                    .collect(Collectors.toList());
            builder.images(images);
        }

        // Map variants if loaded
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            List<ProductVariantResponse> variants = product.getVariants().stream()
                    .map(this::mapVariantToResponse)
                    .collect(Collectors.toList());
            builder.variants(variants);
        }

        return builder.build();
    }

    private ProductImageResponse mapImageToResponse(ProductImage image) {
        return ProductImageResponse.builder()
                .id(image.getId())
                .url(image.getUrl())
                .altText(image.getAltText())
                .isPrimary(image.getIsPrimary())
                .sortOrder(image.getSortOrder())
                .colorId(image.getColor() != null ? image.getColor().getId() : null)
                .build();
    }

    private ProductVariantResponse mapVariantToResponse(ProductVariant variant) {
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

    private void validateOfferSchedule(LocalDateTime offerStartAt, LocalDateTime offerEndAt) {
        if (offerStartAt != null && offerEndAt != null && offerEndAt.isBefore(offerStartAt)) {
            throw new IllegalArgumentException("Offer end date must be greater than or equal to start date");
        }
    }

    private void validatePricingRules(BigDecimal retailPrice, BigDecimal wholesalePrice, Integer wholesaleMinQuantity) {
        if (wholesaleMinQuantity != null && wholesaleMinQuantity < 1) {
            throw new IllegalArgumentException("Wholesale minimum quantity must be at least 1");
        }

        if (retailPrice != null && wholesalePrice != null && wholesaleMinQuantity != null && wholesaleMinQuantity <= 1
                && wholesalePrice.compareTo(retailPrice) >= 0) {
            throw new IllegalArgumentException("Offer price must be lower than retail price");
        }
    }

    public boolean isOfferActive(Product product, LocalDateTime when) {
        if (product.getWholesalePrice() == null || product.getRetailPrice() == null) {
            return false;
        }

        Integer minQty = product.getWholesaleMinQuantity() != null ? product.getWholesaleMinQuantity() : 6;
        if (minQty > 1) {
            return false;
        }

        if (product.getWholesalePrice().compareTo(product.getRetailPrice()) >= 0) {
            return false;
        }

        if (product.getOfferStartAt() != null && when.isBefore(product.getOfferStartAt())) {
            return false;
        }

        if (product.getOfferEndAt() != null && when.isAfter(product.getOfferEndAt())) {
            return false;
        }

        return true;
    }
}
