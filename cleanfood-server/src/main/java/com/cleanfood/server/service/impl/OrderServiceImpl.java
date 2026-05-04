package com.cleanfood.server.service.impl;

import com.cleanfood.server.entity.Order;
import com.cleanfood.server.entity.*;
import com.cleanfood.server.constant.OrderStatus;
import com.cleanfood.server.repository.CartRepository;
import com.cleanfood.server.repository.OrderRepository;
import com.cleanfood.server.repository.ProductRepository;
import com.cleanfood.server.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        OrderStatus previousStatus = order.getStatus();

        // Deduct stock only when admin confirms delivered successfully.
        if (status == OrderStatus.COMPLETED && previousStatus != OrderStatus.COMPLETED) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                if (product.getStockQuantity() < item.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for product: " + product.getName());
                }
                product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
                productRepository.save(product);
            }
        }

        // Restore stock only when an already completed order is moved away from COMPLETED.
        if (previousStatus == OrderStatus.COMPLETED && status != OrderStatus.COMPLETED) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }

        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order createOrder(User user, String shippingAddress, String paymentMethod) {
        List<CartItem> cartItems = cartRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Calculate subtotal
        BigDecimal subtotal = cartItems.stream()
                .map(item -> item.getProduct().getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Shipping logic: Free over 500k, otherwise 30k
        BigDecimal shippingFee = subtotal.compareTo(new BigDecimal(500000)) > 0 ? BigDecimal.ZERO : new BigDecimal(30000);
        BigDecimal totalAmount = subtotal.add(shippingFee);

        Order order = Order.builder()
                .customer(user)
                .status(OrderStatus.PENDING)
                .shippingAddress(shippingAddress)
                .paymentMethod(paymentMethod)
                .totalAmount(totalAmount)
                .items(new ArrayList<>())
                .build();

        Order savedOrder = orderRepository.save(order);

        List<OrderItem> orderItems = cartItems.stream().map(cartItem -> {
            return OrderItem.builder()
                    .order(savedOrder)
                    .product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getProduct().getPrice())
                    .build();
        }).collect(Collectors.toList());

        savedOrder.setItems(orderItems);
        
        // Clear cart
        cartRepository.deleteByUser(user);
        
        return orderRepository.save(savedOrder);
    }

    @Override
    @Transactional
    public Order createGuestOrder(String guestEmail, String shippingAddress, String paymentMethod, List<OrderItem> items) {
        if (items.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Calculate subtotal
        BigDecimal subtotal = items.stream()
                .map(item -> item.getProduct().getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Shipping logic: Free over 500k, otherwise 30k
        BigDecimal shippingFee = subtotal.compareTo(new BigDecimal(500000)) > 0 ? BigDecimal.ZERO : new BigDecimal(30000);
        BigDecimal totalAmount = subtotal.add(shippingFee);

        Order order = Order.builder()
                .guestEmail(guestEmail)
                .status(OrderStatus.PENDING)
                .shippingAddress(shippingAddress)
                .paymentMethod(paymentMethod)
                .totalAmount(totalAmount)
                .items(items)
                .build();

        Order savedOrder = orderRepository.save(order);

        // Set order for items
        items.forEach(item -> item.setOrder(savedOrder));

        Order finalOrder = orderRepository.save(savedOrder);
        return finalOrder;
    }

    @Override
    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByCustomerOrderByOrderDateDesc(user);
    }
}
