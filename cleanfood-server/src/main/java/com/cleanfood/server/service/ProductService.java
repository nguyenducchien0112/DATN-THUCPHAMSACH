package com.cleanfood.server.service;

import com.cleanfood.server.entity.Product;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ProductService {
    List<Product> getAllProducts();
    Product getProductById(Long id);
    Product saveProduct(Product product, MultipartFile[] files, List<Long> removedImageIds);
    void deleteProduct(Long id);
}
