package com.mgstore.domain.service;

import com.mgstore.application.dto.request.GiftCardRequest;
import com.mgstore.application.dto.response.GiftCardResponse;
import com.mgstore.domain.entity.GiftCard;
import com.mgstore.domain.repository.GiftCardRepository;
import com.mgstore.infrastructure.exception.BusinessException;
import com.mgstore.infrastructure.exception.ResourceNotFoundException;
import com.mgstore.util.CodeGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GiftCardService {

    @Autowired
    private GiftCardRepository giftCardRepository;

    /**
     * Get all gift cards
     */
    @Transactional(readOnly = true)
    public List<GiftCardResponse> getAllGiftCards() {
        return giftCardRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get active gift cards only
     */
    @Transactional(readOnly = true)
    public List<GiftCardResponse> getActiveGiftCards() {
        return giftCardRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get gift card by ID
     */
    @Transactional(readOnly = true)
    public GiftCardResponse getGiftCardById(Long id) {
        GiftCard giftCard = giftCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gift card", "id", id));
        return mapToResponse(giftCard);
    }

    /**
     * Get gift card by code
     */
    @Transactional(readOnly = true)
    public GiftCardResponse getGiftCardByCode(String code) {
        GiftCard giftCard = giftCardRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Gift card", "code", code));
        return mapToResponse(giftCard);
    }

    /**
     * Validate gift card code (for checkout)
     */
    @Transactional(readOnly = true)
    public GiftCardResponse validateGiftCard(String code) {
        GiftCard giftCard = giftCardRepository.findByCode(code)
                .orElseThrow(() -> new BusinessException("Invalid gift card code"));

        if (!giftCard.isValid()) {
            throw new BusinessException("Gift card is not valid or has no balance");
        }

        return mapToResponse(giftCard);
    }

    /**
     * Check gift card balance
     */
    @Transactional(readOnly = true)
    public BigDecimal checkBalance(String code) {
        GiftCard giftCard = giftCardRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Gift card", "code", code));
        return giftCard.getCurrentBalance();
    }

    /**
     * Create new gift card
     */
    @Transactional
    public GiftCardResponse createGiftCard(GiftCardRequest request) {
        // Generate code if not provided
        String code = request.getCode();
        if (code == null || code.isBlank()) {
            code = CodeGenerator.generateGiftCardCode();
        } else {
            code = code.toUpperCase();
        }

        // Check if code already exists
        if (giftCardRepository.existsByCode(code)) {
            throw new BusinessException("Gift card code already exists");
        }

        GiftCard giftCard = GiftCard.builder()
                .code(code)
                .initialBalance(request.getInitialBalance())
                .currentBalance(request.getInitialBalance())
                .validUntil(request.getValidUntil())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        giftCard = giftCardRepository.save(giftCard);
        return mapToResponse(giftCard);
    }

    /**
     * Update gift card
     */
    @Transactional
    public GiftCardResponse updateGiftCard(Long id, GiftCardRequest request) {
        GiftCard giftCard = giftCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gift card", "id", id));

        // Only allow updating validUntil and isActive
        // Balance changes should be done through transactions
        giftCard.setValidUntil(request.getValidUntil());

        if (request.getIsActive() != null) {
            giftCard.setIsActive(request.getIsActive());
        }

        giftCard = giftCardRepository.save(giftCard);
        return mapToResponse(giftCard);
    }

    /**
     * Add balance to gift card (for refunds or adjustments)
     */
    @Transactional
    public GiftCardResponse addBalance(Long id, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Amount must be greater than zero");
        }

        GiftCard giftCard = giftCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gift card", "id", id));

        giftCard.setCurrentBalance(giftCard.getCurrentBalance().add(amount));
        giftCard = giftCardRepository.save(giftCard);

        return mapToResponse(giftCard);
    }

    /**
     * Deactivate gift card
     */
    @Transactional
    public void deactivateGiftCard(Long id) {
        GiftCard giftCard = giftCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gift card", "id", id));

        giftCard.setIsActive(false);
        giftCardRepository.save(giftCard);
    }

    /**
     * Delete gift card permanently
     */
    @Transactional
    public void deleteGiftCard(Long id) {
        GiftCard giftCard = giftCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gift card", "id", id));

        // Check if gift card has been used
        if (giftCard.getCurrentBalance().compareTo(giftCard.getInitialBalance()) < 0) {
            throw new BusinessException("Cannot delete gift card that has been used. Deactivate it instead.");
        }

        giftCardRepository.delete(giftCard);
    }

    // Helper method
    private GiftCardResponse mapToResponse(GiftCard giftCard) {
        return GiftCardResponse.builder()
                .id(giftCard.getId())
                .code(giftCard.getCode())
                .initialBalance(giftCard.getInitialBalance())
                .currentBalance(giftCard.getCurrentBalance())
                .validUntil(giftCard.getValidUntil())
                .isActive(giftCard.getIsActive())
                .isValid(giftCard.isValid())
                .createdAt(giftCard.getCreatedAt())
                .updatedAt(giftCard.getUpdatedAt())
                .build();
    }
}
