# AI Project — Gated Software Factory V2

This template automates a Java/Spring Boot + React + PostgreSQL project with Claude Code/MiMo, MarkItDown MCP, Google Stitch MCP, Graphify, Playwright, Flyway, and Docker Compose.

## Why V2 is gated

A two-prompt, fully unattended pipeline is not reliable for requirements interpretation or visual implementation. V2 keeps one root prompt file but divides execution into controlled AUTO stages. Each stage stops at an evidence-based gate.

## Human actions

1. Place `Requirement.docx` in `requirements/source/`.
2. Run prompts from `AUTOMATION_PROMPTS.md` in order.
3. Approve requirement/screen gates when requested.
4. Copy generated Stitch prompts into Google Stitch and approve the visual design.
5. Add the exact Stitch project ID and screen mapping.
6. Continue the Phase 02 prompts until release readiness.

## Sources of truth

- Requirements: business behavior.
- OpenAPI: API request/response/error contract.
- Flyway: database schema evolution.
- Screen specifications: functional UI behavior.
- Approved Stitch: visual source of truth.
- Source code: implementation.
- Playwright/test reports: runtime evidence.
- Graphify: code navigation, dependency exploration, and impact analysis only.

Graphify is **not** allowed to claim requirement coverage unless explicit IDs are linked in project artifacts.

docker compose up --build postgres frontend -d

docker compose up --build backend -d