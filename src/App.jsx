import { useEffect, useMemo, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://web-production-7d03f.up.railway.app";

const C = {
  bg: "#05050a",
  surface: "#09090f",
  card: "#0e0e16",
  border: "#181028",
  borderRed: "#2c1010",
  red: "#c91a1a",
  redB: "#e53030",
  redDim: "#c91a1a15",
  gold: "#c8920e",
  green: "#22c55e",
  blue: "#3b82f6",
  text: "#eceef8",
  muted: "#5a5272",
  mutedL: "#8a82a0",
};

const fmtV = (n = 0) => new Intl.NumberFormat("vi-VN").format(Number(n) || 0) + "đ";
const cleanText = (txt = "") =>
  String(txt)
    .replaceAll("<br/>", "\n")
    .replaceAll("<br>", "\n")
    .replace(/<[^>]*>/g, "")
    .trim();

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

function Header({ search, setSearch }) {
  return (
    <header style={{ background: `${C.surface}ee`, borderBottom: `1px solid ${C.borderRed}`, position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px", minHeight: 64, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${C.red},#8a0808)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>T</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: 0.4 }}>Thiên Minh Group</div>
          <div style={{ fontSize: 10, color: C.redB, fontWeight: 800, letterSpacing: 1.3 }}>DEKTON® OFFICIAL</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ width: "min(420px, 48vw)", position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm, SKU..."
            style={{ width: "100%", background: C.card, border: `1px solid ${C.borderRed}`, borderRadius: 10, padding: "10px 12px 10px 38px", color: C.text, outline: "none" }}
          />
        </div>
      </div>
    </header>
  );
}

function BannerGrid({ banners }) {
  const visible = (banners || []).filter((b) => b.visible !== false);
  if (!visible.length) return null;
  const rows = [...new Set(visible.map((b) => b.row || 1))].sort();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
      {rows.map((row) => (
        <div key={row} style={{ display: "flex", gap: 12 }}>
          {visible.filter((b) => (b.row || 1) === row).map((b) => (
            <div key={b.id} style={{ flex: b.flex || 1, minHeight: b.height || 140, borderRadius: 16, overflow: "hidden", position: "relative", border: `1px solid ${C.borderRed}`, background: b.bg || "linear-gradient(135deg,#1a0404,#0e0816)" }}>
              {b.img && <img src={b.img} alt={b.title || "banner"} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: b.opacity ?? 1 }} />}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.72),rgba(0,0,0,.15))" }} />
              <div style={{ position: "absolute", inset: 0, padding: 20, display: "flex", flexDirection: "column", justifyContent: b.align === "center" ? "center" : "flex-end" }}>
                {b.badge && <div style={{ alignSelf: "flex-start", color: C.redB, background: C.redDim, border: `1px solid ${C.borderRed}`, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 900, marginBottom: 8 }}>{b.badge}</div>}
                <div style={{ color: "#fff", fontSize: row === 1 ? 22 : 16, fontWeight: 950, lineHeight: 1.15 }}>{b.title}</div>
                {b.sub && <div style={{ color: "rgba(255,255,255,.72)", fontSize: 13, marginTop: 6 }}>{b.sub}</div>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Sidebar({ cats, selected, setSelected }) {
  return (
    <aside style={{ width: 220, flexShrink: 0, paddingRight: 16 }}>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Danh mục</div>
      <button onClick={() => setSelected("all")} style={navBtn(selected === "all")}>🏪 Tất cả</button>
      {cats.map((cat) => (
        <button key={cat} onClick={() => setSelected(cat)} style={navBtn(selected === cat)}>📦 {cat}</button>
      ))}
    </aside>
  );
}

function navBtn(active) {
  return {
    width: "100%",
    display: "block",
    textAlign: "left",
    marginBottom: 7,
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${active ? C.borderRed : "transparent"}`,
    background: active ? C.redDim : "transparent",
    color: active ? C.redB : C.mutedL,
    fontWeight: active ? 800 : 500,
    cursor: "pointer",
  };
}

function ProductCard({ p, onOrder }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.borderRed}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 360 }}>
      <div style={{ height: 150, background: "linear-gradient(135deg,#120606,#080812)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {p.img ? <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ fontSize: 40, opacity: 0.22 }}>🛠️</div>}
        {p.hot && <span style={{ position: "absolute", top: 10, left: 10, background: C.redDim, color: C.redB, border: `1px solid ${C.borderRed}`, borderRadius: 99, padding: "3px 8px", fontSize: 10, fontWeight: 900 }}>HOT</span>}
      </div>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div style={{ fontSize: 10, color: C.muted, fontWeight: 800 }}>{p.cat || "Khác"}</div>
        <div style={{ fontSize: 14, fontWeight: 850, lineHeight: 1.35, minHeight: 56 }}>{p.name}</div>
        <div style={{ fontSize: 11, color: C.mutedL, fontFamily: "monospace" }}>{p.sku}</div>
        <div style={{ fontSize: 13, color: C.gold, fontWeight: 950, fontFamily: "monospace" }}>{fmtV(p.price)}</div>
        <div style={{ fontSize: 11, color: C.mutedL, lineHeight: 1.55, maxHeight: 54, overflow: "hidden" }}>{cleanText(p.desc) || "Liên hệ để được tư vấn chi tiết."}</div>
        <div style={{ flex: 1 }} />
        <button onClick={() => onOrder(p)} style={{ border: "none", borderRadius: 10, padding: "10px 12px", background: `linear-gradient(135deg,${C.red},${C.redB})`, color: "white", fontWeight: 900, cursor: "pointer" }}>Đặt hàng / Tư vấn</button>
      </div>
    </div>
  );
}

function OrderModal({ product, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", address: "", qty: 1 });
  const [status, setStatus] = useState(null);
  const total = (Number(product?.price) || 0) * (Number(form.qty) || 1);
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async () => {
    setStatus("sending");
    try {
      const res = await apiPost("/api/public/orders", {
        ...form,
        qty: Number(form.qty) || 1,
        product_name: product.name,
        product_sku: product.sku,
        total,
      });
      setStatus(`Đã gửi đơn ${res.order_id || ""}. Shop sẽ liên hệ xác nhận.`);
    } catch (e) {
      setStatus(`Lỗi gửi đơn: ${e.message}`);
    }
  };
  if (!product) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.82)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }} onClick={onClose}>
      <div style={{ width: 440, background: C.card, border: `1px solid ${C.borderRed}`, borderRadius: 18, padding: 20 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>Đặt hàng / Tư vấn</div>
            <div style={{ fontSize: 12, color: C.mutedL, marginTop: 4 }}>{product.name}</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 24, cursor: "pointer" }}>×</button>
        </div>
        {[ ["name", "Họ tên"], ["phone", "Số điện thoại"], ["address", "Địa chỉ giao hàng"] ].map(([k, label]) => (
          <div key={k} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 800, marginBottom: 4 }}>{label}</div>
            <input value={form[k]} onChange={(e) => upd(k, e.target.value)} style={inputStyle()} />
          </div>
        ))}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 800, marginBottom: 4 }}>Số lượng</div>
          <input type="number" min="1" value={form.qty} onChange={(e) => upd("qty", e.target.value)} style={inputStyle()} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, color: C.gold, fontWeight: 950 }}><span>Tạm tính</span><span>{fmtV(total)}</span></div>
        <button disabled={status === "sending"} onClick={submit} style={{ width: "100%", border: "none", borderRadius: 12, padding: 12, background: `linear-gradient(135deg,${C.red},${C.redB})`, color: "white", fontWeight: 950, cursor: "pointer" }}>{status === "sending" ? "Đang gửi..." : "Gửi đơn"}</button>
        {status && status !== "sending" && <div style={{ marginTop: 12, fontSize: 12, color: status.startsWith("Lỗi") ? C.redB : C.green, lineHeight: 1.5 }}>{status}</div>}
      </div>
    </div>
  );
}

function inputStyle() {
  return { width: "100%", background: C.surface, border: `1px solid ${C.borderRed}`, borderRadius: 10, padding: "10px 12px", color: C.text, outline: "none" };
}

function Footer({ settings }) {
  const phones = settings?.hotlines || ["0909.41.81.51", "0909.858.011", "0937.858.011"];
  return (
    <footer style={{ marginTop: 44, background: C.surface, borderTop: `1px solid ${C.borderRed}` }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "30px 20px", display: "grid", gridTemplateColumns: "2fr 1fr 1.4fr", gap: 24 }}>
        <div><div style={{ fontWeight: 950, marginBottom: 8 }}>{settings?.company || "Công Ty TNHH Việt Nam Thiên Minh Group"}</div><div style={{ color: C.mutedL, fontSize: 13, lineHeight: 1.7 }}>MST: {settings?.tax_code || "0319414767"}<br />{settings?.address || "108 Võ Văn Kiệt, Phường Bến Thành, TP. Hồ Chí Minh"}</div></div>
        <div><div style={{ color: C.redB, fontWeight: 900, marginBottom: 8 }}>Hotline</div>{phones.map((p) => <div key={p} style={{ color: C.gold, fontWeight: 800, marginBottom: 6 }}>📱 {p}</div>)}</div>
        <div><div style={{ color: C.redB, fontWeight: 900, marginBottom: 8 }}>Cam kết</div><div style={{ color: C.mutedL, lineHeight: 1.8, fontSize: 13 }}>Hàng chính hãng, tư vấn kỹ thuật, giao hàng toàn quốc, xác nhận đơn trước khi giao.</div></div>
      </div>
    </footer>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [orderProduct, setOrderProduct] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const [p, b, s] = await Promise.all([
          apiGet("/api/public/products"),
          apiGet("/api/public/banners"),
          apiGet("/api/public/settings"),
        ]);
        if (!alive) return;
        setProducts(Array.isArray(p.products) ? p.products : []);
        setBanners(Array.isArray(b.banners) ? b.banners : []);
        setSettings(s || null);
      } catch (e) {
        if (alive) setErr(e.message || "Không tải được dữ liệu");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const cats = useMemo(() => [...new Set(products.map((p) => p.cat || "Khác"))].sort(), [products]);
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const okCat = cat === "all" || (p.cat || "Khác") === cat;
      const okQ = !q || `${p.name} ${p.sku} ${p.desc}`.toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [products, cat, search]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "system-ui,sans-serif" }}>
      <style>{`*{box-sizing:border-box}body{margin:0;background:${C.bg}}button{transition:.15s}button:hover{filter:brightness(1.08)}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#2c1010;border-radius:99px}`}</style>
      <Header search={search} setSearch={setSearch} />
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: 20 }}>
        <BannerGrid banners={banners} />
        {err && <div style={{ background: "#3a1111", border: `1px solid ${C.redB}`, color: C.redB, borderRadius: 12, padding: 12, marginBottom: 16 }}>⚠️ {err}</div>}
        {loading ? (
          <div style={{ padding: 50, textAlign: "center", color: C.mutedL, background: C.card, borderRadius: 16, border: `1px solid ${C.border}` }}>Đang tải dữ liệu từ hệ thống...</div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <Sidebar cats={cats} selected={cat} setSelected={setCat} />
            <section style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ color: C.mutedL, fontSize: 13 }}>{shown.length} sản phẩm {cat !== "all" ? `trong ${cat}` : ""}</div>
                <div style={{ color: C.green, fontSize: 12 }}>API: {API_BASE}</div>
              </div>
              {!shown.length ? <div style={{ padding: 50, textAlign: "center", color: C.muted, background: C.card, borderRadius: 16 }}>Không tìm thấy sản phẩm</div> : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 14 }}>
                  {shown.map((p) => <ProductCard key={`${p.id}-${p.sku}`} p={p} onOrder={setOrderProduct} />)}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
      <Footer settings={settings} />
      <OrderModal product={orderProduct} onClose={() => setOrderProduct(null)} />
    </div>
  );
}
