# AI PROJECT GATED FACTORY — NỘI DUNG QUY TRÌNH

> Tài liệu quy trình dùng chung cho dự án AI Software Factory
> Tự động hóa phát triển phần mềm bằng Claude Code + MiMo
> Công cụ liên quan: Graphify • MarkItDown MCP • Google Stitch MCP • Playwright • Docker
> **Phiên bản quy trình:** Gated Factory V2

---

## 1. Mục tiêu tài liệu

Chuẩn hóa quy trình từ `Requirement.docx` đến bản phát hành sẵn sàng nghiệm thu, với các **Gate bắt buộc** để ngăn lỗi lan truyền giữa Requirement, API, UI/UX, Frontend, Backend, Test và Release.

---

## 2. Phạm vi và nguyên tắc thiết kế

AI Project Gated Factory là khung vận hành giúp Claude Code và MiMo thực hiện phần lớn công việc phân tích, thiết kế, lập trình, kiểm thử và đóng gói dự án. Thay vì chạy hai prompt lớn xuyên suốt, quy trình được chia thành các **AUTO có Gate kiểm soát**.

**Bài học quan trọng:** Tự động hóa hoàn toàn không đồng nghĩa với bỏ kiểm soát. Mỗi giai đoạn phải có bằng chứng, coverage và điều kiện PASS rõ ràng. Nếu Gate không đạt, pipeline phải dừng thay vì tiếp tục sinh thêm tài liệu hoặc code.

Nguyên tắc cốt lõi:
- AI tự động hóa 80–90% công việc có thể xác minh bằng tài liệu, code, test và runtime.
- Con người phê duyệt tại các điểm có tính chủ quan hoặc rủi ro cao: Requirement mơ hồ, visual Stitch, visual proof React, UAT và production release.
- Không nguồn nào được thay thế nguồn khác: Requirement không thay API, Stitch không thay business rule, Graphify không thay source code, Frontend không thay OpenAPI.
- Không được báo DONE chỉ vì file đã được tạo; DONE phải dựa trên Gate và bằng chứng thực thi.

---

## 3. Vai trò của từng công cụ

| Công cụ | Vai trò | Ghi chú |
|---|---|---|
| Claude Code | Điều phối pipeline, đọc tài liệu, sinh code, chạy test, cập nhật state và report | Orchestrator chính |
| MiMo model | Model được Claude Code sử dụng để phân tích và sinh nội dung/code | Không tự thay quy trình |
| MarkItDown MCP | Chuyển Requirement.docx, PDF và tài liệu nguồn thành Markdown để AI đọc ổn định | Phase 01A |
| Google Stitch | Tạo visual UI/UX từ prompt đã được sinh và phê duyệt | Con người duyệt |
| Stitch MCP | Xác minh đúng Project ID/Screen ID và đọc dữ liệu handoff mà MCP thực sự cung cấp | Không giả định pixel-perfect |
| Graphify | Điều hướng dependency, impact analysis, xác định vùng code liên quan và regression scope | Không phải nguồn coverage chính thức |
| Playwright | E2E browser test trên API thật: Frontend → Backend → PostgreSQL | Release gate |
| Docker Compose | Dựng PostgreSQL, Backend, Frontend và môi trường test/UAT có thể tái tạo | Runtime & release |
| Flyway | Quản lý schema database bằng migration versioned | Không dùng Hibernate update |

---

## 4. Nguồn sự thật và thứ tự ưu tiên

| Nguồn | Quyết định nội dung gì | Không được dùng để quyết định |
|---|---|---|
| Requirement | Nghiệp vụ, actor, workflow, rule, validation, acceptance criteria | Visual chi tiết, schema vật lý |
| Architecture | Ràng buộc hệ thống, module, security, integration | Tự thay business requirement |
| Flyway/Physical DB | Schema, table, constraint, index, seed | API response hoặc UI |
| OpenAPI | Method, path, request, response, error, pagination, permission | Thiết kế hình ảnh |
| Screen Spec | Field, action, state, route, API mapping | Màu, spacing, typography |
| Approved Stitch | Visual source of truth | Tự thêm field/action/API |
| Source code | Implementation thực tế | Tự sửa contract |
| Playwright/Test result | Runtime behavior và regression evidence | Thay requirement |
| Graphify | Dependency/impact navigation | Tự kết luận coverage 100% |

---

## 5. Mô hình vận hành tổng thể

Quy trình gồm **2 Phase lớn**, bên trong chia thành **8 AUTO có Gate độc lập**:

| AUTO | Nội dung | Gate kết thúc |
|---|---|---|
| 01A | Tiếp nhận và chuẩn hóa Requirement | REQUIREMENT_GATE |
| 01B | Architecture + Database + API Contract | CONTRACT_GATE |
| 01C | Screen Map + Screen Spec + DESIGN.md | SCREEN_GATE |
| 01D | Sinh prompt Google Stitch đầy đủ | STITCH_PROMPT_GATE |
| 02A | Xác minh Stitch + Design Handoff | DESIGN_HANDOFF_GATE |
| 02B | Code 1 màn React mẫu và kiểm tra visual | VISUAL_PROOF_GATE |
| 02C | Code toàn bộ FE + BE + FE-BE | IMPLEMENTATION_GATE |
| 02D | Playwright + Build + Docker + UAT + Release | RELEASE_GATE |

