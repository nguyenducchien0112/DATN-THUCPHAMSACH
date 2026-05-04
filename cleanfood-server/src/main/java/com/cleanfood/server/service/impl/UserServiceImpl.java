package com.cleanfood.server.service.impl;

import com.cleanfood.server.entity.User;
import com.cleanfood.server.entity.Order;
import com.cleanfood.server.constant.Role;
import com.cleanfood.server.repository.OrderRepository;
import com.cleanfood.server.repository.UserRepository;
import com.cleanfood.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.isActive());
        return userRepository.save(user);
    }

    @Override
    public User updateUserByAdmin(Long userId, User payload) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(payload.getFullName());
        user.setEmail(payload.getEmail());
        user.setPhone(payload.getPhone());
        user.setAddress(payload.getAddress());
        if (payload.getRole() != null) {
            user.setRole(payload.getRole());
        } else {
            user.setRole(Role.ROLE_CUSTOMER);
        }
        return userRepository.save(user);
    }

    @Override
    public void deleteUserByAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    @Override
    public List<Order> getOrdersByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByCustomerOrderByOrderDateDesc(user);
    }
}
