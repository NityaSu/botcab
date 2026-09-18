package com.botcab.fare;

import org.springframework.stereotype.Component;

/**
 * Simple demand → multiplier. Thresholds are intentional toy rules for Phase 5,
 * not a real marketplace model.
 *
 * <ul>
 *   <li>{@code demandRatio < 1.5} → 1.0×</li>
 *   <li>{@code 1.5 ≤ demandRatio < 2.5} → 1.5×</li>
 *   <li>{@code demandRatio ≥ 2.5} → 2.0×</li>
 * </ul>
 */
@Component
public class SurgePolicy {

    public double multiplier(double demandRatio) {
        if (demandRatio >= 2.5) {
            return 2.0;
        }
        if (demandRatio >= 1.5) {
            return 1.5;
        }
        return 1.0;
    }
}