---

## 6. Hệ thống Gate bắt buộc

| Gate | Mục tiêu | Bằng chứng tối thiểu |
|---|---|---|
| REQUIREMENT_GATE | Coverage nghiệp vụ đầy đủ | Requirement ID, Use Case ID, acceptance criteria |
| CONTRACT_GATE | Architecture/DB/API nhất quán | Flyway, DB validation, OpenAPI validation |
| SCREEN_GATE | Đủ màn và mapping UI | Screen ID, route, permission, operationId |
| STITCH_PROMPT_GATE | Đủ prompt và đúng DESIGN.md | INDEX.md, prompt count |
| STITCH_APPROVAL_GATE | Project/screen đã được con người duyệt | Project ID, Screen ID, approval status |
| DESIGN_HANDOFF_GATE | MCP capability và visual handoff rõ | Inventory, evidence |
| VISUAL_PROOF_GATE | Một màn React mẫu khớp Stitch | Visual report, approval |
| IMPLEMENTATION_GATE | FE/BE/Auth/RBAC/API thật hoàn chỉnh | Build, coverage, integration reports |
| PLAYWRIGHT_GATE | Critical browser flows chạy thật | HTML report, trace, screenshot/video khi fail |
| RELEASE_GATE | Runtime/UAT/package/rollback đạt | Release approval bundle |

---

## 7. Vai trò đúng của Graphify

**Không dùng Graphify làm nguồn sự thật.** Graphify hỗ trợ điều hướng và phân tích ảnh hưởng. Nó không tự hiểu đầy đủ Requirement → API → Screen → Test nếu extractor không tạo các cạnh đó. Mọi kết luận coverage chính thức phải dựa trên ID và bằng chứng trong tài liệu/code/test.

| Nên dùng | Không nên dùng |
|---|---|
| Tìm class/method/file liên quan đến một module | Tự kết luận requirement coverage = 100% |
| Xác định caller/callee và dependency | Tự phê duyệt API contract |
| Thu hẹp context Claude cần đọc | Tự phê duyệt visual parity |
| Impact analysis trước regression | Tự kết luận dead code nếu chưa xác minh framework/reflection |
| Tìm candidate orphan/circular dependency | Làm nguồn duy nhất cho release gate |

Checkpoint nên chạy Graphify:
- Sau Requirement/Architecture: xây index để tra cứu module và tài liệu liên quan.
- Sau Frontend/Backend: refresh code graph để điều hướng implementation.
- Sau mỗi defect fix lớn: xác định downstream impact và regression scope.
- Trước release: refresh lần cuối, nhưng kết luận phải được xác minh bằng source, test và runtime.

---

## 8. Cấu trúc thư mục và quy ước màu

**Quy ước:** 🟩 File dùng chung, viết trước và tái sử dụng. 🟨 File sinh theo từng dự án trong quá trình chạy.

```
AI_Project_Gated_Factory/
├── 🟩 CLAUDE.md
├── 🟩 AUTOMATION_PROMPTS.md
├── 🟩 README.md
├── 🟩 FILE_STATUS_LEGEND.md
├── 🟩 FOLDER_TREE_COLORED.md
├── 🟩 .env.example
├── 🟩 .gitignore
├── 🟩 playwright.config.ts
├── automation/
│   ├── 🟩 pipeline.yaml
│   ├── 🟩 gates.yaml
│   ├── 🟩 state.schema.json
│   ├── 🟨 state.json
│   └── 🟨 run-log.md
├── config/
│   ├── 🟩 project.yaml
│   ├── 🟩 technology.yaml
│   ├── 🟩 environments.yaml
│   ├── 🟩 mcp-policy.yaml
│   ├── 🟩 graphify.yaml
│   └── 🟨 stitch-project.yaml
├── requirements/
│   ├── 🟩 CLAUDE.md
│   ├── 🟨 source/Requirement.docx
│   ├── 🟨 raw/
│   ├── 🟨 normalized/
│   └── 🟨 modules/
├── docs/
│   ├── 🟨 architecture/
│   ├── 🟨 api/
│   ├── 🟨 ui-ux/
│   ├── 🟨 frontend/
│   ├── 🟨 backend/
│   ├── 🟨 integration/
│   ├── 🟨 testing/
│   ├── 🟨 deployment/
│   └── 🟨 release/
├── database/
│   ├── 🟩 CLAUDE.md
│   └── 🟨 modules/
├── backend/
│   ├── 🟩 CLAUDE.md
│   └── 🟨 source code
├── frontend/
│   ├── 🟩 CLAUDE.md
│   └── 🟨 source code
├── e2e/
│   ├── 🟩 CLAUDE.md
│   ├── 🟩 fixtures/helpers/pages base
│   └── 🟨 module specs/flows/visual/accessibility
└── graphify-out/ (generated, không phải source of truth)
```

