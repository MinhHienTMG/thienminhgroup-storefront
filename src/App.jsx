import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "" : "https://web-production-7d03f.up.railway.app");
const IMAGE_BASE = (import.meta.env.VITE_PRODUCT_IMAGE_BASE_URL || "https://rlubdcnqqtokvweztddx.supabase.co/storage/v1/object/public/product-images").replace(/\/+$/, "");
const LOCAL_PRODUCT_IMAGE_BASE = "/images/products/upload_bucket";
const SERVICE_FALLBACK_IMAGE = "/images/products/dekton-service-fallback.svg";
const PRODUCT_COLOR_SUFFIXES = ["XAM", "XXA", "OLV", "OLIVE", "XQD", "XANH", "BAC", "BE", "XCA", "CAM", "DO", "DEN", "TRANG"];
const PRODUCT_IMAGE_VARIANTS = ["", ...PRODUCT_COLOR_SUFFIXES.map((suffix) => `-${suffix}`)];

const CUSTOMER_CATEGORY_ORDER = [
  "Máy Dùng Điện",
  "Máy Dùng Điện > Máy Mài Cắt Cầm Tay",
  "Máy Dùng Điện > Khoan Đầu Cặp",
  "Máy Dùng Điện > Khoan Betong",
  "Máy Dùng Điện > Máy Đục 17MM",
  "Máy Dùng Điện > Máy Đục 30MM",
  "Máy Dùng Điện > Máy Cắt Để Bàn",
  "Máy Dùng Điện > Máy Cắt Để Bàn > Cắt Nhôm / Gỗ",
  "Máy Dùng Điện > Máy Cắt Để Bàn > Cắt Sắt / Kim Loại Nặng",
  "Máy Dùng Pin",
  "Máy Dùng Pin > Hệ Pin M21",
  "Máy Dùng Pin > Hệ Pin M21 > Thân Máy",
  "Máy Dùng Pin > Hệ Pin M21 > Pin Sạc",
  "Máy Dùng Pin > Hệ Pin Thọt 16.8V > Thân Máy",
  "Máy Dùng Pin > Hệ Pin Thọt 16.8V > Pin Sạc",
  "Phụ Kiện",
  "Phụ Kiện > Dùng Nước",
  "Phụ Kiện > Dùng Hơi",
  "Phụ Kiện > Hao Mòn",
  "Dịch Vụ",
  "Dịch Vụ > Sửa Chữa / Bảo Hành DEKTON",
  "Khác",
];

const C = {
  page: "#f4f5f7",
  white: "#ffffff",
  ink: "#171717",
  text: "#2b2b2f",
  muted: "#6f7280",
  line: "#e7e8ed",
  red: "#d71920",
  redDark: "#a70f16",
  redSoft: "#fff1f2",
  gold: "#d89513",
  green: "#087443",
  dark: "#07070b",
  dark2: "#151019",
};

const fmtV = (n = 0) => new Intl.NumberFormat("vi-VN").format(Number(n) || 0) + "đ";
const cleanText = (txt = "") => String(txt).replaceAll("<br/>", "\n").replaceAll("<br>", "\n").replace(/<[^>]*>/g, "").trim();
const DEFAULT_META_TITLE = "Đại lý DEKTON chính hãng | Thiên Minh Group";
const DEFAULT_META_DESCRIPTION = "Thiên Minh Group phân phối DEKTON chính hãng tại Việt Nam: máy pin, máy cắt, máy nén khí, máy rửa xe và phụ kiện. Tư vấn nhanh, COD toàn quốc.";
const PROMO_SKUS = ["M21-AG100PLUS-XAM", "M21-B4085PLUS-XAM", "M21-S25PRO-XAM", "DK-VGT12N-XAM"];

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function apiPost(path, data) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.detail || json?.error || `${res.status} ${res.statusText}`);
  return json;
}

function imageValues(value) {
  if (!value) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(imageValues);
  if (typeof value === "object") return imageValues(value.url || value.src || value.image || value.imageUrl || value.image_url || value.thumbnail);
  return [];
}

function normalizeImageUrl(src) {
  const url = String(src || "").trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("/")) return url;
  return IMAGE_BASE ? `${IMAGE_BASE}/${url.replace(/^\/+/, "")}` : "";
}

function normalizeSkuForImage(sku) {
  return String(sku || "").trim().toUpperCase().replace(/XQĐ/g, "XQD").replace(/Đ/g, "D");
}

function splitSkuColor(sku) {
  const normalized = normalizeSkuForImage(sku);
  const match = normalized.match(new RegExp(`^(.+)-(${PRODUCT_COLOR_SUFFIXES.join("|")})$`));
  return match ? { exact: normalized, base: match[1], color: match[2] } : { exact: normalized, base: normalized, color: "" };
}

