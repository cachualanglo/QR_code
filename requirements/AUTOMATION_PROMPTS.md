# Automation Prompts — Gated Factory V2

Run prompts in order. Do not merge them into one unattended prompt. A prompt must stop at its gate and print the evidence path.

---

## AUTO 01A — Requirement Intake and Normalization

```text
You are the Requirement Orchestrator.

Goal: convert the source requirement into a complete, traceable normalized requirement set. Do not design database, API, UI, or code in this stage.

Read:
- CLAUDE.md
- requirements/CLAUDE.md
- config/project.yaml
- automation/pipeline.yaml
- automation/gates.yaml
- requirements/source/**

Tasks:
1. Verify exactly one primary Requirement.docx exists, plus optional appendices.
2. Use MarkItDown MCP to convert source documents to `requirements/raw/` while preserving headings, tables, forms, and terminology. If MCP fails, stop; do not invent converted content.
3. Assign stable requirement IDs and create:
   - requirements/normalized/00-overview.md
   - requirements/normalized/01-module-map.md
   - requirements/normalized/02-actors-permissions.md
   - requirements/normalized/03-business-rules.md
   - requirements/normalized/04-requirement-inventory.md
   - requirements/normalized/05-open-questions.md
4. For every real module create `requirements/modules/<module>/` with:
   overview.md, workflow.md, business-rules.md, validations.md, permissions.md, reports.md, acceptance-criteria.md, requirement-traceability.md.
5. Create `requirements/normalized/requirement-coverage-matrix.md` mapping source section → requirement ID → module → status.
6. Do not infer missing login, roles, reports, upload, workflow, or integrations. Record open questions.
7. Run a completeness review. Every use case must have actor, trigger, preconditions, main/alternative flow, rules, validation, permission, output, and acceptance criteria, or an explicit BLOCKED marker.
8. Update automation/state.json and automation/run-log.md.

Gate: REQUIREMENT_GATE.
Stop after producing `requirements/normalized/requirement-gate-report.md`.
Final status: REQUIREMENT_GATE_READY, REQUIREMENT_GATE_PASSED, or BLOCKED.
```

---

## AUTO 01B — Architecture, Database and API Contract

```text
You are the Solution Architecture, Database, and API Orchestrator.

Precondition: REQUIREMENT_GATE must be PASSED. If not, stop.

Read all approved normalized requirements and module files. Also read global rules and database rules.

Tasks in order:
A. Architecture
- Create system context, solution architecture, module architecture, security architecture, integration architecture, deployment architecture, and decision log.
- Resolve module ownership and dependencies.

B. Database
- Create logical model, global ERD, module ownership, data classification, and cross-module relationships.
- For every module create physical ERD, table spec, constraints, indexes, seed data, migration plan, and requirement traceability.
- Generate Flyway SQL only after physical review. Never apply migrations in AUTO 01B unless a local PostgreSQL environment is explicitly ready and the pipeline policy allows it.

C. API Contract
- Create global API conventions, errors, pagination, security schemes, permission matrix, and one OpenAPI document.
- Process modules in dependency order.
- Every operationId must map to requirement IDs, permissions, request/response schemas, error codes, and database objects when relevant.
- Validate OpenAPI syntax and references.

D. Graphify
- If Graphify is installed, index the currently available repository only for navigation/dependency exploration.
- Record exact commands and capabilities in `docs/knowledge-graph/phase-01-graphify-report.md`.
- Do not claim requirement coverage from Graphify. Requirement coverage comes from explicit IDs in documents.

Create `docs/api/contract-coverage-matrix.md` and `docs/architecture/contract-conflict-report.md`.
Update state and run log.

Gate: CONTRACT_GATE.
Stop at `docs/api/contract-gate-report.md`.
Final status: CONTRACT_GATE_READY, CONTRACT_GATE_PASSED, or BLOCKED.
```

---

## AUTO 01C — Screen Architecture and Screen Specifications

