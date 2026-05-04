package com.cleanfood.server.entity;

import com.cleanfood.server.constant.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    private String fullName;
    private String email;
    private String phone;
    private String address;

    @Column(unique = true)
    private String resetPasswordToken;

    private Instant resetPasswordExpiresAt;

    @Enumerated(EnumType.STRING)
    private Role role;

    @JsonProperty("isActive")
    private boolean isActive = true;
}
