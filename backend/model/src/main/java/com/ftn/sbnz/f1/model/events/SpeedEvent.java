package com.ftn.sbnz.f1.model.events;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpeedEvent {
    private Instant timestamp;
    private double speedKmh;

    public long getTimestampMillis() {
        return timestamp == null ? 0 : timestamp.toEpochMilli();
    }
}
