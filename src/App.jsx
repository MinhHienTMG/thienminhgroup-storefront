import { useEffect, useMemo, useState } from "react";
import productImageManifest from "./productImageManifest.json";

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "" : "https://web-production-7d03f.up.railway.app");
const IMAGE_BASE = (import.meta.env.VITE_PRODUCT_IMAGE_BASE_URL || "https://rlubdcnqqtokvweztddx.supabase.co/storage/v1/object/public/product-images").replace(/\/+$/, "");
const LOCAL_PRODUCT_IMAGE_BASE = "/images/products/upload_bucket";
const SERVICE_FALLBACK_IMAGE = "/images/products/dekton-service-fallback.svg";
const PRODUCT_COLOR_SUFFIXES = ["XAM", "XXA", "OLV", "OLIVE", "XQD", "XANH", "BAC", "BE", "XCA", "CAM", "DO", "DEN", "TRANG"];
const PRODUCT_IMAGE_VARIANTS = ["", ...PRODUCT_COLOR_SUFFIXES.map((suffix) => `-${suffix}`)];
const PRODUCT_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const LOCAL_PRODUCT_IMAGE_SET = new Set(productImageManifest.map((name) => String(name).toUpperCase()));

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
  page: "#101419",
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
const DEFAULT_STOREFRONT_EFFECTS = {
  mode: "premium-flow",
  enabled: true,
  intensity: 0.72,
  speed: 18,
  topbarA: "#087443",
  topbarB: "#0a5b3d",
  headerTint: "#ffffff",
  navTint: "#fff5f5",
  heroA: "#240505",
  heroB: "#08080d",
  heroC: "#0b351f",
  accent: "#d71920",
  gold: "#d89513",
  stageMode: "industrial-ai",
  stageImageUrl: "/images/effects/dekton-hero-campaign.webp",
  stageOpacity: 0.96,
  stageBlur: 0,
};
const DEFAULT_CUSTOMER_ACTIONS = {
  view_products: {
    label: "Xem sản phẩm",
    strategy: "random_target",
    targets: [
      { label: "Hàng hot", href: "#featured" },
      { label: "Flash sale", href: "#flash-sale" },
      { label: "Tất cả sản phẩm", href: "#products" },
    ],
  },
  call_hotline: {
    label: "Gọi hotline",
    strategy: "customer_choose_phone",
    contacts: [
      { name: "Minh Hiền", phone: "0909418151", href: "tel:0909418151" },
      { name: "Ngọc Linh", phone: "0909858011", href: "tel:0909858011" },
      { name: "Minh Thắng", phone: "0937858011", href: "tel:0937858011" },
    ],
  },
  consult_zalo: {
    label: "Gọi tư vấn",
    strategy: "random_zalo_contact",
    contacts: [
      { name: "Minh Hiền", href: "https://zalo.me/0909418151" },
      { name: "Ngọc Linh", href: "https://zalo.me/0909858011" },
      { name: "Minh Thắng", href: "https://zalo.me/0937858011" },
    ],
  },
  product_card: {
    order_cta: "Đặt hàng",
    order_target: "#order",
    consult_cta: "Tư vấn",
    consult_strategy: "random_zalo_contact",
  },
};

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

function storefrontEffects(settings) {
  const apiEffects = settings?.storefront_effects || settings?.storefrontEffects || {};
  return { ...DEFAULT_STOREFRONT_EFFECTS, ...apiEffects };
}

function cleanPhone(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

function ensureContacts(rows, fallback = []) {
  const source = Array.isArray(rows) && rows.length ? rows : fallback;
  return source.map((row, index) => {
    if (typeof row === "string") {
      const phone = cleanPhone(row);
      return { name: `Hotline ${index + 1}`, phone, href: `tel:${phone}` };
    }
    const phone = cleanPhone(row?.phone || row?.value || row?.href);
    return {
      name: row?.name || row?.label || `Liên hệ ${index + 1}`,
      phone,
      href: row?.href || (phone ? `tel:${phone}` : "#contact"),
    };
  }).filter((row) => row.href && row.href !== "tel:");
}

function customerActions(settings) {
  const apiActions = settings?.customer_actions || settings?.customerActions || {};
  const fallbackPhones = (settings?.hotlines || []).map((phone, index) => ({
    name: ["Minh Hiền", "Ngọc Linh", "Minh Thắng"][index] || `Hotline ${index + 1}`,
    phone: cleanPhone(phone),
    href: `tel:${cleanPhone(phone)}`,
  }));
  return {
    ...DEFAULT_CUSTOMER_ACTIONS,
    ...apiActions,
    view_products: { ...DEFAULT_CUSTOMER_ACTIONS.view_products, ...(apiActions.view_products || {}) },
    call_hotline: {
      ...DEFAULT_CUSTOMER_ACTIONS.call_hotline,
      ...(apiActions.call_hotline || {}),
      contacts: ensureContacts(apiActions.call_hotline?.contacts, fallbackPhones.length ? fallbackPhones : DEFAULT_CUSTOMER_ACTIONS.call_hotline.contacts),
    },
    consult_zalo: {
      ...DEFAULT_CUSTOMER_ACTIONS.consult_zalo,
      ...(apiActions.consult_zalo || {}),
      contacts: ensureContacts(apiActions.consult_zalo?.contacts, DEFAULT_CUSTOMER_ACTIONS.consult_zalo.contacts),
    },
    product_card: { ...DEFAULT_CUSTOMER_ACTIONS.product_card, ...(apiActions.product_card || {}) },
  };
}

function randomItem(rows) {
  const list = Array.isArray(rows) ? rows.filter(Boolean) : [];
  if (!list.length) return null;
  return list[Math.floor(Math.random() * list.length)];
}

function openCustomerHref(href) {
  const target = String(href || "").trim();
  if (!target) return;
  if (target.startsWith("#")) {
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `${location.pathname}${location.search}${target}`);
    return;
  }
  window.location.href = target;
}

function openRandomTarget(rows) {
  const picked = randomItem(rows);
  openCustomerHref(picked?.href || picked?.value || picked);
}

function effectStyle(settings) {
  const fx = storefrontEffects(settings);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
  const enabled = fx.enabled !== false && fx.mode !== "none";
  return {
    "--fx-enabled": enabled ? 1 : 0,
    "--fx-intensity": clamp(fx.intensity, 0, 1),
    "--fx-speed": `${clamp(fx.speed, 8, 40)}s`,
    "--fx-top-a": fx.topbarA,
    "--fx-top-b": fx.topbarB,
    "--fx-header-tint": fx.headerTint,
    "--fx-nav-tint": fx.navTint,
    "--fx-hero-a": fx.heroA,
    "--fx-hero-b": fx.heroB,
    "--fx-hero-c": fx.heroC,
    "--fx-accent": fx.accent,
    "--fx-gold": fx.gold,
    "--fx-stage-image": fx.stageImageUrl ? `url("${String(fx.stageImageUrl).replace(/"/g, "%22")}")` : "none",
    "--fx-stage-opacity": clamp(fx.stageOpacity, 0, 1),
    "--fx-stage-blur": `${clamp(fx.stageBlur, 0, 10)}px`,
  };
}

