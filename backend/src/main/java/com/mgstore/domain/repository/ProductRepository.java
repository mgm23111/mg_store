package com.mgstore.domain.repository;

import com.mgstore.domain.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);

    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.images " +
           "WHERE p.slug = :slug")
    Optional<Product> findBySlugWithImages(@Param("slug") String slug);

    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.variants v " +
           "LEFT JOIN FETCH v.color " +
           "LEFT JOIN FETCH v.size " +
           "WHERE p.slug = :slug")
    Optional<Product> findBySlugWithVariants(@Param("slug") String slug);

    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.images " +
           "WHERE p.slug = :slug")
    Optional<Product> findBySlugWithDetails(@Param("slug") String slug);

    List<Product> findByIsActiveTrue();

    List<Product> findByIsFeaturedTrueAndIsActiveTrue();

    List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Product> findWithFilters(@Param("categoryId") Long categoryId,
                                   @Param("search") String search);

    boolean existsBySlug(String slug);
}
