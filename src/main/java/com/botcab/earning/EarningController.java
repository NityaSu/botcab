package com.botcab.earning;

import com.botcab.common.auth.AuthPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/drivers/me/earnings")
public class EarningController {

    private final EarningService earnings;

    public EarningController(EarningService earnings) {
        this.earnings = earnings;
    }

    @GetMapping
    public DriverEarningsSummary mine() {
        return earnings.summaryForDriver(AuthPrincipal.requireDriverId());
    }
}
