package com.mgstore.domain.repository;

import com.mgstore.domain.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByOrderId(Long orderId);

    Optional<Payment> findByOrderIdAndStatus(Long orderId, String status);

    List<Payment> findByPaymentMethodAndStatus(String paymentMethod, String status);

    @Query("SELECT p FROM Payment p JOIN FETCH p.order WHERE p.paymentMethod = 'YAPE' AND p.status = 'PENDING' ORDER BY p.createdAt ASC")
    List<Payment> findPendingYapePayments();

    Optional<Payment> findByCulqiChargeId(String culqiChargeId);
}
