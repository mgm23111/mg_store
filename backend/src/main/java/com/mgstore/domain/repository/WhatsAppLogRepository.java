package com.mgstore.domain.repository;

import com.mgstore.domain.entity.WhatsAppLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WhatsAppLogRepository extends JpaRepository<WhatsAppLog, Long> {

    List<WhatsAppLog> findByOrderIdOrderByCreatedAtDesc(Long orderId);

    List<WhatsAppLog> findByStatusOrderByCreatedAtDesc(String status);

    List<WhatsAppLog> findByPhoneNumber(String phoneNumber);
}
