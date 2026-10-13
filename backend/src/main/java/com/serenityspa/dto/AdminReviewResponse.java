package com.serenityspa.dto;

import java.time.LocalDateTime;

public class AdminReviewResponse {
    private Long id;
    private String fullName;
    private String customerName;
    private String profession;
    private String treatmentName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private String source;

    public AdminReviewResponse() {}

    public AdminReviewResponse(Long id, String fullName, String customerName, String profession,
                               String treatmentName, Integer rating, String comment,
                               LocalDateTime createdAt, String source) {
        this.id = id;
        this.fullName = fullName;
        this.customerName = customerName;
        this.profession = profession;
        this.treatmentName = treatmentName;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
        this.source = source;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getProfession() {
        return profession;
    }

    public void setProfession(String profession) {
        this.profession = profession;
    }

    public String getTreatmentName() {
        return treatmentName;
    }

    public void setTreatmentName(String treatmentName) {
        this.treatmentName = treatmentName;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}
