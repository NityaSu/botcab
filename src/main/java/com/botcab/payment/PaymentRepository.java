package com.botcab.payment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    boolean existsByRideId(long rideId);

    Optional<Payment> findByRideId(long rideId);
}
