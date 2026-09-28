package com.botcab.rating;

import com.botcab.common.auth.Role;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "ratings")
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ride_id", nullable = false, updatable = false)
    private Long rideId;

    @Enumerated(EnumType.STRING)
    @Column(name = "rater_role", nullable = false, length = 16, updatable = false)
    private Role raterRole;

    @JdbcTypeCode(SqlTypes.SMALLINT)
    @Column(name = "stars", nullable = false)
    private int stars;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Rating() {
        // JPA
    }

    public Rating(long rideId, Role raterRole, int stars) {
        this.rideId = rideId;
        this.raterRole = raterRole;
        this.stars = stars;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Long getRideId() {
        return rideId;
    }

    public Role getRaterRole() {
        return raterRole;
    }

    public int getStars() {
        return stars;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
