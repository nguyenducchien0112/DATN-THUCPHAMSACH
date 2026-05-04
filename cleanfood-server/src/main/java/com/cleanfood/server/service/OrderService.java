package com.cleanfood.server.service;

import com.cleanfood.server.entity.Order;
import com.cleanfood.server.entity.User;
import com.cleanfood.server.entity.OrderItem;
import com.cleanfood.server.constant.OrderStatus;
import java.util.List;

public interface OrderService {
    List<Order> getAllOrders();
    Order updateOrderStatus(Long orderId, OrderStatus status);
    Order createOrder(User user, String shippingAddress, String paymentMethod);
    Order createGuestOrder(String guestEmail, String shippingAddress, String paymentMethod, List<OrderItem> items);
    List<Order> getOrdersByUser(User user);
}
