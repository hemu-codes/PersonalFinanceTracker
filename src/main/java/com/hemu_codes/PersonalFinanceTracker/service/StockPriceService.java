package com.hemu_codes.PersonalFinanceTracker.service;

import com.hemu_codes.PersonalFinanceTracker.dto.StockPriceResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class StockPriceService {

    @Value("${finnhub.api.key}")
    private String apiKey;

    @Value("${finnhub.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public StockPriceResponse getCurrentPrice(String ticker) {
        try {
            String url = String.format("%s/quote?symbol=%s&token=%s", apiUrl, ticker, apiKey);
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);

            if (response != null && response.has("c")) {
                BigDecimal currentPrice = BigDecimal.valueOf(response.get("c").asDouble());
                BigDecimal change = BigDecimal.valueOf(response.get("d").asDouble());
                BigDecimal percentChange = BigDecimal.valueOf(response.get("dp").asDouble());

                return new StockPriceResponse(
                        ticker,
                        currentPrice.setScale(2, RoundingMode.HALF_UP),
                        change.setScale(2, RoundingMode.HALF_UP),
                        percentChange.setScale(2, RoundingMode.HALF_UP)
                );
            }

            throw new RuntimeException("Invalid response from Finnhub");

        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch stock price for " + ticker, e);
        }
    }
}