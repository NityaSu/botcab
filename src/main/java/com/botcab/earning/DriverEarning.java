package com.botcab.earning;

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
@Table(name = "driver_earnings")
public class DriverEarning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "driver_id", nullable = false, updatable = false)
    private Long driverId;

    @Column(name = "ride_id", nullable = false, unique = true, updatable = false)
    private Long rideId;

    @Column(name = "amount_cents", nullable = false)
    private long amountCents;

    @Enumerated(EnumType.STRING)
    @Column(name = "kind", nullable = false, length = 30)
    private EarningKind kind;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected DriverEarning() {
    }

    public DriverEarning(long driverId, long rideId, long amountCents, EarningKind kind) {
        this.driverId = driverId;
        this.rideId = rideId;
        this.amountCents = amountCents;
        this.kind = kind;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Long getDriverId() {
        return driverId;
    }

    public Long getRideId() {
        return rideId;
    }

    public long getAmountCents() {
        return amountCents;
    }

    public EarningKind getKind() {
        return kind;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
