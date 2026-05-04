package com.cleanfood.server.controller;
 
import com.cleanfood.server.entity.Order;
import com.cleanfood.server.entity.OrderItem;
import com.cleanfood.server.entity.Product;
import com.cleanfood.server.entity.User;
import com.cleanfood.server.repository.ProductRepository;
import com.cleanfood.server.repository.UserRepository;
import com.cleanfood.server.service.OrderService;
import com.cleanfood.server.config.VNPAYConfig;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final OrderService orderService;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public PaymentController(OrderService orderService, UserRepository userRepository, ProductRepository productRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/create-vnpay-payment")
    public ResponseEntity<Map<String, String>> createPayment(
            HttpServletRequest req, 
            Authentication authentication,
            @RequestParam String shippingAddress) {
        
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // 1. Create Order first
        Order order = orderService.createOrder(user, shippingAddress, "VNPAY");
        
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_OrderInfo = "Thanh toán đơn hàng sạch #" + order.getId();
        String orderType = "other";
        String vnp_TxnRef = String.valueOf(order.getId());
        String vnp_IpAddr = VNPAYConfig.getIpAddress(req);
        String vnp_TmnCode = VNPAYConfig.vnp_TmnCode;

        long amount = order.getTotalAmount().longValue();
        long vnp_Amount = amount * 100;
        
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(vnp_Amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", VNPAYConfig.vnp_Returnurl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cml = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cml.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cml.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cml.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPAYConfig.hmacSHA512(VNPAYConfig.vnp_HashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = VNPAYConfig.vnp_PayUrl + "?" + queryUrl;

        Map<String, String> result = new HashMap<>();
        result.put("url", paymentUrl);
        result.put("orderId", String.valueOf(order.getId()));
        return ResponseEntity.ok(result);
    }

    @PostMapping("/create-guest-vnpay-payment")
    public ResponseEntity<Map<String, String>> createGuestPayment(
            HttpServletRequest req,
            @RequestBody Map<String, Object> request) {

        String guestEmail = (String) request.get("guestEmail");
        String shippingAddress = (String) request.get("shippingAddress");
        List<Map<String, Object>> cartItems = (List<Map<String, Object>>) request.get("cartItems");

        if (guestEmail == null || shippingAddress == null || cartItems == null || cartItems.isEmpty()) {
            throw new RuntimeException("Missing required fields");
        }

        // Create order items from cart
        List<OrderItem> orderItems = cartItems.stream().map(item -> {
            Long productId = Long.valueOf(item.get("productId").toString());
            Integer quantity = Integer.valueOf(item.get("quantity").toString());
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            return OrderItem.builder()
                    .product(product)
                    .quantity(quantity)
                    .price(product.getPrice())
                    .build();
        }).collect(Collectors.toList());

        // Create guest order
        Order order = orderService.createGuestOrder(guestEmail, shippingAddress, "VNPAY", orderItems);

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_OrderInfo = "Thanh toan don hang sạch #" + order.getId();
        String orderType = "other";
        String vnp_TxnRef = String.valueOf(order.getId());
        String vnp_IpAddr = VNPAYConfig.getIpAddress(req);
        String vnp_TmnCode = VNPAYConfig.vnp_TmnCode;

        long amount = order.getTotalAmount().longValue();
        long vnp_Amount = amount * 100;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(vnp_Amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", VNPAYConfig.vnp_Returnurl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cml = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cml.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cml.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cml.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPAYConfig.hmacSHA512(VNPAYConfig.vnp_HashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = VNPAYConfig.vnp_PayUrl + "?" + queryUrl;

        Map<String, String> result = new HashMap<>();
        result.put("url", paymentUrl);
        result.put("orderId", String.valueOf(order.getId()));
        return ResponseEntity.ok(result);
    }
}
