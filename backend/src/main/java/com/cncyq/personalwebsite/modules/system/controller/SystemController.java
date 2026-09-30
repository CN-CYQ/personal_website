package com.cncyq.personalwebsite.modules.system.controller;

import java.time.Instant;

import com.cncyq.personalwebsite.common.api.ApiResponse;
import com.cncyq.personalwebsite.modules.system.dto.HealthResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/system")
public class SystemController {

    @GetMapping("/health")
    public ApiResponse<HealthResponse> health() {
        return ApiResponse.ok(new HealthResponse(
                "personal-website-api",
                "UP",
                Instant.now()
        ));
    }
}
