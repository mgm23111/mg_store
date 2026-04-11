package com.mgstore.application.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CulqiErrorResponse {

    private String object;
    private String type;

    @JsonProperty("charge_id")
    private String chargeId;

    private String code;

    @JsonProperty("decline_code")
    private String declineCode;

    @JsonProperty("merchant_message")
    private String merchantMessage;

    @JsonProperty("user_message")
    private String userMessage;
}
