package com.ftn.sbnz.f1.model.facts;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RaceState {
    private int currentLap;
    private int totalLaps;
    private boolean criticalPhase;

    public int getRemainingLaps() {
        return totalLaps - currentLap;
    }
}
