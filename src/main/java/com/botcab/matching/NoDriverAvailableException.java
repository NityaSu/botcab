package com.botcab.matching;

public class NoDriverAvailableException extends RuntimeException {

    public NoDriverAvailableException(double lat, double lng) {
        super("No available driver near " + lat + "," + lng);
    }
}
