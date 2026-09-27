package com.botcab.common;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Objects;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

/**
 * Same-origin stand-in for the Vite {@code /osrm} proxy so production MapLibre routing works.
 */
@RestController
@RequestMapping("/osrm")
public class OsrmProxyController {

    private static final String UPSTREAM = "https://router.project-osrm.org";

    private final RestClient http = RestClient.create();

    @GetMapping("/**")
    public ResponseEntity<byte[]> proxy(HttpServletRequest request) {
        String suffix = request.getRequestURI().substring(request.getContextPath().length() + "/osrm".length());
        if (suffix.isBlank()) {
            return ResponseEntity.notFound().build();
        }
        String query = request.getQueryString();
        String url = UPSTREAM + suffix + (query == null || query.isBlank() ? "" : "?" + query);

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
}
