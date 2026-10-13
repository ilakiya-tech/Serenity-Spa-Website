package com.serenityspa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SerenitySpaApplication {
    public static void main(String[] args) {
        // Protect against unrelated postgresql environment variables from other local projects
        String envUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (envUrl != null && envUrl.startsWith("jdbc:postgresql")) {
            System.setProperty("spring.datasource.url", "jdbc:h2:mem:serenity_spa;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL");
            System.setProperty("spring.datasource.driverClassName", "org.h2.Driver");
            System.setProperty("spring.datasource.username", "sa");
            System.setProperty("spring.datasource.password", "");
            if (System.getProperty("spring.profiles.active") == null && System.getenv("SPRING_PROFILES_ACTIVE") == null) {
                System.setProperty("spring.profiles.active", "h2");
            }
        }
        SpringApplication.run(SerenitySpaApplication.class, args);
    }
}
