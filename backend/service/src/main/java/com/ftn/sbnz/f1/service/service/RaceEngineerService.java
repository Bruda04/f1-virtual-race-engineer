package com.ftn.sbnz.f1.service.service;

import com.ftn.sbnz.f1.model.enums.RecommendationType;
import com.ftn.sbnz.f1.model.enums.Urgency;
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
import com.ftn.sbnz.f1.model.facts.Recommendation;
import com.ftn.sbnz.f1.model.facts.SuspensionStatus;
import com.ftn.sbnz.f1.model.facts.TrackProfile;
import com.ftn.sbnz.f1.model.facts.TrackSafetyParameters;
import com.ftn.sbnz.f1.model.facts.TrackStatus;
import com.ftn.sbnz.f1.model.facts.TrackStrategyParameters;
import com.ftn.sbnz.f1.model.facts.TyreStatus;
import com.ftn.sbnz.f1.model.facts.WeatherStatus;
import com.ftn.sbnz.f1.service.dto.RaceEngineerResponse;
import com.ftn.sbnz.f1.service.dto.RaceSessionStartRequest;
import com.ftn.sbnz.f1.service.dto.RaceSessionStatusResponse;
import com.ftn.sbnz.f1.service.dto.RaceSessionUpdateRequest;

import java.util.*;
import java.time.Instant;
import java.util.stream.Collectors;

