package com.eTFMS.eTFMS.controller;

import com.eTFMS.eTFMS.dto.FineRequest;
import com.eTFMS.eTFMS.dto.FineResponse;
import com.eTFMS.eTFMS.service.FineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
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
@RequestMapping("/api/fines")
@RequiredArgsConstructor
public class FineController {

    private final FineService fineService;

    @PostMapping
    @PreAuthorize("hasRole('POLICE_OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<FineResponse> createFine(
            @Valid @RequestBody FineRequest request,
            Authentication authentication
    ) {
        String officerUsername = ((UserDetails) authentication.getPrincipal()).getUsername();
        // Since we are using username in UserDetails but officerId is needed:
        // For simplicity we will assume the officer's User ID needs to be passed, but Spring Security Principal has username.
        // Let's pass the username as officerId, or rely on the frontend to pass officerId.
        // Given our design, we pass the username/id directly. The User entity maps username to username, but `officerId` is the primary key.
        // In our auth service, username is unique. We'll use the authenticated username as the officer identifier for now, 
        // or we can fetch the user by username to get their real ID. Since the token stores username as subject, let's use it as the officerId mapping.
        // Wait, User.id is the ID. Let's pass the username. The User entity's ID can be found if we cast.
        // However, User entity implements UserDetails, so we can cast to User directly.
        com.eTFMS.eTFMS.model.User user = (com.eTFMS.eTFMS.model.User) authentication.getPrincipal();
        
        return new ResponseEntity<>(fineService.createFine(request, user.getId()), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('POLICE_OFFICER')")
    public ResponseEntity<List<FineResponse>> getAllFines() {
        return ResponseEntity.ok(fineService.getAllFines());
    }

    @GetMapping("/driver/{driverId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('POLICE_OFFICER') or (hasRole('DRIVER') and principal.id == #driverId)")
    public ResponseEntity<List<FineResponse>> getFinesByDriver(@PathVariable String driverId) {
        return ResponseEntity.ok(fineService.getFinesByDriver(driverId));
    }

    @GetMapping("/officer/{officerId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('POLICE_OFFICER') and principal.id == #officerId)")
    public ResponseEntity<List<FineResponse>> getFinesByOfficer(@PathVariable String officerId) {
        return ResponseEntity.ok(fineService.getFinesByOfficer(officerId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('POLICE_OFFICER')")
    public ResponseEntity<FineResponse> updateFine(
            @PathVariable Long id,
            @Valid @RequestBody FineRequest request
    ) {
        return ResponseEntity.ok(fineService.updateFine(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFine(@PathVariable Long id) {
        fineService.deleteFine(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/settle")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<FineResponse> settleFine(
            @PathVariable Long id,
            Authentication authentication
    ) {
        com.eTFMS.eTFMS.model.User user = (com.eTFMS.eTFMS.model.User) authentication.getPrincipal();
        return ResponseEntity.ok(fineService.settleFine(id, user.getId()));
    }
}
