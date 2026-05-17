package com.ftn.sbnz.f1.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RaceSessionStartRequest {
    private String trackProfile;
    private Instant startTime;
}
