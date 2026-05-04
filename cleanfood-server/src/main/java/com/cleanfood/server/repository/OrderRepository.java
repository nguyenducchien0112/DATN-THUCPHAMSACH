package com.cleanfood.server.repository;

import com.cleanfood.server.constant.OrderStatus;
import com.cleanfood.server.entity.Order;
import com.cleanfood.server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerOrderByOrderDateDesc(User customer);
    long countByStatus(OrderStatus status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'COMPLETED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT FUNCTION('DATE', o.orderDate) as date, SUM(o.totalAmount) as amount, COUNT(o) as count " +
           "FROM Order o WHERE o.orderDate >= :startDate AND o.status = 'COMPLETED' GROUP BY FUNCTION('DATE', o.orderDate)")
    List<Map<String, Object>> getDailyStats(@Param("startDate") LocalDateTime startDate);
}
