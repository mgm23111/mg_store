package com.mgstore.infrastructure.controller;

import com.mgstore.application.dto.request.CulqiPaymentRequest;
import com.mgstore.application.dto.response.ApiResponse;
import com.mgstore.domain.entity.Payment;
import com.mgstore.domain.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    /**
     * Process Culqi payment
     */
    @PostMapping("/culqi")
    public ResponseEntity<ApiResponse<Payment>> processCulqiPayment(
            @Valid @RequestBody CulqiPaymentRequest request) {

        Payment payment = paymentService.processCulqiPayment(request.getOrderId(), request.getToken());
        return ResponseEntity.ok(ApiResponse.success("Payment processed successfully", payment));
    }

    /**
     * Get payment by order ID
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<Payment>> getPaymentByOrderId(@PathVariable Long orderId) {
        Payment payment = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(payment));
    }
}
