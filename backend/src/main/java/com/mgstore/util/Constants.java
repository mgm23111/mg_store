package com.mgstore.util;

public class Constants {

    // Order Status
    public static final String ORDER_STATUS_PENDING = "PENDING";
    public static final String ORDER_STATUS_PENDING_YAPE = "PENDING_YAPE";
    public static final String ORDER_STATUS_PAID = "PAID";
    public static final String ORDER_STATUS_PROCESSING = "PROCESSING";
    public static final String ORDER_STATUS_SHIPPED = "SHIPPED";
    public static final String ORDER_STATUS_DELIVERED = "DELIVERED";
    public static final String ORDER_STATUS_CANCELLED = "CANCELLED";

    // Payment Status
    public static final String PAYMENT_STATUS_PENDING = "PENDING";
    public static final String PAYMENT_STATUS_COMPLETED = "COMPLETED";
    public static final String PAYMENT_STATUS_FAILED = "FAILED";
    public static final String PAYMENT_STATUS_REFUNDED = "REFUNDED";

    // Payment Methods
    public static final String PAYMENT_METHOD_CULQI = "CULQI";
    public static final String PAYMENT_METHOD_YAPE = "YAPE";

    // Shipping Status
    public static final String SHIPPING_STATUS_PENDING = "PENDING";
    public static final String SHIPPING_STATUS_PROCESSING = "PROCESSING";
    public static final String SHIPPING_STATUS_SHIPPED = "SHIPPED";
    public static final String SHIPPING_STATUS_IN_TRANSIT = "IN_TRANSIT";
    public static final String SHIPPING_STATUS_DELIVERED = "DELIVERED";

    // Coupon Types
    public static final String COUPON_TYPE_PERCENTAGE = "PERCENTAGE";
    public static final String COUPON_TYPE_FIXED_AMOUNT = "FIXED_AMOUNT";

    // Gift Card Transaction Types
    public static final String GIFT_CARD_TRANSACTION_CREATION = "CREATION";
    public static final String GIFT_CARD_TRANSACTION_USAGE = "USAGE";
    public static final String GIFT_CARD_TRANSACTION_REFUND = "REFUND";

    // WhatsApp Message Types
    public static final String WHATSAPP_MESSAGE_ORDER_CONFIRMATION = "ORDER_CONFIRMATION";
    public static final String WHATSAPP_MESSAGE_SHIPPING_UPDATE = "SHIPPING_UPDATE";
    public static final String WHATSAPP_MESSAGE_DELIVERY_CONFIRMATION = "DELIVERY_CONFIRMATION";

    // WhatsApp Status
    public static final String WHATSAPP_STATUS_SENT = "SENT";
    public static final String WHATSAPP_STATUS_FAILED = "FAILED";
    public static final String WHATSAPP_STATUS_PENDING = "PENDING";

    // Default Values
    public static final int DEFAULT_WHOLESALE_MIN_QUANTITY = 6;

    private Constants() {
        // Prevent instantiation
    }
}
