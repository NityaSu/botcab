package com.botcab.ride;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * A single ride. Postgres is the source of truth for this row.
 *
 * Rider and driver are held as raw ids: {@code ride} must not reach into
 * another feature's tables, so there is no {@code @ManyToOne} here.
 */
@Entity
@Table(name = "rides")
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rider_id", nullable = false, updatable = false)
    private Long riderId;

    @Column(name = "driver_id")
    private Long driverId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private RideStatus status;

    @Column(name = "pickup_lat", nullable = false, precision = 9, scale = 6)
    private BigDecimal pickupLat;

    @Column(name = "pickup_lng", nullable = false, precision = 9, scale = 6)
    private BigDecimal pickupLng;

    @Column(name = "dropoff_lat", nullable = false, precision = 9, scale = 6)
    private BigDecimal dropoffLat;

    @Column(name = "dropoff_lng", nullable = false, precision = 9, scale = 6)
    private BigDecimal dropoffLng;

    @Column(name = "requested_at", nullable = false, updatable = false)
    private Instant requestedAt;

    @Column(name = "matched_at")
    private Instant matchedAt;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    /** Optimistic lock — concurrent accept/cancel must not silently overwrite. */
    @Version
    @Column(name = "version", nullable = false)
    private long version;

    protected Ride() {
        // for JPA
    }

    public Ride(Long riderId,
                BigDecimal pickupLat, BigDecimal pickupLng,
                BigDecimal dropoffLat, BigDecimal dropoffLng) {
        this.riderId = riderId;
        this.pickupLat = pickupLat;
        this.pickupLng = pickupLng;
        this.dropoffLat = dropoffLat;
        this.dropoffLng = dropoffLng;
        this.status = RideStatus.REQUESTED;
        this.requestedAt = Instant.now();
    }

    /**
     * Moves the ride to {@code next}, or throws if the machine forbids it.
     * The only way status should ever change.
     */
    public void transitionTo(RideStatus next) {
        RideStatusMachine.require(this.status, next);
        this.status = next;
    }

    /** Driver accepted the offer: assign and move {@code REQUESTED → MATCHED}. */
    public void assignDriver(long driverId, Instant matchedAt) {
        transitionTo(RideStatus.MATCHED);
        this.driverId = driverId;
        this.matchedAt = matchedAt;
    }

    /** Cancel per {@link RideCancellationRules}; clears assignment timestamps. */
    public void cancel(CancelledBy by, Instant endedAt) {
        RideCancellationRules.requireAllowed(this.status, by);
        transitionTo(RideStatus.CANCELLED);
        this.endedAt = endedAt;
    }

    public Long getId() {
        return id;
    }

    public long getVersion() {
        return version;
    }

    public Long getRiderId() {
        return riderId;
    }

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public RideStatus getStatus() {
        return status;
    }

    public BigDecimal getPickupLat() {
        return pickupLat;
    }

    public BigDecimal getPickupLng() {
        return pickupLng;
    }

    public BigDecimal getDropoffLat() {
        return dropoffLat;
    }

    public BigDecimal getDropoffLng() {
        return dropoffLng;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public Instant getMatchedAt() {
        return matchedAt;
    }

    public void setMatchedAt(Instant matchedAt) {
        this.matchedAt = matchedAt;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(Instant endedAt) {
        this.endedAt = endedAt;
    }
}