const EFFECT_STYLE_CSS = `
  .effect-surface .topbar,.effect-surface .site-header,.effect-surface .nav-row,.effect-surface .premium-hero,.effect-surface .commerce-stage{position:relative;isolation:isolate}
  .effect-surface{min-height:100vh;background:radial-gradient(circle at 0% 14%,rgba(215,25,32,.24),transparent 28%),radial-gradient(circle at 100% 18%,rgba(8,116,67,.24),transparent 32%),linear-gradient(180deg,#12171d 0,#161b20 36%,#101419 100%)}
  .effect-surface .topbar{overflow:hidden;background:linear-gradient(90deg,var(--fx-top-a),var(--fx-top-b) 62%,var(--fx-top-a));box-shadow:inset 0 -1px rgba(255,255,255,.16)}
  .effect-surface .topbar:before{content:"";position:absolute;inset:-90% -20%;z-index:0;background:linear-gradient(112deg,transparent 35%,rgba(255,255,255,.26) 47%,transparent 59%);transform:translateX(-42%);opacity:calc(var(--fx-enabled) * var(--fx-intensity));animation:fx-sheen var(--fx-speed) linear infinite}
  .effect-surface .topbar-inner{position:relative;z-index:1}
  .effect-surface .site-header{overflow:hidden;background-color:color-mix(in srgb,var(--fx-header-tint) 88%,transparent);background-image:linear-gradient(90deg,rgba(255,255,255,.92),rgba(255,255,255,.78)),url("/images/effects/dekton-header-panel.webp");background-size:cover;background-position:center;backdrop-filter:blur(14px);box-shadow:0 10px 34px rgba(15,18,24,.05)}
  .effect-surface .site-header:before{content:"";position:absolute;inset:0;z-index:0;background:linear-gradient(120deg,rgba(215,25,32,.055),transparent 34%,rgba(8,116,67,.055) 68%,transparent),repeating-linear-gradient(90deg,rgba(23,23,23,.035) 0 1px,transparent 1px 44px);opacity:calc(var(--fx-enabled) * var(--fx-intensity) * .82)}
  .effect-surface .site-header:after{content:"";position:absolute;inset:auto -20% 0;z-index:0;height:2px;background:linear-gradient(90deg,transparent,var(--fx-accent),var(--fx-gold),transparent);opacity:calc(var(--fx-enabled) * .7);animation:fx-pan calc(var(--fx-speed) * 1.6) ease-in-out infinite}
  .effect-surface .header-inner{position:relative;z-index:1}
  .effect-surface .search{background:rgba(255,255,255,.72);box-shadow:inset 0 1px rgba(255,255,255,.9),0 10px 24px rgba(18,20,28,.045)}
  .effect-surface .nav-row{overflow:hidden;background-image:linear-gradient(180deg,rgba(255,255,255,.9),rgba(255,245,245,.82)),url("/images/effects/dekton-header-panel.webp");background-size:cover;background-position:center bottom;box-shadow:0 1px rgba(215,25,32,.05)}
  .effect-surface .nav-row:before{content:"";position:absolute;inset:0;z-index:0;background:repeating-linear-gradient(135deg,rgba(215,25,32,.055) 0 1px,transparent 1px 18px),linear-gradient(90deg,transparent,rgba(8,116,67,.055),transparent);opacity:calc(var(--fx-enabled) * var(--fx-intensity) * .62)}
  .effect-surface .nav-row .wrap{position:relative;z-index:1}
  .effect-surface .commerce-stage{overflow:hidden;padding-bottom:40px;background:radial-gradient(circle at -8% 8%,rgba(215,25,32,.26),transparent 28%),radial-gradient(circle at 108% 12%,rgba(18,170,115,.22),transparent 32%),linear-gradient(180deg,#11171d 0,#171b20 22%,#101419 100%)}
  .effect-surface .commerce-stage:before{content:"";position:absolute;inset:0 -8% -190px;z-index:-2;background:linear-gradient(90deg,rgba(215,25,32,.08),transparent 18%,transparent 82%,rgba(8,116,67,.1)),radial-gradient(circle at 18% 12%,rgba(215,25,32,.18),transparent 28%),radial-gradient(circle at 78% 18%,rgba(45,195,255,.14),transparent 34%);opacity:calc(var(--fx-enabled) * .94);pointer-events:none}
  .effect-surface .commerce-stage:after{content:"";position:absolute;inset:0;z-index:-1;background:repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,transparent 1px 92px),repeating-linear-gradient(0deg,rgba(255,255,255,.024) 0 1px,transparent 1px 72px),linear-gradient(115deg,transparent 0 44%,rgba(215,25,32,.08) 44% 45%,transparent 45% 100%),linear-gradient(245deg,transparent 0 56%,rgba(8,116,67,.08) 56% 57%,transparent 57% 100%);pointer-events:none}
  .effect-surface .premium-hero{overflow:hidden;margin-top:18px;margin-bottom:20px;padding-top:28px;padding-bottom:30px;border-radius:18px;background-image:linear-gradient(90deg,rgba(8,10,12,.74),rgba(21,4,6,.5) 48%,rgba(3,36,23,.42)),var(--fx-stage-image);background-repeat:no-repeat;background-size:cover;background-position:center;box-shadow:0 28px 80px rgba(0,0,0,.36),inset 0 0 0 1px rgba(255,255,255,.14)}
  .effect-surface .premium-hero:before{content:"";position:absolute;inset:0;z-index:0;background:radial-gradient(circle at 18% 24%,rgba(255,126,40,.28),transparent 24%),radial-gradient(circle at 74% 18%,rgba(45,195,255,.24),transparent 28%),linear-gradient(115deg,rgba(215,25,32,.26),transparent 34%,rgba(8,116,67,.2) 72%,transparent);opacity:calc(var(--fx-enabled) * var(--fx-intensity));animation:fx-pan calc(var(--fx-speed) * 1.3) ease-in-out infinite;pointer-events:none}
  .effect-surface .premium-hero:after{content:"";position:absolute;inset:0;z-index:0;background:linear-gradient(180deg,rgba(255,255,255,.02),rgba(255,255,255,.16) 70%,rgba(255,255,255,.28));pointer-events:none}
  .effect-surface .premium-hero>.hero-grid,.effect-surface .premium-hero>.trust-grid{position:relative;z-index:1}
  .effect-surface .hero-main,.effect-surface .hero-promo{position:relative;background:linear-gradient(135deg,rgba(36,5,5,.9),rgba(8,8,13,.78) 58%,rgba(20,16,24,.88));border-color:rgba(255,255,255,.16);box-shadow:0 26px 56px rgba(0,0,0,.24),inset 0 1px rgba(255,255,255,.08);backdrop-filter:blur(12px)}
  .effect-surface .hero-promo{background:linear-gradient(135deg,var(--fx-hero-c),var(--fx-hero-b) 62%,var(--fx-hero-a))}
  .effect-surface .hero-main:before,.effect-surface .hero-promo:before{content:"";position:absolute;inset:-40% -25%;background:conic-gradient(from 120deg,transparent,rgba(255,255,255,.12),transparent,rgba(215,25,32,.16),transparent);opacity:calc(var(--fx-enabled) * var(--fx-intensity));animation:fx-rotate calc(var(--fx-speed) * 1.55) linear infinite}
  .effect-surface .hero-main>div,.effect-surface .hero-promo>div{position:relative;z-index:1}
  .effect-surface .trust-grid div{background:rgba(255,255,255,.92);backdrop-filter:blur(12px);box-shadow:0 18px 44px rgba(0,0,0,.16)}
  .effect-surface .promo-tabs a{background:rgba(255,255,255,.9);backdrop-filter:blur(10px);box-shadow:0 12px 30px rgba(19,23,31,.055)}
  .effect-surface .promo-tabs a:first-child{background:var(--fx-accent);border-color:var(--fx-accent);color:white}
  .effect-surface .product-section{position:relative;margin-top:30px;padding:30px 20px 36px;border-radius:18px;background-color:#111820;background-image:linear-gradient(90deg,rgba(8,11,15,.68) 0%,rgba(8,11,15,.42) 36%,rgba(8,11,15,.08) 68%,rgba(8,11,15,.34) 100%),url("/images/effects/dekton-section-products.webp");background-repeat:no-repeat;background-size:cover;background-position:center;box-shadow:0 30px 88px rgba(0,0,0,.34),inset 0 0 0 1px rgba(255,255,255,.16)}
  .effect-surface #flash-sale{background-image:linear-gradient(90deg,rgba(8,11,15,.72) 0%,rgba(48,8,10,.42) 36%,rgba(8,11,15,.06) 68%,rgba(8,11,15,.34) 100%),url("/images/effects/dekton-section-flash.webp")}
  .effect-surface #new-arrivals{background-image:linear-gradient(90deg,rgba(8,11,15,.72) 0%,rgba(5,43,34,.38) 36%,rgba(8,11,15,.06) 68%,rgba(8,11,15,.34) 100%),url("/images/effects/dekton-section-new.webp")}
  .effect-surface #featured{background-image:linear-gradient(90deg,rgba(8,11,15,.72) 0%,rgba(54,34,5,.38) 36%,rgba(8,11,15,.06) 68%,rgba(8,11,15,.34) 100%),url("/images/effects/dekton-section-featured.webp")}
  .effect-surface .product-section .section-head,.effect-surface .product-section .product-grid{position:relative;z-index:1}
  .effect-surface .product-section .section-head h2{color:#fff;text-shadow:0 2px 18px rgba(0,0,0,.42)}
  .effect-surface .product-section .section-head small{color:rgba(255,255,255,.76)}
  .effect-surface .product-section .section-head span{color:#ff3b42;text-shadow:0 2px 14px rgba(0,0,0,.44)}
  @keyframes fx-sheen{0%{transform:translateX(-46%) rotate(0deg)}100%{transform:translateX(46%) rotate(0deg)}}
  @keyframes fx-pan{0%,100%{background-position:0% 50%,0% 50%,0 0}50%{background-position:100% 50%,100% 50%,0 18px}}
  @keyframes fx-rotate{to{transform:rotate(360deg)}}
  @keyframes fx-stage-drift{0%,100%{background-position:center}50%{background-position:center 16px}}
  @media (prefers-reduced-motion:reduce){.effect-surface *,.effect-surface *:before,.effect-surface *:after{animation:none!important;transition:none!important}}
  @media(max-width:560px){.effect-surface .topbar:before{display:none}.effect-surface .commerce-stage{padding-bottom:22px;background:linear-gradient(180deg,#11171d 0,#161b20 34%,#101419 100%)}.effect-surface .commerce-stage:before{inset:0 -52% -120px;opacity:calc(var(--fx-enabled) * .76)}.effect-surface .premium-hero{margin-top:12px;margin-bottom:16px;padding-top:16px;padding-bottom:18px;border-radius:14px;background-size:cover;background-position:center}.effect-surface .product-section{margin-top:20px;padding:20px 16px 24px;border-radius:14px;background-position:center top}.effect-surface .site-header:before{background:linear-gradient(120deg,rgba(215,25,32,.05),transparent)}}
`;

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

