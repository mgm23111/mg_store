package com.mgstore.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "whatsapp_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WhatsAppLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    // Message Type: ORDER_CONFIRMATION, SHIPPING_UPDATE, etc.
    @Column(name = "message_type", nullable = false, length = 50)
    private String messageType;

    @Column(name = "message_content", nullable = false, columnDefinition = "TEXT")
    private String messageContent;

    // Status: SENT, FAILED, PENDING
    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "whatsapp_message_id", length = 100)
    private String whatsappMessageId;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
