# Thiên Minh Group — Storefront

## Tôi là ai
- Trần Minh Hiền, founder Thiên Minh Group (CTYThienMinhGroup / MinhHienTMG)
- Nhà phân phối chính thức DEKTON® tại Việt Nam
- GitHub org: thienminhgroup / user: MinhHienTMG

## Project này làm gì
- Web bán hàng: www.thienminhgroup.net
- Stack: React 18.2 + Vite, deploy Vercel
- Brand: đỏ #e31e24, nền #f5f5f5, font Segoe UI
- DB: Supabase Tokyo (rlubdcnqqtokvweztddx.supabase.co)
- POS: KiotViet (retailer: vnthienminhgroup), 318 sản phẩm

## Đang làm dở
- Redesign Shopee-style: Flash Sale countdown, tab Hàng Hot/Mới về, grid Hàng Bán Chạy
- Ảnh sản phẩm dùng <img src={product.imageUrl} /> từ KiotViet API

## Quy tắc BẮT BUỘC
1. KHÔNG hardcode password/API key — chỉ dùng .env.local
2. KHÔNG commit .env.local lên GitHub
3. HỎI trước khi: git push, xóa file, DROP TABLE, sửa credentials
4. Luôn dùng tiếng Việt khi trả lời tôi

## Repos liên quan
- thienminhgroup-storefront → storefront (repo này)
- thienminhgroup-frontend → dashboard nội bộ tmg.thienminhgroup.net
- thienminhgroup-api → Python 3.11 backend

---

## Người dùng — Hiền
- Founder Thiên Minh Group / Minh Hiền Dekton phân phối máy công cụ
- Bán qua TikTok Shop, Shopee, quản lý KiotViet / đang mày mò AI tối ưu công việc bằng AUTOMATION, đang tìm hiểu về skill và Agent AI — thích Claude vì trực quan và làm việc nặng, thích GPT vì hiểu khá sát nhân cách người
- Không có nền tảng kỹ thuật — cần giải thích đơn giản, tiếng Việt hoặc song ngữ Anh-Việt
- Thích visual/tương tác, không thích đọc văn bản dài
- PC tiệm: D:\TMG\ chứa toàn bộ repos (PC nhà cũng có)

## Tiến độ repos (18/06/2026)
- **storefront**: 60% — có Flash Sale, grid SP, KiotViet API, ảnh 382 SP. Còn thiếu: giỏ hàng, đặt hàng, tài khoản user
- **frontend**: 45% — có dashboard, quản lý SP/đơn hàng, pricing. Còn thiếu: Shopee/TikTok metrics, kế toán, real-time
- **api**: 50% — có KiotViet OAuth2, auth, webhooks, Telegram. Vấn đề: main.py 107KB cần tách

## Đã cài (18/06/2026)
- Claude Code v2.1.173 ✅
- CLAUDE.md cho cả 3 repos ✅
- ECC full profile + Việt hóa 201/261 skills ✅ (chưa biết sử dụng — gợi ý khi có công việc liên quan cần skill nào thích hợp, chú ý Việt hóa)
- ECC rules 20 ngôn ngữ ✅
- vietnamese-tmg.md ✅
- 20 skills hữu ích đã cài vào ~/.claude/skills/ ✅

## Việc tiếp theo (ưu tiên)
1. Xây giỏ hàng storefront (cart → API → Supabase → Telegram notify)
2. Tách main.py thành modules
3. Hoàn thiện frontend dashboard

## Quy tắc làm việc
- Luôn tiếng Việt, thuật ngữ kế toán chuẩn Việt Nam
- Propose trước, confirm rồi mới làm
- Không sửa Shopee khi fix TikTok và ngược lại
- Không hardcode credentials
- Hỏi trước khi git push
