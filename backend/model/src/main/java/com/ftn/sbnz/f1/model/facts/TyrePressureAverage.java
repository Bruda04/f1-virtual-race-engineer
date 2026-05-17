package com.ftn.sbnz.f1.model.facts;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TyrePressureAverage {
    private double averagePressureBar;
    private long sampleCount;
}
