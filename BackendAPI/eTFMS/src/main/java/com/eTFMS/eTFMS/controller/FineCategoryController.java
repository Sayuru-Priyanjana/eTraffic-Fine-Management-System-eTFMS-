package com.eTFMS.eTFMS.controller;

import com.eTFMS.eTFMS.dto.FineCategoryDto;
import com.eTFMS.eTFMS.service.FineCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class FineCategoryController {

    private final FineCategoryService fineCategoryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FineCategoryDto> createCategory(@Valid @RequestBody FineCategoryDto request) {
        return new ResponseEntity<>(fineCategoryService.createCategory(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<FineCategoryDto>> getAllCategories() {
        return ResponseEntity.ok(fineCategoryService.getAllCategories());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FineCategoryDto> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody FineCategoryDto request
    ) {
        return ResponseEntity.ok(fineCategoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        fineCategoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
