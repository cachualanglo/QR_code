package com.attendance.repository;

import com.attendance.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Query("SELECT rt FROM RefreshToken rt WHERE rt.tokenHash = :hash AND rt.revokedAt IS NULL AND rt.expiresAt > :now")
    Optional<RefreshToken> findValidToken(@Param("hash") String hash, @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revokedAt = :now WHERE rt.id = :id AND rt.revokedAt IS NULL")
    int revokeToken(@Param("id") Long id, @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revokedAt = :now WHERE rt.user.id = :userId AND rt.revokedAt IS NULL")
    int revokeAllUserTokens(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}
