package com.ftn.sbnz.f1.service.dto;

import lombok.Data;

@Data
public class TelemetrySnapshot {
    private Double speedKmh;

    private Double lateralGForce;
    private Double longitudinalGForce;

    private Double tyrePressureBar;

    private Double engineTemperatureCelsius;
    private Double brakeTemperatureCelsius;
    private Double tyreTemperatureCelsius;

    private Double lapTimeSeconds;
}