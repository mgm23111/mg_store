package com.mgstore.domain.repository;

import com.mgstore.domain.entity.ShippingAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, Long> {

    Optional<ShippingAddress> findByOrderId(Long orderId);
}
