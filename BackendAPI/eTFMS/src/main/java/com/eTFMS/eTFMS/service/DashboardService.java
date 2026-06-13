package com.eTFMS.eTFMS.service;

import com.eTFMS.eTFMS.dto.DashboardStatsResponse;
import com.eTFMS.eTFMS.model.Fine;
import com.eTFMS.eTFMS.model.FineCategory;
import com.eTFMS.eTFMS.repository.FineCategoryRepository;
import com.eTFMS.eTFMS.repository.FineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final FineRepository fineRepository;
    private final FineCategoryRepository fineCategoryRepository;

    public DashboardStatsResponse getStats() {
        List<Fine> fines = fineRepository.findAll();
        List<FineCategory> categories = fineCategoryRepository.findAll();
        Map<Long, String> categoryMap = categories.stream()
                .collect(Collectors.toMap(FineCategory::getId, FineCategory::getIdentifier));

        // Group by Month: "yyyy-MM"
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        
        Map<String, Double> incomeMap = new TreeMap<>();
        Map<String, Double> finesCountMap = new TreeMap<>();
        Map<String, Long> categoryCountMap = new HashMap<>();

        for (Fine fine : fines) {
            String month = fine.getIssueDate().format(formatter);
            
            // Income and Count over time
            incomeMap.put(month, incomeMap.getOrDefault(month, 0.0) + fine.getAmount());
            finesCountMap.put(month, finesCountMap.getOrDefault(month, 0.0) + 1.0);
            
            // Category count
            String catName = categoryMap.getOrDefault(fine.getCategoryId(), "Unknown");
            categoryCountMap.put(catName, categoryCountMap.getOrDefault(catName, 0L) + 1L);
        }

        List<DashboardStatsResponse.TimeStat> incomeOverTime = incomeMap.entrySet().stream()
                .map(e -> new DashboardStatsResponse.TimeStat(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        List<DashboardStatsResponse.TimeStat> finesOverTime = finesCountMap.entrySet().stream()
                .map(e -> new DashboardStatsResponse.TimeStat(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        List<DashboardStatsResponse.CategoryStat> finesByCategory = categoryCountMap.entrySet().stream()
                .map(e -> new DashboardStatsResponse.CategoryStat(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .incomeOverTime(incomeOverTime)
                .finesOverTime(finesOverTime)
                .finesByCategory(finesByCategory)
                .build();
    }
}
