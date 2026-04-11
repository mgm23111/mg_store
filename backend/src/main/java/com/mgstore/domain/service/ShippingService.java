package com.mgstore.domain.service;

import com.mgstore.application.dto.request.UpdateShippingRequest;
import com.mgstore.application.dto.response.ShippingMethodResponse;
import com.mgstore.application.dto.response.ShippingResponse;
import com.mgstore.domain.entity.*;
import com.mgstore.domain.repository.*;
import com.mgstore.infrastructure.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShippingService {

    @Autowired
    private ShippingRepository shippingRepository;

    @Autowired
    private ShippingMethodRepository shippingMethodRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private WhatsAppService whatsAppService;

    // ==================== SHIPPING METHODS ====================

    @Transactional(readOnly = true)
    public List<ShippingMethodResponse> getAllShippingMethods() {
        return shippingMethodRepository.findAll()
                .stream()
                .map(this::mapShippingMethodToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShippingMethodResponse> getActiveShippingMethods() {
        return shippingMethodRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapShippingMethodToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ShippingMethodResponse getShippingMethodById(Long id) {
        ShippingMethod method = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShippingMethod", "id", id));
        return mapShippingMethodToResponse(method);
    }

    @Transactional
    public ShippingMethodResponse updateShippingMethod(Long id, ShippingMethod request) {
        ShippingMethod method = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShippingMethod", "id", id));

        method.setName(request.getName());
        method.setBasePrice(request.getBasePrice());
        method.setEstimatedDays(request.getEstimatedDays());
        method.setIsActive(request.getIsActive());

        method = shippingMethodRepository.save(method);
        return mapShippingMethodToResponse(method);
    }

    // ==================== SHIPPING MANAGEMENT ====================

    @Transactional(readOnly = true)
    public List<ShippingResponse> getAllShippings() {
        return shippingRepository.findAll()
                .stream()
                .map(this::mapShippingToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShippingResponse> getPendingShippings() {
        return shippingRepository.findByStatus("PENDING")
                .stream()
                .map(this::mapShippingToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ShippingResponse getShippingByOrderId(Long orderId) {
        Shipping shipping = shippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipping", "orderId", orderId));
        return mapShippingToResponse(shipping);
    }

    @Transactional
    public ShippingResponse updateShipping(Long orderId, UpdateShippingRequest request) {
        Shipping shipping = shippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipping", "orderId", orderId));

        Order order = shipping.getOrder();

        // Update carrier name if provided
        if (request.getCourierName() != null && !request.getCourierName().isBlank()) {
            shipping.setCarrier(request.getCourierName());
        }

        // Update tracking number if provided
        if (request.getTrackingNumber() != null && !request.getTrackingNumber().isBlank()) {
            shipping.setTrackingNumber(request.getTrackingNumber());

            // Send WhatsApp notification when tracking number is assigned
            if (shipping.getStatus().equals("PENDING") || shipping.getStatus().equals("PREPARING")) {
                whatsAppService.sendShippingUpdate(order, request.getTrackingNumber());
            }
        }

        // Update status if provided
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            String previousStatus = shipping.getStatus();
            shipping.setStatus(request.getStatus());

            // Update timestamps based on status
            switch (request.getStatus()) {
                case "SHIPPED":
                    if (shipping.getShippedAt() == null) {
                        shipping.setShippedAt(LocalDateTime.now());
                    }
                    break;
                case "DELIVERED":
                    if (shipping.getDeliveredAt() == null) {
                        shipping.setDeliveredAt(LocalDateTime.now());
                        // Send delivery confirmation WhatsApp
                        whatsAppService.sendDeliveryConfirmation(order);
                    }
                    break;
            }
        }

        // Notes functionality removed - not in Shipping entity

        shipping = shippingRepository.save(shipping);
        return mapShippingToResponse(shipping);
    }

    @Transactional
    public ShippingResponse updateShippingStatus(Long orderId, String status) {
        Shipping shipping = shippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipping", "orderId", orderId));

        Order order = shipping.getOrder();
        shipping.setStatus(status);

        // Update timestamps
        switch (status) {
            case "PREPARING":
                // Order is being prepared
                break;
            case "SHIPPED":
                if (shipping.getShippedAt() == null) {
                    shipping.setShippedAt(LocalDateTime.now());
                }
                // Send WhatsApp if tracking number exists
                if (shipping.getTrackingNumber() != null) {
                    whatsAppService.sendShippingUpdate(order, shipping.getTrackingNumber());
                }
                break;
            case "DELIVERED":
                if (shipping.getDeliveredAt() == null) {
                    shipping.setDeliveredAt(LocalDateTime.now());
                    whatsAppService.sendDeliveryConfirmation(order);
                }
                break;
        }

        shipping = shippingRepository.save(shipping);
        return mapShippingToResponse(shipping);
    }

    // ==================== HELPER METHODS ====================

    private ShippingMethodResponse mapShippingMethodToResponse(ShippingMethod method) {
        return ShippingMethodResponse.builder()
                .id(method.getId())
                .name(method.getName())
                .code(method.getCode())
                .basePrice(method.getBasePrice())
                .estimatedDays(method.getEstimatedDays())
                .isActive(method.getIsActive())
                .build();
    }

    private ShippingResponse mapShippingToResponse(Shipping shipping) {
        Order order = shipping.getOrder();
        ShippingAddress address = order.getShippingAddress();

        return ShippingResponse.builder()
                .id(shipping.getId())
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .shippingMethodId(shipping.getShippingMethod().getId())
                .shippingMethodName(shipping.getShippingMethodName())
                .courierName(shipping.getCarrier())
                .trackingNumber(shipping.getTrackingNumber())
                .shippingCost(order.getShippingCost())
                .status(shipping.getStatus())
                .estimatedDeliveryDate(null) // Not tracked in current schema
                .shippedAt(shipping.getShippedAt())
                .deliveredAt(shipping.getDeliveredAt())
                .notes(null) // Not tracked in current schema
                .recipientName(address != null ? address.getFullName() : order.getCustomerName())
                .recipientPhone(address != null ? address.getPhone() : order.getCustomerPhone())
                .address(address != null ? formatAddress(address) : "No address")
                .createdAt(shipping.getCreatedAt())
                .build();
    }

    private String formatAddress(ShippingAddress address) {
        return String.format("%s, %s, %s %s, %s",
                address.getAddressLine1(),
                address.getCity(),
                address.getState(),
                address.getPostalCode(),
                address.getCountry()
        );
    }
}
