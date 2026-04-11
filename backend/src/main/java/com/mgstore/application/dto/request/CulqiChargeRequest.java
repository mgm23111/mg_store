package com.mgstore.application.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CulqiChargeRequest {

    private Integer amount;  // Amount in cents (100 = S/ 1.00)

    @JsonProperty("currency_code")
    private String currencyCode;  // "PEN"

    private String email;

    @JsonProperty("source_id")
    private String sourceId;  // Token from frontend

    private String description;  // Description of the charge

    private Map<String, String> metadata;
}
