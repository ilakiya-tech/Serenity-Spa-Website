package com.serenityspa.service;

import com.serenityspa.dto.ContactRequest;
import com.serenityspa.dto.ContactResponse;
import com.serenityspa.entity.ContactEnquiry;
import com.serenityspa.exception.ResourceNotFoundException;
import com.serenityspa.repository.ContactEnquiryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ContactServiceTest {

    @Mock
    private ContactEnquiryRepository contactEnquiryRepository;

    @InjectMocks
    private ContactService contactService;

    private ContactEnquiry sampleEnquiry;

    @BeforeEach
    void setUp() {
        sampleEnquiry = new ContactEnquiry("John Doe", "john@example.com", "1234567890", "Pricing", "How much is massage?");
        sampleEnquiry.setId(1L);
    }

    @Test
    void saveEnquiry_Success() {
        ContactRequest req = new ContactRequest("John Doe", "john@example.com", "1234567890", "Pricing", "How much is massage?");
        when(contactEnquiryRepository.save(any(ContactEnquiry.class))).thenReturn(sampleEnquiry);

        ContactResponse resp = contactService.saveEnquiry(req);

        assertNotNull(resp);
        assertEquals("John Doe", resp.getName());
        assertEquals("john@example.com", resp.getEmail());
        verify(contactEnquiryRepository, times(1)).save(any(ContactEnquiry.class));
    }

    @Test
    void replyToEnquiry_Success() {
        when(contactEnquiryRepository.findById(1L)).thenReturn(Optional.of(sampleEnquiry));
        when(contactEnquiryRepository.save(any(ContactEnquiry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ContactResponse resp = contactService.replyToEnquiry(1L, "Our massage starts at $120.");

        assertNotNull(resp);
        assertEquals("Our massage starts at $120.", resp.getReply());
        assertEquals("REPLIED", resp.getStatus());
        assertTrue(resp.isRead());
        assertNotNull(resp.getRepliedAt());
        verify(contactEnquiryRepository, times(1)).save(any(ContactEnquiry.class));
    }

    @Test
    void replyToEnquiry_ThrowsNotFound_WhenIdInvalid() {
        when(contactEnquiryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> contactService.replyToEnquiry(999L, "Test reply"));
        verify(contactEnquiryRepository, never()).save(any(ContactEnquiry.class));
    }

    @Test
    void getEnquiriesForUser_ReturnsUserMessages() {
        when(contactEnquiryRepository.findByEmailOrderByCreatedAtDesc("john@example.com"))
                .thenReturn(List.of(sampleEnquiry));

        List<ContactResponse> list = contactService.getEnquiriesForUser("john@example.com");

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("john@example.com", list.get(0).getEmail());
    }
}
