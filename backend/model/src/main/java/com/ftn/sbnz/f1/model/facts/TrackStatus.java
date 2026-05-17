package com.ftn.sbnz.f1.model.facts;

import com.ftn.sbnz.f1.model.enums.FlagStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrackStatus {
    private FlagStatus flagStatus;
    private boolean safetyCarActive;
    private boolean virtualSafetyCarActive;
    private boolean safetyCarRecentlyEnded;
    private boolean driverSlowedForYellowFlag;
}
