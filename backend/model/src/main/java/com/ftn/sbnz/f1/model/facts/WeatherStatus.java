package com.ftn.sbnz.f1.model.facts;

import com.ftn.sbnz.f1.model.enums.TrackCondition;
import com.ftn.sbnz.f1.model.enums.WeatherTrend;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeatherStatus {
    private double asphaltTemperatureCelsius;
    private double rainProbabilityPercentage;
    private TrackCondition trackCondition;
    private WeatherTrend weatherTrend;
}
