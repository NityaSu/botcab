package com.botcab.common.auth;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableConfigurationProperties(JwtProperties.class)
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/rides").hasRole("RIDER")
                        .requestMatchers(HttpMethod.POST, "/api/rides/*/cancel").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/rides/*/accept").hasRole("DRIVER")
                        .requestMatchers(HttpMethod.POST, "/api/rides/*/reject").hasRole("DRIVER")
                        .requestMatchers(HttpMethod.POST, "/api/rides/*/en-route").hasRole("DRIVER")
                        .requestMatchers(HttpMethod.POST, "/api/rides/*/start").hasRole("DRIVER")
                        .requestMatchers(HttpMethod.POST, "/api/rides/*/complete").hasRole("DRIVER")
                        .requestMatchers(HttpMethod.POST, "/api/offers/*/accept").hasRole("DRIVER")
                        .requestMatchers(HttpMethod.POST, "/api/offers/*/reject").hasRole("DRIVER")
                        .requestMatchers("/api/drivers/me/**").hasRole("DRIVER")
                        .requestMatchers("/api/drivers/*/location", "/api/drivers/*/available", "/api/drivers/*/offline")
                        .hasRole("DRIVER")
                        .anyRequest().permitAll())
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Login required\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(403);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Forbidden\"}");
                        }))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
