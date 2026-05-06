# Một số source code tiêu biểu

Các đoạn mã dưới đây được trích từ backend Spring Boot của hệ thống Clean Food. Nội dung được chọn theo các phần quan trọng của hệ thống: mô hình dữ liệu, xử lý nghiệp vụ đặt hàng, truy vấn dữ liệu, đăng nhập bằng JWT và phân quyền người dùng.

## 1. Entity `Product`

File: `cleanfood-server/src/main/java/com/cleanfood/server/entity/Product.java`

```java
@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    private BigDecimal discountPercent;
    private BigDecimal discountedPrice;
    private LocalDate promotionStartDate;
    private LocalDate promotionEndDate;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    @Column(nullable = false)
    private Integer stockQuantity;

    private String origin;
    private String unit;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
}
```

**Mô tả:**

Lớp `Product` đại diện cho sản phẩm trong hệ thống. Đây là một lớp entity được ánh xạ với bảng `products` trong cơ sở dữ liệu thông qua annotation `@Entity` và `@Table`.

Các thuộc tính chính gồm tên sản phẩm, mô tả, giá bán, phần trăm giảm giá, giá sau giảm, thời gian khuyến mãi, số lượng tồn kho, xuất xứ, đơn vị tính và danh mục sản phẩm. Kiểu dữ liệu `BigDecimal` được sử dụng cho các trường tiền tệ để đảm bảo độ chính xác khi tính toán giá.

Quan hệ `@ManyToOne` với `Category` thể hiện một sản phẩm thuộc một danh mục. Quan hệ `@OneToMany` với `ProductImage` thể hiện một sản phẩm có thể có nhiều ảnh. Tùy chọn `cascade = CascadeType.ALL` cho phép thao tác với sản phẩm có thể ảnh hưởng đồng thời đến danh sách ảnh liên quan, còn `orphanRemoval = true` giúp xóa ảnh không còn gắn với sản phẩm.

Các annotation của Lombok như `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor` và `@Builder` giúp giảm mã lặp, tự sinh getter, setter, constructor và builder khi biên dịch.

## 2. Entity `Order`

File: `cleanfood-server/src/main/java/com/cleanfood/server/entity/Order.java`

```java
@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true)
    private User customer;

    private String guestEmail;
    private LocalDateTime orderDate;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private String shippingAddress;
    private String paymentMethod;

    @Column(nullable = false)
    @Builder.Default
    private Boolean paid = false;

    @Column(name = "stock_deducted", nullable = false)
    @Builder.Default
    private Boolean stockDeducted = false;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;

    @PrePersist
    protected void onCreate() {
        orderDate = LocalDateTime.now();
        if (paid == null) {
            paid = false;
        }
        if (stockDeducted == null) {
            stockDeducted = false;
        }
    }
}
```

**Mô tả:**

Lớp `Order` biểu diễn đơn hàng của khách hàng. Lớp này được ánh xạ với bảng `orders`, lưu các thông tin như khách hàng đặt hàng, email khách vãng lai, ngày đặt hàng, tổng tiền, trạng thái đơn hàng, địa chỉ giao hàng, phương thức thanh toán và trạng thái thanh toán.

Thuộc tính `customer` có quan hệ `@ManyToOne` với lớp `User`, nghĩa là một người dùng có thể tạo nhiều đơn hàng. Trường này cho phép `nullable = true` để hỗ trợ trường hợp đơn hàng của khách vãng lai. Thuộc tính `items` có quan hệ `@OneToMany` với `OrderItem`, thể hiện một đơn hàng gồm nhiều dòng sản phẩm.

Trường `status` sử dụng `@Enumerated(EnumType.STRING)` để lưu trạng thái đơn hàng dưới dạng chuỗi như `PENDING`, `SHIPPING`, `COMPLETED`, `CANCELLED`. Cách lưu này giúp dữ liệu dễ đọc hơn so với lưu bằng số thứ tự enum.

