package com.ftn.sbnz.f1.model.events;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemperatureEvent {
    private Instant timestamp;
    private double brakeTemperatureCelsius;
    private double engineTemperatureCelsius;
    private double tyreTemperatureCelsius;
}
