package com.cleanfood.server.service;

import com.cleanfood.server.entity.User;
import com.cleanfood.server.entity.Order;
import java.util.List;

public interface UserService {
    List<User> getAllUsers();
    User toggleUserStatus(Long userId);
    User updateUserByAdmin(Long userId, User payload);
    void deleteUserByAdmin(Long userId);
    List<Order> getOrdersByUserId(Long userId);
}
