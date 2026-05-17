package com.ftn.sbnz.f1.model.facts;

import com.ftn.sbnz.f1.model.enums.DriverIssue;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverReport {
    private DriverIssue issue;
    private String note;
}
