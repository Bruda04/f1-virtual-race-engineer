package com.ftn.sbnz.f1.model.facts;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrackSafetyParameters {
    private double criticalTyreTemperatureCelsius;
    private double criticalBrakeTemperatureCelsius;
    private double maxEngineTemperatureCelsius;
    private double criticalFuelConsumptionDeltaKgPerLap;
}