Phương thức `onCreate()` được đánh dấu `@PrePersist`, tự động chạy trước khi đơn hàng được lưu lần đầu vào cơ sở dữ liệu. Phương thức này gán ngày đặt hàng hiện tại và đảm bảo các cờ `paid`, `stockDeducted` luôn có giá trị mặc định hợp lệ.

## 3. Controller đăng nhập và sinh JWT

File: `cleanfood-server/src/main/java/com/cleanfood/server/controller/AuthController.java`

```java
@PostMapping("/login")
public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
    Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                    request.getUsername(),
                    request.getPassword()
            )
    );

    UserDetails userDetails = (UserDetails) authentication.getPrincipal();
    String token = jwtUtils.generateToken(userDetails);
    String role = userDetails.getAuthorities()
            .iterator()
            .next()
            .getAuthority();

    return ResponseEntity.ok(
            new AuthResponse(token, userDetails.getUsername(), role)
    );
}
```

**Mô tả:**

Đoạn mã trên xử lý chức năng đăng nhập của hệ thống. API được ánh xạ bằng `@PostMapping("/login")`, nhận dữ liệu đăng nhập gồm tên tài khoản và mật khẩu từ frontend thông qua `LoginRequest`.

`AuthenticationManager` thực hiện xác thực thông tin đăng nhập bằng cách tạo đối tượng `UsernamePasswordAuthenticationToken`. Nếu tài khoản hoặc mật khẩu không đúng, Spring Security sẽ trả về lỗi xác thực. Nếu hợp lệ, hệ thống lấy thông tin người dùng từ `authentication.getPrincipal()`.

Sau khi xác thực thành công, hệ thống gọi `jwtUtils.generateToken(userDetails)` để sinh JWT. Token này được frontend lưu lại và gửi kèm trong các request tiếp theo để truy cập các API cần đăng nhập. Ngoài token, hệ thống còn trả về username và role của người dùng, giúp frontend điều hướng đúng giao diện khách hàng hoặc quản trị viên.

Đoạn mã này là phần quan trọng trong cơ chế xác thực stateless của hệ thống, vì server không cần lưu session mà dựa vào JWT để xác định người dùng ở mỗi request.

## 4. Controller tạo đơn hàng COD

File: `cleanfood-server/src/main/java/com/cleanfood/server/controller/CustomerOrderController.java`

```java
@PostMapping("/create-cod-order")
public ResponseEntity<?> createCodOrder(
        Authentication authentication,
        @RequestBody Map<String, String> payload
) {
    User user = userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

    String shippingAddress = payload != null
            ? payload.get("shippingAddress")
            : null;

    if (shippingAddress == null || shippingAddress.isBlank()) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", "Shipping address is required"));
    }

    Order order = orderService.createOrder(user, shippingAddress, "COD");

    return ResponseEntity.ok(Map.of(
            "message", "COD order created successfully",
            "orderId", order.getId()
    ));
}
```

**Mô tả:**

Đây là API tạo đơn hàng với phương thức thanh toán COD. Người dùng phải đăng nhập trước khi gọi API này, vì phương thức nhận tham số `Authentication` để xác định tài khoản đang thực hiện đặt hàng.

Hệ thống tìm người dùng trong cơ sở dữ liệu bằng `userRepository.findByUsername(authentication.getName())`. Sau đó, địa chỉ giao hàng được lấy từ request body. Nếu địa chỉ giao hàng rỗng hoặc không tồn tại, API trả về lỗi `badRequest` để yêu cầu người dùng nhập đầy đủ thông tin.

Khi dữ liệu hợp lệ, controller gọi `orderService.createOrder(user, shippingAddress, "COD")`. Việc tính tiền, tạo đơn hàng, tạo chi tiết đơn hàng và xóa giỏ hàng không xử lý trực tiếp trong controller mà được chuyển xuống service. Cách tổ chức này giúp controller gọn, đúng vai trò tiếp nhận request và trả response.

Kết quả trả về gồm thông báo tạo đơn thành công và `orderId`, giúp frontend có thể hiển thị mã đơn hàng hoặc chuyển sang trang kết quả thanh toán.

