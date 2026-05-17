package com.ftn.sbnz.f1.model.events;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TelemetryEvent {
    private Instant timestamp;
    private double speedKmh;
    private double lateralGForce;
    private double longitudinalGForce;
}
