package com.eTFMS.eTFMS.service;

import com.eTFMS.eTFMS.dto.FineRequest;
import com.eTFMS.eTFMS.dto.FineResponse;
import com.eTFMS.eTFMS.model.Fine;
import com.eTFMS.eTFMS.model.FineCategory;
import com.eTFMS.eTFMS.model.FineStatus;
import com.eTFMS.eTFMS.repository.FineCategoryRepository;
import com.eTFMS.eTFMS.repository.FineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FineService {

    private final FineRepository fineRepository;
    private final FineCategoryRepository fineCategoryRepository;

    public FineResponse createFine(FineRequest request, String officerId) {
        FineCategory category = fineCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid category ID"));

        Fine fine = Fine.builder()
                .referenceNumber("FIN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .categoryId(request.getCategoryId())
                .driverId(request.getDriverId())
                .officerId(officerId)
                .amount(category.getAmount())
                .issueDate(LocalDateTime.now())
                .dueDate(request.getDueDate())
                .status(FineStatus.PENDING)
                .build();

        fine = fineRepository.save(fine);
        return mapToResponse(fine);
    }

    public List<FineResponse> getAllFines() {
        return fineRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<FineResponse> getFinesByDriver(String driverId) {
        return fineRepository.findByDriverId(driverId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<FineResponse> getFinesByOfficer(String officerId) {
        return fineRepository.findByOfficerId(officerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public FineResponse updateFine(Long id, FineRequest request) {
        Fine fine = fineRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fine not found with id: " + id));

        FineCategory category = fineCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid category ID"));

        fine.setCategoryId(request.getCategoryId());
        fine.setDriverId(request.getDriverId());
        fine.setAmount(category.getAmount());
        fine.setDueDate(request.getDueDate());
        
        if (request.getStatus() != null) {
            fine.setStatus(request.getStatus());
        }

        fine = fineRepository.save(fine);
        return mapToResponse(fine);
    }

    public void deleteFine(Long id) {
        if (!fineRepository.existsById(id)) {
            throw new IllegalArgumentException("Fine not found with id: " + id);
        }
        fineRepository.deleteById(id);
    }

    public FineResponse settleFine(Long id, String driverId) {
        Fine fine = fineRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fine not found with id: " + id));

        if (!fine.getDriverId().equals(driverId)) {
            throw new IllegalArgumentException("You can only settle your own fines");
        }
        
        if (fine.getStatus() == FineStatus.PAID) {
            throw new IllegalArgumentException("Fine is already settled");
        }

        fine.setStatus(FineStatus.PAID);
        fine = fineRepository.save(fine);
        return mapToResponse(fine);
    }

    private FineResponse mapToResponse(Fine fine) {
        return FineResponse.builder()
                .id(fine.getId())
                .referenceNumber(fine.getReferenceNumber())
                .categoryId(fine.getCategoryId())
                .driverId(fine.getDriverId())
                .officerId(fine.getOfficerId())
                .amount(fine.getAmount())
                .issueDate(fine.getIssueDate())
                .dueDate(fine.getDueDate())
                .status(fine.getStatus())
                .build();
    }
}
