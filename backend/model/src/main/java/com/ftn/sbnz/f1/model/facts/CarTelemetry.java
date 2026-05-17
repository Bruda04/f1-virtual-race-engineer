package com.ftn.sbnz.f1.model.facts;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarTelemetry {
    private double speedKmh;
    private double lateralGForce;
    private double longitudinalGForce;
    private double fuelPressure;
    private double oilPressure;
    private int ersBatteryPercentage;
}
