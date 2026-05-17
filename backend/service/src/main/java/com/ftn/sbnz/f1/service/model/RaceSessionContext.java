package com.ftn.sbnz.f1.service.model;

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

    public void upsertFact(Object fact) {
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

    public void advanceTo(Instant targetTime) {
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
}