## 5. Service tạo đơn hàng từ giỏ hàng

File: `cleanfood-server/src/main/java/com/cleanfood/server/service/impl/OrderServiceImpl.java`

```java
@Override
@Transactional
public Order createOrder(
        User user,
        String shippingAddress,
        String paymentMethod,
        boolean clearCart
) {
    List<CartItem> cartItems = cartRepository.findByUser(user);
    if (cartItems.isEmpty()) {
        throw new RuntimeException("Cart is empty");
    }

    BigDecimal subtotal = cartItems.stream()
            .map(item -> getEffectivePrice(item.getProduct())
                    .multiply(new BigDecimal(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal shippingFee = subtotal.compareTo(new BigDecimal(500000)) > 0
            ? BigDecimal.ZERO
            : new BigDecimal(30000);

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

    List<OrderItem> orderItems = cartItems.stream()
            .map(cartItem -> OrderItem.builder()
                    .order(savedOrder)
                    .product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity())
                    .price(getEffectivePrice(cartItem.getProduct()))
                    .build())
            .collect(Collectors.toList());

    savedOrder.setItems(orderItems);

    if (clearCart) {
        cartRepository.deleteByUser(user);
    }

    return orderRepository.save(savedOrder);
}
```

**Mô tả:**

Đây là đoạn xử lý nghiệp vụ cốt lõi của chức năng đặt hàng. Phương thức nhận vào người dùng, địa chỉ giao hàng, phương thức thanh toán và tham số `clearCart` để quyết định có xóa giỏ hàng sau khi tạo đơn hay không.

Đầu tiên, hệ thống lấy danh sách sản phẩm trong giỏ hàng của người dùng bằng `cartRepository.findByUser(user)`. Nếu giỏ hàng rỗng, hệ thống ném lỗi để ngăn việc tạo đơn hàng không có sản phẩm.

Tiếp theo, hệ thống tính tạm tính đơn hàng bằng cách duyệt từng dòng giỏ hàng, lấy giá hiệu lực của sản phẩm qua `getEffectivePrice()`, nhân với số lượng rồi cộng dồn. Cách này cho phép hệ thống áp dụng giá khuyến mãi nếu sản phẩm đang trong thời gian giảm giá.

Sau khi có tạm tính, hệ thống tính phí vận chuyển: nếu tổng tiền sản phẩm lớn hơn 500.000 VNĐ thì miễn phí vận chuyển, ngược lại phí vận chuyển là 30.000 VNĐ. Tổng tiền đơn hàng bằng tạm tính cộng phí vận chuyển.

Đơn hàng được tạo với trạng thái ban đầu là `PENDING`. Sau khi lưu đơn hàng lần đầu để có mã đơn, hệ thống tạo danh sách `OrderItem` từ các dòng trong giỏ hàng. Mỗi `OrderItem` lưu sản phẩm, số lượng và giá tại thời điểm mua. Việc lưu giá tại thời điểm mua rất quan trọng vì giá sản phẩm có thể thay đổi sau này nhưng lịch sử đơn hàng vẫn phải giữ đúng giá đã mua.

Annotation `@Transactional` đảm bảo toàn bộ quá trình tạo đơn được thực hiện trong một giao dịch. Nếu có lỗi xảy ra ở bất kỳ bước nào, dữ liệu sẽ được rollback để tránh tình trạng tạo đơn không đầy đủ.

## 6. Service cập nhật trạng thái và tồn kho

File: `cleanfood-server/src/main/java/com/cleanfood/server/service/impl/OrderServiceImpl.java`

