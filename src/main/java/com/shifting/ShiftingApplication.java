package com.shifting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync   // ← required for @Async email sending (non-blocking)
public class ShiftingApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShiftingApplication.class, args);
    }
}