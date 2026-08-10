# AI PROJECT GATED FACTORY — CÁC BƯỚC AI THỰC HIỆN

> File này dành cho AI (Claude Code) đọc và thực thi theo đúng thứ tự.
> Nguyên tắc: mỗi AUTO phải dừng tại Gate, chỉ đi tiếp khi Gate đã PASS. Không được báo DONE nếu Gate chưa đạt.

---

## QUY TRÌNH VẬN HÀNH THỰC TẾ (tổng quan các bước người dùng + AI)

| Bước | Hành động |
|---|---|
| 1 | Người dùng đặt `Requirement.docx` vào `requirements/source/` |
| 2 | AI chạy AUTO 01A → 01B → 01C → 01D; xử lý blocker nếu Gate dừng |
| 3 | Người dùng duyệt Screen Map và prompt coverage |
| 4 | Người dùng copy prompt sang Google Stitch và duyệt visual |
| 5 | Người dùng điền exact Stitch Project ID/Screen ID |
| 6 | AI chạy AUTO 02A |
| 7 | AI chạy AUTO 02B, người dùng duyệt một màn React mẫu |
| 8 | AI chạy AUTO 02C |
| 9 | Người dùng mở Docker Desktop, chuẩn bị `.env`, AI chạy AUTO 02D |
| 10 | Người dùng nghiệm thu, ký xác nhận và deploy theo tài liệu release |

**Lưu ý:** Không quay lại mô hình 2 prompt chạy xuyên suốt. Có thể giữ một file `AUTOMATION_PROMPTS.md` duy nhất, nhưng bên trong phải có các AUTO riêng.

---

## PHASE 01 — TỪ REQUIREMENT ĐẾN GOOGLE STITCH

### AUTO 01A — Requirement Intake & Normalization
Các bước AI thực hiện:
1. Kiểm tra MarkItDown MCP và chuyển `Requirement.docx` sang Markdown.
2. Tách module, actor, use case, workflow, business rule, validation, permission, report và acceptance criteria.
3. Gán ID ổn định cho Requirement, Use Case, Business Rule và Validation.
4. Tạo traceability ban đầu và danh sách open questions.

✅ **REQUIREMENT_GATE — chỉ PASS khi:**
- Mọi module có requirement file.
- Mọi use case có actor, precondition, main flow, alternative flow, business rule, validation, permission và acceptance criteria.
- Không còn lỗ hổng nghiêm trọng bị che bằng assumption.

---

### AUTO 01B — Architecture, Database & API Contract
Các bước AI thực hiện:
1. Thiết kế kiến trúc hệ thống, module, security và integration.
2. Thiết kế Logical/Physical Database Model.
3. Sinh Flyway migration (không sửa migration đã chạy).
4. Khởi động PostgreSQL local khi cần, chạy Flyway và validate database thật.
5. Thiết kế API conventions và OpenAPI cho toàn bộ module.
6. Đối chiếu Requirement ↔ Database ↔ OpenAPI bằng ID rõ ràng.

✅ **CONTRACT_GATE — chỉ PASS khi:**
- Database validation đạt.
- OpenAPI hợp lệ.
- Mọi operationId có Requirement ID.
- Request/response/error/pagination/permission đã được chốt.
- Không còn endpoint quan trọng ở trạng thái BLOCKED.

---

### AUTO 01C — Screen Map, Screen Spec & DESIGN.md
Các bước AI thực hiện:
1. Tạo navigation architecture dùng chung (module không tự thiết kế sidebar riêng).
2. Tạo Screen Map cho tất cả use case cần UI.
3. Tạo Screen Spec chi tiết cho field, table, action, state, permission, route và API mapping.
4. Tạo `DESIGN.md` khóa App Shell, color, typography, spacing, button, form, table, card, modal, state và accessibility.
5. Đặt chiến lược Master Visual Reference.

✅ **SCREEN_GATE — chỉ PASS khi:**
- Mỗi use case cần UI có Screen ID.
- Mỗi Screen ID có route, actor, permission, API operationId, Screen Spec và acceptance criteria.
- Không tạo một màn CRUD cho mỗi table nếu không có use case.

---