function normalizeProductText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Đ/g, "D")
    .replace(/đ/g, "d")
    .toUpperCase();
}

function customerCategoryPath(p) {
  const sku = normalizeSkuForImage(p.sku);
  const text = normalizeProductText(`${p.name || ""} ${p.sku || ""} ${p.cat || ""}`);
  if (sku.startsWith("SCDEKTON") || text.includes("SUA CHUA")) return "Dịch Vụ > Sửa Chữa / Bảo Hành DEKTON";
  if (text.includes("DAY RUA") || text.includes("RUA XE") || text.includes("SUNG RUA") || /^DK-(D10|D15|D20|CWR|RX|RW)/.test(sku)) return "Phụ Kiện > Dùng Nước";
  if (text.includes("HOI") || text.includes("NEN KHI") || /^DK-AC/.test(sku)) return "Phụ Kiện > Dùng Hơi";
  if (text.startsWith("LUOI") || text.includes(" LUOI CAT") || text.includes("DA CAT") || /^DK-B/.test(sku) || /^DK-SB/.test(sku)) return "Phụ Kiện > Hao Mòn";
  if (text.includes("BO PIN") || text.includes("AC QUY") || text.includes("SAC BANG") || text.includes("SAC DE") || text.includes("PIN&SAC") || /^M21-(BC|CHR|B2065)/.test(sku)) return "Máy Dùng Pin > Hệ Pin M21 > Pin Sạc";
  if (/^(D16|DK-16)/.test(sku) && (text.includes("PIN") || text.includes("SAC"))) return "Máy Dùng Pin > Hệ Pin Thọt 16.8V > Pin Sạc";
  if (/^(D16|DK-16|DV)/.test(sku)) return "Máy Dùng Pin > Hệ Pin Thọt 16.8V > Thân Máy";
  if (/^DK-(VT|VGT|MCB)/.test(sku) || text.includes("PIN")) return "Máy Dùng Pin";
  if (text.includes("CAN NOI") || text.includes("HOP HUT BUI") || text.includes("HOP PHU KIEN")) return "Phụ Kiện";
  if (/^M21/.test(sku) || text.includes("M21")) return "Máy Dùng Pin > Hệ Pin M21 > Thân Máy";
  if (text.includes("MAY CAT NHOM") || text.includes("CAT NHOM") || text.includes("CAT GO") || /^DK-CN/.test(sku)) return "Máy Dùng Điện > Máy Cắt Để Bàn > Cắt Nhôm / Gỗ";
  if (text.includes("CAT SAT") || text.includes("KIM LOAI") || /^DK-SB/.test(sku)) return "Máy Dùng Điện > Máy Cắt Để Bàn > Cắt Sắt / Kim Loại Nặng";
  if (text.includes("MAY CAT DE BAN")) return "Máy Dùng Điện > Máy Cắt Để Bàn";
  if (text.includes("DUC 30") || text.includes("30MM") || /^DK-DH3/.test(sku)) return "Máy Dùng Điện > Máy Đục 30MM";
  if (text.includes("DUC 17") || text.includes("17MM") || /^DK-DH1/.test(sku)) return "Máy Dùng Điện > Máy Đục 17MM";
  if (text.includes("BETONG") || text.includes("BE TONG") || text.includes("KHOAN BUA") || /^DK-RH/.test(sku)) return "Máy Dùng Điện > Khoan Betong";
  if (text.includes("KHOAN") || /^DK-ID/.test(sku)) return "Máy Dùng Điện > Khoan Đầu Cặp";
  if (text.includes("MAY MAI") || text.includes("MAY CAT") || text.includes("CAT GACH") || text.includes("MAY CUA") || /^DK-(AG|CG|CS)/.test(sku)) return "Máy Dùng Điện > Máy Mài Cắt Cầm Tay";
  return "Khác";
}

function customerCategory(p) {
  return customerCategoryPath(p).split(" > ").slice(-1)[0];
}

function categoryMain(path) {
  return String(path || "Khác").split(" > ")[0] || "Khác";
}

function categorySort(a, b) {
  const ai = CUSTOMER_CATEGORY_ORDER.indexOf(a);
  const bi = CUSTOMER_CATEGORY_ORDER.indexOf(b);
  return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi) || a.localeCompare(b, "vi");
}

function setMetaTag(name, content) {
  const tag = document.querySelector(`meta[name="${name}"]`);
  if (tag) tag.setAttribute("content", content);
}

function categoryTitle(path) {
  if (!path || path === "all") return "";
  return path.split(" > ").join(" - ");
}