```text
You are the UX Architecture Orchestrator.

Precondition: CONTRACT_GATE PASSED.
Do not generate Stitch prompts until SCREEN_GATE passes.

Read requirements, architecture, OpenAPI, permission matrix, error catalog, and UI design template.

Tasks:
1. Create one global `docs/ui-ux/DESIGN.md` from the template, with a locked App Shell and design tokens.
2. Create one `navigation-architecture.md`; modules may not define their own sidebar.
3. Create `screen-map.md` from use cases, not database tables.
4. For every UI-required use case assign Screen IDs and create module screen specs containing route, actor, permission, layout, fields, actions, API operationIds, validation, loading/empty/error/access-denied/conflict states, responsive rules, and acceptance criteria.
5. Explicitly verify authentication screens such as Login whenever required by requirements/OpenAPI.
6. Create:
   - use-case-to-screen-matrix.md
   - screen-to-api-matrix.md
   - permission-ui-matrix.md
   - screen-completeness-report.md
7. Detect missing, duplicate, overly generic, and unsupported screens.
8. Do not create one CRUD screen per database table automatically.
9. Update state and run log.

Gate: SCREEN_GATE.
Stop before Stitch prompt generation.
Final status: SCREEN_GATE_READY, SCREEN_GATE_PASSED, or BLOCKED.
```

---

## AUTO 01D — Generate Complete Google Stitch Prompt Pack

```text
You are the Stitch Handoff Orchestrator.

Precondition: SCREEN_GATE PASSED.

Tasks:
1. Read DESIGN.md, navigation architecture, screen map, and every approved screen spec.
2. Generate `docs/ui-ux/stitch-prompts/INDEX.md` listing every Screen ID intended for Stitch.
3. Generate exactly one prompt file per Screen ID in `docs/ui-ux/stitch-prompts/screens/<SCREEN_ID>.md`.
4. Every prompt must include:
   - Screen ID and route
   - user role and goal
   - GLOBAL APP SHELL LOCK
   - exact content, fields, table columns, actions, states, validation, and permission behavior
   - explicit instruction not to invent fields/actions/navigation
   - reference to the approved master visual language
5. Generate App Shell, Login, representative List, and representative Create/Edit prompts first.
6. Cross-check counts:
   expected Stitch screens = prompt files = INDEX entries.
7. Create `stitch-prompt-coverage.md` with status for every Screen ID.
8. Search all prompts for forbidden patterns such as module-specific branding, new sidebar, or redesigned navigation.
9. Update state and run log.

Gate: STITCH_PROMPT_GATE.
Stop and instruct the user to copy prompts into Google Stitch and approve designs.
Final status: READY_FOR_STITCH, or BLOCKED.
```

---

## HUMAN GATE — Google Stitch Approval Checklist

Before AUTO 02A:
- Approve global App Shell.
- Approve Login.
- Approve one List screen.
- Approve one Create/Edit screen.
- Confirm all expected Screen IDs exist in Stitch.
- Fill `config/stitch-project.yaml` with exact Project ID and exact Screen ID mapping.
- Set `approval_status: APPROVED` only after visual review.

---

## AUTO 02A — Verify Stitch and Produce Design Handoff

```text
You are the Stitch Verification and Design Handoff Orchestrator.

Precondition: config/stitch-project.yaml says APPROVED and contains exact Project ID.
Do not write production frontend yet.

Tasks:
1. List actual Stitch MCP tools and document whether they provide metadata, screenshots, HTML, CSS, code, dimensions, tokens, and assets.
2. Fetch the exact project by ID, never by similar name.
3. Fetch every mapped screen by exact Stitch Screen ID.
4. Compare expected Screen IDs with Stitch screens and report MATCHED/MISSING/NAME_MISMATCH.
5. Extract or document:
   - App Shell
   - navigation visual rules
   - typography
   - colors
   - spacing
   - radius/border/shadow
   - shared component appearance
   - assets
6. If MCP provides only partial visual data, explicitly state limitations and require screenshots/exported code as additional handoff artifacts.
7. Create `docs/ui-ux/design-handoff/` inventory, tokens, app-shell, component specs, asset map, and screen reference files.
8. Do not claim pixel parity from metadata-only access.
9. Update state and run log.

Gate: DESIGN_HANDOFF_GATE.
Stop before bulk code generation.
Final status: DESIGN_HANDOFF_READY, PARTIAL_HANDOFF_REQUIRES_ARTIFACTS, or BLOCKED.
```

---

## AUTO 02B — Implement One Visual Proof Screen

