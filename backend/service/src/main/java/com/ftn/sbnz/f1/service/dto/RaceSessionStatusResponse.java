package com.ftn.sbnz.f1.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RaceSessionStatusResponse {
    private Instant currentTime;
}