### AUTO 01D — Sinh Prompt Google Stitch
Các bước AI thực hiện:
1. Sinh đúng một prompt cho mỗi màn cần thiết kế trên Stitch.
2. Mọi prompt bắt đầu bằng `GLOBAL DESIGN LOCK`.
3. Prompt không được tự định nghĩa lại sidebar, branding, typography hoặc app shell.
4. Tạo `INDEX.md` với mapping Screen ID ↔ Prompt file ↔ Module ↔ Route.
5. Kiểm tra số prompt bằng số màn cần Stitch.

✅ **STITCH_PROMPT_GATE — chỉ PASS khi:**
- 100% màn cần thiết kế đều có prompt.
- Không prompt trùng màn.
- Không prompt thiếu field/action/state.
- Không có prompt định nghĩa visual độc lập trái với DESIGN.md.

> ⏸ **Điểm dừng cho người dùng:** duyệt Screen Map + prompt, sau đó copy prompt sang Google Stitch để tạo visual và duyệt.

---

## PHASE 02 — TỪ STITCH ĐẾN NGHIỆM THU VÀ RELEASE

### AUTO 02A — Stitch Verification & Design Handoff
Điều kiện đầu vào: người dùng đã hoàn thành và duyệt UI/UX trên Stitch, đã điền exact Project ID vào `config/stitch-project.yaml`.

Các bước AI thực hiện:
1. Dùng Stitch MCP ở chế độ **read-only**.
2. Xác minh Project ID, Screen ID và danh sách màn; không chọn theo tên gần giống.
3. Ghi rõ MCP thực sự cung cấp gì: screenshot, HTML, CSS, code, asset, token, dimensions hay chỉ metadata.
4. Tạo Design Handoff: Screen ID ↔ Stitch Screen ID ↔ Route ↔ React page dự kiến.

✅ **DESIGN_HANDOFF_GATE — chỉ PASS khi:**
- Đúng project, đủ screen mapping.
- Biết rõ capability của MCP.
- Đã có dữ liệu handoff thực tế (nếu MCP chỉ trả metadata, phải dùng export/screenshot/spec bổ sung — không được giả định có full visual data).

---

### AUTO 02B — Visual Proof trên 1 màn đại diện
Các bước AI thực hiện:
1. Chọn 1 màn đại diện có App Shell + table hoặc form.
2. Code isolated React implementation, tránh reuse component cũ gây drift.
3. So sánh trực tiếp với Stitch: layout, font, màu, spacing, radius, sidebar, header, table/form.
4. Sửa theo đúng thứ tự: token → app shell → shared component → page layout.
5. Yêu cầu người dùng hoặc visual reviewer phê duyệt mẫu.

✅ **VISUAL_PROOF_GATE — chỉ PASS khi:**
- App Shell và component nền đã được chứng minh khớp thiết kế đủ để tái sử dụng.
- Không code toàn bộ frontend nếu màn mẫu còn MAJOR_DIFFERENCE.

---

### AUTO 02C — Full Implementation
Các bước AI thực hiện:
1. Code Frontend theo Screen Map, Screen Spec và Stitch mapping.
2. Code Backend đúng OpenAPI và database đã migrate.
3. Hoàn thiện JWT/Auth, RBAC, error mapping, pagination, upload/download nếu có.
4. Thay mock bằng API thật theo từng module.
5. Dùng Graphify để thu hẹp phạm vi code, kiểm tra dependency và impact.
6. Build và kiểm tra contract coverage.

✅ **IMPLEMENTATION_GATE — chỉ PASS khi:**
- FE và BE build thành công.
- OperationId cần thiết đã implement.
- Auth/RBAC hoạt động.
- Mock runtime đã tắt ở integration mode.
- Không còn contract mismatch nghiêm trọng.

---

### AUTO 02D — Test, Docker, UAT & Release
Điều kiện đầu vào: người dùng mở Docker Desktop (Engine running), chuẩn bị `.env`.

Các bước AI thực hiện:
1. Chạy unit, integration, controller/security và contract tests.
2. Chạy lint, type-check và build.
3. Dựng full stack bằng Docker Compose.
4. Chạy Playwright E2E trên API thật.
5. Chạy smoke test, UAT, defect/retest và regression.
6. Tạo release manifest, deployment guide, operations guide, rollback plan và acceptance package.

