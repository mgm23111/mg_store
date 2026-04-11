package com.mgstore.domain.repository;

import com.mgstore.domain.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {

    List<CouponUsage> findByCouponId(Long couponId);

    long countByCouponId(Long couponId);
}
