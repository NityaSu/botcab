package com.botcab.earning;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * One earning row per ride. {@code ride} calls this service;
 * this package never injects {@code RideRepository}.
 */
@Service
public class EarningService {

    static final int DRIVER_SHARE_PERCENT = 80;

    static final String CURRENCY_KHR = "KHR";

    private final EarningRepository earnings;

    public EarningService(EarningRepository earnings) {
        this.earnings = earnings;
    }

    /** 80% of a completed fare, integer cents. */
    public static long tripShareCents(long fareTotalCents) {
        if (fareTotalCents < 0) {
            throw new IllegalArgumentException("fareTotalCents must be >= 0");
        }
        return (fareTotalCents * DRIVER_SHARE_PERCENT) / 100;
    }

    @Transactional
    public Optional<DriverEarningView> creditTrip(long driverId, long rideId, long fareTotalCents) {
        return credit(driverId, rideId, tripShareCents(fareTotalCents), EarningKind.TRIP);
    }

    @Transactional
    public Optional<DriverEarningView> creditCancelFee(long driverId, long rideId, long feeCents) {
        return credit(driverId, rideId, feeCents, EarningKind.CANCEL_FEE);
    }

    private Optional<DriverEarningView> credit(long driverId, long rideId, long amountCents, EarningKind kind) {
        if (amountCents <= 0) {
            return Optional.empty();
        }
        if (earnings.existsByRideId(rideId)) {
            throw new EarningAlreadyExistsException(rideId);
        }
        try {
            DriverEarning saved = earnings.save(new DriverEarning(driverId, rideId, amountCents, kind));
            return Optional.of(DriverEarningView.from(saved));
        } catch (DataIntegrityViolationException ex) {
            throw new EarningAlreadyExistsException(rideId);
        }
    }

    public Optional<DriverEarningView> findByRideId(long rideId) {
        return earnings.findByRideId(rideId).map(DriverEarningView::from);
    }

    public DriverEarningsSummary summaryForDriver(long driverId) {
        List<DriverEarning> all = earnings.findByDriverId(driverId);
        long total = 0;
        int trips = 0;
        int cancelFees = 0;
        for (DriverEarning row : all) {
            total += row.getAmountCents();
            if (row.getKind() == EarningKind.TRIP) {
                trips++;
            } else {
                cancelFees++;
            }
        }
        List<DriverEarningView> recent = earnings
                .findByDriverIdOrderByCreatedAtDesc(driverId, PageRequest.of(0, 20))
                .stream()
                .map(DriverEarningView::from)
                .toList();
        return new DriverEarningsSummary(total, CURRENCY_KHR, trips, cancelFees, recent);
    }
}
