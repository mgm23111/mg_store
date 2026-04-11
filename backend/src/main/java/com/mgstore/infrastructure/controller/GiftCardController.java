package com.mgstore.infrastructure.controller;

import com.mgstore.application.dto.request.GiftCardRequest;
import com.mgstore.application.dto.response.ApiResponse;
import com.mgstore.application.dto.response.GiftCardResponse;
import com.mgstore.domain.service.GiftCardService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@CrossOrigin(origins = "*")
public class GiftCardController {

    @Autowired
    private GiftCardService giftCardService;

    // ==================== PUBLIC ENDPOINTS ====================

    /**
     * Validate gift card code (for checkout)
     */
    @GetMapping("/gift-cards/validate/{code}")
    public ResponseEntity<ApiResponse<GiftCardResponse>> validateGiftCard(@PathVariable String code) {
        GiftCardResponse giftCard = giftCardService.validateGiftCard(code);
        return ResponseEntity.ok(ApiResponse.success("Gift card is valid", giftCard));
    }

    /**
     * Check gift card balance
     */
    @GetMapping("/gift-cards/balance/{code}")
    public ResponseEntity<ApiResponse<BigDecimal>> checkBalance(@PathVariable String code) {
        BigDecimal balance = giftCardService.checkBalance(code);
        return ResponseEntity.ok(ApiResponse.success("Balance retrieved", balance));
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Get all gift cards (admin)
     */
    @GetMapping("/admin/gift-cards")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<GiftCardResponse>>> getAllGiftCards() {
        List<GiftCardResponse> giftCards = giftCardService.getAllGiftCards();
        return ResponseEntity.ok(ApiResponse.success(giftCards));
    }

    /**
     * Get active gift cards (admin)
     */
    @GetMapping("/admin/gift-cards/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<GiftCardResponse>>> getActiveGiftCards() {
        List<GiftCardResponse> giftCards = giftCardService.getActiveGiftCards();
        return ResponseEntity.ok(ApiResponse.success(giftCards));
    }

    /**
     * Get gift card by ID (admin)
     */
    @GetMapping("/admin/gift-cards/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GiftCardResponse>> getGiftCardById(@PathVariable Long id) {
        GiftCardResponse giftCard = giftCardService.getGiftCardById(id);
        return ResponseEntity.ok(ApiResponse.success(giftCard));
    }

    /**
     * Get gift card by code (admin)
     */
    @GetMapping("/admin/gift-cards/code/{code}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GiftCardResponse>> getGiftCardByCode(@PathVariable String code) {
        GiftCardResponse giftCard = giftCardService.getGiftCardByCode(code);
        return ResponseEntity.ok(ApiResponse.success(giftCard));
    }

    /**
     * Create new gift card (admin)
     */
    @PostMapping("/admin/gift-cards")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GiftCardResponse>> createGiftCard(
            @Valid @RequestBody GiftCardRequest request) {
        GiftCardResponse giftCard = giftCardService.createGiftCard(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Gift card created successfully", giftCard));
    }

    /**
     * Update gift card (admin)
     */
    @PutMapping("/admin/gift-cards/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GiftCardResponse>> updateGiftCard(
            @PathVariable Long id,
            @Valid @RequestBody GiftCardRequest request) {
        GiftCardResponse giftCard = giftCardService.updateGiftCard(id, request);
        return ResponseEntity.ok(ApiResponse.success("Gift card updated successfully", giftCard));
    }

    /**
     * Add balance to gift card (admin)
     */
    @PostMapping("/admin/gift-cards/{id}/add-balance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GiftCardResponse>> addBalance(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> request) {
        BigDecimal amount = request.get("amount");
        GiftCardResponse giftCard = giftCardService.addBalance(id, amount);
        return ResponseEntity.ok(ApiResponse.success("Balance added successfully", giftCard));
    }

    /**
     * Deactivate gift card (admin)
     */
    @PutMapping("/admin/gift-cards/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateGiftCard(@PathVariable Long id) {
        giftCardService.deactivateGiftCard(id);
        return ResponseEntity.ok(ApiResponse.success("Gift card deactivated successfully", null));
    }

    /**
     * Delete gift card permanently (admin)
     */
    @DeleteMapping("/admin/gift-cards/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteGiftCard(@PathVariable Long id) {
        giftCardService.deleteGiftCard(id);
        return ResponseEntity.ok(ApiResponse.success("Gift card deleted successfully", null));
    }
}
