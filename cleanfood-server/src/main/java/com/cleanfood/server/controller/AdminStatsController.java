package com.cleanfood.server.controller;

import com.cleanfood.server.constant.OrderStatus;
import com.cleanfood.server.constant.Role;
import com.cleanfood.server.entity.Order;
import com.cleanfood.server.repository.OrderRepository;
import com.cleanfood.server.repository.ProductRepository;
import com.cleanfood.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminStatsController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();

        List<Order> allOrders = orderRepository.findAll();
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalOrders", orderRepository.countByStatus(OrderStatus.PENDING));
        stats.put("totalCustomers", userRepository.countByRole(Role.ROLE_CUSTOMER));
        
        Long totalStock = productRepository.getTotalStock();
        stats.put("totalStock", totalStock != null ? totalStock : 0);

        // Weekly Chart Data (Last 7 days, completed orders only)
        LocalDate startDate = LocalDate.now().minusDays(6);
        Map<LocalDate, BigDecimal> revenueByDay = new HashMap<>();
        Map<LocalDate, Long> completedCountByDay = new HashMap<>();
        Map<String, BigDecimal> revenueByDate = new HashMap<>();
        for (Order order : allOrders) {
            if (order.getStatus() != OrderStatus.COMPLETED || order.getOrderDate() == null) {
                continue;
            }
            LocalDate orderDay = order.getOrderDate().toLocalDate();
            revenueByDate.put(orderDay.toString(), revenueByDate.getOrDefault(orderDay.toString(), BigDecimal.ZERO).add(order.getTotalAmount()));
            if (orderDay.isBefore(startDate)) {
                continue;
            }
            revenueByDay.put(orderDay, revenueByDay.getOrDefault(orderDay, BigDecimal.ZERO).add(order.getTotalAmount()));
            completedCountByDay.put(orderDay, completedCountByDay.getOrDefault(orderDay, 0L) + 1);
        }

        List<Map<String, Object>> chartData = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {
            LocalDateTime date = LocalDateTime.now().minusDays(i);
            LocalDate currentDay = date.toLocalDate();
            String dayName = getVietnameseDayName(date);
            
            Map<String, Object> dayStats = new HashMap<>();
            dayStats.put("name", dayName);
            dayStats.put("date", currentDay.toString());
            dayStats.put("revenue", revenueByDay.getOrDefault(currentDay, BigDecimal.ZERO));
            dayStats.put("orders", completedCountByDay.getOrDefault(currentDay, 0L));
            chartData.add(dayStats);
        }
        
        stats.put("chartData", chartData);
        stats.put("revenueByDate", revenueByDate);
        stats.put("orderDistribution", List.of(
                Map.of("name", "Thanh cong", "orders", orderRepository.countByStatus(OrderStatus.COMPLETED)),
                Map.of("name", "Da huy", "orders", orderRepository.countByStatus(OrderStatus.CANCELLED))
        ));

        return ResponseEntity.ok(stats);
    }

    private String getVietnameseDayName(LocalDateTime date) {
        String dayEn = date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        switch (dayEn) {
            case "Monday": return "Thứ 2";
            case "Tuesday": return "Thứ 3";
            case "Wednesday": return "Thứ 4";
            case "Thursday": return "Thứ 5";
            case "Friday": return "Thứ 6";
            case "Saturday": return "Thứ 7";
            case "Sunday": return "Chủ nhật";
            default: return dayEn;
        }
    }
}
