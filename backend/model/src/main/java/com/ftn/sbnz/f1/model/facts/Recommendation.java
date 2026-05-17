package com.ftn.sbnz.f1.model.facts;

import com.ftn.sbnz.f1.model.enums.EngineMode;
import com.ftn.sbnz.f1.model.enums.ErsMode;
import com.ftn.sbnz.f1.model.enums.RecommendationType;
import com.ftn.sbnz.f1.model.enums.Urgency;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recommendation {
    private RecommendationType type;
    private Urgency urgency;
    private String message;
    private EngineMode engineMode;
    private ErsMode ersMode;
}