function productImageAliases(p) {
  const sku = splitSkuColor(p.sku);
  const aliases = [sku.exact, sku.base];
  const text = `${p.sku || ""} ${p.name || ""}`.toUpperCase();
  const hose = text.match(/\b(10|15|20)M\b/);
  if (hose && (text.includes("DÂY RỬA") || text.includes("DAY RUA") || text.includes("DEKTON"))) {
    aliases.push(`DK-D${hose[1]}PLUS`);
  }
  return [...new Set(aliases.filter(Boolean))];
}

function imageCandidates(p) {
  const apiImages = [
    p.img,
    p.image,
    p.imageUrl,
    p.image_url,
    p.thumbnail,
    p.avatar,
    p.picture,
    p.photo,
    p.images,
  ].flatMap(imageValues).map(normalizeImageUrl).filter(Boolean);
  const skuAliases = productImageAliases(p);
  const isService = normalizeSkuForImage(p.sku).startsWith("SCDEKTON") || String(p.cat || "").toUpperCase().includes("SỬA CHỮA");
  if (isService) return [...new Set([...apiImages, SERVICE_FALLBACK_IMAGE])];
  if (!skuAliases.length) return [...new Set(apiImages)];
  const extensions = ["jpg", "jpeg", "png", "webp"];
  const skuNames = skuAliases.flatMap((sku) => PRODUCT_IMAGE_VARIANTS.map((suffix) => `${encodeURIComponent(sku)}${suffix}`));
  const localImages = skuNames.flatMap((name) => extensions.map((ext) => `${LOCAL_PRODUCT_IMAGE_BASE}/${name}.${ext}`));
  const configuredImages = IMAGE_BASE ? skuNames.flatMap((name) => extensions.map((ext) => `${IMAGE_BASE}/${name}.${ext}`)) : [];
  return [...new Set([...apiImages, ...localImages, ...configuredImages])];
}

function ProductImage({ p }) {
  const candidates = imageCandidates(p);
  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [p.sku]);
  if (!candidates.length || idx >= candidates.length) return <div className="product-placeholder"><strong>DEKTON</strong><span>Ảnh đang cập nhật</span></div>;
  return <img src={candidates[idx]} alt={p.name} onError={() => setIdx((i) => i + 1)} className="product-img" />;
}

function TopBar({ settings }) {
  const phones = settings?.hotlines || ["0909.41.81.51", "0909.858.011", "0937.858.011"];
  return <div className="topbar">
    <div className="wrap topbar-inner">
      <span>Đại lý DEKTON chính hãng</span>
      <span>Giao hàng toàn quốc</span>
      <span>Hotline: <strong>{phones[0]}</strong></span>
    </div>
  </div>;
}

function Header({ search, setSearch, settings }) {
  const phones = settings?.hotlines || ["0909.41.81.51", "0909.858.011", "0937.858.011"];
  const phoneHref = `tel:${String(phones[0] || "").replace(/[^\d+]/g, "")}`;
  return <header className="site-header">
    <div className="wrap header-inner">
      <div className="brand">
        <div className="brand-mark">D</div>
        <div>
          <div className="brand-name">DEKTON</div>
          <div className="brand-sub">Thiên Minh Group</div>
        </div>
      </div>
      <div className="search">
        <span>🔍</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm sản phẩm, SKU..." />
      </div>
      <div className="header-actions">
        <a href={phoneHref}>Gọi hotline</a>
        <a href="#products" className="cart-btn">Xem sản phẩm</a>
      </div>
    </div>
  </header>;
}

function NavRow({ categories, selected, setSelected }) {
  const mainCats = [...new Set(categories.map(categoryMain))].sort(categorySort);
  const activeMain = selected === "all" ? "" : categoryMain(selected);
  const subCats = activeMain ? categories.filter((cat) => categoryMain(cat) === activeMain && cat !== activeMain).sort(categorySort) : [];
  return <nav className="nav-row">
    <div className="wrap nav-scroll">
      <button onClick={() => setSelected("all")} className={selected === "all" ? "active" : ""}>Tất cả</button>
      {mainCats.map((cat) => <button key={cat} onClick={() => setSelected(cat)} className={activeMain === cat ? "active" : ""}>{cat}</button>)}
    </div>
    {subCats.length > 0 && <div className="wrap nav-scroll nav-sub">
      <button onClick={() => setSelected(activeMain)} className={selected === activeMain ? "active" : ""}>Tất cả {activeMain}</button>
      {subCats.map((cat) => <button key={cat} onClick={() => setSelected(cat)} className={selected === cat ? "active" : ""}>{cat.split(" > ").slice(1).join(" / ")}</button>)}
    </div>}
  </nav>;
}

