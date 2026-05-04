package com.cleanfood.server.service.impl;

import com.cleanfood.server.entity.Product;
import com.cleanfood.server.entity.ProductImage;
import com.cleanfood.server.repository.ProductImageRepository;
import com.cleanfood.server.repository.ProductRepository;
import com.cleanfood.server.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public Product saveProduct(Product product, MultipartFile[] files, List<Long> removedImageIds) {
        Product savedProduct;
        if (product.getId() != null) {
            Product existingProduct = productRepository.findById(product.getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            existingProduct.setName(product.getName());
            existingProduct.setDescription(product.getDescription());
            existingProduct.setPrice(product.getPrice());
            existingProduct.setDiscountPercent(product.getDiscountPercent());
            existingProduct.setPromotionStartDate(product.getPromotionStartDate());
            existingProduct.setPromotionEndDate(product.getPromotionEndDate());
            existingProduct.setStockQuantity(product.getStockQuantity());
            existingProduct.setOrigin(product.getOrigin());
            existingProduct.setUnit(product.getUnit());
            existingProduct.setCategory(product.getCategory());

            applyPromotionPricing(existingProduct);

            if (removedImageIds != null && !removedImageIds.isEmpty()) {
                List<ProductImage> toRemove = existingProduct.getImages().stream()
                        .filter(img -> removedImageIds.contains(img.getId()))
                        .collect(java.util.stream.Collectors.toList());
                for (ProductImage img : toRemove) {
                    deletePhysicalFile(img.getUrl());
                    existingProduct.getImages().remove(img);
                }
            }

            savedProduct = productRepository.save(existingProduct);
        } else {
            applyPromotionPricing(product);
            savedProduct = productRepository.save(product);
        }
        
        if (files != null && files.length > 0) {
            try {
                Path uploadPath = resolveUploadDir();
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                for (MultipartFile file : files) {
                    if (file != null && !file.isEmpty()) {
                        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                        Path filePath = uploadPath.resolve(fileName);
                        Files.copy(file.getInputStream(), filePath);

                        ProductImage image = ProductImage.builder()
                                .url("/uploads/" + fileName)
                                .product(savedProduct)
                                .build();
                        productImageRepository.save(image);
                        savedProduct.getImages().add(image);
                    }
                }
            } catch (IOException e) {
                throw new RuntimeException("Could not store files. Error: " + e.getMessage());
            }
        }
        return savedProduct;
    }

    private void applyPromotionPricing(Product product) {
        if (product == null || product.getPrice() == null) {
            return;
        }

        BigDecimal discountPercent = product.getDiscountPercent();
        if (discountPercent == null || discountPercent.compareTo(BigDecimal.ZERO) <= 0) {
            product.setDiscountPercent(BigDecimal.ZERO);
            product.setDiscountedPrice(product.getPrice());
            return;
        }

        if (discountPercent.compareTo(new BigDecimal("100")) > 0) {
            discountPercent = new BigDecimal("100");
            product.setDiscountPercent(discountPercent);
        }

        BigDecimal discountAmount = product.getPrice()
                .multiply(discountPercent)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal discountedPrice = product.getPrice().subtract(discountAmount).max(BigDecimal.ZERO);
        product.setDiscountedPrice(discountedPrice);
    }

    private void deletePhysicalFile(String url) {
        if (url == null || !url.startsWith("/uploads/")) return;
        try {
            String fileName = url.substring("/uploads/".length());
            Path primaryPath = resolveUploadDir().resolve(fileName);
            Path fallbackPath = resolveFallbackUploadDir().resolve(fileName);
            boolean deleted = Files.deleteIfExists(primaryPath);
            if (!deleted && !fallbackPath.equals(primaryPath)) {
                Files.deleteIfExists(fallbackPath);
            }
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + url + ". " + e.getMessage());
        }
    }

    private Path resolveUploadDir() {
        Path currentDirUpload = Paths.get("uploads").toAbsolutePath().normalize();
        Path parentDirUpload = Paths.get("..", "uploads").toAbsolutePath().normalize();
        if (Files.exists(parentDirUpload) && !Files.exists(currentDirUpload)) {
            return parentDirUpload;
        }
        return currentDirUpload;
    }

    private Path resolveFallbackUploadDir() {
        Path currentDirUpload = Paths.get("uploads").toAbsolutePath().normalize();
        Path parentDirUpload = Paths.get("..", "uploads").toAbsolutePath().normalize();
        return currentDirUpload.equals(parentDirUpload) ? currentDirUpload : parentDirUpload;
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product != null) {
            for (ProductImage img : product.getImages()) {
                deletePhysicalFile(img.getUrl());
            }
            productRepository.deleteById(id);
        }
    }
}
