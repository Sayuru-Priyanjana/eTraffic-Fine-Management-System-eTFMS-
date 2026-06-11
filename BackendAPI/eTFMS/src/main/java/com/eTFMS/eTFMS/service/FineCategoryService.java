package com.eTFMS.eTFMS.service;

import com.eTFMS.eTFMS.dto.FineCategoryDto;
import com.eTFMS.eTFMS.model.FineCategory;
import com.eTFMS.eTFMS.repository.FineCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FineCategoryService {

    private final FineCategoryRepository fineCategoryRepository;

    public FineCategoryDto createCategory(FineCategoryDto request) {
        if (fineCategoryRepository.findByIdentifier(request.getIdentifier()).isPresent()) {
            throw new IllegalArgumentException("Category identifier already exists.");
        }

        FineCategory category = FineCategory.builder()
                .identifier(request.getIdentifier())
                .description(request.getDescription())
                .amount(request.getAmount())
                .build();

        category = fineCategoryRepository.save(category);
        return mapToDto(category);
    }

    public List<FineCategoryDto> getAllCategories() {
        return fineCategoryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public FineCategoryDto updateCategory(Long id, FineCategoryDto request) {
        FineCategory category = fineCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found."));

        if (!category.getIdentifier().equals(request.getIdentifier()) &&
            fineCategoryRepository.findByIdentifier(request.getIdentifier()).isPresent()) {
            throw new IllegalArgumentException("Category identifier already exists.");
        }

        category.setIdentifier(request.getIdentifier());
        category.setDescription(request.getDescription());
        category.setAmount(request.getAmount());

        category = fineCategoryRepository.save(category);
        return mapToDto(category);
    }

    public void deleteCategory(Long id) {
        if (!fineCategoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Category not found.");
        }
        fineCategoryRepository.deleteById(id);
    }

    private FineCategoryDto mapToDto(FineCategory category) {
        return FineCategoryDto.builder()
                .id(category.getId())
                .identifier(category.getIdentifier())
                .description(category.getDescription())
                .amount(category.getAmount())
                .build();
    }
}
