package com.attendance.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Getter
@Component
public class JwtConfig {

    private final String secret;
    private final long accessTokenExpirationMinutes;
    private final long refreshTokenExpirationDays;

    public JwtConfig(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiration-minutes}") long accessTokenExpirationMinutes,
            @Value("${jwt.refresh-token-expiration-days}") long refreshTokenExpirationDays) {
        this.secret = secret;
        this.accessTokenExpirationMinutes = accessTokenExpirationMinutes;
        this.refreshTokenExpirationDays = refreshTokenExpirationDays;
    }

    public long getAccessTokenExpirationMs() {
        return accessTokenExpirationMinutes * 60 * 1000;
    }

    public long getRefreshTokenExpirationDays() {
        return refreshTokenExpirationDays;
    }
}
