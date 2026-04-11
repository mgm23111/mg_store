package com.mgstore.domain.service;

import com.mgstore.application.dto.request.ProductRequest;
import com.mgstore.application.dto.response.ProductResponse;
import com.mgstore.domain.entity.*;
import com.mgstore.domain.repository.CategoryRepository;
import com.mgstore.domain.repository.ProductRepository;
import com.mgstore.infrastructure.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductService productService;

    private Product product;
    private Category category;
    private List<ProductVariant> variants;
    private List<ProductImage> images;
    private Size size1, size2;
    private Color color1, color2;

    @BeforeEach
    void setUp() {
        // Setup Category
        category = new Category();
        category.setId(1L);
        category.setName("T-Shirts");
        category.setSlug("t-shirts");

        // Setup Sizes and Colors
        size1 = Size.builder().id(1L).name("M").sortOrder(1).build();
        size2 = Size.builder().id(2L).name("L").sortOrder(2).build();
        color1 = Color.builder().id(1L).name("Blue").hexCode("#0000FF").build();
        color2 = Color.builder().id(2L).name("Red").hexCode("#FF0000").build();

        // Setup Product
        product = Product.builder()
                .id(1L)
                .name("Classic T-Shirt")
                .slug("classic-t-shirt")
                .description("A classic t-shirt")
                .retailPrice(BigDecimal.valueOf(100))
                .wholesalePrice(BigDecimal.valueOf(80))
                .wholesaleMinQuantity(6)
                .category(category)
                .isActive(true)
                .isFeatured(false)
                .variants(new ArrayList<>())
                .images(new ArrayList<>())
                .build();

        // Setup Variants
        variants = new ArrayList<>();
        ProductVariant variant1 = ProductVariant.builder()
                .id(1L)
                .product(product)
                .size(size1)
                .color(color1)
                .sku("TSHIRT-001-M-BLUE")
                .stockQuantity(10)
                .reservedQuantity(0)
                .isActive(true)
                .build();
        variants.add(variant1);

        ProductVariant variant2 = ProductVariant.builder()
                .id(2L)
                .product(product)
                .size(size2)
                .color(color2)
                .sku("TSHIRT-001-L-RED")
                .stockQuantity(15)
                .reservedQuantity(0)
                .isActive(true)
                .build();
        variants.add(variant2);

        product.setVariants(variants);

        // Setup Images
        images = new ArrayList<>();
        ProductImage image1 = ProductImage.builder()
                .id(1L)
                .product(product)
                .url("https://example.com/image1.jpg")
                .isPrimary(true)
                .sortOrder(0)
                .build();
        images.add(image1);

        product.setImages(images);
    }

    @Test
    void testGetAllProducts() {
        // Arrange
        List<Product> products = List.of(product);

        when(productRepository.findByIsActiveTrue()).thenReturn(products);

        // Act
        List<ProductResponse> result = productService.getAllProducts();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(productRepository, times(1)).findByIsActiveTrue();
    }

    @Test
    void testGetFeaturedProducts() {
        // Arrange
        List<Product> products = List.of(product);

        when(productRepository.findByIsFeaturedTrueAndIsActiveTrue()).thenReturn(products);

        // Act
        List<ProductResponse> result = productService.getFeaturedProducts();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(productRepository, times(1)).findByIsFeaturedTrueAndIsActiveTrue();
    }

    @Test
    void testSearchProducts() {
        // Arrange
        List<Product> products = List.of(product);

        when(productRepository.findWithFilters(1L, "classic")).thenReturn(products);

        // Act
        List<ProductResponse> result = productService.searchProducts(1L, "classic");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(productRepository, times(1)).findWithFilters(1L, "classic");
    }

    @Test
    void testGetProductBySlug_Success() {
        // Arrange
        when(productRepository.findBySlugWithImages("classic-t-shirt"))
                .thenReturn(Optional.of(product));
        when(productRepository.findBySlugWithVariants("classic-t-shirt"))
                .thenReturn(Optional.of(product));

        // Act
        ProductResponse result = productService.getProductBySlug("classic-t-shirt");

        // Assert
        assertNotNull(result);
        assertEquals("Classic T-Shirt", result.getName());
        assertEquals("classic-t-shirt", result.getSlug());
        verify(productRepository, times(1)).findBySlugWithImages("classic-t-shirt");
    }

    @Test
    void testGetProductBySlug_NotFound() {
        // Arrange
        when(productRepository.findBySlugWithImages("non-existent"))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            productService.getProductBySlug("non-existent");
        });
    }

    @Test
    void testGetProductById_Success() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // Act
        ProductResponse result = productService.getProductById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Classic T-Shirt", result.getName());
        verify(productRepository, times(1)).findById(1L);
    }

    @Test
    void testGetProductById_NotFound() {
        // Arrange
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            productService.getProductById(999L);
        });
    }

    @Test
    void testCreateProduct() {
        // Arrange
        ProductRequest request = ProductRequest.builder()
                .name("Classic T-Shirt")
                .slug("classic-t-shirt")
                .description("A classic t-shirt")
                .categoryId(1L)
                .retailPrice(BigDecimal.valueOf(100))
                .wholesalePrice(BigDecimal.valueOf(80))
                .wholesaleMinQuantity(6)
                .isActive(true)
                .isFeatured(false)
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.existsBySlug("classic-t-shirt")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenReturn(product);

        // Act
        ProductResponse result = productService.createProduct(request);

        // Assert
        assertNotNull(result);
        assertEquals("Classic T-Shirt", result.getName());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void testUpdateProduct_Success() {
        // Arrange
        ProductRequest request = ProductRequest.builder()
                .name("Updated T-Shirt")
                .slug("classic-t-shirt")
                .description("An updated t-shirt")
                .categoryId(1L)
                .retailPrice(BigDecimal.valueOf(120))
                .wholesalePrice(BigDecimal.valueOf(100))
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        // Act
        ProductResponse result = productService.updateProduct(1L, request);

        // Assert
        assertNotNull(result);
        verify(productRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void testDeleteProduct_Success() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // Act
        productService.deleteProduct(1L);

        // Assert
        assertFalse(product.getIsActive());
        verify(productRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).save(product);
    }

    @Test
    void testCalculateDiscountPercentage() {
        // Arrange
        // Product already has wholesalePrice set to 80 and retailPrice to 100
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // Act
        ProductResponse result = productService.getProductById(1L);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getDiscountPercentage());
        assertEquals(20.0, result.getDiscountPercentage().doubleValue(), 0.01);
        assertEquals(BigDecimal.valueOf(80), result.getWholesalePrice());
    }
}
