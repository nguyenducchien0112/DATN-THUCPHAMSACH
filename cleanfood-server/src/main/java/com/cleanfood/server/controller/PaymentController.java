package com.cleanfood.server.controller;

import com.cleanfood.server.config.VNPAYConfig;
import com.cleanfood.server.entity.Order;
import com.cleanfood.server.entity.User;
import com.cleanfood.server.repository.UserRepository;
import com.cleanfood.server.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public PaymentController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    @GetMapping("/create-vnpay-payment")
    public ResponseEntity<Map<String, String>> createPayment(
            HttpServletRequest req,
            Authentication authentication,
            @RequestParam String shippingAddress) {
        if (shippingAddress == null || shippingAddress.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Shipping address is required"));
        }

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderService.createOrder(user, shippingAddress, "VNPAY", false);
        return ResponseEntity.ok(createVnpayResponse(req, order));
    }

    @PostMapping("/create-guest-vnpay-payment")
    public ResponseEntity<Map<String, String>> createGuestPayment() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Vui lòng đăng nhập để thanh toán"));
    }

    private Map<String, String> createVnpayResponse(HttpServletRequest req, Order order) {
        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", VNPAYConfig.vnp_TmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(order.getTotalAmount().longValue() * 100));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", String.valueOf(order.getId()));
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang #" + order.getId());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", VNPAYConfig.vnp_Returnurl);
        vnpParams.put("vnp_IpAddr", VNPAYConfig.getIpAddress(req));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        LocalDateTime createDate = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        vnpParams.put("vnp_CreateDate", formatter.format(createDate));
        vnpParams.put("vnp_ExpireDate", formatter.format(createDate.plusMinutes(15)));

        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnpParams.get(fieldName);
            if (fieldValue != null && !fieldValue.isBlank()) {
                String encodedFieldName = URLEncoder.encode(fieldName, StandardCharsets.UTF_8);
                String encodedFieldValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8);
                hashData.append(fieldName).append('=').append(encodedFieldValue);
                query.append(encodedFieldName).append('=').append(encodedFieldValue);
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String secureHash = VNPAYConfig.hmacSHA512(VNPAYConfig.vnp_HashSecret, hashData.toString());
        String paymentUrl = VNPAYConfig.vnp_PayUrl + "?" + queryUrl + "&vnp_SecureHash=" + secureHash;

        Map<String, String> result = new HashMap<>();
        result.put("url", paymentUrl);
        result.put("orderId", String.valueOf(order.getId()));
        return result;
    }
}
