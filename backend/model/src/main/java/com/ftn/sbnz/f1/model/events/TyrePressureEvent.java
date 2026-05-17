package com.ftn.sbnz.f1.model.events;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TyrePressureEvent {
    private Instant timestamp;
    private double pressureBar;

    public long getTimestampMillis() {
        return timestamp == null ? 0 : timestamp.toEpochMilli();
    }
}
