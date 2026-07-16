package com.campusconnect.exception;

public class InvalidEventTimeException extends RuntimeException {

    public InvalidEventTimeException(String message) {
        super(message);
    }
}