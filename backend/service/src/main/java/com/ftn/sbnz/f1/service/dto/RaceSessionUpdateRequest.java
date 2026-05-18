package com.ftn.sbnz.f1.service.dto;

import com.ftn.sbnz.f1.model.facts.*;
import com.ftn.sbnz.f1.model.facts.BatteryStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RaceSessionUpdateRequest {
    private RaceState raceState;
    private BatteryStatus batteryStatus;
    private FuelStatus fuelStatus;
    private EngineStatus engineStatus;
    private BrakeStatus brakeStatus;
    private TyreStatus tyreStatus;
    private WeatherStatus weatherStatus;
    private TrackStatus trackStatus;
    private CompetitorStatus competitorStatus;
    private DriverReport driverReport;
    private SuspensionStatus suspensionStatus;

    private Instant timestamp;
    private TelemetrySnapshot telemetry;
}
