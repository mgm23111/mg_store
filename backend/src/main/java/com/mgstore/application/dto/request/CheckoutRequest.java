package com.mgstore.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    @NotBlank(message = "Session ID or cart ID is required")
    private String sessionId;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String customerEmail;

    @NotBlank(message = "Phone is required")
    private String customerPhone;

    private String customerDocumentType; // Optional: DNI, RUC, CE, Passport, etc.

    private String customerDocumentNumber; // Optional: Document/ID number

    @NotNull(message = "Shipping address is required")
    private ShippingAddressRequest shippingAddress;

    @NotNull(message = "Shipping method ID is required")
    private Long shippingMethodId;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // CULQI or YAPE

    private String couponCode;

    private String giftCardCode;
}
