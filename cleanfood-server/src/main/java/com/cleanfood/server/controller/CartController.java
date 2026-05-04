package com.cleanfood.server.controller;

import com.cleanfood.server.entity.CartItem;
import com.cleanfood.server.entity.Product;
import com.cleanfood.server.entity.User;
import com.cleanfood.server.repository.CartRepository;
import com.cleanfood.server.repository.ProductRepository;
import com.cleanfood.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(cartRepository.findByUser(user));
    }

    @PostMapping("/add")
    public ResponseEntity<CartItem> addToCart(Authentication authentication, @RequestParam Long productId, @RequestParam Integer quantity) {
        User user = getCurrentUser(authentication);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem cartItem = cartRepository.findByUserAndProductId(user, productId)
                .map(item -> {
                    item.setQuantity(item.getQuantity() + quantity);
                    return item;
                })
                .orElse(CartItem.builder().user(user).product(product).quantity(quantity).build());

        return ResponseEntity.ok(cartRepository.save(cartItem));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CartItem> updateQuantity(@PathVariable Long id, @RequestParam Integer quantity) {
        CartItem item = cartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        item.setQuantity(quantity);
        return ResponseEntity.ok(cartRepository.save(item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long id) {
        cartRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        User user = getCurrentUser(authentication);
        cartRepository.deleteByUser(user);
        return ResponseEntity.noContent().build();
    }
}
