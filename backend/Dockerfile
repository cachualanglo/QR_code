# ===== Stage 1: Build =====
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy source code
COPY . .

# Build the application (skip tests in Docker — tests run separately)
RUN mvn package -DskipTests -B

# ===== Stage 2: Run =====
FROM eclipse-temurin:17-jre
WORKDIR /app

# Install wget for Docker HEALTHCHECK
RUN apt-get update && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Switch to non-root user
USER appuser

EXPOSE 8080

# Spring Boot entrypoint
ENTRYPOINT ["java", "-jar", "app.jar"]
