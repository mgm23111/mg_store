package com.mgstore.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreSettingsResponse {
    private Long id;
    private String companyName;
    private String logoUrl;
    private LocalDateTime updatedAt;
}
