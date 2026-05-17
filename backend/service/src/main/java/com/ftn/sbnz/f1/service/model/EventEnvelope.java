package com.ftn.sbnz.f1.service.model;

import lombok.Getter;

import java.time.Instant;

@Getter
public class EventEnvelope {
    private final Instant timestamp;
    private final Object payload;

    public EventEnvelope(Instant timestamp, Object payload) {
        if (timestamp == null) {
            timestamp = Instant.EPOCH;
        }
        this.timestamp = timestamp;
        this.payload = payload;
    }
}