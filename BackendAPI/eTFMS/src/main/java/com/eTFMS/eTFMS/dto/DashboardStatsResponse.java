package com.eTFMS.eTFMS.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsResponse {
    private List<TimeStat> incomeOverTime;
    private List<TimeStat> finesOverTime;
    private List<CategoryStat> finesByCategory;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TimeStat {
        private String date;
        private Double value;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategoryStat {
        private String categoryName;
        private Long count;
    }
}
