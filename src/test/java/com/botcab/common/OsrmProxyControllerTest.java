package com.botcab.common;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class OsrmProxyControllerTest {

    @Test
    void upstreamUrlKeepsOsrmSemicolonAndDotDecimals() {
        String url = OsrmProxyController.upstreamUrl(104.921, 11.55, 104.923, 11.576);
        assertThat(url)
                .startsWith("https://router.project-osrm.org/route/v1/driving/")
                .contains("104.921000,11.550000;104.923000,11.576000")
                .contains("overview=full")
                .contains("geometries=geojson")
                .doesNotContain("%3B");
    }
}
