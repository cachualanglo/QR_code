# Requirement — Web Chấm Công Bằng QR

**Module:** MOD-01 Chấm công QR
**AUTO:** 01A — Requirement Intake & Normalization
**Gate:** REQUIREMENT_GATE = PASS

---

## 1. Actor

| ID | Actor | Mô tả |
|---|---|---|
| ACT-01 | Nhân viên | Vai trò duy nhất trong hệ thống. Tự đăng nhập, tự chấm công, chỉ xem dữ liệu của chính mình. |

---

## 2. Phạm vi loại trừ (Out of scope — có chủ đích)

Ghi rõ để tránh hiểu nhầm là thiếu sót:

- Không có vai trò Quản lý/HR, không có quy trình duyệt nghỉ phép.
- Không tính lương, không tính phạt đi trễ/về sớm — chỉ ghi nhận thời gian thực tế.
- Chỉ hỗ trợ 1 địa điểm công ty (single-location), không multi-branch.
- Không có chức năng quên mật khẩu / xác thực 2 lớp (MFA) ở bản này.

---

## 3. Use Case

### UC-01 — Chấm công vào/ra bằng QR (xác thực bán kính 10m)

**Actor:** ACT-01 Nhân viên

**Precondition:**
- Nhân viên đã đăng nhập hệ thống bằng tài khoản + mật khẩu.
- Thiết bị đã cấp quyền Camera và Vị trí (GPS).

**Main flow:**
1. Nhân viên đăng nhập vào hệ thống.
2. Vào màn "Chấm công", bấm nút mở camera quét QR.
3. Quét mã QR được hiển thị/dán tại công ty.
4. Hệ thống lấy vị trí GPS hiện tại và tính khoảng cách đến toạ độ công ty.
5. Nếu trong bán kính 10m, hệ thống xác định đây là lần quét thứ mấy trong ngày của nhân viên đó:
   - Lần 1 trong ngày → ghi nhận **Check-in**, lưu giờ vào.
   - Lần 2 trong ngày → ghi nhận **Check-out**, lưu giờ ra.
   - Lần 3 trở lên → từ chối, báo "Bạn đã hoàn tất chấm công hôm nay".

**Alternative flow:**
- AF-01: Ngoài bán kính 10m → từ chối, hiển thị khoảng cách hiện tại, không ghi log.
- AF-02: Chưa cấp quyền Camera/GPS → hướng dẫn nhân viên cấp quyền, không cho tiếp tục.
- AF-03: Phiên đăng nhập hết hạn giữa chừng → yêu cầu đăng nhập lại trước khi tiếp tục quét.

**Business rule:** BR-01, BR-02, BR-03
**Validation:** VAL-01, VAL-02
**Permission:** PERM-01

**Acceptance Criteria:**
- AC-01: Quét lần đầu trong ngày, trong bán kính 10m → check-in thành công, hiển thị giờ vào.
- AC-02: Quét lần 2 trong ngày, trong bán kính 10m → check-out thành công, hiển thị giờ ra.
- AC-03: Quét ngoài bán kính 10m → bị từ chối, kèm khoảng cách hiện tại.
- AC-04: Quét lần 3 trở lên trong ngày → bị từ chối, kèm thông báo đã hoàn tất chấm công.

---

### UC-02 — Xem thống kê chấm công cá nhân

**Actor:** ACT-01 Nhân viên

**Precondition:** Nhân viên đã đăng nhập hệ thống.

**Main flow:**
1. Nhân viên vào màn "Thống kê".
2. Hệ thống hiển thị mặc định dạng lịch tuần hiện tại.
3. Nhân viên có thể chuyển đổi giữa chế độ xem Tuần và Tháng.
4. Mỗi ô ngày trong lịch hiển thị 1 trạng thái bằng màu/icon (xem bảng bên dưới).
5. Nhân viên bấm vào 1 ngày cụ thể → xem chi tiết giờ vào, giờ ra của ngày đó.

**Trạng thái ngày hiển thị trên lịch:**

| Trạng thái | Điều kiện |
|---|---|
| Đúng giờ | Có check-in, giờ vào ≤ 8h30 |
| Đi trễ | Có check-in, giờ vào > 8h30 |
| Vắng | Ngày làm việc (T2–T6) nhưng không có check-in |
| Ngày nghỉ | Thứ 7, Chủ nhật — tự động, không cần khai báo |
| Thiếu check-out | Có check-in nhưng không có check-out trong ngày |

**Business rule:** BR-01, BR-02
**Permission:** PERM-01 — chỉ xem dữ liệu của chính mình

**Acceptance Criteria:**
- AC-05: Mở màn Thống kê → mặc định hiển thị đúng lịch tuần hiện tại.
- AC-06: Chuyển sang chế độ Tháng → hiển thị đúng toàn bộ trạng thái các ngày trong tháng.
- AC-07: Bấm vào 1 ngày cụ thể → hiển thị đúng giờ vào/giờ ra, hoặc đúng trạng thái Vắng/Nghỉ nếu không có dữ liệu.

---

## 4. Business Rule

| ID | Nội dung |
|---|---|
| BR-01 | Giờ làm chuẩn: 8h30. |
| BR-02 | Đi trễ/về sớm chỉ ghi nhận thời gian thực tế, không tính phạt hay ảnh hưởng lương. |
| BR-03 | Mỗi ngày chấm đúng 1 lần vào + 1 lần ra. Từ lần quét thứ 3 trở đi trong cùng ngày sẽ bị từ chối. |

---

## 5. Validation

| ID | Nội dung |
|---|---|
| VAL-01 | Vị trí quét QR phải nằm trong bán kính 10 mét quanh toạ độ công ty (1 địa điểm duy nhất). |
| VAL-02 | Phải đăng nhập bằng tài khoản + mật khẩu hợp lệ trước khi hệ thống cho mở camera quét QR. |

---

## 6. Permission

| ID | Nội dung |
|---|---|
| PERM-01 | Nhân viên chỉ xem được dữ liệu chấm công của chính tài khoản đang đăng nhập, không xem được của người khác. |

---

## 7. Traceability tổng hợp

| Use Case | Business Rule | Validation | Permission | Acceptance Criteria |
|---|---|---|---|---|
| UC-01 | BR-01, BR-02, BR-03 | VAL-01, VAL-02 | PERM-01 | AC-01 → AC-04 |
| UC-02 | BR-01, BR-02 | — | PERM-01 | AC-05 → AC-07 |

---

## 8. Open Questions

Không còn open question nghiêm trọng che bằng assumption. Toàn bộ điểm mơ hồ ban đầu đã được xác nhận trực tiếp với người yêu cầu (xem mục 2 — Phạm vi loại trừ để biết các hạng mục cố ý không làm ở bản này).
