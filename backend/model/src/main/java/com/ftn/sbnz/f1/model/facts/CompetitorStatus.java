package com.ftn.sbnz.f1.model.facts;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompetitorStatus {
    private double gapAheadSeconds;
    private double gapBehindSeconds;
    private boolean wouldExitAheadAfterPit;
    private boolean driverBehindVeryClose;
    private boolean beingLapped;
}
