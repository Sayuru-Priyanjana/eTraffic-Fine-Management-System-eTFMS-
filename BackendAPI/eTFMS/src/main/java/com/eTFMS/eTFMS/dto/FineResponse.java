package com.eTFMS.eTFMS.dto;

import com.eTFMS.eTFMS.model.FineStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FineResponse {
    
    private Long id;
    private String referenceNumber;
    private Long categoryId;
    private String driverId;
    private String officerId;
    private Double amount;
    private LocalDateTime issueDate;
    private LocalDateTime dueDate;
    private FineStatus status;
}
