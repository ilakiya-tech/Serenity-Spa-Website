package com.serenityspa.repository;

import com.serenityspa.entity.MembershipStatus;
import com.serenityspa.entity.UserMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserMembershipRepository extends JpaRepository<UserMembership, Long> {
    List<UserMembership> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT um FROM UserMembership um WHERE um.user.id = :userId AND um.status = :status AND um.membershipPlan.active = true AND :today BETWEEN um.startDate AND um.endDate ORDER BY um.endDate DESC")
    List<UserMembership> findActiveMemberships(
            @Param("userId") Long userId,
            @Param("status") MembershipStatus status,
            @Param("today") LocalDate today
    );

    default Optional<UserMembership> findCurrentActiveMembership(Long userId) {
        List<UserMembership> active = findActiveMemberships(userId, MembershipStatus.ACTIVE, LocalDate.now());
        return active.isEmpty() ? Optional.empty() : Optional.of(active.get(0));
    }

    @Query("SELECT um FROM UserMembership um JOIN FETCH um.user JOIN FETCH um.membershipPlan WHERE um.status = 'ACTIVE' AND um.membershipPlan.active = true AND :today BETWEEN um.startDate AND um.endDate ORDER BY um.endDate ASC")
    List<UserMembership> findAllCurrentlyActive(@Param("today") LocalDate today);

    default List<UserMembership> findAllCurrentlyActive() {
        return findAllCurrentlyActive(LocalDate.now());
    }

    List<UserMembership> findByMembershipPlanId(Long membershipPlanId);
}
