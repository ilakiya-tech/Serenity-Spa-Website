package com.serenityspa.controller;

import com.serenityspa.dto.ContactRequest;
import com.serenityspa.dto.ContactResponse;
import com.serenityspa.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@Tag(name = "Contact", description = "Endpoints for submitting guest contact enquiries")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping("/contact")
    @Operation(summary = "Submit a contact enquiry (Public)")
    public ResponseEntity<ContactResponse> submitContactEnquiry(@Valid @RequestBody ContactRequest request) {
        ContactResponse response = contactService.saveEnquiry(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/contact/my")
    @Operation(summary = "Get contact messages and replies for logged-in user")
    public ResponseEntity<java.util.List<ContactResponse>> getMyEnquiries(@org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        return ResponseEntity.ok(contactService.getEnquiriesForUser(userDetails.getUsername()));
    }

    @GetMapping("/contact/by-email")
    @Operation(summary = "Get contact messages and replies by email (Public/Guest)")
    public ResponseEntity<java.util.List<ContactResponse>> getEnquiriesByEmail(@RequestParam String email) {
        return ResponseEntity.ok(contactService.getEnquiriesForUser(email));
    }
}
