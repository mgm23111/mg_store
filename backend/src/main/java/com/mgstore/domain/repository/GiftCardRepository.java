package com.mgstore.domain.repository;

import com.mgstore.domain.entity.GiftCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GiftCardRepository extends JpaRepository<GiftCard, Long> {

    Optional<GiftCard> findByCode(String code);

    List<GiftCard> findByIsActiveTrue();

    boolean existsByCode(String code);
}