import com.ftn.sbnz.f1.service.model.EventEnvelope;
import com.ftn.sbnz.f1.service.model.RaceSessionContext;
import org.kie.api.runtime.ClassObjectFilter;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.kie.api.time.SessionPseudoClock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RaceEngineerService {

    private static final String SESSION_NAME = "f1KSession";
    private static final Set<Class<?>> INPUT_FACT_TYPES = Set.of(
            RaceState.class,
            CarTelemetry.class,
            FuelStatus.class,
            EngineStatus.class,
            BrakeStatus.class,
            TyreStatus.class,
            WeatherStatus.class,
            TrackStatus.class,
            CompetitorStatus.class,
            DriverReport.class,
            SuspensionStatus.class,
            TrackSafetyParameters.class,
            TrackStrategyParameters.class,
            TrackProfile.class,
            TelemetryEvent.class,
            TyrePressureEvent.class,
            TemperatureEvent.class,
            LapTimeEvent.class,
            GForceEvent.class,
            SpeedEvent.class
    );

    private final KieContainer kieContainer;
    private final TrackThresholdService trackThresholdService;
    private RaceSessionContext session;

    @Autowired
    public RaceEngineerService(KieContainer kieContainer, TrackThresholdService trackThresholdService) {
        this.kieContainer = kieContainer;
        this.trackThresholdService = trackThresholdService;
    }

    public synchronized RaceSessionStatusResponse startRace(RaceSessionStartRequest request) {
        clear();

        KieSession kieSession = kieContainer.newKieSession(SESSION_NAME);

        SessionPseudoClock clock = kieSession.getSessionClock();

        Instant startTime = request.getStartTime() != null ? request.getStartTime() : Instant.EPOCH;
        RaceSessionContext context = new RaceSessionContext(kieSession, clock, startTime);


        insertTemplateParameters(context, request.getTrackProfile());

        context.kieSession().fireAllRules();

        session = context;
        return new RaceSessionStatusResponse(context.currentTime());
    }

    public synchronized RaceEngineerResponse updateRace(RaceSessionUpdateRequest request) {
        RaceSessionContext context = currentSession();
        context.upsertFact(request.getRaceState());
        context.upsertFact(request.getCarTelemetry());
        context.upsertFact(request.getFuelStatus());
        context.upsertFact(request.getEngineStatus());
        context.upsertFact(request.getBrakeStatus());
        context.upsertFact(request.getTyreStatus());
        context.upsertFact(request.getWeatherStatus());
        context.upsertFact(request.getTrackStatus());
        context.upsertFact(request.getCompetitorStatus());
        context.upsertFact(request.getDriverReport());
        context.upsertFact(request.getSuspensionStatus());

        insertEvents(context, request);

        context.kieSession().fireAllRules();

        return responseFrom(context.kieSession());
    }

    public synchronized RaceEngineerResponse fireRules() {
        RaceSessionContext context = currentSession();
        context.kieSession().fireAllRules();
        return responseFrom(context.kieSession());
    }

    public synchronized void clear() {
        if (session != null) {
            session.kieSession().dispose();
            session = null;
        }
    }

    private void insertEvents(RaceSessionContext context, RaceSessionUpdateRequest request) {
        List<EventEnvelope> events = new ArrayList<>();
        appendEvents(events, request.getTelemetryEvents());
        appendEvents(events, request.getTyrePressureEvents());
        appendEvents(events, request.getTemperatureEvents());
        appendEvents(events, request.getLapTimeEvents());
        appendEvents(events, request.getGForceEvents());
        appendEvents(events, request.getSpeedEvents());

        events.stream()
                .sorted(Comparator.comparing(EventEnvelope::getTimestamp))
                .forEach(event -> {
                    context.advanceTo(event.getTimestamp());
                    context.kieSession().insert(event.getPayload());
                });
    }

    private void insertTemplateParameters(RaceSessionContext context, String trackProfile) {
        TrackThresholdService.TrackTemplateParameters parameters = trackThresholdService.parametersFor(trackProfile);
        context.upsertFact(new TrackProfile(parameters.getTrackProfile()));

        context.upsertFact(parameters.getSafetyParameters());
        context.upsertFact(parameters.getStrategyParameters());
    }

    private void appendEvents(List<EventEnvelope> envelopes, List<?> events) {
        if (events == null) {
            return;
        }
        events.stream()
                .filter(Objects::nonNull)
                .map(this::envelopeFor)
                .forEach(envelopes::add);
    }

    private EventEnvelope envelopeFor(Object event) {
        if (event instanceof TelemetryEvent) {
            TelemetryEvent telemetryEvent = (TelemetryEvent) event;
            return new EventEnvelope(telemetryEvent.getTimestamp(), telemetryEvent);
        }
        if (event instanceof TyrePressureEvent) {
            TyrePressureEvent tyrePressureEvent = (TyrePressureEvent) event;
            return new EventEnvelope(tyrePressureEvent.getTimestamp(), tyrePressureEvent);
        }
        if (event instanceof TemperatureEvent) {
            TemperatureEvent temperatureEvent = (TemperatureEvent) event;
            return new EventEnvelope(temperatureEvent.getTimestamp(), temperatureEvent);
        }
        if (event instanceof LapTimeEvent) {
            LapTimeEvent lapTimeEvent = (LapTimeEvent) event;
            return new EventEnvelope(lapTimeEvent.getTimestamp(), lapTimeEvent);
        }
        if (event instanceof GForceEvent) {
            GForceEvent gForceEvent = (GForceEvent) event;
            return new EventEnvelope(gForceEvent.getTimestamp(), gForceEvent);
        }
        if (event instanceof SpeedEvent) {
            SpeedEvent speedEvent = (SpeedEvent) event;
            return new EventEnvelope(speedEvent.getTimestamp(), speedEvent);
        }
        throw new IllegalArgumentException("Unsupported event type: " + event.getClass().getName());
    }

    private RaceEngineerResponse responseFrom(KieSession kieSession) {
        return new RaceEngineerResponse(recommendationsFrom(kieSession), derivedFactsFrom(kieSession));
    }

    private RaceSessionContext currentSession() {
        if (session == null) {
            throw new IllegalStateException("Race session is not started.");
        }
        return session;
    }

    private List<Recommendation> recommendationsFrom(KieSession kieSession) {
        List<Recommendation> all = kieSession.getObjects(new ClassObjectFilter(Recommendation.class)).stream()
                .map(Recommendation.class::cast)
                .collect(Collectors.toList());

        Map<RecommendationType, Urgency> maxUrgencyPerType = all.stream()
                .collect(Collectors.groupingBy(
                        Recommendation::getType,
                        Collectors.collectingAndThen(
                                Collectors.maxBy(Comparator.comparingInt(r -> r.getUrgency().ordinal())),
                                opt -> opt.get().getUrgency()
                        )
                ));

        return all.stream()
                .filter(r -> r.getUrgency() == maxUrgencyPerType.get(r.getType()))
                .sorted(Comparator.comparingInt((Recommendation r) -> r.getUrgency().ordinal()).reversed())
                .collect(Collectors.toList());
    }
    private List<String> derivedFactsFrom(KieSession kieSession) {
        return kieSession.getObjects().stream()
                .filter(fact -> fact.getClass().getPackageName().startsWith("com.ftn.sbnz.f1.model.facts"))
                .filter(fact -> fact.getClass() != Recommendation.class)
                .filter(fact -> !INPUT_FACT_TYPES.contains(fact.getClass()))
                .map(fact -> fact.getClass().getSimpleName())
                .sorted()
                .collect(Collectors.toList());
    }


}
