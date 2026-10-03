package com.elo.api.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.elo.api.dto.AuthRequest;
import com.elo.api.dto.AuthResponse;
import com.elo.api.dto.RegisterRequest;
import com.elo.api.dto.StatsResponse;
import com.elo.api.exception.NotFoundException;
import com.elo.api.exception.UnauthorizedException;
import com.elo.api.model.User;
import com.elo.api.repository.UserRepository;
import com.elo.api.security.JwtService;
import java.util.List;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Usuário já existe");
        }

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole()
        );

        userRepository.save(user);
    }

    public AuthResult authenticateAndGenerateToken(AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Usuário ou senha inválidos"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Usuário ou senha inválidos");
        }

        String token = jwtService.generateToken(user.getId(), user.getRole().name());

        return new AuthResult(token, toAuthResponse(user));
    }

    public AuthResponse getAuthResponse(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Usuário não encontrado"));

        return toAuthResponse(user);
    }

    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(user.getId(), user.getUsername(), user.getRole());
    }

    public record AuthResult(String token, AuthResponse authResponse) {
    }
}
