package com.mgstore.application.dto.response;

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
public class CulqiChargeResponse {

    private String id;
    private String object;
    private Integer amount;

    @JsonProperty("currency_code")
    private String currencyCode;

    private String email;
    private String description;

    private Outcome outcome;

    @JsonProperty("reference_code")
    private String referenceCode;

    @JsonProperty("authorization_code")
    private String authorizationCode;

    @JsonProperty("transaction_id")
    private String transactionId;

    private Map<String, Object> metadata;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Outcome {
        private String type;
        private String code;

        @JsonProperty("merchant_message")
        private String merchantMessage;

        @JsonProperty("user_message")
        private String userMessage;
    }
}
