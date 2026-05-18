package com.ftn.sbnz.f1.model.facts;

import com.ftn.sbnz.f1.model.enums.TyreCompound;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WetEarlyPitRecommended {
    private TyreCompound targetCompound;
}
