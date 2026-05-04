package com.cleanfood.server.repository;

import com.cleanfood.server.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByCategoryId(Long categoryId);

    @Query("SELECT SUM(p.stockQuantity) FROM Product p")
    Long getTotalStock();
}
