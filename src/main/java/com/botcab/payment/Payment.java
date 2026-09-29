package com.botcab.payment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ride_id", nullable = false, unique = true, updatable = false)
    private Long rideId;

    @Column(name = "amount_cents", nullable = false)
    private long amountCents;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private PaymentStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Payment() {
        // JPA
    }

    public Payment(long rideId, long amountCents, PaymentStatus status) {
        this.rideId = rideId;
        this.amountCents = amountCents;
        this.status = status;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Long getRideId() {
        return rideId;
    }

    public long getAmountCents() {
        return amountCents;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
