package com.mgstore.domain.service;

import com.mgstore.application.dto.request.ProductImageRequest;
import com.mgstore.domain.entity.Color;
import com.mgstore.domain.entity.Product;
import com.mgstore.domain.entity.ProductImage;
import com.mgstore.domain.repository.ColorRepository;
import com.mgstore.domain.repository.ProductImageRepository;
import com.mgstore.domain.repository.ProductRepository;
import com.mgstore.infrastructure.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class ProductImageService {

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ColorRepository colorRepository;

    @Value("${app.upload.base-dir:uploads}")
    private String uploadBaseDir;

    @Value("${app.public-api-base-url:http://localhost:8891/api}")
    private String publicApiBaseUrl;

    @Transactional
    public ProductImage addProductImage(Long productId, ProductImageRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Color color = resolveColor(request.getColorId());

        // If this is set as primary, unset all other primary images
        if (Boolean.TRUE.equals(request.getIsPrimary())) {
            unsetPrimaryImages(product, color != null ? color.getId() : null, null);
        }

        ProductImage image = ProductImage.builder()
                .product(product)
                .color(color)
                .url(request.getUrl())
                .altText(request.getAltText())
                .isPrimary(request.getIsPrimary())
                .sortOrder(request.getSortOrder())
                .build();

        return productImageRepository.save(image);
    }

    @Transactional
    public ProductImage uploadProductImage(Long productId,
                                           MultipartFile file,
                                           String altText,
                                           Boolean isPrimary,
                                           Integer sortOrder,
                                           Long colorId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }

        if (file.getContentType() == null || !file.getContentType().toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        Color color = resolveColor(colorId);
        String imageUrl = saveImageFile(file);
        boolean primary = Boolean.TRUE.equals(isPrimary);
        int finalSortOrder = sortOrder != null ? sortOrder : product.getImages().size();

        if (primary) {
            unsetPrimaryImages(product, color != null ? color.getId() : null, null);
        }

        ProductImage image = ProductImage.builder()
                .product(product)
                .color(color)
                .url(imageUrl)
                .altText(altText)
                .isPrimary(primary)
                .sortOrder(finalSortOrder)
                .build();

        return productImageRepository.save(image);
    }

    @Transactional(readOnly = true)
    public List<ProductImage> getProductImages(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        return productImageRepository.findByProductOrderBySortOrder(product);
    }

    @Transactional
    public void deleteProductImage(Long imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductImage", "id", imageId));

        deleteImageFileIfManaged(image.getUrl());
        productImageRepository.delete(image);
    }

    @Transactional
    public ProductImage updateProductImage(Long imageId, ProductImageRequest request) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductImage", "id", imageId));

        Color color = resolveColor(request.getColorId());

        // If this is set as primary, unset all other primary images
        if (Boolean.TRUE.equals(request.getIsPrimary()) && !Boolean.TRUE.equals(image.getIsPrimary())) {
            Product product = image.getProduct();
            unsetPrimaryImages(product, color != null ? color.getId() : null, imageId);
        }

        image.setUrl(request.getUrl());
        image.setAltText(request.getAltText());
        image.setIsPrimary(request.getIsPrimary());
        image.setSortOrder(request.getSortOrder());
        image.setColor(color);

        return productImageRepository.save(image);
    }

    private Color resolveColor(Long colorId) {
        if (colorId == null) {
            return null;
        }

        return colorRepository.findById(colorId)
                .orElseThrow(() -> new ResourceNotFoundException("Color", "id", colorId));
    }

    private void unsetPrimaryImages(Product product, Long colorId, Long exceptImageId) {
        product.getImages().stream()
                .filter(img -> exceptImageId == null || !Objects.equals(img.getId(), exceptImageId))
                .filter(img -> {
                    Long imageColorId = img.getColor() != null ? img.getColor().getId() : null;
                    return (colorId == null && imageColorId == null)
                            || (colorId != null && colorId.equals(imageColorId));
                })
                .forEach(img -> img.setIsPrimary(false));
    }

    private String saveImageFile(MultipartFile file) {
        try {
            Path uploadDir = Paths.get(uploadBaseDir, "products").toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            String extension = getFileExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + extension;
            Path targetPath = uploadDir.resolve(filename).normalize();

            if (!targetPath.startsWith(uploadDir)) {
                throw new IllegalArgumentException("Invalid file path");
            }

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            String baseUrl = publicApiBaseUrl.endsWith("/")
                    ? publicApiBaseUrl.substring(0, publicApiBaseUrl.length() - 1)
                    : publicApiBaseUrl;
            return baseUrl + "/uploads/products/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Could not store image file", e);
        }
    }

    private void deleteImageFileIfManaged(String url) {
        if (url == null || !url.contains("/uploads/products/")) {
            return;
        }

        try {
            int idx = url.lastIndexOf("/uploads/products/");
            String filename = url.substring(idx + "/uploads/products/".length());
            Path filePath = Paths.get(uploadBaseDir, "products", filename).toAbsolutePath().normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // Best effort deletion; keep DB operation successful.
        }
    }

    private String getFileExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return ".jpg";
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        if (extension.length() > 10) {
            return ".jpg";
        }

        return extension;
    }
}
