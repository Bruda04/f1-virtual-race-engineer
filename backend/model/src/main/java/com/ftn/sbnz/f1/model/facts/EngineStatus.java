package com.ftn.sbnz.f1.model.facts;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EngineStatus {
    private double temperatureCelsius;
    private boolean inDirtyAir;
    private boolean attemptingOvertake;
}
