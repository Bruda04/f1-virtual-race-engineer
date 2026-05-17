package com.ftn.sbnz.f1.service.controller;

import com.ftn.sbnz.f1.service.dto.RaceEngineerResponse;
import com.ftn.sbnz.f1.service.dto.RaceSessionStartRequest;
import com.ftn.sbnz.f1.service.dto.RaceSessionStatusResponse;
import com.ftn.sbnz.f1.service.dto.RaceSessionUpdateRequest;
import com.ftn.sbnz.f1.service.service.RaceEngineerService;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/race")
public class RaceEngineerController {

    private final RaceEngineerService raceEngineerService;

    @Autowired
    public RaceEngineerController(RaceEngineerService raceEngineerService) {
        this.raceEngineerService = raceEngineerService;
    }

    @PostMapping("/start")
    public RaceSessionStatusResponse startRace(@RequestBody RaceSessionStartRequest request) {
        return raceEngineerService.startRace(request);
    }

    @PostMapping("/update")
    public RaceEngineerResponse updateRace(@RequestBody RaceSessionUpdateRequest request) {
        return raceEngineerService.updateRace(request);
    }

    @PostMapping("/fire")
    public RaceEngineerResponse fireRules() {
        return raceEngineerService.fireRules();
    }

    @DeleteMapping("/clear")
    public void clear() {
        raceEngineerService.clear();
    }

}