function PremiumHero({ banners, settings }) {
  const visible = (banners || []).filter((b) => b.visible !== false);
  const primary = visible[0] || {};
  const promo = visible[1] || {};
  const phones = settings?.hotlines || ["0909.41.81.51", "0909.858.011", "0937.858.011"];
  const phoneHref = `tel:${String(phones[0] || "").replace(/[^\d+]/g, "")}`;
  const primaryTitle = /professional tools/i.test(primary.title || "")
    ? "Đại lý DEKTON chính hãng tại Việt Nam"
    : primary.title || "Đại lý DEKTON chính hãng tại Việt Nam";
  const primarySub = /công cụ điện chuyên nghiệp/i.test(primary.sub || "")
    ? "Máy pin, máy cắt, máy rửa xe và phụ kiện DEKTON. Tư vấn nhanh, xác nhận trước khi giao."
    : primary.sub || "Máy pin, máy cắt, máy rửa xe và phụ kiện DEKTON. Tư vấn nhanh, xác nhận trước khi giao.";
  return <section className="wrap premium-hero">
    <div className="hero-grid">
      <div className="hero-main">
        <div>
          <h1>{primaryTitle}</h1>
          <p>{primarySub}</p>
          <div className="hero-actions"><a href="#products">Xem sản phẩm</a><a href={phoneHref}>Gọi tư vấn</a></div>
        </div>
      </div>
      <div className="hero-promo">
        <div>
          <h2>{promo.title || "Khuyến Mãi Tháng 5"}</h2>
          <p>{promo.sub || "Máy Xịt Rửa Xe - Giảm 20%"}</p>
        </div>
      </div>
    </div>
    <div className="trust-grid">
      <div><strong>Hàng chính hãng</strong><span>Bảo hành theo chính sách DEKTON</span></div>
      <div><strong>Gọi xác nhận trước khi giao</strong><span>COD hoặc chuyển khoản toàn quốc</span></div>
      <div><strong>Hỗ trợ hóa đơn VAT</strong><span>Tư vấn kỹ thuật trước khi mua</span></div>
    </div>
  </section>;
}

function ProductCard({ p, onOrder }) {
  return <article className="product-card">
    <div className="product-media">
      <ProductImage p={p} />
      {p.hot && <span className="hot-tag">HOT</span>}
    </div>
    <div className="product-body">
      <div className="product-cat">{customerCategory(p)}</div>
      <h3>{p.name}</h3>
      <div className="sku">{p.sku}</div>
      <div className="price">{fmtV(p.price)}</div>
      <p>{cleanText(p.desc) || "Liên hệ để được tư vấn chi tiết."}</p>
      <button onClick={() => onOrder(p)}>Đặt hàng / Tư vấn</button>
    </div>
  </article>;
}

function ProductSection({ id, title, kicker, products, onOrder }) {
  if (!products.length) return null;
  return <section id={id} className="wrap product-section">
    <div className="section-head">
      <div>
        <span>{kicker}</span>
        <h2>{title}</h2>
      </div>
      <small>{products.length} sản phẩm</small>
    </div>
    <div className="product-grid">
      {products.map((p) => <ProductCard key={`${title}-${p.id}-${p.sku}`} p={p} onOrder={onOrder} />)}
    </div>
  </section>;
}

function PromoTabs() {
  return <div className="wrap promo-tabs">
    <a href="#flash-sale">Flash Sale</a>
    <a href="#new-arrivals">Hàng mới về</a>
    <a href="#featured">Hàng nổi bật</a>
    <a href="#products">Tất cả sản phẩm</a>
  </div>;
}

function saleScore(p, index = 0) {
  const realSold = Number(p.totalSold ?? p.sold ?? p.quantitySold ?? p.saleCount ?? p.sale_count ?? 0);
  if (realSold > 0) return realSold;
  const price = Number(p.price || 0);
  const stock = Number(p.stock ?? p.onHand ?? 0);
  const skuSignal = normalizeSkuForImage(p.sku).split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return Math.max(1, 120 - index * 3 + (p.hot ? 35 : 0) + (price > 0 ? Math.min(20, Math.round(price / 250000)) : 0) + Math.min(12, stock) + (skuSignal % 11));
}

function productDateScore(p, index = 0) {
  const raw = p.createdAt || p.created_at || p.modifiedDate || p.updatedAt || p.updated_at || p.lastModified || "";
  const timestamp = raw ? Date.parse(raw) : NaN;
  return Number.isFinite(timestamp) ? timestamp : Date.now() - index * 86400000;
}

function pickUniqueProducts(groups, limit = 8) {
  const seen = new Set();
  const rows = [];
  groups.flat().forEach((p) => {
    const key = normalizeSkuForImage(p?.sku) || String(p?.id || p?.name || "");
    if (!p || !key || seen.has(key) || rows.length >= limit) return;
    seen.add(key);
    rows.push(p);
  });
  return rows;
}

