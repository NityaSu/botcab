package com.botcab.fare;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * Persisted fare for one ride. Amounts are integer KHR units stored in
 * {@code total_cents} — never floating point money.
 */
@Entity
@Table(name = "fares")
public class Fare {

    public static final String CURRENCY_KHR = "KHR";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ride_id", nullable = false, unique = true, updatable = false)
    private Long rideId;

    @Column(name = "total_cents", nullable = false)
    private long totalCents;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Fare() {
        // for JPA
    }

    public Fare(long rideId, long totalCents, String currency) {
        this.rideId = rideId;
        this.totalCents = totalCents;
        this.currency = currency;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Long getRideId() {
        return rideId;
    }

    public long getTotalCents() {
        return totalCents;
    }

    public String getCurrency() {
        return currency;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