---

## 9. Docker, database và môi trường chạy

Phase 02 cần Docker Desktop ở trạng thái **Engine running** trước khi đến các bước Flyway, integration, Playwright và release.

| File | Vai trò |
|---|---|
| docker-compose.yml | Định nghĩa PostgreSQL, Backend, Frontend và network/volume |
| .env | Giá trị local thật; không commit |
| .env.example | Mẫu biến môi trường dùng chung |
| application-local.yml | Backend chạy ngoài Docker, DB dùng localhost |
| application-docker.yml | Backend trong Docker, DB host là service name postgres |
| db/migration/ | Flyway tạo schema/table/constraint/index/seed |

**Quy tắc bắt buộc:** Trong container backend, không dùng `localhost` để kết nối PostgreSQL; phải dùng tên service Docker. Hibernate phải dùng `ddl-auto=validate`, không dùng `update`/`create`.

---

## 10. Playwright và chiến lược kiểm thử

Playwright kiểm tra luồng thật: Browser → Frontend → Backend → PostgreSQL.

- Không dùng mock API cho E2E integration/release suite.
- Tách test theo tag: `@smoke`, `@critical`, `@auth`, `@rbac`, `@crud`, `@validation`, `@error`, `@upload`, `@download`, `@visual`, `@release`.
- Lưu trace, screenshot và video khi lỗi.
- Dùng `storageState` theo actor; không commit file chứa token/cookie.
- Ưu tiên locator theo role/label/text; không dùng timeout sleep tùy tiện.

| Lớp test | Mục tiêu |
|---|---|
| Unit | Business logic, mapper, validator, state, error normalization |
| Integration | Controller → Service → Repository → PostgreSQL |
| Contract | OpenAPI ↔ Backend DTO/Controller ↔ Frontend service/types |
| Security | Login, JWT, 401, 403, permission, scope |
| E2E Playwright | Critical user flows trên full stack thật |
| Smoke/UAT | Runtime và acceptance theo Requirement |

---

## 11. Trạng thái, checkpoint và phục hồi phiên

Pipeline phải ghi trạng thái vào `automation/state.json` và bằng chứng vào `automation/run-log.md`.

| Trạng thái | Ý nghĩa |
|---|---|
| NOT_STARTED | Chưa chạy |
| IN_PROGRESS | Đang xử lý |
| PASS | Gate đạt đủ evidence |
| BLOCKED | Thiếu input hoặc conflict nghiêm trọng |
| REQUIRES_REVISION | Đã chạy nhưng chưa đạt Gate |
| APPROVED_BY_USER | Điểm cần người dùng duyệt đã được xác nhận |

---

## 12. Tiêu chí DONE và giới hạn tự động hóa

Claude chỉ được trả **"DONE — READY FOR USER ACCEPTANCE SIGN-OFF"** khi:
- Requirement, Contract, Screen và Stitch prompt Gates đã PASS.
- Stitch Project/Screen mapping đã được xác minh.
- Visual Proof đã được duyệt.
- Frontend, Backend và FE-BE Integration đã PASS.
- Playwright critical flows đã chạy thật và PASS.
- Docker full stack healthy.
- Smoke/UAT không còn blocker/critical/high unresolved.
- Release manifest, deployment, operations, backup, rollback và acceptance documents đầy đủ.

**DONE không có nghĩa là:** AI đã tự deploy production, tự push registry, tự ký nghiệm thu, tự quyết định secret hoặc tự chấp nhận rủi ro. Các hành động này cần quyền và phê duyệt thực tế.

---

## 13. Phụ lục A — Checklist tối thiểu trước khi chạy

| Hạng mục | Đã sẵn sàng khi |
|---|---|
| MarkItDown MCP | Claude liệt kê được tool và convert được Requirement.docx |
| Stitch MCP | Đọc được exact Project ID; capability được ghi rõ |
| Graphify | Command/config thật được xác định; output không dùng làm approval duy nhất |
| Docker | `docker version`, `docker compose version`, `docker info` chạy được |
| Database | .env có giá trị local; migration path tồn tại |
| Playwright | Browser cài được; base URL và test users được cấu hình |
| State | state.json hợp lệ theo schema; run-log ghi được |

---

## 14. Phụ lục B — Các report quan trọng

- `requirement-coverage.md`
- `api-contract-approval.md`
- `screen-map.md` và `stitch-prompts/INDEX.md`
- `stitch-design-inventory.md`
- `visual-proof-report.md`
- `api-implementation-coverage.md`
- `visual-parity-report.md`
- `playwright-execution-report.md`
- `docker-compose-test-report.md`
- `uat-execution-report.md`
- `release-manifest.md` và `release-approval.md`
