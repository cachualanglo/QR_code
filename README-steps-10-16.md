# Local steps 10-16: TLS, Admin UI, Tests, Documentation, and local build

Prerequisites:
- JDK and Maven installed on the host (Windows/Linux/WSL)
- Node.js and npm installed for frontend builds
- Optional: Docker and docker-compose if you want to run the full stack

10. TLS/HTTPS scaffolding for local backend
- Generate a PKCS12 keystore (Windows or Linux/WSL):
  - Windows: run backend\scripts\generate-keystore.cmd
  - Linux/WSL: run backend/scripts/generate-keystore.sh
- Ensure Spring Boot TLS properties are enabled when running locally. If you set SERVER_SSL_ENABLED=true, Spring will load the keystore at the path specified by SERVER_SSL_KEY_STORE (e.g., keystore.p12 in repo root).
- Example (bash): export SERVER_SSL_ENABLED=true; export SERVER_SSL_KEY_STORE=./keystore.p12; export SERVER_SSL_PASSWORD=password

11. Admin UI readiness (frontend)
- Build frontend: cd frontend && npm ci && npm run build
- If you use Windows path issues, prefer WSL/Linux or run in CI to produce artifacts.
- Admin UI routes should be wired (e.g., /admin/location) to control GPS devices.

12. Backend tests (GPS flow)
- Run GPS-related tests: mvn -Dorg.slf4j.simpleLogger.defaultLogLevel=DEBUG -DskipTests=false test
- Ensure AttendanceControllerGpsIntegrationTest and AttendanceServiceGpsTests pass.

13. Documentation
- Ensure README includes TLS, GPS, and deployment steps (this repo already contains TLS notes in TLS script references).
- Update any environment-specific instructions for TLS termination (Nginx or direct TLS in Spring Boot).

14. Local build
- Build backend: mvn -Dorg.slf4j.simpleLogger.defaultLogLevel=DEBUG -DskipTests=false package
- Build frontend: cd frontend && npm ci && npm run build
- Optional: run docker-compose if you have a docker-compose.yml that builds the multi-service stack

15. Optional: Run with Docker Compose (if configured)
- docker-compose up --build

16. Validation
- Access API at https://localhost:8443 (if TLS is enabled and nginx is terminating TLS). If using direct TLS, ensure Spring Boot is listening on 8443.
- Validate admin UI connectivity and GPS controls.
