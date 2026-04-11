package com.mgstore.domain.repository;

import com.mgstore.domain.entity.GiftCardTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GiftCardTransactionRepository extends JpaRepository<GiftCardTransaction, Long> {

    List<GiftCardTransaction> findByGiftCardIdOrderByCreatedAtDesc(Long giftCardId);

    List<GiftCardTransaction> findByOrderId(Long orderId);
}
