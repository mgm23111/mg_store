package com.mgstore.domain.repository;

import com.mgstore.domain.entity.Color;
import com.mgstore.domain.entity.Product;
import com.mgstore.domain.entity.ProductVariant;
import com.mgstore.domain.entity.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductId(Long productId);

    List<ProductVariant> findByProduct(Product product);

    Optional<ProductVariant> findBySku(String sku);

    @Query("SELECT pv FROM ProductVariant pv JOIN FETCH pv.color JOIN FETCH pv.size WHERE pv.product.id = :productId AND pv.isActive = true")
    List<ProductVariant> findActiveByProductIdWithDetails(@Param("productId") Long productId);

    @Query("SELECT pv FROM ProductVariant pv WHERE pv.product.id = :productId AND pv.color.id = :colorId AND pv.size.id = :sizeId")
    Optional<ProductVariant> findByProductIdAndColorIdAndSizeId(@Param("productId") Long productId,
                                                                  @Param("colorId") Long colorId,
                                                                  @Param("sizeId") Long sizeId);

    boolean existsBySku(String sku);

    boolean existsByProductAndColorAndSize(Product product, Color color, Size size);
}
