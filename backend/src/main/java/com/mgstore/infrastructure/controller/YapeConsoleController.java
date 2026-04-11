package com.mgstore.infrastructure.controller;

import com.mgstore.application.dto.response.ApiResponse;
import com.mgstore.domain.entity.Payment;
import com.mgstore.domain.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/yape")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class YapeConsoleController {

    @Autowired
    private PaymentService paymentService;

    /**
     * Get all pending Yape payments
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<Payment>>> getPendingYapePayments() {
        List<Payment> payments = paymentService.getPendingYapePayments();
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    /**
     * Approve Yape payment
     */
    @PostMapping("/{paymentId}/approve")
    public ResponseEntity<ApiResponse<Payment>> approveYapePayment(
            @PathVariable Long paymentId,
            @RequestBody Map<String, Object> request) {

        Long adminId = request.get("adminId") != null ? ((Number) request.get("adminId")).longValue() : null;
        String notes = (String) request.get("notes");

        Payment payment = paymentService.approveYapePayment(paymentId, adminId, notes);
        return ResponseEntity.ok(ApiResponse.success("Yape payment approved successfully", payment));
    }

    /**
     * Reject Yape payment
     */
    @PostMapping("/{paymentId}/reject")
    public ResponseEntity<ApiResponse<Payment>> rejectYapePayment(
            @PathVariable Long paymentId,
            @RequestBody Map<String, Object> request) {

        Long adminId = request.get("adminId") != null ? ((Number) request.get("adminId")).longValue() : null;
        String notes = (String) request.get("notes");

        Payment payment = paymentService.rejectYapePayment(paymentId, adminId, notes);
        return ResponseEntity.ok(ApiResponse.success("Yape payment rejected", payment));
    }
}