function explicitProductImages(p) {
  return [
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
}

function isServiceProduct(p) {
  return normalizeSkuForImage(p.sku).startsWith("SCDEKTON") || String(p.cat || "").toUpperCase().includes("SỬA CHỮA");
}

function localManifestImageUrls(p) {
  const skuAliases = productImageAliases(p);
  const skuNames = skuAliases.flatMap((sku) => PRODUCT_IMAGE_VARIANTS.map((suffix) => `${sku}${suffix}`));
  return skuNames.flatMap((name) => PRODUCT_IMAGE_EXTENSIONS
    .map((ext) => `${name}.${ext}`)
    .filter((fileName) => LOCAL_PRODUCT_IMAGE_SET.has(fileName.toUpperCase()))
    .map((fileName) => `${LOCAL_PRODUCT_IMAGE_BASE}/${encodeURIComponent(fileName)}`));
}

function productReadyForStorefront(p) {
  return isServiceProduct(p) || explicitProductImages(p).length > 0 || localManifestImageUrls(p).length > 0;
}

function imageCandidates(p) {
  const apiImages = explicitProductImages(p);
  if (isServiceProduct(p)) return [...new Set([...apiImages, SERVICE_FALLBACK_IMAGE])];
  return [...new Set([...apiImages, ...localManifestImageUrls(p)])];
}

function ProductImage({ p, onMissingImage }) {
  const candidates = imageCandidates(p);
  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [p.sku]);
  useEffect(() => {
    if (candidates.length && idx >= candidates.length) onMissingImage?.();
  }, [candidates.length, idx, onMissingImage]);
  if (!candidates.length || idx >= candidates.length) return null;
  return <img src={candidates[idx]} alt={p.name} onError={() => setIdx((i) => i + 1)} className="product-img" />;
}

