package com.eTFMS.eTFMS.dto;

import com.eTFMS.eTFMS.model.FineStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FineRequest {

    @NotBlank(message = "Category identifier is required")
    private String categoryIdentifier;

    @NotBlank(message = "Driver ID is required")
    private String driverId;

    @NotNull(message = "Due date is required")
    @Future(message = "Due date must be in the future")
    private LocalDateTime dueDate;
    
    private FineStatus status;
}
