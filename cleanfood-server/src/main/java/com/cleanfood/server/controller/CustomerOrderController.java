package com.cleanfood.server.controller;

import com.cleanfood.server.entity.Order;
import com.cleanfood.server.entity.User;
import com.cleanfood.server.repository.UserRepository;
import com.cleanfood.server.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerOrderController {
    private final OrderService orderService;
    private final UserRepository userRepository;
    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(orderService.getOrdersByUser(user));
    }
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(Authentication authentication, @PathVariable Long id) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(orderService.cancelOrder(user, id));
    }
    @PostMapping("/create-cod-order")
    public ResponseEntity<?> createCodOrder(
            Authentication authentication,
            @RequestBody Map<String, String> payload
    ) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String shippingAddress = payload != null ? payload.get("shippingAddress") : null;
        if (shippingAddress == null || shippingAddress.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Shipping address is required"));
        }
        Order order = orderService.createOrder(user, shippingAddress, "COD");
        return ResponseEntity.ok(Map.of(
                "message", "COD order created successfully",
                "orderId", order.getId()
        ));
    }
}