```text
You are the Frontend Visual Proof Engineer.

Precondition: DESIGN_HANDOFF_GATE PASSED.
Do not generate the full frontend.

Tasks:
1. Select the approved representative List or Form screen recorded in config/stitch-project.yaml.
2. Bootstrap or inspect the React/TypeScript frontend.
3. Implement only:
   - design tokens
   - global App Shell required by the proof
   - shared components required by the proof
   - one isolated proof route/page
4. Use exact Stitch screen reference and screen spec.
5. Run the frontend and capture screenshots at the approved viewport.
6. Compare visual result to Stitch, documenting differences in layout, typography, colors, spacing, components, and responsive behavior.
7. Fix shared root causes, not page-specific hacks.
8. Preserve functionality and API contract.
9. Produce `docs/frontend/visual-proof-report.md` and evidence paths.
10. Require human approval of the proof before bulk generation.

Gate: VISUAL_PROOF_GATE.
Stop.
Final status: VISUAL_PROOF_READY_FOR_APPROVAL, VISUAL_PROOF_PASSED, or BLOCKED.
```

---

## AUTO 02C — Full Frontend, Backend and FE-BE Integration

```text
You are the Full-stack Implementation Orchestrator.

Precondition: VISUAL_PROOF_GATE PASSED with human approval.

Execute in bounded module batches following dependency order.

Frontend:
- Reuse the approved App Shell, tokens, and shared components from the proof.
- Implement routes, pages, forms, state, validation, and mock service abstraction.
- Fetch each exact Stitch screen before implementing its page.
- Maintain screen-spec/route/Stitch-ID/source-file mapping.
- Run visual checks per module; do not wait until all pages are complete.

Backend:
- Run PostgreSQL in Docker and apply/validate Flyway.
- Implement Entity → Repository → DTO/Mapper → Service → Controller → Security → Tests.
- Match every required OpenAPI operationId exactly.
- Implement JWT/auth/RBAC only as approved.

Integration:
- Replace mock transports module by module with real APIs.
- Normalize errors, pagination, auth, RBAC, upload/download.
- Disable mock runtime for integration/release mode.

Graphify:
- Refresh after significant code batches.
- Use it to locate dependencies and determine regression scope.
- Verify every gate-impacting finding against source/runtime.
- Do not use it to declare business or visual coverage.

Create operation coverage, screen implementation coverage, visual parity, FE-BE integration, auth, RBAC, and conflict reports.
Run compile/build tests continuously.

Gate: IMPLEMENTATION_GATE.
Stop before release testing.
Final status: IMPLEMENTATION_READY_FOR_TEST, IMPLEMENTATION_REQUIRES_REVISION, or BLOCKED.
```

---

## AUTO 02D — Playwright, Build, Docker, UAT and Release Readiness

```text
You are the QA, DevOps, UAT, and Release Orchestrator.

Precondition: IMPLEMENTATION_GATE PASSED.

Tasks:
1. Build test inventory and risk-based strategy.
2. Generate/complete unit, repository, controller, integration, and security tests.
3. Generate Playwright tests mapped to Requirement ID + Screen ID + operationId.
4. Run Playwright against real frontend/backend/PostgreSQL, never mock APIs in release suite.
5. Cover login, logout, protected routes, RBAC, critical CRUD/business flows, validation, errors, pagination/filter/sort, and upload/download when applicable.
6. Preserve trace, screenshot, and video evidence on failure.
7. Run lint, type-check, backend clean verify, frontend build, OpenAPI alignment, Docker image build, Compose config, full-stack startup, and smoke tests.
8. Use an isolated Compose project for test/UAT. Never delete the dev volume blindly.
9. Refresh Graphify and use it for change-impact regression selection; verify findings manually.
10. Execute requirement-based UAT and defect/retest workflow.
11. Generate deployment guide, operations guide, release notes, backup/restore, rollback, package manifest, acceptance checklist, and release approval.
12. Do not deploy production or claim customer sign-off.

Gate: RELEASE_GATE.
Final status:
- DONE — READY FOR USER ACCEPTANCE SIGN-OFF
- RELEASE_REQUIRES_REVISION
- BLOCKED

DONE is allowed only when all gate evidence exists and no unresolved critical/high defect remains.
```
