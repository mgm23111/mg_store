package com.mgstore.domain.service;

import com.mgstore.domain.entity.Order;
import com.mgstore.domain.entity.WhatsAppLog;
import com.mgstore.domain.repository.WhatsAppLogRepository;
import com.mgstore.util.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class WhatsAppService {

    private static final Logger logger = LoggerFactory.getLogger(WhatsAppService.class);

    @Value("${whatsapp.api.token:}")
    private String apiToken;

    @Value("${whatsapp.phone.number.id:}")
    private String phoneNumberId;

    @Value("${whatsapp.api.url:https://graph.facebook.com/v18.0}")
    private String apiUrl;

    @Autowired
    private WhatsAppLogRepository whatsAppLogRepository;

    /**
     * Send order confirmation message
     * Executed asynchronously
     */
    @Async
    public void sendOrderConfirmation(Order order) {
        try {
            String message = buildOrderConfirmationMessage(order);
            String phoneNumber = formatPhoneNumber(order.getCustomerPhone());

            sendMessage(phoneNumber, message, order.getId(), Constants.WHATSAPP_MESSAGE_ORDER_CONFIRMATION);

            logger.info("Order confirmation WhatsApp sent for order: {}", order.getOrderNumber());

        } catch (Exception e) {
            logger.error("Error sending WhatsApp for order {}: {}", order.getOrderNumber(), e.getMessage());
            logFailedMessage(order.getId(), Constants.WHATSAPP_MESSAGE_ORDER_CONFIRMATION, e.getMessage());
        }
    }

    /**
     * Send shipping update message
     */
    @Async
    public void sendShippingUpdate(Order order, String trackingNumber) {
        try {
            String message = buildShippingUpdateMessage(order, trackingNumber);
            String phoneNumber = formatPhoneNumber(order.getCustomerPhone());

            sendMessage(phoneNumber, message, order.getId(), Constants.WHATSAPP_MESSAGE_SHIPPING_UPDATE);

            logger.info("Shipping update WhatsApp sent for order: {}", order.getOrderNumber());

        } catch (Exception e) {
            logger.error("Error sending shipping WhatsApp for order {}: {}", order.getOrderNumber(), e.getMessage());
            logFailedMessage(order.getId(), Constants.WHATSAPP_MESSAGE_SHIPPING_UPDATE, e.getMessage());
        }
    }

    /**
     * Send delivery confirmation message
     */
    @Async
    public void sendDeliveryConfirmation(Order order) {
        try {
            String message = buildDeliveryConfirmationMessage(order);
            String phoneNumber = formatPhoneNumber(order.getCustomerPhone());

            sendMessage(phoneNumber, message, order.getId(), Constants.WHATSAPP_MESSAGE_DELIVERY_CONFIRMATION);

            logger.info("Delivery confirmation WhatsApp sent for order: {}", order.getOrderNumber());

        } catch (Exception e) {
            logger.error("Error sending delivery WhatsApp for order {}: {}", order.getOrderNumber(), e.getMessage());
            logFailedMessage(order.getId(), Constants.WHATSAPP_MESSAGE_DELIVERY_CONFIRMATION, e.getMessage());
        }
    }

    // Helper methods

    private void sendMessage(String phoneNumber, String message, Long orderId, String messageType) {
        // Check if API is configured
        if (apiToken == null || apiToken.isBlank() || phoneNumberId == null || phoneNumberId.isBlank()) {
            logger.warn("WhatsApp API not configured. Skipping message send.");
            logFailedMessage(orderId, messageType, "WhatsApp API not configured");
            return;
        }

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Build WhatsApp API request
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("messaging_product", "whatsapp");
        requestBody.put("to", phoneNumber);
        requestBody.put("type", "text");

        Map<String, String> text = new HashMap<>();
        text.put("body", message);
        requestBody.put("text", text);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            String url = apiUrl + "/" + phoneNumberId + "/messages";
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                logSuccessMessage(orderId, phoneNumber, message, messageType);
            } else {
                logFailedMessage(orderId, messageType, "HTTP " + response.getStatusCode());
            }

        } catch (Exception e) {
            logger.error("WhatsApp API error: {}", e.getMessage());
            logFailedMessage(orderId, messageType, e.getMessage());
            throw new RuntimeException("Failed to send WhatsApp message", e);
        }
    }

    private String buildOrderConfirmationMessage(Order order) {
        return String.format(
                "¡Hola %s! 👋\n\n" +
                "Gracias por tu compra en MG Store 🛍️\n\n" +
                "📦 *Pedido #%s*\n" +
                "💰 Total: S/ %.2f\n\n" +
                "Tu pedido ha sido confirmado y está siendo procesado.\n\n" +
                "Te notificaremos cuando sea enviado. 📬\n\n" +
                "¡Gracias por tu preferencia! 🙏",
                order.getCustomerName(),
                order.getOrderNumber(),
                order.getTotalAmount()
        );
    }

    private String buildShippingUpdateMessage(Order order, String trackingNumber) {
        return String.format(
                "¡Hola %s! 👋\n\n" +
                "Tu pedido *#%s* ha sido enviado 📦✨\n\n" +
                "🔢 Código de seguimiento: %s\n\n" +
                "Recibirás tu pedido pronto.\n\n" +
                "¡Gracias por tu preferencia! 🙏",
                order.getCustomerName(),
                order.getOrderNumber(),
                trackingNumber
        );
    }

    private String buildDeliveryConfirmationMessage(Order order) {
        return String.format(
                "¡Hola %s! 👋\n\n" +
                "Tu pedido *#%s* ha sido entregado ✅\n\n" +
                "Esperamos que disfrutes tus productos 🎉\n\n" +
                "¿Necesitas ayuda? Contáctanos.\n\n" +
                "¡Gracias por comprar en MG Store! 🙏",
                order.getCustomerName(),
                order.getOrderNumber()
        );
    }

    private String formatPhoneNumber(String phone) {
        // Remove all non-digit characters
        String cleaned = phone.replaceAll("[^0-9]", "");

        // If starts with 51 (Peru code), use as is
        if (cleaned.startsWith("51")) {
            return cleaned;
        }

        // If starts with 0, remove it and add 51
        if (cleaned.startsWith("0")) {
            return "51" + cleaned.substring(1);
        }

        // Otherwise, add 51 (Peru country code)
        return "51" + cleaned;
    }

    private void logSuccessMessage(Long orderId, String phoneNumber, String message, String messageType) {
        Order order = new Order();
        order.setId(orderId);

        WhatsAppLog log = WhatsAppLog.builder()
                .order(order)
                .phoneNumber(phoneNumber)
                .messageContent(message)
                .messageType(messageType)
                .status(Constants.WHATSAPP_STATUS_SENT)
                .sentAt(java.time.LocalDateTime.now())
                .build();

        whatsAppLogRepository.save(log);
    }

    private void logFailedMessage(Long orderId, String messageType, String errorMessage) {
        Order order = new Order();
        order.setId(orderId);

        WhatsAppLog log = WhatsAppLog.builder()
                .order(order)
                .phoneNumber("")
                .messageContent("")
                .messageType(messageType)
                .status(Constants.WHATSAPP_STATUS_FAILED)
                .errorMessage(errorMessage)
                .build();

        whatsAppLogRepository.save(log);
    }
}
