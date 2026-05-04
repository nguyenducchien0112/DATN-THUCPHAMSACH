package com.cleanfood.server.config;

import com.cleanfood.server.constant.Role;
import com.cleanfood.server.entity.Category;
import com.cleanfood.server.entity.Product;
import com.cleanfood.server.entity.User;
import com.cleanfood.server.repository.CategoryRepository;
import com.cleanfood.server.repository.ProductRepository;
import com.cleanfood.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            seedUsers();
        }
    }

    private void seedUsers() {
        User admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .email("admin@cleanfood.com")
                .fullName("Quản trị viên")
                .role(Role.ROLE_ADMIN)
                .isActive(true)
                .build();
        userRepository.save(admin);
    }
}
