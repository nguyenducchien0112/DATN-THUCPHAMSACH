package com.cleanfood.server.service.impl;

import com.cleanfood.server.dto.StatsResponse;
import com.cleanfood.server.entity.Order;
import com.cleanfood.server.constant.OrderStatus;
import com.cleanfood.server.repository.OrderRepository;
import com.cleanfood.server.repository.UserRepository;
import com.cleanfood.server.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatsServiceImpl implements StatsService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Override
    public StatsResponse getAdminStats() {
        List<Order> orders = orderRepository.findAll();
        long totalOrders = orders.size();
        BigDecimal totalRevenue = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long totalCustomers = userRepository.count();
        return new StatsResponse(totalOrders, totalRevenue, totalCustomers);
    }
}