function inputStyle() {
  return { width: "100%", background: C.white, border: `1px solid ${C.line}`, borderRadius: 8, padding: "11px 12px", color: C.text, outline: "none" };
}

function OrderModal({ product, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", address: "", qty: 1 });
  const [status, setStatus] = useState(null);
  const total = (Number(product?.price) || 0) * (Number(form.qty) || 1);
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async () => {
    const qty = Math.max(1, Number(form.qty) || 1);
    const comboItems = Array.isArray(product.items)
      ? product.items.map((item) => ({
          sku: item.sku,
          qty: Math.max(1, Number(item.qty) || 1) * qty,
          name: item.name || item.product_name || item.sku,
        })).filter((item) => item.sku)
      : [];
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      qty,
      type: product.type === "combo" || comboItems.length ? "combo" : "single",
      product_name: product.name,
      product_sku: product.sku,
      total: (Number(product?.price) || 0) * qty,
    };
    if (comboItems.length) payload.items = comboItems;
    if (!payload.name || !payload.phone || !payload.address) {
      setStatus("Vui lòng nhập họ tên, số điện thoại và địa chỉ giao hàng để shop liên hệ.");
      return;
    }
    setStatus("sending");
    try {
      const res = await apiPost("/api/public/orders", payload);
      setStatus(`Đã gửi đơn ${res.order_id || ""}. Shop sẽ liên hệ xác nhận.`);
    } catch (e) { setStatus("Chưa gửi được đơn. Vui lòng thử lại hoặc gọi hotline để được hỗ trợ."); }
  };
  if (!product) return null;
  return <div className="modal-backdrop" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-title"><div><h3>Đặt hàng / Tư vấn</h3><p>{product.name}</p></div><button onClick={onClose}>×</button></div>
      {[["name", "Họ tên"], ["phone", "Số điện thoại"], ["address", "Địa chỉ giao hàng"]].map(([k, label]) => <div key={k} className="field"><label>{label}</label><input value={form[k]} onChange={(e) => upd(k, e.target.value)} style={inputStyle()} /></div>)}
      <div className="field"><label>Số lượng</label><input type="number" min="1" value={form.qty} onChange={(e) => upd("qty", e.target.value)} style={inputStyle()} /></div>
      <div className="total"><span>Tạm tính</span><strong>{fmtV(total)}</strong></div>
      <button className="submit-order" disabled={status === "sending"} onClick={submit}>{status === "sending" ? "Đang gửi..." : "Gửi đơn"}</button>
      {status && status !== "sending" && <div className={status.startsWith("Đã gửi") ? "status ok" : "status"}>{status}</div>}
    </div>
  </div>;
}

function Footer({ settings }) {
  const phones = settings?.hotlines || ["0909.41.81.51", "0909.858.011", "0937.858.011"];
  return <footer className="footer">
    <div className="wrap footer-grid">
      <div><strong>{settings?.company || "Công Ty TNHH Việt Nam Thiên Minh Group"}</strong><p>MST: {settings?.tax_code || "0319414767"}<br />{settings?.address || "108 Võ Văn Kiệt, Phường Bến Thành, TP. Hồ Chí Minh"}</p></div>
      <div><strong>Hotline</strong>{phones.map((p) => <p key={p} className="footer-phone">{p}</p>)}</div>
      <div><strong>Cam kết</strong><p>Hàng chính hãng, tư vấn kỹ thuật, giao hàng toàn quốc, xác nhận đơn trước khi giao.</p></div>
    </div>
  </footer>;
}