```java
@Override
@Transactional
public Order updateOrderStatus(Long orderId, OrderStatus status) {
    Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

    if (status == OrderStatus.COMPLETED
            && !Boolean.TRUE.equals(order.getStockDeducted())) {
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock for product: " + product.getName()
                );
            }
            product.setStockQuantity(
                    product.getStockQuantity() - item.getQuantity()
            );
            productRepository.save(product);
        }
        order.setStockDeducted(true);
    }

    if (status != OrderStatus.COMPLETED
            && Boolean.TRUE.equals(order.getStockDeducted())) {
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(
                    product.getStockQuantity() + item.getQuantity()
            );
            productRepository.save(product);
        }
        order.setStockDeducted(false);
    }

    order.setStatus(status);
    return orderRepository.save(order);
}
```

**Mô tả:**

Phương thức này dùng cho quản trị viên khi cập nhật trạng thái đơn hàng. Trước tiên, hệ thống tìm đơn hàng theo `orderId`. Nếu không tồn tại, hệ thống ném lỗi `Order not found`.

Khi trạng thái mới là `COMPLETED`, hệ thống thực hiện trừ tồn kho cho từng sản phẩm trong đơn hàng. Trước khi trừ, hệ thống kiểm tra số lượng tồn kho hiện tại có đủ đáp ứng số lượng trong đơn hay không. Nếu không đủ, quá trình cập nhật bị dừng và trả về lỗi.

Thuộc tính `stockDeducted` có vai trò đánh dấu đơn hàng đã từng bị trừ kho hay chưa. Nhờ vậy, nếu quản trị viên cập nhật trạng thái `COMPLETED` nhiều lần, hệ thống không trừ kho lặp lại. Đây là điểm quan trọng để tránh sai lệch số lượng tồn kho.

Nếu đơn hàng đã từng trừ kho nhưng trạng thái được đổi khỏi `COMPLETED`, hệ thống cộng lại số lượng sản phẩm vào kho và đặt `stockDeducted` về `false`. Cơ chế này giúp dữ liệu tồn kho phản ánh đúng trạng thái hiện tại của đơn hàng.

Annotation `@Transactional` đảm bảo việc cập nhật trạng thái đơn hàng và cập nhật tồn kho được thực hiện đồng bộ trong một giao dịch.

## 7. Repository truy vấn đơn hàng và thống kê doanh thu

File: `cleanfood-server/src/main/java/com/cleanfood/server/repository/OrderRepository.java`

```java
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerOrderByOrderDateDesc(User customer);

    long countByStatus(OrderStatus status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o " +
           "WHERE o.status = 'COMPLETED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT FUNCTION('DATE', o.orderDate) as date, " +
           "SUM(o.totalAmount) as amount, COUNT(o) as count " +
           "FROM Order o " +
           "WHERE o.orderDate >= :startDate " +
           "AND o.status = 'COMPLETED' " +
           "GROUP BY FUNCTION('DATE', o.orderDate)")
    List<Map<String, Object>> getDailyStats(
            @Param("startDate") LocalDateTime startDate
    );
}
```

**Mô tả:**

`OrderRepository` là interface thao tác dữ liệu cho entity `Order`. Interface này kế thừa `JpaRepository<Order, Long>`, vì vậy hệ thống tự có sẵn các phương thức CRUD như thêm, sửa, xóa, tìm theo id và lấy toàn bộ đơn hàng.

Phương thức `findByCustomerOrderByOrderDateDesc(User customer)` là truy vấn được Spring Data JPA tự sinh dựa trên tên phương thức. Chức năng của phương thức là lấy danh sách đơn hàng của một khách hàng và sắp xếp giảm dần theo ngày đặt hàng.

Phương thức `countByStatus(OrderStatus status)` dùng để đếm số lượng đơn hàng theo từng trạng thái. Dữ liệu này có thể được dùng trong trang thống kê hoặc quản lý đơn hàng.

Hai phương thức `getTotalRevenue()` và `getDailyStats()` sử dụng annotation `@Query` để viết truy vấn JPQL tùy chỉnh. `getTotalRevenue()` tính tổng doanh thu từ các đơn hàng đã hoàn thành. `getDailyStats()` thống kê doanh thu và số lượng đơn hàng theo ngày, phục vụ chức năng dashboard cho quản trị viên.

