package com.elo.api.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.elo.api.security.JwtAuthFilter;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
 private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // bcrypt, igual pedido: mesma logica do backend Node (bcrypt) so que em Java
        return new BCryptPasswordEncoder();
    }

   @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, error) -> {
                    response.setStatus(401);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\":\"Autenticação necessária\"}");
                })
                .accessDeniedHandler((request, response, error) -> {
                    response.setStatus(403);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\":\"Acesso negado\"}");
                })
            )

            .authorizeHttpRequests(auth -> auth

                // Permite requisições OPTIONS (preflight do navegador)
                .requestMatchers(
                    org.springframework.http.HttpMethod.OPTIONS,
                    "/**"
                ).permitAll()

                .requestMatchers(org.springframework.http.HttpMethod.POST, "/clinic/v1/appointments")
                    .hasRole("PATIENT")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/clinic/v1/appointments/mine")
                    .hasRole("PATIENT")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/clinic/v1/appointments/agenda")
                    .hasRole("PSYCHOLOGIST")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/clinic/v1/appointments/**")
                    .hasRole("PSYCHOLOGIST")
                .requestMatchers("/clinic/v1/attachments/**", "/auth/v1/avatar/**", "/auth/v1/avatar")
                    .authenticated()

                // Cadastro, login e logout não precisam de cookie válido
                .requestMatchers(
    "/auth/v1/user/save",
    "/auth/v1/auth",
    "/auth/v1/logout"
).permitAll()

                // Outras rotas precisam de autenticação
                .anyRequest().authenticated()
            )

            .addFilterBefore(
                jwtAuthFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }




    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:8081",
            "http://192.168.1.10:8081"
        ));

        configuration.setAllowedMethods(List.of(
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
