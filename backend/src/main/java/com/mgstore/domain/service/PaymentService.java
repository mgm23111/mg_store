package com.mgstore.domain.service;

import com.mgstore.application.dto.request.CulqiChargeRequest;
import com.mgstore.application.dto.response.CulqiChargeResponse;
import com.mgstore.domain.entity.Order;
import com.mgstore.domain.entity.Payment;
import com.mgstore.domain.repository.OrderRepository;
import com.mgstore.domain.repository.PaymentRepository;
import com.mgstore.infrastructure.exception.PaymentException;
import com.mgstore.infrastructure.exception.ResourceNotFoundException;
import com.mgstore.util.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CulqiService culqiService;

    @Autowired(required = false)
    private WhatsAppService whatsAppService;

    /**
     * Process Culqi payment
     * Automatically approves payment and deducts stock if successful
     */
    @Transactional
    public Payment processCulqiPayment(Long orderId, String culqiToken) {
        // Get order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Verify order status
        if (!order.getStatus().equals(Constants.ORDER_STATUS_PENDING)) {
            throw new PaymentException("Order is not in PENDING status");
        }

        // Get payment record
        Payment payment = paymentRepository.findByOrderIdAndStatus(orderId, Constants.PAYMENT_STATUS_PENDING)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", orderId));

        // Verify payment method
        if (!payment.getPaymentMethod().equals(Constants.PAYMENT_METHOD_CULQI)) {
            throw new PaymentException("Payment method is not CULQI");
        }

        try {
            // Create charge in Culqi
            CulqiChargeRequest culqiRequest = CulqiChargeRequest.builder()
                    .amount((int) (order.getTotalAmount().doubleValue() * 100))  // Convert to cents
                    .currencyCode("PEN")
                    .email(order.getCustomerEmail())
                    .sourceId(culqiToken)
                    .description("Orden #" + order.getOrderNumber() + " - MG Store")
                    .metadata(Map.of(
                            "order_id", order.getId().toString(),
                            "order_number", order.getOrderNumber()
                    ))
                    .build();

            CulqiChargeResponse culqiResponse = culqiService.createCharge(culqiRequest);

            // Update payment with Culqi information
            payment.setCulqiChargeId(culqiResponse.getId());
            payment.setCulqiTransactionId(culqiResponse.getTransactionId());
            payment.setStatus(Constants.PAYMENT_STATUS_COMPLETED);
            payment.setCompletedAt(LocalDateTime.now());

            // Store metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("culqi_response", culqiResponse);
            payment.setMetadata(metadata);

            paymentRepository.save(payment);

            // APPROVE PAYMENT: Deduct stock and send WhatsApp
            orderService.approvePayment(orderId);

            // Send WhatsApp notification (async)
            if (whatsAppService != null) {
                whatsAppService.sendOrderConfirmation(order);
            }

            return payment;

        } catch (PaymentException e) {
            // Update payment as failed
            payment.setStatus(Constants.PAYMENT_STATUS_FAILED);
            paymentRepository.save(payment);

            throw e;
        } catch (Exception e) {
            // Update payment as failed
            payment.setStatus(Constants.PAYMENT_STATUS_FAILED);
            paymentRepository.save(payment);

            throw new PaymentException("Error processing Culqi payment: " + e.getMessage(), e);
        }
    }

    /**
     * Get pending Yape payments for admin console
     */
    @Transactional(readOnly = true)
    public List<Payment> getPendingYapePayments() {
        return paymentRepository.findPendingYapePayments();
    }

    /**
     * Approve Yape payment manually (admin)
     * Deducts stock and sends WhatsApp
     */
    @Transactional
    public Payment approveYapePayment(Long paymentId, Long adminId, String notes) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        // Verify payment method and status
        if (!payment.getPaymentMethod().equals(Constants.PAYMENT_METHOD_YAPE)) {
            throw new PaymentException("Payment method is not YAPE");
        }

        if (!payment.getStatus().equals(Constants.PAYMENT_STATUS_PENDING)) {
            throw new PaymentException("Payment is not in PENDING status");
        }

        // Update payment
        payment.setStatus(Constants.PAYMENT_STATUS_COMPLETED);
        payment.setYapeApprovalNotes(notes);
        payment.setCompletedAt(LocalDateTime.now());
        // Note: yapeApprovedByAdmin would be set if we had Admin entity loaded

        paymentRepository.save(payment);

        // APPROVE PAYMENT: Deduct stock
        orderService.approvePayment(payment.getOrder().getId());

        // Send WhatsApp notification (async)
        if (whatsAppService != null) {
            Order order = payment.getOrder();
            whatsAppService.sendOrderConfirmation(order);
        }

        return payment;
    }

    /**
     * Reject Yape payment manually (admin)
     * Releases reserved stock and cancels order
     */
    @Transactional
    public Payment rejectYapePayment(Long paymentId, Long adminId, String notes) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        // Verify payment method and status
        if (!payment.getPaymentMethod().equals(Constants.PAYMENT_METHOD_YAPE)) {
            throw new PaymentException("Payment method is not YAPE");
        }

        if (!payment.getStatus().equals(Constants.PAYMENT_STATUS_PENDING)) {
            throw new PaymentException("Payment is not in PENDING status");
        }

        // Update payment
        payment.setStatus(Constants.PAYMENT_STATUS_FAILED);
        payment.setYapeApprovalNotes(notes);
        // Note: yapeApprovedByAdmin would be set if we had Admin entity loaded

        paymentRepository.save(payment);

        // CANCEL ORDER: Release reserved stock
        orderService.cancelOrder(payment.getOrder().getId());

        return payment;
    }

    /**
     * Get payment by order ID
     */
    @Transactional(readOnly = true)
    public Payment getPaymentByOrderId(Long orderId) {
        List<Payment> payments = paymentRepository.findByOrderId(orderId);
        if (payments.isEmpty()) {
            throw new ResourceNotFoundException("Payment", "orderId", orderId);
        }
        // Return the latest payment
        return payments.get(payments.size() - 1);
    }
}
