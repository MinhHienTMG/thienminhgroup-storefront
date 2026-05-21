# Storefront Effect Settings

This storefront reads visual effect settings from `settings.storefront_effects`.
The API/dashboard should own persistence and editing.

| Field | Type | Default | Admin label | Notes |
|---|---|---:|---|---|
| `enabled` | boolean | `true` | Bật hiệu ứng nền | Turn all effects on/off. |
| `mode` | string | `premium-flow` | Kiểu hiệu ứng | Use `none` to disable. |
| `intensity` | number | `0.72` | Độ mạnh hiệu ứng | Clamp 0-1. |
| `speed` | number | `18` | Tốc độ chuyển động | Seconds, clamp 8-40. |
| `topbarA` | color | `#087443` | Màu topbar 1 | Main trust strip. |
| `topbarB` | color | `#0a5b3d` | Màu topbar 2 | Secondary trust strip. |
| `headerTint` | color | `#ffffff` | Nền header | Glass tint. |
| `navTint` | color | `#fff5f5` | Nền danh mục | Soft nav tint. |
| `heroA` | color | `#240505` | Hero màu 1 | Dark red side. |
| `heroB` | color | `#08080d` | Hero màu 2 | Dark center. |
| `heroC` | color | `#0b351f` | Promo màu 1 | Dark green side. |
| `accent` | color | `#d71920` | Màu nhấn | DEKTON red. |
| `gold` | color | `#d89513` | Màu phụ | Warm highlight. |
| `stageMode` | string | `industrial-ai` | Kiểu nền dài | `industrial-ai`, `image`, or `none`. |
| `stageImageUrl` | string | `/images/effects/dekton-ai-stage.svg` | Ảnh nền chiến dịch | Canva/Photoshop/AI asset, lightly blurred by storefront. |
| `stageOpacity` | number | `0.72` | Độ rõ nền dài | Clamp 0-1. |
| `stageBlur` | number | `0` | Độ mờ ảnh nền | Pixel blur, clamp 0-10. |

Example public settings response:

```json
{
  "storefront_effects": {
    "enabled": true,
    "mode": "premium-flow",
    "intensity": 0.72,
    "speed": 18,
    "topbarA": "#087443",
    "topbarB": "#0a5b3d",
    "headerTint": "#ffffff",
    "navTint": "#fff5f5",
    "heroA": "#240505",
    "heroB": "#08080d",
    "heroC": "#0b351f",
    "accent": "#d71920",
    "gold": "#d89513",
    "stageMode": "industrial-ai",
    "stageImageUrl": "/images/effects/dekton-ai-stage.svg",
    "stageOpacity": 0.72,
    "stageBlur": 0
  }
}
```

Recommended asset direction for `stageImageUrl`:

- 16:9 or 21:9 wide background.
- DEKTON power tools in an energetic industrial/city or workshop scene.
- No important text inside the image, because storefront overlays product cards on top.
- Keep subject on the right or upper area, with clean space in the center/left.
- Export WebP/JPEG around 1800-2400 px wide and under 700 KB when possible.

Production asset workflow:

- Use the shared high-resolution DEKTON photo folder as the source of truth.
- In Photoshop/Canva, remove the product background and remove printed spec blocks when they are only decoration.
- Keep the real product shape/proportion intact; do not stretch the tool to fit the canvas.
- Compose one wide campaign image with light industrial/AI energy, grid, speed lines, or city/workshop atmosphere.
- Avoid important text inside the image. Put seasonal copy in dashboard fields, not baked into the picture.
- Publish the final asset to the public image bucket/CDN, then update `stageImageUrl` through API settings.
