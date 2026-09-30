package com.botcab.earning;

import java.util.List;

public record DriverEarningsSummary(
        long totalCents,
        String currency,
        int tripCount,
        int cancelFeeCount,
        List<DriverEarningView> recent
) {
}
