package com.hemu_codes.PersonalFinanceTracker.controller;

import com.hemu_codes.PersonalFinanceTracker.dto.StockPriceResponse;
import com.hemu_codes.PersonalFinanceTracker.model.Stock;
import com.hemu_codes.PersonalFinanceTracker.service.StockPriceService;
import com.hemu_codes.PersonalFinanceTracker.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = "http://localhost:5173") // Allow React frontend to call this API
public class StockController {

    @Autowired
    private StockService stockService;

    @Autowired
    private StockPriceService stockPriceService;

    // GET all stocks
    @GetMapping
    public ResponseEntity<List<Stock>> getAllStocks() {
        List<Stock> stocks = stockService.getAllStocks();
        return ResponseEntity.ok(stocks);
    }

    // GET stock by ID
    @GetMapping("/{id}")
    public ResponseEntity<Stock> getStockById(@PathVariable Long id) {
        Optional<Stock> stock = stockService.getStockById(id);
        return stock.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST - Create new stock
    @PostMapping
    public ResponseEntity<Stock> createStock(@RequestBody Stock stock) {
        Stock savedStock = stockService.saveStock(stock);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedStock);
    }

    // PUT - Update stock
    @PutMapping("/{id}")
    public ResponseEntity<Stock> updateStock(@PathVariable Long id, @RequestBody Stock stock) {
        Optional<Stock> existingStock = stockService.getStockById(id);
        if (existingStock.isPresent()) {
            stock.setId(id);
            Stock updatedStock = stockService.saveStock(stock);
            return ResponseEntity.ok(updatedStock);
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE stock
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStock(@PathVariable Long id) {
        Optional<Stock> stock = stockService.getStockById(id);
        if (stock.isPresent()) {
            stockService.deleteStock(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // GET current price for a ticker
    @GetMapping("/{ticker}/price")
    public ResponseEntity<StockPriceResponse> getStockPrice(@PathVariable String ticker) {
        try {
            StockPriceResponse price = stockPriceService.getCurrentPrice(ticker.toUpperCase());
            return ResponseEntity.ok(price);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}