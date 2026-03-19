# Đối chiếu API FE vs BE

Rà soát endpoint FE gọi vs BE hỗ trợ. Dùng để khóa UI/action khi BE chưa sẵn sàng.

## Endpoint BE chưa hỗ trợ (FE đã khóa/không gọi)

| Service | Method | Ghi chú |
|---------|--------|---------|
| **groupService** | `update` | BE không có `PUT /api/Groups/{id}` |
| **groupService** | `delete` | BE không có `DELETE /api/Groups/{id}` |

## UI đã khóa tương ứng

- **GroupsPage**: Chỉ đọc (getAll), không có nút sửa/xóa – `update`/`delete` không được dùng trong UI.
- **Lecturer Compatibilities**: Đã xóa khỏi BE và FE (tab, service methods).

## Config trong code

- `src/api/apiSupport.ts`: Bảng `API_SUPPORT` và `isEndpointSupported()` để kiểm tra trước khi gọi.
- `admin.service.ts`: Các method `@deprecated` (groups.update/delete) có JSDoc trỏ tới `API_SUPPORT`.

## Endpoint BE có, FE chưa dùng

| Service | Method | Ghi chú |
|---------|--------|---------|
| **councilService** | `getBySlot`, `assignChairman` | Có thể dùng cho màn chi tiết hội đồng |
| **schedulingService** | `updateWeights`, `manualOverride`, `reset` | SchedulingPage chỉ dùng `run`, `getResult` |
| **reviewSessionService** | `updateStatus` | Chưa có UI gọi |

## Lưu ý contract

- **schedulingService.updateWeights**: BE nhận `W1–W5`; FE gửi `w1–w6` (w6 bị bỏ qua).
- **ReviewSlots.getAll**: BE bắt buộc `reviewPeriodId`; FE nên gọi khi đã chọn đợt review.
