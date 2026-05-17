package com.ftn.sbnz.f1.service.service;

import com.ftn.sbnz.f1.model.facts.TrackProfile;
import com.ftn.sbnz.f1.model.facts.TrackSafetyParameters;
import com.ftn.sbnz.f1.model.facts.TrackStrategyParameters;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.drools.decisiontable.ExternalSpreadsheetCompiler;
import org.drools.decisiontable.InputType;
import org.kie.api.KieBase;
import org.kie.api.builder.Message;
import org.kie.api.builder.Results;
import org.kie.api.io.ResourceType;
import org.kie.api.runtime.ClassObjectFilter;
import org.kie.api.runtime.KieSession;
import org.kie.internal.utils.KieHelper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
public class TrackThresholdService {
    private static final String DEFAULT_PROFILE = "Default";

    private static final Set<String> SUPPORTED_TRACK_PROFILES = new HashSet<>(List.of(
            "Default",
            "HighDegradationTrack",
            "LowDegradationTrack",
            "HighAltitudeTrack"
    ));
    private static final List<TemplateResource> TEMPLATES = List.of(
            new TemplateResource("templates/track-safety-thresholds.csv", "templates/track-safety-thresholds.drt"),
            new TemplateResource("templates/track-strategy-thresholds.csv", "templates/track-strategy-thresholds.drt")
    );

    private final KieBase templateKieBase;

    public TrackThresholdService() {
        this.templateKieBase = buildTemplateKieBase();
    }

    public String normalize(String trackProfile) {
        if (trackProfile == null || trackProfile.isBlank()) {
            return DEFAULT_PROFILE;
        }
        if (!SUPPORTED_TRACK_PROFILES.contains(trackProfile)) {
            return DEFAULT_PROFILE;
        }
        return trackProfile;
    }

    public TrackTemplateParameters parametersFor(String trackProfile) {
        String normalizedTrackProfile = normalize(trackProfile);
        KieSession kieSession = templateKieBase.newKieSession();

        try {
            kieSession.insert(new TrackProfile(normalizedTrackProfile));
            kieSession.fireAllRules();

            TrackSafetyParameters safetyParameters = singleFact(kieSession, TrackSafetyParameters.class);
            TrackStrategyParameters strategyParameters = singleFact(kieSession, TrackStrategyParameters.class);

            return new TrackTemplateParameters(
                    normalizedTrackProfile,
                    safetyParameters,
                    strategyParameters
            );
        } finally {
            kieSession.dispose();
        }
    }

    private KieBase buildTemplateKieBase() {
        KieHelper kieHelper = new KieHelper();
        TEMPLATES.stream()
                .map(this::compileTemplate)
                .forEach(drl -> kieHelper.addContent(drl, ResourceType.DRL));

        Results results = kieHelper.verify();
        if (results.hasMessages(Message.Level.WARNING, Message.Level.ERROR)) {
            String messages = results.getMessages(Message.Level.WARNING, Message.Level.ERROR)
                    .stream()
                    .map(Message::toString)
                    .collect(Collectors.joining(System.lineSeparator()));
            throw new IllegalStateException("Compilation errors were found in template rules." +
                    System.lineSeparator() + messages);
        }

        return kieHelper.build();
    }

    private String compileTemplate(TemplateResource templateResource) {
        ExternalSpreadsheetCompiler compiler = new ExternalSpreadsheetCompiler();
        try (InputStream data = resourceStream(templateResource.dataPath);
             InputStream template = resourceStream(templateResource.templatePath)) {
            return compiler.compile(data, template, InputType.CSV, 2, 1);
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to compile template " + templateResource.templatePath, ex);
        }
    }

    private InputStream resourceStream(String classpathLocation) throws IOException {
        return new ClassPathResource(classpathLocation).getInputStream();
    }

    private <T> T singleFact(KieSession kieSession, Class<T> factType) {
        Collection<?> facts = kieSession.getObjects(new ClassObjectFilter(factType));
        if (facts.size() != 1) {
            throw new IllegalStateException("Expected exactly one " + factType.getSimpleName() +
                    " from track templates, but found " + facts.size() + ".");
        }
        return factType.cast(facts.iterator().next());
    }

    @Getter
    @AllArgsConstructor
    public static class TrackTemplateParameters {
        private final String trackProfile;
        private final TrackSafetyParameters safetyParameters;
        private final TrackStrategyParameters strategyParameters;
    }

    @AllArgsConstructor
    private static class TemplateResource {
        private final String dataPath;
        private final String templatePath;
    }
}