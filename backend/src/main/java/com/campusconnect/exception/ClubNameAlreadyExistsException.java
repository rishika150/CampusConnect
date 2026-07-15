package com.campusconnect.exception;

public class ClubNameAlreadyExistsException extends RuntimeException {

    public ClubNameAlreadyExistsException(String name) {
        super("A club already exists with name: " + name);
    }
}
