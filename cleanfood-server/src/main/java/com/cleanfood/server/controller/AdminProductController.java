package com.cleanfood.server.controller;

import com.cleanfood.server.entity.Product;
import com.cleanfood.server.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminProductController {

    private final ProductService productService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PostMapping
    public ResponseEntity<Product> addProduct(
            @RequestPart("product") String productJson,
            @RequestPart(value = "files", required = false) MultipartFile[] files,
            @RequestPart(value = "removedImageIds", required = false) String removedIdsJson) throws Exception {
        
        Product product = objectMapper.readValue(productJson, Product.class);
        List<Long> removedImageIds = new ArrayList<>();
        if (removedIdsJson != null && !removedIdsJson.isEmpty()) {
            removedImageIds = objectMapper.readValue(removedIdsJson, new com.fasterxml.jackson.core.type.TypeReference<List<Long>>(){});
        }
        
        return ResponseEntity.ok(productService.saveProduct(product, files, removedImageIds));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestPart("product") String productJson,
            @RequestPart(value = "files", required = false) MultipartFile[] files,
            @RequestPart(value = "removedImageIds", required = false) String removedIdsJson) throws Exception {
        
        Product product = objectMapper.readValue(productJson, Product.class);
        product.setId(id);
        
        List<Long> removedImageIds = new ArrayList<>();
        if (removedIdsJson != null && !removedIdsJson.isEmpty()) {
            removedImageIds = objectMapper.readValue(removedIdsJson, new com.fasterxml.jackson.core.type.TypeReference<List<Long>>(){});
        }
        
        return ResponseEntity.ok(productService.saveProduct(product, files, removedImageIds));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
