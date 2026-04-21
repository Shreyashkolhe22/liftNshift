package com.shifting.payload.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminDashboardDto {
    private long totalUsers;
    private long totalBookings;
    private long pendingBookings;
    private long confirmedBookings;
    private long inProgressBookings;
    private long completedBookings;
    private long cancelledBookings;
    private BigDecimal totalRevenue;
    private long totalPredefinedItems;
    private long totalPayments;
}