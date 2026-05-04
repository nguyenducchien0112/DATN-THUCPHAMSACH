package com.cleanfood.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class StatsResponse {
    private long totalOrders;
    private BigDecimal totalRevenue;
    private long totalCustomers;
}
