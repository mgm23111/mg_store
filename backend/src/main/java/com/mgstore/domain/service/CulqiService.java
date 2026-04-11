package com.mgstore.domain.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mgstore.application.dto.request.CulqiChargeRequest;
import com.mgstore.application.dto.response.CulqiChargeResponse;
import com.mgstore.application.dto.response.CulqiErrorResponse;
import com.mgstore.infrastructure.exception.PaymentException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class CulqiService {

    private static final Logger log = LoggerFactory.getLogger(CulqiService.class);

    @Value("${culqi.secret.key}")
    private String secretKey;

    @Value("${culqi.api.url:https://api.culqi.com/v2}")
    private String apiUrl;

    /**
     * Create a charge in Culqi
     */
    public CulqiChargeResponse createCharge(CulqiChargeRequest request) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + secretKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<CulqiChargeRequest> entity = new HttpEntity<>(request, headers);

        try {
            log.debug("Sending charge request to Culqi. amount={}, currency={}", request.getAmount(), request.getCurrencyCode());

            // Make the charge request
            ResponseEntity<CulqiChargeResponse> response = restTemplate.exchange(
                    apiUrl + "/charges",
                    HttpMethod.POST,
                    entity,
                    CulqiChargeResponse.class
            );

            log.debug("Culqi response status={}", response.getStatusCode());

            if (response.getBody() == null) {
                throw new PaymentException("No response from Culqi API");
            }

            CulqiChargeResponse chargeResponse = response.getBody();

            // Check if charge was successful
            if (!"charge".equals(chargeResponse.getObject())) {
                throw new PaymentException("Invalid Culqi charge response");
            }

            // Verify outcome is successful
            if (chargeResponse.getOutcome() != null && !"venta_exitosa".equals(chargeResponse.getOutcome().getType())) {
                String errorMessage = chargeResponse.getOutcome().getUserMessage() != null
                    ? chargeResponse.getOutcome().getUserMessage()
                    : chargeResponse.getOutcome().getMerchantMessage();
                throw new PaymentException(errorMessage != null ? errorMessage : "Pago rechazado por Culqi");
            }

            return chargeResponse;

        } catch (HttpClientErrorException e) {
            // Extract error details from Culqi
            String errorBody = e.getResponseBodyAsString();
            log.error("Culqi API error status={} body={}", e.getStatusCode(), errorBody);

            // Try to parse Culqi error response
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                CulqiErrorResponse culqiError = objectMapper.readValue(errorBody, CulqiErrorResponse.class);

                // Use user-friendly message from Culqi
                String userMessage = culqiError.getUserMessage() != null
                    ? culqiError.getUserMessage()
                    : culqiError.getMerchantMessage();

                throw new PaymentException(userMessage != null ? userMessage : "Error al procesar el pago con Culqi");
            } catch (PaymentException pe) {
                throw pe;
            } catch (Exception parseEx) {
                // If parsing fails, throw generic error
                throw new PaymentException("Error al procesar el pago: " + errorBody, e);
            }
        } catch (Exception e) {
            log.error("Error processing Culqi payment", e);
            throw new PaymentException("Error processing Culqi payment: " + e.getMessage(), e);
        }
    }

    /**
     * Verify a charge status
     */
    public CulqiChargeResponse getCharge(String chargeId) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + secretKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<CulqiChargeResponse> response = restTemplate.exchange(
                    apiUrl + "/charges/" + chargeId,
                    HttpMethod.GET,
                    entity,
                    CulqiChargeResponse.class
            );

            return response.getBody();

        } catch (Exception e) {
            throw new PaymentException("Error retrieving Culqi charge: " + e.getMessage(), e);
        }
    }
}
