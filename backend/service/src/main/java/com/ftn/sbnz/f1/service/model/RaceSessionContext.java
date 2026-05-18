package com.ftn.sbnz.f1.service.model;

import com.ftn.sbnz.f1.model.events.*;
import com.ftn.sbnz.f1.model.facts.TrackProfile;
import com.ftn.sbnz.f1.service.dto.RaceSessionUpdateRequest;
import com.ftn.sbnz.f1.service.dto.TelemetrySnapshot;
import com.ftn.sbnz.f1.service.service.TrackThresholdService;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.rule.FactHandle;
import org.kie.api.time.SessionPseudoClock;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

public class RaceSessionContext {
    private final KieSession kieSession;
    private final SessionPseudoClock clock;
    private final Map<Class<?>, FactHandle> factHandlesByType = new ConcurrentHashMap<>();
    private Instant currentTime;

    public RaceSessionContext(KieSession kieSession, SessionPseudoClock clock, Instant currentTime) {
        this.kieSession = kieSession;
        this.clock = clock;
        this.currentTime = currentTime;
    }

    public KieSession kieSession() {
        return kieSession;
    }

    public Instant currentTime() {
        return currentTime;
    }

    private void upsertFact(Object fact) {
        if (fact == null) {
            return;
        }
        FactHandle factHandle = factHandlesByType.get(fact.getClass());
        if (factHandle == null) {
            factHandlesByType.put(fact.getClass(), kieSession.insert(fact));
            return;
        }
        kieSession.update(factHandle, fact);
    }

    private void advanceTo(Instant targetTime) {
        if (targetTime == null || !targetTime.isAfter(currentTime)) {
            return;
        }
        long millis = Duration.between(currentTime, targetTime).toMillis();
        clock.advanceTime(millis, TimeUnit.MILLISECONDS);
        currentTime = targetTime;
    }

    public void clearGeneratedFactsForReevaluation(Set<Class<?>> factTypesToKeep) {
        kieSession.getObjects().stream()
                .filter(fact -> fact.getClass().getPackageName().startsWith("com.ftn.sbnz.f1.model.facts"))
                .filter(fact -> !factTypesToKeep.contains(fact.getClass()))
                .map(kieSession::getFactHandle)
                .filter(Objects::nonNull)
                .collect(Collectors.toList())
                .forEach(kieSession::delete);
    }

    public void insertTelemetryEvents(RaceSessionUpdateRequest request) {
        if (request.getTelemetry() == null || request.getTimestamp() == null) {
            return;
        }

        Instant ts = request.getTimestamp();
        TelemetrySnapshot t = request.getTelemetry();

        this.advanceTo(ts);

        if (t.getTyrePressureBar() != null) {
            this.kieSession().insert(
                    new TyrePressureEvent(ts, t.getTyrePressureBar())
            );
        }

        if (
                t.getBrakeTemperatureCelsius() != null
                        || t.getEngineTemperatureCelsius() != null
                        || t.getTyreTemperatureCelsius() != null
        ) {
            this.kieSession().insert(
                    new TemperatureEvent(
                            ts,
                            t.getBrakeTemperatureCelsius(),
                            t.getEngineTemperatureCelsius(),
                            t.getTyreTemperatureCelsius()
                    )
            );
        }

        if (
                t.getLateralGForce() != null
                        || t.getLongitudinalGForce() != null
        ) {
            this.kieSession().insert(
                    new GForceEvent(
                            ts,
                            t.getLateralGForce(),
                            t.getLongitudinalGForce()
                    )
            );
        }

        if (t.getSpeedKmh() != null) {
            this.kieSession().insert(
                    new SpeedEvent(ts, t.getSpeedKmh())
            );
        }

        if (t.getLapTimeSeconds() != null) {
            this.kieSession().insert(
                    new LapTimeEvent(
                            ts,
                            request.getRaceState().getCurrentLap(),
                            t.getLapTimeSeconds()
                    )
            );
        }
    }

    public void upsertFacts(RaceSessionUpdateRequest request) {
        this.upsertFact(request.getRaceState());
        this.upsertFact(request.getBatteryStatus());
        this.upsertFact(request.getFuelStatus());
        this.upsertFact(request.getEngineStatus());
        this.upsertFact(request.getBrakeStatus());
        this.upsertFact(request.getTyreStatus());
        this.upsertFact(request.getWeatherStatus());
        this.upsertFact(request.getTrackStatus());
        this.upsertFact(request.getCompetitorStatus());
        this.upsertFact(request.getDriverReport());
        this.upsertFact(request.getSuspensionStatus());
    }

    public void insertTemplateParameters(TrackThresholdService.TrackTemplateParameters parameters) {
        this.upsertFact(new TrackProfile(parameters.getTrackProfile()));
        this.upsertFact(parameters.getSafetyParameters());
        this.upsertFact(parameters.getStrategyParameters());
    }
}