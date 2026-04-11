package com.mgstore.infrastructure.exception;

public class InsufficientStockException extends BusinessException {

    public InsufficientStockException(String message) {
        super(message);
    }

    public InsufficientStockException(String productName, Integer requested, Integer available) {
        super(String.format("Insufficient stock for %s. Requested: %d, Available: %d",
                productName, requested, available));
    }
}
