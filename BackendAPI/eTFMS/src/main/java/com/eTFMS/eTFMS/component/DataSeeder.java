package com.eTFMS.eTFMS.component;

import com.eTFMS.eTFMS.model.FineCategory;
import com.eTFMS.eTFMS.repository.FineCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final FineCategoryRepository fineCategoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (fineCategoryRepository.count() == 0) {
            List<FineCategory> defaultCategories = Arrays.asList(
                    FineCategory.builder()
                            .identifier("SPEEDING_TIER_1")
                            .description("Speeding over 10km/h but less than 20km/h")
                            .amount(3000.0)
                            .build(),
                    FineCategory.builder()
                            .identifier("SPEEDING_TIER_2")
                            .description("Speeding over 20km/h")
                            .amount(5000.0)
                            .build(),
                    FineCategory.builder()
                            .identifier("ILLEGAL_PARKING")
                            .description("Parking in a no-parking zone")
                            .amount(2000.0)
                            .build(),
                    FineCategory.builder()
                            .identifier("DRUNK_DRIVING")
                            .description("Driving under the influence of alcohol")
                            .amount(25000.0)
                            .build()
            );

            fineCategoryRepository.saveAll(defaultCategories);
            System.out.println("Database seeded with default Fine Categories.");
        }
    }
}
