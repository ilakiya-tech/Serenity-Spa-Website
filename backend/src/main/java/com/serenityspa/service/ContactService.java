package com.serenityspa.service;

import com.serenityspa.dto.ContactRequest;
import com.serenityspa.dto.ContactResponse;
import com.serenityspa.entity.ContactEnquiry;
import com.serenityspa.repository.ContactEnquiryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactService {

    private final ContactEnquiryRepository contactEnquiryRepository;

    public ContactService(ContactEnquiryRepository contactEnquiryRepository) {
        this.contactEnquiryRepository = contactEnquiryRepository;
    }

    @Transactional
    public ContactResponse saveEnquiry(ContactRequest request) {
        ContactEnquiry enquiry = new ContactEnquiry(
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getSubject(),
                request.getMessage()
        );

        ContactEnquiry saved = contactEnquiryRepository.save(enquiry);
        return mapToResponse(saved);
    }

    public List<ContactResponse> getEnquiriesForUser(String email) {
        return contactEnquiryRepository.findByEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ContactResponse replyToEnquiry(Long id, String replyText) {
        ContactEnquiry enquiry = contactEnquiryRepository.findById(id)
                .orElseThrow(() -> new com.serenityspa.exception.ResourceNotFoundException("Contact enquiry not found with id: " + id));

        enquiry.setReply(replyText);
        enquiry.setRepliedAt(java.time.LocalDateTime.now());
        enquiry.setStatus("REPLIED");
        enquiry.setRead(true);

        ContactEnquiry saved = contactEnquiryRepository.save(enquiry);
        return mapToResponse(saved);
    }

    private ContactResponse mapToResponse(ContactEnquiry ce) {
        return new ContactResponse(
                ce.getId(),
                ce.getName(),
                ce.getEmail(),
                ce.getPhone(),
                ce.getSubject(),
                ce.getMessage(),
                ce.getCreatedAt(),
                ce.isRead(),
                ce.getReply(),
                ce.getRepliedAt(),
                ce.getStatus()
        );
    }
}