export default function App() {
  const [products, setProducts] = useState([]), [banners, setBanners] = useState([]), [settings, setSettings] = useState(null);
  const initialParams = new URLSearchParams(window.location.search);
  const [loading, setLoading] = useState(true), [err, setErr] = useState(""), [search, setSearch] = useState(initialParams.get("q") || ""), [cat, setCat] = useState(initialParams.get("cat") || "all"), [orderProduct, setOrderProduct] = useState(null);
  useEffect(() => { let alive = true; (async () => { setLoading(true); setErr(""); try { const [p, b, s] = await Promise.all([apiGet("/api/public/products"), apiGet("/api/public/banners"), apiGet("/api/public/settings")]); if (!alive) return; setProducts(Array.isArray(p.products) ? p.products : []); setBanners(Array.isArray(b.banners) ? b.banners : []); setSettings(s || null); } catch (e) { if (alive) setErr("Chưa tải được dữ liệu sản phẩm. Vui lòng thử lại sau hoặc liên hệ hotline."); } finally { if (alive) setLoading(false); } })(); return () => { alive = false; }; }, []);
  useEffect(() => {
    const titlePart = categoryTitle(cat) || "DEKTON chính hãng";
    const nextTitle = cat === "all" && !search.trim() ? DEFAULT_META_TITLE : `${titlePart}${search.trim() ? ` - ${search.trim()}` : ""} | Thiên Minh Group`;
    const nextDescription = cat === "all" && !search.trim()
      ? DEFAULT_META_DESCRIPTION
      : `Xem ${titlePart.toLowerCase()} DEKTON tại Thiên Minh Group. Tư vấn nhanh, gọi xác nhận trước khi giao, COD toàn quốc.`;
    document.title = nextTitle;
    setMetaTag("description", nextDescription);

    const params = new URLSearchParams();
    if (cat !== "all") params.set("cat", cat);
    if (search.trim()) params.set("q", search.trim());
    const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, [cat, search]);
  const cats = useMemo(() => [...new Set(products.map(customerCategoryPath))].sort(categorySort), [products]);
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const path = customerCategoryPath(p);
      const inCategory = cat === "all" || path === cat || path.startsWith(`${cat} > `);
      return inCategory && (!q || `${p.name} ${p.sku} ${p.desc}`.toLowerCase().includes(q));
    });
  }, [products, cat, search]);
  const showroomProducts = useMemo(() => cat === "all" ? shown.filter((p) => categoryMain(customerCategoryPath(p)) !== "Dịch Vụ") : shown, [shown, cat]);
  const flashSale = useMemo(() => {
    const byPromoSku = PROMO_SKUS
      .map((sku) => showroomProducts.find((p) => normalizeSkuForImage(p.sku) === sku))
      .filter(Boolean);
    const byFlag = showroomProducts.filter((p) => p.hot || p.flash_sale || p.flashSale || p.sale_price || p.salePrice);
    return pickUniqueProducts([byPromoSku, byFlag, showroomProducts], 8);
  }, [showroomProducts]);
  const newProducts = useMemo(() => {
    return [...showroomProducts]
      .sort((a, b) => productDateScore(b, showroomProducts.indexOf(b)) - productDateScore(a, showroomProducts.indexOf(a)))
      .slice(0, 8);
  }, [showroomProducts]);
  const featuredProducts = useMemo(() => {
    return [...showroomProducts]
      .sort((a, b) => saleScore(b, showroomProducts.indexOf(b)) - saleScore(a, showroomProducts.indexOf(a)))
      .slice(0, 8);
  }, [showroomProducts]);

  return <div className="app">
    <style>{`
      *{box-sizing:border-box}html,body,#root{max-width:100%;overflow-x:hidden;scroll-behavior:smooth}body{margin:0;background:${C.page};color:${C.text};font-family:system-ui,-apple-system,Segoe UI,sans-serif}button,input{font:inherit}button{cursor:pointer;transition:.16s ease}button:hover{filter:brightness(.97)}.wrap{width:100%;max-width:1280px;margin:0 auto;padding:0 20px}.topbar{background:${C.green};color:white;font-size:13px}.topbar-inner{min-height:34px;display:flex;align-items:center;justify-content:space-between;gap:16px}.site-header{background:${C.white};border-bottom:1px solid ${C.line};position:sticky;top:0;z-index:20}.header-inner{min-height:76px;display:grid;grid-template-columns:240px 1fr auto;align-items:center;gap:22px}.brand{display:flex;align-items:center;gap:12px}.brand-mark{width:46px;height:46px;border-radius:8px;background:${C.red};color:white;display:grid;place-items:center;font-weight:950;font-size:24px}.brand-name{font-size:26px;font-weight:950;color:${C.red};line-height:1}.brand-sub{font-size:12px;color:${C.ink};font-weight:800;letter-spacing:.8px}.search{height:44px;border:1px solid #d9dbe3;border-radius:8px;background:#f9fafb;display:flex;align-items:center;padding:0 14px;gap:10px}.search input{width:100%;border:0;outline:0;background:transparent;color:${C.ink}}.header-actions{display:flex;gap:10px}.header-actions a{border:1px solid ${C.line};background:white;border-radius:8px;padding:10px 14px;font-weight:800;color:${C.text};text-decoration:none;display:inline-flex;align-items:center;justify-content:center;min-height:42px}.header-actions .cart-btn{background:${C.red};border-color:${C.red};color:white}.nav-row{background:white;border-bottom:1px solid ${C.line};overflow:hidden}.nav-scroll{display:flex;gap:8px;overflow-x:auto;max-width:100%;padding-top:10px;padding-bottom:10px;-ms-overflow-style:none;scrollbar-width:none}.nav-scroll::-webkit-scrollbar{display:none}.nav-scroll button{white-space:nowrap;border:0;background:transparent;color:${C.text};font-weight:800;padding:9px 12px;border-radius:8px}.nav-scroll button.active{background:${C.redSoft};color:${C.red}}.nav-sub{padding-top:0;padding-bottom:11px}.nav-sub button{font-size:13px;background:#fafafa;border:1px solid ${C.line};padding:8px 11px}.nav-sub button.active{background:${C.red};border-color:${C.red};color:white}.premium-hero{padding-top:22px}.hero-grid{display:grid;grid-template-columns:1.45fr .95fr;gap:16px}.hero-main,.hero-promo{min-height:210px;border-radius:10px;padding:28px;display:flex;align-items:flex-end;overflow:hidden;background:linear-gradient(135deg,#240505,#08080d 64%,#141018);color:white;border:1px solid #321014}.hero-promo{background:linear-gradient(135deg,#051a0f,#08090d 62%,#240505)}.hero-main h1,.hero-promo h2{margin:0 0 8px;font-size:34px;line-height:1.08;color:white}.hero-promo h2{font-size:28px}.hero-main p,.hero-promo p{margin:0;color:#f3d6d6;max-width:680px}.hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.hero-actions a{border:1px solid rgba(255,255,255,.28);border-radius:8px;padding:10px 14px;text-decoration:none;color:white;font-weight:900;background:rgba(255,255,255,.1)}.hero-actions a:first-child{background:${C.red};border-color:${C.red}}.trust-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:14px}.trust-grid div{background:white;border:1px solid ${C.line};border-left:4px solid ${C.red};border-radius:8px;padding:16px 18px;display:flex;flex-direction:column;gap:4px}.trust-grid strong{color:${C.ink}}.trust-grid span{color:${C.muted};font-size:13px}.promo-tabs{display:flex;gap:10px;overflow-x:auto;padding-top:16px;padding-bottom:0}.promo-tabs a{white-space:nowrap;text-decoration:none;background:white;border:1px solid ${C.line};border-bottom:3px solid ${C.red};border-radius:8px;padding:10px 14px;color:${C.ink};font-weight:900;font-size:13px;box-shadow:0 6px 18px rgba(20,22,28,.05)}.promo-tabs a:first-child{background:${C.red};border-color:${C.red};color:white}.state-card{margin-top:18px;background:white;border:1px solid ${C.line};border-radius:10px;padding:34px;text-align:center;color:${C.muted}}.error-card{margin-top:18px;background:${C.redSoft};border-color:#ffcdd2;color:${C.redDark}}.product-section{padding-top:28px;overflow:hidden;scroll-margin-top:130px}.section-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:14px}.section-head span{display:block;color:${C.red};font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:.7px}.section-head h2{margin:3px 0 0;color:${C.ink};font-size:26px}.section-head small{color:${C.muted};font-weight:700}.product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));align-items:stretch;gap:16px}.product-card{min-width:0;max-width:100%;background:white;border:1px solid ${C.line};border-radius:8px;overflow:hidden;display:flex;flex-direction:column;height:100%;min-height:430px;box-shadow:0 8px 24px rgba(19,23,31,.06)}.product-media{height:214px;min-height:214px;max-height:214px;flex:0 0 214px;background:#fff;position:relative;display:grid;place-items:center;overflow:hidden;padding:0;border-bottom:1px solid ${C.line}}.product-img{position:absolute;inset:10px;display:block;width:calc(100% - 20px);height:calc(100% - 20px);max-width:calc(100% - 20px);max-height:calc(100% - 20px);object-fit:contain;object-position:center;background:white}.product-placeholder{width:100%;height:100%;background:linear-gradient(135deg,#fafafa,#f1f2f5);color:#8a82a0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;font-size:12px;font-weight:800;text-align:center}.product-placeholder strong{width:56px;height:56px;border-radius:8px;background:${C.red};color:white;display:grid;place-items:center;font-size:13px;letter-spacing:.8px}.product-placeholder span{color:${C.muted}}.hot-tag{position:absolute;top:10px;left:10px;background:${C.red};color:white;border-radius:5px;padding:4px 7px;font-size:10px;font-weight:950}.product-body{min-width:0;padding:14px;display:flex;flex-direction:column;gap:7px;flex:1}.product-cat{font-size:11px;color:${C.red};font-weight:900;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.product-card h3{max-width:100%;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;white-space:normal;word-break:break-word;margin:0;color:${C.ink};font-size:15px;line-height:1.35;height:61px;overflow:hidden;overflow-wrap:anywhere}.sku{font-size:11px;color:${C.muted};font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.price{font-size:16px;color:${C.red};font-weight:950;min-height:22px}.product-card p{margin:0;color:${C.muted};font-size:12px;line-height:1.5;height:54px;overflow:hidden;overflow-wrap:anywhere;word-break:break-word;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical}.product-card button{margin-top:auto;border:0;border-radius:7px;background:${C.red};color:white;font-weight:900;padding:10px 12px;min-height:42px}.modal-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:18px}.modal{width:440px;max-width:100%;background:white;border-radius:10px;padding:20px;box-shadow:0 20px 70px rgba(0,0,0,.28)}.modal-title{display:flex;justify-content:space-between;gap:12px;margin-bottom:14px}.modal-title h3{margin:0;color:${C.ink}}.modal-title p{margin:4px 0 0;color:${C.muted};font-size:13px}.modal-title button{border:0;background:transparent;font-size:28px;color:${C.muted}}.field{margin-bottom:10px}.field label{display:block;color:${C.muted};font-size:11px;font-weight:900;margin-bottom:4px;text-transform:uppercase}.total{display:flex;justify-content:space-between;color:${C.ink};font-weight:900;margin:12px 0}.submit-order{width:100%;border:0;border-radius:8px;padding:12px;background:${C.red};color:white;font-weight:950}.status{margin-top:12px;font-size:13px;color:${C.redDark};line-height:1.45}.status.ok{color:${C.green}}.footer{margin-top:44px;background:linear-gradient(135deg,${C.dark},${C.dark2});border-top:4px solid ${C.red};color:white}.footer-grid{padding-top:30px;padding-bottom:30px;display:grid;grid-template-columns:2fr 1fr 1.4fr;gap:24px}.footer strong{display:block;margin-bottom:8px}.footer p{margin:0;color:#bfc1cc;line-height:1.7;font-size:13px}.footer-phone{color:#ffd16a!important;font-weight:900}@media(max-width:860px){.topbar-inner{justify-content:center;flex-wrap:wrap;padding-top:8px;padding-bottom:8px}.header-inner{grid-template-columns:1fr;gap:12px;padding-top:14px;padding-bottom:14px}.header-actions{display:grid;grid-template-columns:1fr 1fr}.header-actions a{padding:9px 10px}.hero-grid,.trust-grid,.footer-grid{grid-template-columns:1fr}.hero-main,.hero-promo{min-height:176px;padding:22px}.hero-main h1{font-size:27px}.hero-promo h2{font-size:24px}.product-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.product-card{min-height:414px}.product-card h3{font-size:14px}.product-media{height:176px;min-height:176px;max-height:176px;flex-basis:176px}.wrap{padding-left:16px;padding-right:16px}}@media(max-width:560px){.product-grid{grid-template-columns:1fr}.product-card{width:100%;max-width:calc(100vw - 32px);min-height:430px}.product-media{height:224px;min-height:224px;max-height:224px;flex-basis:224px}.product-body>*{max-width:calc(100vw - 60px)}.section-head{align-items:flex-start;flex-direction:column;gap:4px}.brand-name{font-size:22px}.header-actions{grid-template-columns:1fr}.hero-main h1{font-size:24px;max-width:310px;overflow-wrap:anywhere}.hero-main p,.hero-promo p{max-width:310px;overflow-wrap:anywhere}.hero-promo h2{font-size:22px;max-width:310px;overflow-wrap:anywhere}.hero-actions a{padding:9px 12px}.premium-hero{padding-top:16px}}`}</style>
    <TopBar settings={settings} />
    <Header search={search} setSearch={setSearch} settings={settings} />
    <NavRow categories={cats} selected={cat} setSelected={setCat} />
    <main>
      <PremiumHero banners={banners} settings={settings} />
      <PromoTabs />
      {err && <div className="wrap"><div className="state-card error-card">⚠️ {err}</div></div>}
      {loading ? <div className="wrap"><div className="state-card">Đang tải dữ liệu từ hệ thống...</div></div> : <>
        <ProductSection id="flash-sale" title="Flash Sale" kicker="Ưu đãi chủ động" products={flashSale} onOrder={setOrderProduct} />
        <ProductSection id="new-arrivals" title="Hàng mới về" kicker="Vừa cập nhật" products={newProducts} onOrder={setOrderProduct} />
        <ProductSection id="featured" title="Hàng nổi bật" kicker="Ưu tiên theo lượt bán Kiot" products={featuredProducts} onOrder={setOrderProduct} />
        <ProductSection id="products" title="Tất cả sản phẩm" kicker={cat === "all" ? "Danh mục đang bán" : cat} products={showroomProducts} onOrder={setOrderProduct} />
        {!shown.length && <div className="wrap"><div className="state-card">Không tìm thấy sản phẩm</div></div>}
      </>}
    </main>
    <Footer settings={settings} />
    <OrderModal product={orderProduct} onClose={() => setOrderProduct(null)} />
  </div>;
}
