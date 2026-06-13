package com.eTFMS.eTFMS.repository;

import com.eTFMS.eTFMS.model.Fine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {
    List<Fine> findByDriverId(String driverId);
    List<Fine> findByOfficerId(String officerId);
    Optional<Fine> findByReferenceNumberAndCategoryId(String referenceNumber, Long categoryId);
}

