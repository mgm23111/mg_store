package com.mgstore.domain.repository;

import com.mgstore.domain.entity.ShippingMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShippingMethodRepository extends JpaRepository<ShippingMethod, Long> {

    Optional<ShippingMethod> findByCode(String code);

    List<ShippingMethod> findByIsActiveTrue();

    boolean existsByCode(String code);
}