Việc đặt các truy vấn trong repository giúp tách biệt tầng truy cập dữ liệu với tầng xử lý nghiệp vụ, làm cho mã nguồn dễ bảo trì hơn.

## 8. Sinh và kiểm tra JWT

File: `cleanfood-server/src/main/java/com/cleanfood/server/security/JwtUtils.java`

```java
@Component
public class JwtUtils {

    private final String SECRET_KEY =
            "your-very-secure-and-long-secret-key-for-cleanfood-project";
    private final long JWT_EXPIRATION = 86400000;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(
                        new Date(System.currentTimeMillis() + JWT_EXPIRATION)
                )
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }
}
```

**Mô tả:**

Lớp `JwtUtils` chịu trách nhiệm sinh và kiểm tra JWT trong hệ thống. Annotation `@Component` cho phép Spring quản lý lớp này như một bean và inject vào các lớp khác khi cần sử dụng.

Biến `SECRET_KEY` là khóa bí mật dùng để ký token. Biến `JWT_EXPIRATION` xác định thời gian sống của token, trong đoạn mã này là 86.400.000 mili giây, tương đương 24 giờ.

Phương thức `getSigningKey()` chuyển chuỗi khóa bí mật thành đối tượng `Key` dùng cho thuật toán ký HS256. Phương thức `generateToken()` tạo token mới, trong đó `subject` là username của người dùng, `issuedAt` là thời điểm phát hành token và `expiration` là thời điểm hết hạn.

Phương thức `validateToken()` kiểm tra token có thuộc đúng người dùng hay không và token đã hết hạn chưa. Nếu username trong token trùng với username của `UserDetails` và token chưa hết hạn, token được xem là hợp lệ.

Nhờ cơ chế JWT, hệ thống có thể xác thực người dùng theo hướng stateless. Mỗi request gửi lên server chỉ cần kèm token hợp lệ, không cần lưu session phía server.

## 9. Cấu hình bảo mật Spring Security

File: `cleanfood-server/src/main/java/com/cleanfood/server/config/SecurityConfig.java`

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http)
        throws Exception {
    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(AbstractHttpConfigurer::disable)
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(
                "/api/auth/**",
                "/api/public/**",
                "/uploads/**"
            ).permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated()
        )
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authenticationProvider(authenticationProvider)
        .addFilterBefore(
            jwtAuthFilter,
            UsernamePasswordAuthenticationFilter.class
        );

    return http.build();
}
```

**Mô tả:**

Đoạn mã trên cấu hình bảo mật chính cho backend. Phương thức `securityFilterChain()` định nghĩa các quy tắc truy cập API, cơ chế xác thực và cách xử lý request trong Spring Security.

`csrf(AbstractHttpConfigurer::disable)` tắt CSRF vì hệ thống sử dụng REST API và JWT thay vì session truyền thống. `cors()` cấu hình cho phép frontend gọi API từ domain được chỉ định.

Phần `authorizeHttpRequests()` quy định quyền truy cập cho từng nhóm API. Các đường dẫn `/api/auth/**`, `/api/public/**` và `/uploads/**` được phép truy cập công khai. Các đường dẫn `/api/admin/**` chỉ cho phép tài khoản có quyền `ADMIN`. Những API còn lại yêu cầu người dùng phải đăng nhập.

`sessionManagement()` được cấu hình với `SessionCreationPolicy.STATELESS`, nghĩa là server không tạo session đăng nhập. Mỗi request phải tự mang thông tin xác thực thông qua JWT.

Cuối cùng, `addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)` đưa bộ lọc JWT vào trước bộ lọc đăng nhập mặc định của Spring Security. Bộ lọc này có nhiệm vụ đọc token trong request, kiểm tra tính hợp lệ và thiết lập thông tin xác thực cho người dùng.

Nhờ cấu hình này, hệ thống phân biệt rõ API công khai, API dành cho quản trị viên và API yêu cầu đăng nhập, đảm bảo an toàn cho các chức năng quản lý.
