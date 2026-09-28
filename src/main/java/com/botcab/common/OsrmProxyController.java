package com.botcab.common;

import java.net.URI;
import java.util.Locale;
import java.util.Objects;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

/**
 * Same-origin OSRM proxy. Coordinates go in query params so Tomcat does not
 * reject the {@code ;} that native OSRM paths use ({@code lng,lat;lng,lat}).
 */
@RestController
@RequestMapping("/osrm")
public class OsrmProxyController {

    static final String UPSTREAM = "https://router.project-osrm.org";

    private final RestClient http = RestClient.create();

    @GetMapping("/route")
    public ResponseEntity<byte[]> route(
            @RequestParam double fromLng,
            @RequestParam double fromLat,
            @RequestParam double toLng,
            @RequestParam double toLat) {
        URI url = URI.create(upstreamUrl(fromLng, fromLat, toLng, toLat));
        try {
            ResponseEntity<byte[]> upstream = http.get()
                    .uri(url)
                    .retrieve()
                    .toEntity(byte[].class);
            MediaType contentType = Objects.requireNonNullElse(
                    upstream.getHeaders().getContentType(),
                    MediaType.APPLICATION_JSON);
            return ResponseEntity.status(upstream.getStatusCode())
                    .contentType(contentType)
                    .body(upstream.getBody());
        } catch (RestClientResponseException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(ex.getResponseBodyAsByteArray());
        }
    }

    static String upstreamUrl(double fromLng, double fromLat, double toLng, double toLat) {
        return String.format(
                Locale.US,
                "%s/route/v1/driving/%f,%f;%f,%f?overview=full&geometries=geojson",
                UPSTREAM,
                fromLng,
                fromLat,
                toLng,
                toLat);
    }
}
