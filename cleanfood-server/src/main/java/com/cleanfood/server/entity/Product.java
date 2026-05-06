package com.cleanfood.server.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "products")
@JsonIgnoreProperties(ignoreUnknown = true)
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
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private java.util.List<ProductImage> images = new java.util.ArrayList<>();
    @Column(nullable = false)
    private Integer stockQuantity;
    private String origin; // Nguồn gốc
    private String unit;   // Đơn vị tính (kg, bó, hộp...)
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
}
