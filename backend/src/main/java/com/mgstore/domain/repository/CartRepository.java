package com.mgstore.domain.repository;

import com.mgstore.domain.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findBySessionId(String sessionId);

    Optional<Cart> findByCustomerId(Long customerId);

    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items WHERE c.sessionId = :sessionId")
    Optional<Cart> findBySessionIdWithItems(@Param("sessionId") String sessionId);

    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items WHERE c.customer.id = :customerId")
    Optional<Cart> findByCustomerIdWithItems(@Param("customerId") Long customerId);
}
