package com.cncyq.personalwebsite.modules.system.dto;

import java.time.Instant;

public record HealthResponse(
        String service,
        String status,
        Instant timestamp
) {
}