✅ **RELEASE_GATE — chỉ PASS khi:**
- Docker full stack healthy.
- Critical Playwright/UAT flows PASS.
- Không còn RELEASE_BLOCKER/CRITICAL/HIGH unresolved.
- Release package có thể tái tạo.
- Backup/rollback/documentation sẵn sàng.

> ⏸ **Điểm dừng cuối:** người dùng nghiệm thu, ký xác nhận và deploy theo tài liệu release.

---

## XỬ LÝ GIÁN ĐOẠN / PHỤC HỒI PHIÊN

Khi session bị gián đoạn, AI phải:
1. Đọc `automation/state.json`.
2. Đọc `automation/run-log.md` và report gần nhất.
3. Xác minh artifact thực tế còn tồn tại (không tin report cũ nếu source hoặc runtime đã thay đổi).
4. Tiếp tục từ Gate chưa đạt — **không chạy lại toàn bộ pipeline**.

---

## SỬ DỤNG GRAPHIFY ĐÚNG CÁCH (áp dụng xuyên suốt các AUTO)

AI nên chạy Graphify tại các checkpoint sau:
- Sau Requirement/Architecture → xây index tra cứu module và tài liệu liên quan.
- Sau Frontend/Backend → refresh code graph để điều hướng implementation.
- Sau mỗi defect fix lớn → xác định downstream impact và regression scope.
- Trước release → refresh lần cuối, nhưng kết luận phải được xác minh bằng source, test và runtime.

⚠️ Graphify **không phải nguồn sự thật**: không dùng để tự kết luận coverage 100%, tự phê duyệt API contract, tự phê duyệt visual parity, hay làm nguồn duy nhất cho release gate.

---

## TIÊU CHÍ ĐỂ AI ĐƯỢC BÁO "DONE"

AI chỉ được trả:
```
DONE — READY FOR USER ACCEPTANCE SIGN-OFF
```
khi **toàn bộ** điều kiện sau đã đạt:
- [ ] REQUIREMENT_GATE, CONTRACT_GATE, SCREEN_GATE, STITCH_PROMPT_GATE đã PASS.
- [ ] Stitch Project/Screen mapping đã được xác minh.
- [ ] Visual Proof đã được duyệt.
- [ ] Frontend, Backend và FE-BE Integration đã PASS.
- [ ] Playwright critical flows đã chạy thật và PASS.
- [ ] Docker full stack healthy.
- [ ] Smoke/UAT không còn blocker/critical/high unresolved.
- [ ] Release manifest, deployment, operations, backup, rollback và acceptance documents đầy đủ.

🚫 AI **không được tự** deploy production, push registry, ký nghiệm thu, quyết định secret, hoặc tự chấp nhận rủi ro — các hành động này cần phê duyệt thực tế từ con người.

---

## CHECKLIST TRƯỚC KHI BẮT ĐẦU CHẠY PIPELINE

AI cần xác nhận các mục sau đã sẵn sàng:
- [ ] MarkItDown MCP: liệt kê được tool và convert được `Requirement.docx`.
- [ ] Stitch MCP: đọc được exact Project ID; capability được ghi rõ.
- [ ] Graphify: command/config thật được xác định.
- [ ] Docker: `docker version`, `docker compose version`, `docker info` chạy được.
- [ ] Database: `.env` có giá trị local; migration path tồn tại.
- [ ] Playwright: browser cài được; base URL và test users được cấu hình.
- [ ] State: `state.json` hợp lệ theo schema; `run-log.md` ghi được.

---

## GHI CHÚ KHI TRIỂN KHAI LẠI DỰ ÁN CŨ (nếu áp dụng)

1. Dừng pipeline cũ dựa trên hai prompt chạy xuyên suốt.
2. Giữ lại Requirement, Architecture, Database, API, UI/UX và source code đã đúng; audit phần thiếu thay vì xóa toàn bộ.
3. Thêm Gate và state schema trước khi chạy lại.
4. Chạy lại Phase 01 ở chế độ audit coverage, đặc biệt Screen ↔ Stitch Prompt.
5. Xác minh capability thực của Stitch MCP.
6. Code lại một màn mẫu isolated để khóa visual trước khi refactor toàn frontend.
7. Đưa Graphify về vai trò dependency/impact navigation.
8. Dùng Playwright và runtime evidence làm release proof.
9. Chỉ cho phép AUTO tiếp theo chạy khi Gate trước đã có bằng chứng PASS.
