// src/main/java/com/hemu_codes/PersonalFinanceTracker/repository/StockRepository.java

package com.hemu_codes.PersonalFinanceTracker.repository;

import com.hemu_codes.PersonalFinanceTracker.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    // Custom query methods
    List<Stock> findByTicker(String ticker);

    // JpaRepository already provides:
    // - save()
    // - findById()
    // - findAll()
    // - deleteById()
    // - etc.
}