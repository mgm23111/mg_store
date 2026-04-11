package com.mgstore.infrastructure.exception;

public class InvalidRequestException extends BusinessException {

    public InvalidRequestException(String message) {
        super(message);
    }
}
