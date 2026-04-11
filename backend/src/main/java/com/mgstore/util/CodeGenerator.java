package com.mgstore.util;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

public class CodeGenerator {

    private static final String ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final Random RANDOM = new SecureRandom();

    /**
     * Generate unique order number
     * Format: ORD-YYYYMMDD-XXXXX
     */
    public static String generateOrderNumber() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = generateRandomString(5);
        return String.format("ORD-%s-%s", date, randomPart);
    }

    /**
     * Generate coupon code
     * Format: COUP-XXXXXXXXX
     */
    public static String generateCouponCode() {
        return "COUP-" + generateRandomString(9);
    }

    /**
     * Generate gift card code
     * Format: GIFT-XXXX-XXXX-XXXX
     */
    public static String generateGiftCardCode() {
        return String.format("GIFT-%s-%s-%s",
                generateRandomString(4),
                generateRandomString(4),
                generateRandomString(4));
    }

    /**
     * Generate SKU for product variant
     * Format: productId-colorId-sizeId
     */
    public static String generateSKU(Long productId, Long colorId, Long sizeId) {
        return String.format("SKU-%d-%d-%d", productId, colorId, sizeId);
    }

    /**
     * Generate random alphanumeric string
     */
    public static String generateRandomString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
        }
        return sb.toString();
    }

    /**
     * Generate session ID for anonymous cart
     */
    public static String generateSessionId() {
        return "SESSION-" + generateRandomString(16);
    }

    private CodeGenerator() {
        // Prevent instantiation
    }
}
