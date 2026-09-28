package com.botcab.common;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * SPA routes for the baked React app ({@code /web} → {@code classpath:/static/}).
 * API ({@code /api}), WebSocket ({@code /ws}), Actuator, and {@code /osrm} stay on their controllers.
 */
@Controller
public class SpaForwardController {

    @GetMapping({"/rider", "/driver", "/login", "/trips", "/profile", "/settings"})
    public String spaRoutes() {
        return "forward:/index.html";
    }
}
