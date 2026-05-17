package com.ftn.sbnz.f1.model.facts;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrackStrategyParameters {
    private int maxLapsOnTyres;
    private int minLapsOnTyresForSafetyCarPit;
    private double averagePitLossSeconds;
    private double paceDropThresholdSeconds;
}
