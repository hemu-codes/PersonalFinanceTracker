package com.hemu_codes.PersonalFinanceTracker.dto;

import java.math.BigDecimal;

public class StockPriceResponse {
    private String ticker;
    private BigDecimal currentPrice;
    private BigDecimal change;
    private BigDecimal percentChange;

    public StockPriceResponse() {}

    public StockPriceResponse(String ticker, BigDecimal currentPrice, BigDecimal change, BigDecimal percentChange) {
        this.ticker = ticker;
        this.currentPrice = currentPrice;
        this.change = change;
        this.percentChange = percentChange;
    }

    // Getters and Setters
    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public BigDecimal getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }

    public BigDecimal getChange() { return change; }
    public void setChange(BigDecimal change) { this.change = change; }

    public BigDecimal getPercentChange() { return percentChange; }
    public void setPercentChange(BigDecimal percentChange) { this.percentChange = percentChange; }
}