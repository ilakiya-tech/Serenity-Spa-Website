package com.serenityspa.service;

import com.serenityspa.dto.MembershipPlanResponse;
import com.serenityspa.dto.MembershipPurchaseRequest;
import com.serenityspa.dto.UserMembershipResponse;
import com.serenityspa.entity.*;
import com.serenityspa.exception.ConflictException;
import com.serenityspa.exception.ResourceNotFoundException;
import com.serenityspa.repository.MembershipPlanRepository;
import com.serenityspa.repository.UserMembershipRepository;
import com.serenityspa.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MembershipService {

    private final MembershipPlanRepository membershipPlanRepository;
    private final UserMembershipRepository userMembershipRepository;
    private final UserRepository userRepository;

    public MembershipService(MembershipPlanRepository membershipPlanRepository,
                             UserMembershipRepository userMembershipRepository,
                             UserRepository userRepository) {
        this.membershipPlanRepository = membershipPlanRepository;
        this.userMembershipRepository = userMembershipRepository;
        this.userRepository = userRepository;
    }

    public List<MembershipPlanResponse> getAllPlans() {
        return membershipPlanRepository.findAll().stream()
                .map(this::mapToPlanResponse)
                .collect(Collectors.toList());
    }

    public List<MembershipPlanResponse> getAllActivePlans() {
        return membershipPlanRepository.findByActiveTrue().stream()
                .map(this::mapToPlanResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MembershipPlanResponse createPlan(com.serenityspa.dto.CreateMembershipPlanRequest request) {
        if (membershipPlanRepository.findByName(request.getName()).isPresent()) {
            throw new ConflictException("A membership plan with the name '" + request.getName() + "' already exists");
        }

        MembershipPlan plan = new MembershipPlan(
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getDurationDays(),
                request.getDiscountPercentage(),
                request.getBenefits(),
                true
        );

        MembershipPlan saved = membershipPlanRepository.save(plan);
        return mapToPlanResponse(saved);
    }

    @Transactional
    public void removePlan(Long planId) {
        MembershipPlan plan = membershipPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Membership plan not found with id: " + planId));

        // 1. Mark the plan as inactive so it is no longer purchasable or active in system
        plan.setActive(false);
        membershipPlanRepository.save(plan);

        // 2. Immediately revoke and deactivate all user memberships tied to this removed plan
        List<UserMembership> userMemberships = userMembershipRepository.findByMembershipPlanId(planId);
        for (UserMembership um : userMemberships) {
            um.setStatus(MembershipStatus.CANCELLED);
        }
        userMembershipRepository.saveAll(userMemberships);
    }

    public MembershipPlanResponse getPlanById(Long id) {
        MembershipPlan plan = membershipPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership plan not found with id: " + id));
        return mapToPlanResponse(plan);
    }

    public Optional<UserMembershipResponse> getCurrentCustomerMembership(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        return userMembershipRepository.findCurrentActiveMembership(user.getId())
                .map(this::mapToUserMembershipResponse);
    }

    public List<UserMembershipResponse> getCustomerMembershipHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        return userMembershipRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToUserMembershipResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserMembershipResponse activateMembership(String userEmail, MembershipPurchaseRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        MembershipPlan plan = membershipPlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Membership plan not found: " + request.getPlanId()));

        if (!plan.isActive()) {
            throw new IllegalArgumentException("Cannot activate an inactive membership plan");
        }

        // Check if user already has an active membership; extend if active, otherwise start fresh
        Optional<UserMembership> currentActive = userMembershipRepository.findCurrentActiveMembership(user.getId());

        LocalDate startDate = LocalDate.now();
        if (currentActive.isPresent() && !currentActive.get().getEndDate().isBefore(startDate)) {
            // Renewal starts after current expiration
            startDate = currentActive.get().getEndDate().plusDays(1);
        }

        LocalDate endDate = startDate.plusDays(plan.getDurationDays());

        UserMembership newMembership = new UserMembership(
                user,
                plan,
                startDate,
                endDate,
                MembershipStatus.ACTIVE
        );

        UserMembership saved = userMembershipRepository.save(newMembership);
        return mapToUserMembershipResponse(saved);
    }

    public BigDecimal getActiveDiscountPercentage(Long userId) {
        Optional<UserMembership> active = userMembershipRepository.findCurrentActiveMembership(userId);
        if (active.isPresent() && active.get().isCurrentlyActive()) {
            return active.get().getMembershipPlan().getDiscountPercentage();
        }
        return BigDecimal.ZERO;
    }

    public Optional<UserMembership> getActiveMembership(Long userId) {
        return userMembershipRepository.findCurrentActiveMembership(userId);
    }

    private MembershipPlanResponse mapToPlanResponse(MembershipPlan p) {
        return new MembershipPlanResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getDurationDays(),
                p.getDiscountPercentage(),
                p.getBenefits(),
                p.isActive()
        );
    }

    private UserMembershipResponse mapToUserMembershipResponse(UserMembership um) {
        return new UserMembershipResponse(
                um.getId(),
                um.getMembershipPlan().getId(),
                um.getMembershipPlan().getName(),
                um.getMembershipPlan().getPrice(),
                um.getMembershipPlan().getDiscountPercentage(),
                um.getMembershipPlan().getBenefits(),
                um.getStartDate(),
                um.getEndDate(),
                um.getStatus(),
                um.isCurrentlyActive()
        );
    }
}
