# TMG Storefront Customer Actions Handoff

## Scope

Repo này xử lý phần website khách hàng `www.thienminhgroup.net`.

Không đưa logic dashboard/admin/backend vào đây.

## Đã triển khai ở Storefront

- Nút `Gọi hotline` mở danh sách 3 số để khách chọn:
  - Minh Hiền: `0909418151`
  - Ngọc Linh: `0909858011`
  - Minh Thắng: `0937858011`
- Nút `Gọi tư vấn` random mở Zalo một trong 3 người.
- Nút `Xem sản phẩm` random tới:
  - `#featured`
  - `#flash-sale`
  - `#products`
- Thẻ sản phẩm tách riêng:
  - `Đặt hàng`: mở form đặt hàng.
  - `Tư vấn`: random Zalo.
- Có fallback trong Storefront nếu API chưa trả `customer_actions`.

## Cần phối hợp với API

Storefront sẽ ưu tiên đọc:

```text
GET /api/public/settings
settings.customer_actions
```

Nếu API chưa có `customer_actions`, Storefront dùng fallback mặc định.

## Việc còn chờ API

- API lưu `customer_actions` bền vững trong Supabase.
- Dashboard gửi cấu hình live qua API.
- Public settings trả `customer_actions` để Storefront không cần fallback hardcoded.

## Test phía khách

- Mở `https://www.thienminhgroup.net`.
- Bấm `Gọi hotline`: phải hiện danh sách 3 số.
- Bấm từng số trên điện thoại: phải mở màn hình gọi.
- Bấm `Gọi tư vấn`: phải mở Zalo.
- Bấm `Xem sản phẩm`: phải cuộn tới một khu vực sản phẩm.
- Trên card sản phẩm:
  - `Đặt hàng` mở form đặt hàng.
  - `Tư vấn` mở Zalo.

## Rollback

```powershell
git checkout -- src/App.jsx
```
