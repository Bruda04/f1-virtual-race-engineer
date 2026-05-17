package com.ftn.sbnz.f1.service.dto;

import com.ftn.sbnz.f1.model.facts.Recommendation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RaceEngineerResponse {
    private List<Recommendation> recommendations;
    private List<String> derivedFacts;
}
