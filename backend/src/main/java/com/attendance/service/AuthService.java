package com.attendance.service;

import com.attendance.config.JwtConfig;
import com.attendance.dto.request.LoginRequest;
import com.attendance.dto.request.LogoutRequest;
import com.attendance.dto.request.RefreshRequest;
import com.attendance.dto.response.LoginResponse;
import com.attendance.entity.RefreshToken;
import com.attendance.entity.User;
import com.attendance.exception.BusinessException;
import com.attendance.repository.RefreshTokenRepository;
import com.attendance.repository.UserRepository;
import com.attendance.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtConfig jwtConfig;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(request.getUsername());

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "Không tìm thấy người dùng"));

        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .tokenHash(hashToken(refreshToken))
                .expiresAt(LocalDateTime.now().plus(jwtConfig.getRefreshTokenExpirationDays(), ChronoUnit.DAYS))
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        log.info("User {} logged in successfully", request.getUsername());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtConfig.getAccessTokenExpirationMinutes() * 60)
                .build();
    }

    @Transactional
    public LoginResponse refresh(RefreshRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtTokenProvider.validateToken(refreshToken) || !jwtTokenProvider.isRefreshToken(refreshToken)) {
            throw new BusinessException("INVALID_REFRESH_TOKEN", "Refresh token không hợp lệ hoặc đã hết hạn");
        }

        String tokenHash = hashToken(refreshToken);

        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BusinessException("INVALID_REFRESH_TOKEN", "Refresh token không tồn tại"));

        if (storedToken.isRevoked()) {
            throw new BusinessException("INVALID_REFRESH_TOKEN", "Refresh token đã bị thu hồi");
        }

        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException("INVALID_REFRESH_TOKEN", "Refresh token đã hết hạn");
        }

        // Revoke old token
        refreshTokenRepository.revokeToken(storedToken.getId(), LocalDateTime.now());

        // Generate new tokens
        User user = storedToken.getUser();
        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getUsername());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getUsername());

        RefreshToken newRefreshTokenEntity = RefreshToken.builder()
                .user(user)
                .tokenHash(hashToken(newRefreshToken))
                .expiresAt(LocalDateTime.now().plus(jwtConfig.getRefreshTokenExpirationDays(), ChronoUnit.DAYS))
                .build();
        refreshTokenRepository.save(newRefreshTokenEntity);

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .expiresIn(jwtConfig.getAccessTokenExpirationMinutes() * 60)
                .build();
    }

    @Transactional
    public void logout(LogoutRequest request) {
        String refreshToken = request.getRefreshToken();
        if (jwtTokenProvider.validateToken(refreshToken)) {
            String tokenHash = hashToken(refreshToken);
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
                refreshTokenRepository.revokeToken(token.getId(), LocalDateTime.now());
            });
            log.info("Refresh token revoked successfully");
        }
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