function TopBar({ settings, actions }) {
  const phones = actions.call_hotline.contacts.map((row) => row.phone || row.href.replace(/^tel:/, ""));
  return <div className="topbar">
    <div className="wrap topbar-inner">
      <span>Đại lý DEKTON chính hãng</span>
      <span>Giao hàng toàn quốc</span>
      <span>Hotline: <strong>{phones[0]}</strong></span>
    </div>
  </div>;
}

function Header({ search, setSearch, actions, onHotline }) {
  const viewTargets = actions.view_products.targets || DEFAULT_CUSTOMER_ACTIONS.view_products.targets;
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
        <a href={actions.call_hotline.contacts[0]?.href || "tel:0909418151"} onClick={(e) => { e.preventDefault(); onHotline(); }}>{actions.call_hotline.label || "Gọi hotline"}</a>
        <a href={viewTargets[0]?.href || "#products"} className="cart-btn" onClick={(e) => { e.preventDefault(); openRandomTarget(viewTargets); }}>{actions.view_products.label || "Xem sản phẩm"}</a>
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

function PremiumHero({ banners, actions }) {
  const visible = (banners || []).filter((b) => b.visible !== false);
  const primary = visible[0] || {};
  const promo = visible[1] || {};
  const viewTargets = actions.view_products.targets || DEFAULT_CUSTOMER_ACTIONS.view_products.targets;
  const zaloContacts = actions.consult_zalo.contacts || DEFAULT_CUSTOMER_ACTIONS.consult_zalo.contacts;
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
          <div className="hero-actions">
            <a href={viewTargets[0]?.href || "#products"} onClick={(e) => { e.preventDefault(); openRandomTarget(viewTargets); }}>{actions.view_products.label || "Xem sản phẩm"}</a>
            <a href={zaloContacts[0]?.href || "#contact"} onClick={(e) => { e.preventDefault(); openRandomTarget(zaloContacts); }}>{actions.consult_zalo.label || "Gọi tư vấn"}</a>
          </div>
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

function ProductCard({ p, onOrder, onConsult, actions }) {
  const [imageMissing, setImageMissing] = useState(false);
  useEffect(() => setImageMissing(false), [p.sku]);
  if (imageMissing) return null;
  return <article className="product-card">
    <div className="product-media">
      <ProductImage p={p} onMissingImage={() => setImageMissing(true)} />
      {p.hot && <span className="hot-tag">HOT</span>}
    </div>
    <div className="product-body">
      <div className="product-cat">{customerCategory(p)}</div>
      <h3>{p.name}</h3>
      <div className="sku">{p.sku}</div>
      <div className="price">{fmtV(p.price)}</div>
      <p>{cleanText(p.desc) || "Liên hệ để được tư vấn chi tiết."}</p>
      <div className="product-actions">
        <button onClick={() => onOrder(p)}>{actions.product_card.order_cta || "Đặt hàng"}</button>
        <button className="consult-btn" onClick={() => onConsult(p)}>{actions.product_card.consult_cta || "Tư vấn"}</button>
      </div>
    </div>
  </article>;
}

function ProductSection({ id, title, kicker, products, onOrder, onConsult, actions }) {
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
      {products.map((p) => <ProductCard key={`${title}-${p.id}-${p.sku}`} p={p} onOrder={onOrder} onConsult={onConsult} actions={actions} />)}
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

function isFailedOrderStep(value) {
  if (value === false) return true;
  if (typeof value === "string") {
    return ["failed", "error", "not_configured"].includes(value.toLowerCase());
  }
  if (!value || typeof value !== "object") return false;
  return value.ok === false
    || value.success === false
    || value.synced === false
    || value.created === false
    || ["failed", "error", "not_configured"].includes(String(value.status || "").toLowerCase())
    || Boolean(value.error || value.reason);
}

function orderResponseStatus(res) {
  const storageFailed = isFailedOrderStep(res?.storage);
  const kiotFailed = isFailedOrderStep(res?.kiot_sync) || isFailedOrderStep(res?.kiot_order);
  return { storageFailed, kiotFailed };
}

function orderResponseDiagnostics(res, flags) {
  return {
    order_id: res?.order_id || null,
    storage_persisted: res?.storage?.persisted,
    storage_error: res?.storage?.error,
    kiot_sync: res?.kiot_sync,
    kiot_order_ok: typeof res?.kiot_order === "object" ? res.kiot_order.ok ?? res.kiot_order.success ?? res.kiot_order.created : res?.kiot_order,
    storage_failed: flags.storageFailed,
    kiot_failed: flags.kiotFailed,
  };
}

function HotlineModal({ contacts, onClose }) {
  if (!contacts?.length) return null;
  return <div className="modal-backdrop" onClick={onClose}>
    <div className="modal hotline-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-title">
        <div><h3>Chọn hotline</h3><p>Bấm số để mở màn hình gọi điện</p></div>
        <button onClick={onClose}>×</button>
      </div>
      <div className="hotline-list">
        {contacts.map((contact) => (
          <a key={`${contact.name}-${contact.href}`} href={contact.href}>
            <span>{contact.name}</span>
            <strong>{contact.phone || contact.href.replace(/^tel:/, "")}</strong>
          </a>
        ))}
      </div>
    </div>
  </div>;
}

const ORDER_CHANNEL = "website thienminhgroup.net";

// Tỉnh/thành 2 cấp (sau sáp nhập 2025) kèm KiotViet locationId — để KiotViet tự điền ô Khu vực.
const VN_PROVINCES = [
  { id: 770, name: "Thành phố Hồ Chí Minh" },
  { id: 743, name: "Thành phố Hà Nội" },
  { id: 763, name: "Thành phố Đà Nẵng" },
  { id: 755, name: "Thành phố Hải Phòng" },
  { id: 775, name: "Thành phố Cần Thơ" },
  { id: 762, name: "Thành phố Huế" },
  { id: 769, name: "Thành phố Đồng Nai" },
  { id: 774, name: "Tỉnh An Giang" },
  { id: 753, name: "Tỉnh Bắc Ninh" },
  { id: 776, name: "Tỉnh Cà Mau" },
  { id: 744, name: "Tỉnh Cao Bằng" },
  { id: 767, name: "Tỉnh Đắk Lắk" },
  { id: 746, name: "Tỉnh Điện Biên" },
  { id: 772, name: "Tỉnh Đồng Tháp" },
  { id: 765, name: "Tỉnh Gia Lai" },
  { id: 760, name: "Tỉnh Hà Tĩnh" },
  { id: 756, name: "Tỉnh Hưng Yên" },
  { id: 766, name: "Tỉnh Khánh Hòa" },
  { id: 747, name: "Tỉnh Lai Châu" },
  { id: 768, name: "Tỉnh Lâm Đồng" },
  { id: 751, name: "Tỉnh Lạng Sơn" },
  { id: 749, name: "Tỉnh Lào Cai" },
  { id: 759, name: "Tỉnh Nghệ An" },
  { id: 757, name: "Tỉnh Ninh Bình" },
  { id: 754, name: "Tỉnh Phú Thọ" },
  { id: 764, name: "Tỉnh Quảng Ngãi" },
  { id: 752, name: "Tỉnh Quảng Ninh" },
  { id: 761, name: "Tỉnh Quảng Trị" },
  { id: 748, name: "Tỉnh Sơn La" },
  { id: 750, name: "Tỉnh Thái Nguyên" },
  { id: 758, name: "Tỉnh Thanh Hóa" },
  { id: 771, name: "Tỉnh Tây Ninh" },
  { id: 745, name: "Tỉnh Tuyên Quang" },
  { id: 773, name: "Tỉnh Vĩnh Long" },
];

function composeVnAddress(f) {
  return [f.street, f.ward, f.province, "Việt Nam"]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");
}

function normalizePhone(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

function normVi(s) {
  return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase().trim();
}

// Viết hoa chữ đầu mỗi từ trong tên (tôn trọng tên khách): "minh hiền" -> "Minh Hiền".
function titleCaseName(s) {
  return String(s || "").toLowerCase().replace(/\s+/g, " ").trim()
    .split(" ").map((w) => w ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(" ");
}

// Viết hoa chữ đầu mỗi từ, GIỮ NGUYÊN phần còn lại (cho tên đường: "45/68 cao lỗ" -> "45/68 Cao Lỗ", không phá QL1A).
function capWords(s) {
  return String(s || "").replace(/\s+/g, " ").trim()
    .split(" ").map((w) => w ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(" ");
}

// Ô chọn có tìm kiếm gõ-để-lọc (không dấu). Giá trị chỉ hợp lệ khi khách chọn 1 mục.
function SearchSelect({ value, onChange, options, placeholder, disabled }) {
  const [q, setQ] = useState(value || "");
  const [open, setOpen] = useState(false);
  useEffect(() => { setQ(value || ""); }, [value]);
  const nq = normVi(q);
  const filtered = (nq ? options.filter((o) => normVi(o).includes(nq)) : options).slice(0, 60);
  return <div style={{ position: "relative" }}>
    <input value={q} placeholder={placeholder} disabled={disabled} style={inputStyle()}
      onChange={(e) => { setQ(e.target.value); setOpen(true); if (value) onChange(""); }}
      onFocus={() => setOpen(true)}
      onBlur={() => setTimeout(() => {
        setOpen(false);
        const exact = options.find((o) => normVi(o) === normVi(q));
        if (exact) { onChange(exact); setQ(exact); } else { setQ(value || ""); }
      }, 160)} />
    {open && !disabled && filtered.length > 0 && <div className="ss-list">
      {filtered.map((o) => <div key={o} className="ss-item" onMouseDown={() => { onChange(o); setQ(o); setOpen(false); }}>{o}</div>)}
    </div>}
  </div>;
}

function OrderModal({ product, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", street: "", ward: "", province: "", qty: 1 });
  const [status, setStatus] = useState(null);
  const [wardOptions, setWardOptions] = useState([]);
  useEffect(() => {
    const prov = VN_PROVINCES.find((p) => p.name === form.province);
    if (!prov) { setWardOptions([]); return; }
    let alive = true;
    apiGet(`/api/public/wards?province_id=${prov.id}`)
      .then((r) => { if (alive) setWardOptions(Array.isArray(r.wards) ? r.wards : []); })
      .catch(() => { if (alive) setWardOptions([]); });
    return () => { alive = false; };
  }, [form.province]);
  const [done, setDone] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [showContacts, setShowContacts] = useState(false);
  const [paused, setPaused] = useState(false);
  // Reset toàn bộ khi mở sản phẩm khác (component không remount giữa các lần mở).
  useEffect(() => {
    setDone(null); setStatus(null); setShowContacts(false); setPaused(false);
    setForm({ name: "", phone: "", street: "", ward: "", province: "", qty: 1 });
  }, [product?.sku]);
  // Đếm ngược tự đóng (chống khách bấm gửi nhiều lần). Dừng nếu khách mở danh bạ liên hệ.
  useEffect(() => {
    if (!done || paused) return;
    if (countdown <= 0) { onClose(); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [done, countdown, paused]);
  const statusMessage = status && status !== "sending" ? (status.text || status) : "";
  const statusTone = status && typeof status === "object" ? status.tone : "";
  const total = (Number(product?.price) || 0) * (Number(form.qty) || 1);
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addressPreview = composeVnAddress(form);
  const submit = async () => {
    const qty = Math.max(1, Number(form.qty) || 1);
    const name = titleCaseName(form.name);
    const phone = normalizePhone(form.phone);
    const street = capWords(form.street), ward = form.ward.trim(), province = form.province.trim();
    if (!name) { setStatus({ tone: "error", text: "Vui lòng nhập họ tên người nhận." }); return; }
    if (!/^0\d{9}$/.test(phone)) { setStatus({ tone: "error", text: "Số điện thoại chưa đúng — cần 10 số, bắt đầu bằng 0." }); return; }
    if (!street) { setStatus({ tone: "error", text: "Vui lòng nhập số nhà + tên đường." }); return; }
    if (!province) { setStatus({ tone: "error", text: "Vui lòng chọn tỉnh / thành phố." }); return; }
    if (!ward) { setStatus({ tone: "error", text: "Vui lòng nhập phường / xã / thị trấn." }); return; }
    const provinceId = (VN_PROVINCES.find((p) => p.name === province) || {}).id || null;
    const address = composeVnAddress({ street, ward, province });
    const comboItems = Array.isArray(product.items)
      ? product.items.map((item) => ({
          sku: item.sku,
          qty: Math.max(1, Number(item.qty) || 1) * qty,
          name: item.name || item.product_name || item.sku,
        })).filter((item) => item.sku)
      : [];
    const payload = {
      name,
      phone,
      address,
      address_street: street,
      address_ward: ward,
      address_province: province,
      address_province_id: provinceId,
      address_country: "Việt Nam",
      channel: ORDER_CHANNEL,
      source: "website",
      qty,
      type: product.type === "combo" || comboItems.length ? "combo" : "single",
      product_name: product.name,
      product_sku: product.sku,
      total: (Number(product?.price) || 0) * qty,
    };
    if (comboItems.length) payload.items = comboItems;
    setStatus("sending");
    try {
      const res = await apiPost("/api/public/orders", payload);
      const flags = orderResponseStatus(res);
      if (flags.storageFailed || flags.kiotFailed) {
        console.warn("Order accepted with backend follow-up issue", orderResponseDiagnostics(res, flags));
      }
      setCountdown(3);
      setDone({ orderId: res.order_id || "" });
    } catch (e) { setStatus({ tone: "error", text: "Chưa gửi được đơn. Vui lòng thử lại hoặc gọi hotline để được hỗ trợ." }); }
  };
  if (!product) return null;
  if (done) {
    return <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="thanks">
          <div className="thanks-check">✓</div>
          <h3>Cảm ơn quý khách đã tin tưởng đặt hàng!</h3>
          <p className="thanks-msg">Thiên Minh Group đã nhận yêu cầu{done.orderId ? <> <strong>{done.orderId}</strong></> : null} và sẽ <strong>gọi xác nhận</strong> sản phẩm, địa chỉ và tổng tiền trước khi giao. Anh/chị <strong>chưa phải thanh toán</strong> gì lúc này.</p>
          {!showContacts ? <div className="thanks-actions">
            <button className="submit-order" onClick={onClose}>Tiếp tục xem sản phẩm{!paused && countdown > 0 ? ` (${countdown}s)` : ""}</button>
            <button className="ghost-btn" onClick={() => { setShowContacts(true); setPaused(true); }}>📞 Gọi / Zalo shop ngay</button>
          </div> : <div className="contact-list">
            {[["Minh Hiền", "0909418151"], ["Ngọc Linh", "0909858011"], ["Minh Thắng", "0937858011"]].map(([nm, ph]) => <div key={ph} className="contact-row">
              <span className="contact-name">{nm}</span>
              <a className="contact-tel" href={`tel:${ph}`}>📞 {ph}</a>
              <a className="contact-zalo" href={`https://zalo.me/${ph}`} target="_blank" rel="noreferrer">💬 Zalo</a>
            </div>)}
            <button className="ghost-btn" onClick={onClose}>Đóng</button>
          </div>}
        </div>
      </div>
    </div>;
  }
  const hasStreet = form.street.trim().length > 0;
  const hasProvince = form.province.length > 0;
  const tf = (k, label, ph) => <div key={k} className="field"><label>{label}</label><input value={form[k]} placeholder={ph} inputMode={k === "phone" ? "numeric" : undefined} onChange={(e) => upd(k, e.target.value)} style={inputStyle()} /></div>;
  return <div className="modal-backdrop" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-title"><div><h3>Đặt hàng</h3><p>{product.name}</p></div><button onClick={onClose}>×</button></div>
      <div className="field"><label>Họ tên người nhận</label><input value={form.name} placeholder="Ví dụ: Nguyễn Văn An" style={inputStyle()} onChange={(e) => upd("name", e.target.value)} onBlur={() => upd("name", titleCaseName(form.name))} /></div>
      {tf("phone", "Số điện thoại", "Ví dụ: 0901 234 567")}
      <div className="field"><label>① Số nhà + tên đường</label><input value={form.street} placeholder="Ví dụ: 25 Lê Lợi" style={inputStyle()} onChange={(e) => upd("street", e.target.value)} onBlur={() => upd("street", capWords(form.street))} /></div>
      {hasStreet && <div className="field"><label>② Tỉnh / Thành phố</label><SearchSelect value={form.province} onChange={(v) => setForm((f) => ({ ...f, province: v, ward: "" }))} options={VN_PROVINCES.map((p) => p.name)} placeholder="Gõ để tìm — vd: hồ chí, hà nội" /></div>}
      {hasProvince && <div className="field"><label>③ Phường / Xã / Thị trấn</label><SearchSelect value={form.ward} onChange={(v) => upd("ward", v)} options={wardOptions} placeholder={wardOptions.length ? "Gõ để tìm — vd: chánh hưng" : "Đang tải phường/xã..."} disabled={!wardOptions.length} /></div>}
      {addressPreview && <div className="addr-preview">📍 Giao tới: {addressPreview}</div>}
      <div className="field"><label>Số lượng</label><input type="number" min="1" value={form.qty} onChange={(e) => upd("qty", e.target.value)} style={inputStyle()} /></div>
      <div className="total"><span>Tạm tính</span><strong>{fmtV(total)}</strong></div>
      <button className="submit-order" disabled={status === "sending"} onClick={submit}>{status === "sending" ? "Đang gửi..." : "Gửi đơn"}</button>
      {statusMessage && <div className={`status ${statusTone}`.trim()}>{statusMessage}</div>}
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
  const [hotlineOpen, setHotlineOpen] = useState(false);
  const actions = useMemo(() => customerActions(settings), [settings]);
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
  const publishableProducts = useMemo(() => products.filter(productReadyForStorefront), [products]);
  const cats = useMemo(() => [...new Set(publishableProducts.map(customerCategoryPath))].sort(categorySort), [publishableProducts]);
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return publishableProducts.filter((p) => {
      const path = customerCategoryPath(p);
      const inCategory = cat === "all" || path === cat || path.startsWith(`${cat} > `);
      return inCategory && (!q || `${p.name} ${p.sku} ${p.desc}`.toLowerCase().includes(q));
    });
  }, [publishableProducts, cat, search]);
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
  const consultProduct = () => openRandomTarget(actions.consult_zalo.contacts);

  return <div className="app effect-surface" style={effectStyle(settings)}>
    <style>{`
      *{box-sizing:border-box}html,body,#root{max-width:100%;overflow-x:hidden;scroll-behavior:smooth}body{margin:0;background:${C.page};color:${C.text};font-family:system-ui,-apple-system,Segoe UI,sans-serif}button,input{font:inherit}button{cursor:pointer;transition:.16s ease}button:hover{filter:brightness(.97)}.wrap{width:100%;max-width:1280px;margin:0 auto;padding:0 20px}.topbar{background:${C.green};color:white;font-size:13px}.topbar-inner{min-height:34px;display:flex;align-items:center;justify-content:space-between;gap:16px}.site-header{background:${C.white};border-bottom:1px solid ${C.line};position:sticky;top:0;z-index:20}.header-inner{min-height:76px;display:grid;grid-template-columns:240px 1fr auto;align-items:center;gap:22px}.brand{display:flex;align-items:center;gap:12px}.brand-mark{width:46px;height:46px;border-radius:8px;background:${C.red};color:white;display:grid;place-items:center;font-weight:950;font-size:24px}.brand-name{font-size:26px;font-weight:950;color:${C.red};line-height:1}.brand-sub{font-size:12px;color:${C.ink};font-weight:800;letter-spacing:.8px}.search{height:44px;border:1px solid #d9dbe3;border-radius:8px;background:#f9fafb;display:flex;align-items:center;padding:0 14px;gap:10px}.search input{width:100%;border:0;outline:0;background:transparent;color:${C.ink}}.header-actions{display:flex;gap:10px}.header-actions a{border:1px solid ${C.line};background:white;border-radius:8px;padding:10px 14px;font-weight:800;color:${C.text};text-decoration:none;display:inline-flex;align-items:center;justify-content:center;min-height:42px}.header-actions .cart-btn{background:${C.red};border-color:${C.red};color:white}.nav-row{background:white;border-bottom:1px solid ${C.line};overflow:hidden}.nav-scroll{display:flex;gap:8px;overflow-x:auto;max-width:100%;padding-top:10px;padding-bottom:10px;-ms-overflow-style:none;scrollbar-width:none}.nav-scroll::-webkit-scrollbar{display:none}.nav-scroll button{white-space:nowrap;border:0;background:transparent;color:${C.text};font-weight:800;padding:9px 12px;border-radius:8px}.nav-scroll button.active{background:${C.redSoft};color:${C.red}}.nav-sub{padding-top:0;padding-bottom:11px}.nav-sub button{font-size:13px;background:#fafafa;border:1px solid ${C.line};padding:8px 11px}.nav-sub button.active{background:${C.red};border-color:${C.red};color:white}.premium-hero{padding-top:22px}.hero-grid{display:grid;grid-template-columns:1.45fr .95fr;gap:16px}.hero-main,.hero-promo{min-height:210px;border-radius:10px;padding:28px;display:flex;align-items:flex-end;overflow:hidden;background:linear-gradient(135deg,#240505,#08080d 64%,#141018);color:white;border:1px solid #321014}.hero-promo{background:linear-gradient(135deg,#051a0f,#08090d 62%,#240505)}.hero-main h1,.hero-promo h2{margin:0 0 8px;font-size:34px;line-height:1.08;color:white}.hero-promo h2{font-size:28px}.hero-main p,.hero-promo p{margin:0;color:#f3d6d6;max-width:680px}.hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.hero-actions a{border:1px solid rgba(255,255,255,.28);border-radius:8px;padding:10px 14px;text-decoration:none;color:white;font-weight:900;background:rgba(255,255,255,.1)}.hero-actions a:first-child{background:${C.red};border-color:${C.red}}.trust-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:14px}.trust-grid div{background:white;border:1px solid ${C.line};border-left:4px solid ${C.red};border-radius:8px;padding:16px 18px;display:flex;flex-direction:column;gap:4px}.trust-grid strong{color:${C.ink}}.trust-grid span{color:${C.muted};font-size:13px}.promo-tabs{display:flex;gap:10px;overflow-x:auto;padding-top:16px;padding-bottom:0}.promo-tabs a{white-space:nowrap;text-decoration:none;background:white;border:1px solid ${C.line};border-bottom:3px solid ${C.red};border-radius:8px;padding:10px 14px;color:${C.ink};font-weight:900;font-size:13px;box-shadow:0 6px 18px rgba(20,22,28,.05)}.promo-tabs a:first-child{background:${C.red};border-color:${C.red};color:white}.state-card{margin-top:18px;background:white;border:1px solid ${C.line};border-radius:10px;padding:34px;text-align:center;color:${C.muted}}.error-card{margin-top:18px;background:${C.redSoft};border-color:#ffcdd2;color:${C.redDark}}.product-section{padding-top:28px;overflow:hidden;scroll-margin-top:130px}.section-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:14px}.section-head span{display:block;color:${C.red};font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:.7px}.section-head h2{margin:3px 0 0;color:${C.ink};font-size:26px}.section-head small{color:${C.muted};font-weight:700}.product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));align-items:stretch;gap:16px}.product-card{min-width:0;max-width:100%;background:white;border:1px solid ${C.line};border-radius:8px;overflow:hidden;display:flex;flex-direction:column;height:100%;min-height:430px;box-shadow:0 8px 24px rgba(19,23,31,.06)}.product-media{height:214px;min-height:214px;max-height:214px;flex:0 0 214px;background:#fff;position:relative;display:grid;place-items:center;overflow:hidden;padding:0;border-bottom:1px solid ${C.line}}.product-img{position:absolute;inset:10px;display:block;width:calc(100% - 20px);height:calc(100% - 20px);max-width:calc(100% - 20px);max-height:calc(100% - 20px);object-fit:contain;object-position:center;background:white}.product-placeholder{width:100%;height:100%;background:linear-gradient(135deg,#fafafa,#f1f2f5);color:#8a82a0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;font-size:12px;font-weight:800;text-align:center}.product-placeholder strong{width:56px;height:56px;border-radius:8px;background:${C.red};color:white;display:grid;place-items:center;font-size:13px;letter-spacing:.8px}.product-placeholder span{color:${C.muted}}.hot-tag{position:absolute;top:10px;left:10px;background:${C.red};color:white;border-radius:5px;padding:4px 7px;font-size:10px;font-weight:950}.product-body{min-width:0;padding:14px;display:flex;flex-direction:column;gap:7px;flex:1}.product-cat{font-size:11px;color:${C.red};font-weight:900;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.product-card h3{max-width:100%;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;white-space:normal;word-break:break-word;margin:0;color:${C.ink};font-size:15px;line-height:1.35;height:61px;overflow:hidden;overflow-wrap:anywhere}.sku{font-size:11px;color:${C.muted};font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.price{font-size:16px;color:${C.red};font-weight:950;min-height:22px}.product-card p{margin:0;color:${C.muted};font-size:12px;line-height:1.5;height:54px;overflow:hidden;overflow-wrap:anywhere;word-break:break-word;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical}.product-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:auto}.product-card button{border:0;border-radius:7px;background:${C.red};color:white;font-weight:900;padding:10px 12px;min-height:42px}.product-card .consult-btn{background:${C.dark2};border:1px solid #3c3d48;color:white}.modal-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:18px}.modal{width:440px;max-width:100%;background:white;border-radius:10px;padding:20px;box-shadow:0 20px 70px rgba(0,0,0,.28)}.modal-title{display:flex;justify-content:space-between;gap:12px;margin-bottom:14px}.modal-title h3{margin:0;color:${C.ink}}.modal-title p{margin:4px 0 0;color:${C.muted};font-size:13px}.modal-title button{border:0;background:transparent;font-size:28px;color:${C.muted}}.hotline-list{display:grid;gap:10px}.hotline-list a{display:flex;align-items:center;justify-content:space-between;gap:12px;text-decoration:none;border:1px solid ${C.line};border-radius:9px;padding:13px 14px;color:${C.ink};background:#fafafa}.hotline-list a strong{color:${C.red};font-size:18px}.field{margin-bottom:10px}.field label{display:block;color:${C.muted};font-size:11px;font-weight:900;margin-bottom:4px;text-transform:uppercase}.addr-preview{margin:2px 0 12px;font-size:12px;color:${C.muted};background:#f6f7f9;border:1px solid ${C.line};border-radius:7px;padding:8px 10px;line-height:1.45;overflow-wrap:anywhere}.ss-list{position:absolute;z-index:30;left:0;right:0;top:100%;margin-top:4px;max-height:240px;overflow-y:auto;background:#fff;border:1px solid #d9dbe3;border-radius:8px;box-shadow:0 12px 32px rgba(0,0,0,.16)}.ss-item{padding:10px 12px;font-size:14px;color:${C.ink};cursor:pointer;line-height:1.3}.ss-item:hover{background:#f1f2f5}.thanks{text-align:center;padding:6px 2px}.thanks-check{width:62px;height:62px;border-radius:50%;background:#e8f6ec;color:${C.green};font-size:36px;font-weight:900;display:grid;place-items:center;margin:4px auto 14px}.thanks h3{margin:0 0 10px;color:${C.ink};font-size:19px;line-height:1.3}.thanks-msg{margin:0 0 18px;color:${C.muted};font-size:14px;line-height:1.6}.thanks-msg strong{color:${C.ink}}.thanks-actions{display:flex;flex-direction:column;gap:10px}.ghost-btn{border:1px solid ${C.red};background:#fff;color:${C.red};border-radius:8px;padding:12px;font-weight:900;font-size:14px;cursor:pointer}.contact-list{display:flex;flex-direction:column;gap:9px}.contact-row{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid ${C.line};border-radius:8px;padding:10px 12px;background:#fafafa}.contact-name{font-weight:800;color:${C.ink};font-size:13px}.contact-tel{color:${C.red};font-weight:900;text-decoration:none;font-size:14px}.contact-zalo{color:#0068ff;font-weight:900;text-decoration:none;font-size:13px}.total{display:flex;justify-content:space-between;color:${C.ink};font-weight:900;margin:12px 0}.submit-order{width:100%;border:0;border-radius:8px;padding:12px;background:${C.red};color:white;font-weight:950}.status{margin-top:12px;font-size:13px;color:${C.redDark};line-height:1.45}.status.ok{color:${C.green}}.status.warn{color:${C.gold}}.footer{margin-top:44px;background:linear-gradient(135deg,${C.dark},${C.dark2});border-top:4px solid ${C.red};color:white}.footer-grid{padding-top:30px;padding-bottom:30px;display:grid;grid-template-columns:2fr 1fr 1.4fr;gap:24px}.footer strong{display:block;margin-bottom:8px}.footer p{margin:0;color:#bfc1cc;line-height:1.7;font-size:13px}.footer-phone{color:#ffd16a!important;font-weight:900}@media(max-width:860px){.topbar-inner{justify-content:center;flex-wrap:wrap;padding-top:8px;padding-bottom:8px}.header-inner{grid-template-columns:1fr;gap:12px;padding-top:14px;padding-bottom:14px}.header-actions{display:grid;grid-template-columns:1fr 1fr}.header-actions a{padding:9px 10px}.hero-grid,.trust-grid,.footer-grid{grid-template-columns:1fr}.hero-main,.hero-promo{min-height:176px;padding:22px}.hero-main h1{font-size:27px}.hero-promo h2{font-size:24px}.product-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.product-card{min-height:414px}.product-card h3{font-size:14px}.product-media{height:176px;min-height:176px;max-height:176px;flex-basis:176px}.wrap{padding-left:16px;padding-right:16px}}@media(max-width:560px){.product-grid{grid-template-columns:1fr}.product-card{width:100%;max-width:calc(100vw - 32px);min-height:430px}.product-media{height:224px;min-height:224px;max-height:224px;flex-basis:224px}.product-body>*{max-width:calc(100vw - 60px)}.product-body>.product-actions{max-width:100%;grid-template-columns:1fr}.section-head{align-items:flex-start;flex-direction:column;gap:4px}.brand-name{font-size:22px}.header-actions{grid-template-columns:1fr}.hero-main h1{font-size:24px;max-width:310px;overflow-wrap:anywhere}.hero-main p,.hero-promo p{max-width:310px;overflow-wrap:anywhere}.hero-promo h2{font-size:22px;max-width:310px;overflow-wrap:anywhere}.hero-actions a{padding:9px 12px}.premium-hero{padding-top:16px}}`}</style>
    <style>{EFFECT_STYLE_CSS}</style>
    <TopBar settings={settings} actions={actions} />
    <Header search={search} setSearch={setSearch} actions={actions} onHotline={() => setHotlineOpen(true)} />
    <NavRow categories={cats} selected={cat} setSelected={setCat} />
    <main className="commerce-stage">
      <PremiumHero banners={banners} actions={actions} />
      <PromoTabs />
      {err && <div className="wrap"><div className="state-card error-card">⚠️ {err}</div></div>}
      {loading ? <div className="wrap"><div className="state-card">Đang tải dữ liệu từ hệ thống...</div></div> : <>
        <ProductSection id="flash-sale" title="Flash Sale" kicker="Ưu đãi chủ động" products={flashSale} onOrder={setOrderProduct} onConsult={consultProduct} actions={actions} />
        <ProductSection id="new-arrivals" title="Hàng mới về" kicker="Vừa cập nhật" products={newProducts} onOrder={setOrderProduct} onConsult={consultProduct} actions={actions} />
        <ProductSection id="featured" title="Hàng nổi bật" kicker="Ưu tiên theo lượt bán Kiot" products={featuredProducts} onOrder={setOrderProduct} onConsult={consultProduct} actions={actions} />
        <ProductSection id="products" title="Tất cả sản phẩm" kicker={cat === "all" ? "Danh mục đang bán" : cat} products={showroomProducts} onOrder={setOrderProduct} onConsult={consultProduct} actions={actions} />
        {!shown.length && <div className="wrap"><div className="state-card">Không tìm thấy sản phẩm</div></div>}
      </>}
    </main>
    <Footer settings={settings} />
    <HotlineModal contacts={hotlineOpen ? actions.call_hotline.contacts : []} onClose={() => setHotlineOpen(false)} />
    <OrderModal product={orderProduct} onClose={() => setOrderProduct(null)} />
  </div>;
}
