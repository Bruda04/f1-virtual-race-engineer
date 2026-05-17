package com.ftn.sbnz.f1.service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ftn.sbnz.f1.model.events.GForceEvent;
import com.ftn.sbnz.f1.model.events.LapTimeEvent;
import com.ftn.sbnz.f1.model.events.SpeedEvent;
import com.ftn.sbnz.f1.model.events.TemperatureEvent;
import com.ftn.sbnz.f1.model.events.TyrePressureEvent;
import com.ftn.sbnz.f1.model.facts.*;
import com.ftn.sbnz.f1.model.facts.BatteryStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

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
    private List<TyrePressureEvent> tyrePressureEvents;
    private List<TemperatureEvent> temperatureEvents;
    private List<LapTimeEvent> lapTimeEvents;
    @JsonProperty("gForceEvents")
    private List<GForceEvent> gForceEvents;
    private List<SpeedEvent> speedEvents;

}
