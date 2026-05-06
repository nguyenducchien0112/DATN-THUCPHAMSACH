package com.cleanfood.server.controller;

import com.cleanfood.server.constant.Role;
import com.cleanfood.server.dto.AuthResponse;
import com.cleanfood.server.dto.ForgotPasswordRequest;
import com.cleanfood.server.dto.LoginRequest;
import com.cleanfood.server.dto.RegisterRequest;
import com.cleanfood.server.dto.ResetPasswordRequest;
import com.cleanfood.server.entity.Order;
import com.cleanfood.server.entity.OrderItem;
import com.cleanfood.server.entity.Product;
import com.cleanfood.server.entity.User;
import com.cleanfood.server.repository.OrderRepository;
import com.cleanfood.server.repository.ProductRepository;
import com.cleanfood.server.repository.UserRepository;
import com.cleanfood.server.security.JwtUtils;
import com.cleanfood.server.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.MailException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderService orderService;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtils.generateToken(userDetails);
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        return ResponseEntity.ok(new AuthResponse(token, userDetails.getUsername(), role));
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Tên đăng nhập đã tồn tại");
        }

        User newUser = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(Role.ROLE_CUSTOMER)
                .isActive(true)
                .build();

        userRepository.save(newUser);
        return ResponseEntity.ok("Đăng ký thành công");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("Email không đúng hoặc chưa đăng ký");
        }

        User user = optionalUser.get();
        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
        userRepository.save(user);

        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        try {
            sendResetPasswordEmail(user.getEmail(), resetLink);
        } catch (MailException ex) {
            ex.printStackTrace();
            return ResponseEntity.ok("Yêu cầu đặt lại mật khẩu đã được ghi nhận. Vui lòng kiểm tra email khi hệ thống mail hoạt động.");
        }

        return ResponseEntity.ok("Đã gửi link đặt lại mật khẩu đến email của bạn");
    }

    private void sendResetPasswordEmail(String to, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Đặt lại mật khẩu CleanFood");
        message.setText("Chào bạn,\n\n" +
                "Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu. Vui lòng bấm vào liên kết bên dưới để tạo mật khẩu mới:\n\n" +
                resetLink + "\n\n" +
                "Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.\n\n" +
                "Trân trọng,\nCleanFood");
        mailSender.send(message);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        Optional<User> optionalUser = userRepository.findByResetPasswordToken(request.getToken());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("Token đặt lại mật khẩu không hợp lệ");
        }

        User user = optionalUser.get();
        if (user.getResetPasswordExpiresAt() == null || user.getResetPasswordExpiresAt().isBefore(Instant.now())) {
            return ResponseEntity.badRequest().body("Liên kết đặt lại mật khẩu đã hết hạn");
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiresAt(null);
        userRepository.save(user);

        return ResponseEntity.ok("Đặt lại mật khẩu thành công");
    }

    @PostMapping("/create-guest-cod-order")
    public ResponseEntity<Map<String, Object>> createGuestCodOrder(@RequestBody Map<String, Object> request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Vui lòng đăng nhập để thanh toán"));
    }

    @PostMapping("/send-invoice")
    public ResponseEntity<String> sendInvoice(@RequestBody Map<String, Object> request) {
        Long orderId = Long.valueOf(request.get("orderId").toString());
        Optional<Order> optionalOrder = orderRepository.findById(orderId);
        if (optionalOrder.isEmpty()) {
            return ResponseEntity.badRequest().body("Đơn hàng không tồn tại");
        }

        Order order = optionalOrder.get();
        String email = order.getCustomer() != null ? order.getCustomer().getEmail() : order.getGuestEmail();
        if (email == null) {
            return ResponseEntity.badRequest().body("Không có email để gửi hóa đơn");
        }

        try {
            sendInvoiceEmail(email, order);
        } catch (MailException ex) {
            ex.printStackTrace();
            return ResponseEntity.ok("Hóa đơn đã được ghi nhận. Vui lòng kiểm tra email khi hệ thống mail hoạt động.");
        }

        return ResponseEntity.ok("Hóa đơn đã được gửi đến email của bạn");
    }

    private void sendInvoiceEmail(String to, Order order) {
        StringBuilder itemsText = new StringBuilder();
        for (OrderItem item : order.getItems()) {
            itemsText.append("- ").append(item.getProduct().getName())
                    .append(" x").append(item.getQuantity())
                    .append(" = ").append(item.getPrice().multiply(new BigDecimal(item.getQuantity()))).append(" VND\n");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Hóa đơn đơn hàng CleanFood #" + order.getId());
        message.setText("Cảm ơn bạn đã mua hàng tại CleanFood!\n\n" +
                "Chi tiết đơn hàng #" + order.getId() + ":\n\n" +
                itemsText.toString() + "\n" +
                "Tổng tiền: " + order.getTotalAmount() + " VND\n" +
                "Địa chỉ giao hàng: " + order.getShippingAddress() + "\n" +
                "Phương thức thanh toán: " + order.getPaymentMethod() + "\n\n" +
                "Đơn hàng đang được xử lý và sẽ sớm được giao đến.\n\n" +
                "Trân trọng,\nCleanFood");
        mailSender.send(message);
    }
}
