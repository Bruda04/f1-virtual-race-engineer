package com.ftn.sbnz.f1.service.dto;

import com.ftn.sbnz.f1.model.events.GForceEvent;
import com.ftn.sbnz.f1.model.events.LapTimeEvent;
import com.ftn.sbnz.f1.model.events.SpeedEvent;
import com.ftn.sbnz.f1.model.events.TelemetryEvent;
import com.ftn.sbnz.f1.model.events.TemperatureEvent;
import com.ftn.sbnz.f1.model.events.TyrePressureEvent;
import com.ftn.sbnz.f1.model.facts.BrakeStatus;
import com.ftn.sbnz.f1.model.facts.CarTelemetry;
import com.ftn.sbnz.f1.model.facts.CompetitorStatus;
import com.ftn.sbnz.f1.model.facts.DriverReport;
import com.ftn.sbnz.f1.model.facts.EngineStatus;
import com.ftn.sbnz.f1.model.facts.FuelStatus;
import com.ftn.sbnz.f1.model.facts.RaceState;
import com.ftn.sbnz.f1.model.facts.SuspensionStatus;
import com.ftn.sbnz.f1.model.facts.TrackStatus;
import com.ftn.sbnz.f1.model.facts.TyreStatus;
import com.ftn.sbnz.f1.model.facts.WeatherStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RaceSessionUpdateRequest {
    private RaceState raceState;
    private CarTelemetry carTelemetry;
    private FuelStatus fuelStatus;
    private EngineStatus engineStatus;
    private BrakeStatus brakeStatus;
    private TyreStatus tyreStatus;
    private WeatherStatus weatherStatus;
    private TrackStatus trackStatus;
    private CompetitorStatus competitorStatus;
    private DriverReport driverReport;
    private SuspensionStatus suspensionStatus;
    private List<TelemetryEvent> telemetryEvents;
    private List<TyrePressureEvent> tyrePressureEvents;
    private List<TemperatureEvent> temperatureEvents;
    private List<LapTimeEvent> lapTimeEvents;
    private List<GForceEvent> gForceEvents;
    private List<SpeedEvent> speedEvents;

}
