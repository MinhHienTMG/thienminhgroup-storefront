import { useState, useRef, useCallback } from "react";

const C={bg:"#05050a",surface:"#09090f",card:"#0e0e16",border:"#181028",borderRed:"#2c1010",red:"#c91a1a",redB:"#e53030",redDim:"#c91a1a15",gold:"#c8920e",goldDim:"#c8920e15",green:"#22c55e",greenDim:"#22c55e15",blue:"#3b82f6",blueDim:"#3b82f615",purple:"#9333ea",text:"#eceef8",muted:"#5a5272",mutedL:"#8a82a0"};
const TG_TOKEN="8966525578:AAH62aZrvqphdGaYMiOipQ_RJNwStasc_6E";
const TG_CHAT="968664794";
const fmtV=n=>new Intl.NumberFormat("vi-VN").format(n)+"đ";
let _uid=1000;
const ADMIN={user:"admin",pass:"577677"};

const CATS={
  "Máy Xịt Rửa Xe":{icon:"💧",color:"#22c55e",subs:["Mini & Gia Đình","Chuyên Nghiệp","Công Nghiệp","Bình Tạo Bọt"]},
  "Máy Khoan":{icon:"🔧",color:"#3b82f6",subs:["Khoan Búa","Khoan Pin","Đa Chức Năng","Khoan Đứng"]},
  "Máy Cắt":{icon:"⚡",color:"#c91a1a",subs:["Cắt Sắt","Cắt Gỗ","Cắt Đá","Cắt Kim Loại"]},
  "Máy Nén Khí":{icon:"💨",color:"#c8920e",subs:["Không Dầu","Có Dầu","Mini","Công Nghiệp"]},
  "Máy Siết Bulong":{icon:"🔩",color:"#9333ea",subs:["Siết Bulong","Siết Pin","Khẩu Siết"]},
  "Máy Mài":{icon:"⚙️",color:"#f97316",subs:["Mài Góc","Mài Thẳng","Đánh Bóng"]},
  "Phụ Kiện":{icon:"🛠️",color:"#6b7280",subs:["Lưỡi Cắt","Mũi Khoan","Vòi Xịt","Dây Cao Áp"]},
};

const INIT_BANNERS=[
  {id:1,row:1,flex:3,title:"DEKTON® Professional Tools",sub:"Công Cụ Điện Chuyên Nghiệp Hàng Đầu Việt Nam",badge:"🔥 SALE HÈ 2026 · GIẢM ĐẾN 30%",img:null,opacity:1,visible:true,bg:"linear-gradient(135deg,#1a0404,#0e0816)",height:210,align:"flex-end"},
  {id:2,row:1,flex:2,title:"Khuyến Mãi Tháng 5",sub:"Máy Xịt Rửa Xe · Máy Khoan Giảm 20%",badge:"💧 Flash Sale",img:null,opacity:1,visible:true,bg:"linear-gradient(135deg,#041a08,#050510)",height:210,align:"flex-end"},
  {id:3,row:2,flex:1,title:"Bảo Hành Chính Hãng",sub:"12 Tháng Motor · Đổi Mới 7 Ngày",badge:"🛡 Cam Kết",img:null,opacity:1,visible:true,bg:"linear-gradient(135deg,#050515,#100508)",height:130,align:"center"},
  {id:4,row:2,flex:1,title:"Giao Hàng Toàn Quốc",sub:"Miễn phí đơn từ 500K · Nhanh 2-5 ngày",badge:"🚚 Free Ship",img:null,opacity:1,visible:true,bg:"linear-gradient(135deg,#051510,#050510)",height:130,align:"center"},
  {id:5,row:2,flex:1,title:"Thanh Toán An Toàn",sub:"COD · Chuyển khoản · Ví điện tử",badge:"💳 Đa Phương Thức",img:null,opacity:1,visible:true,bg:"linear-gradient(135deg,#150505,#050515)",height:130,align:"center"},
];

const INIT_P=[
  {id:1,name:"Máy Xịt Rửa Xe DEKTON DK-CWR3001PRO",price:2100000,orig:2500000,desc:"2000W · 180Bar · Inverter · Bảo hành motor 12 tháng · Dây cao áp 15m.",stock:20,sku:"DK-CWR3001PRO",cat:"Máy Xịt Rửa Xe",subcat:"Chuyên Nghiệp",img:null,hot:true},
  {id:2,name:"Máy Xịt Rửa Mini DK-CWR2200PRO",price:890000,orig:1100000,desc:"790W · 120bar · 6L/phút. Gọn nhẹ gia đình.",stock:30,sku:"DK-CWR2200PRO",cat:"Máy Xịt Rửa Xe",subcat:"Mini & Gia Đình",img:null,hot:false},
  {id:3,name:"Máy Khoan 3CN DEKTON M21-RH2603C",price:1250000,orig:1500000,desc:"Brushless · 3.2J · 0-900RPM · Pin 18V.",stock:45,sku:"M21-RH2603C",cat:"Máy Khoan",subcat:"Đa Chức Năng",img:null,hot:true},
  {id:4,name:"Máy Nén Khí Không Dầu DK-AC2918X",price:3200000,orig:3800000,desc:"1.1HP · 800W · Bình 18L · Không dầu.",stock:12,sku:"DK-AC2918X",cat:"Máy Nén Khí",subcat:"Không Dầu",img:null,hot:true},
  {id:5,name:"Máy Cắt Sắt DEKTON DK-CS2400XPRO",price:2150000,orig:2500000,desc:"355mm · 2400W · Xanh Olive.",stock:8,sku:"DK-CS2400XPRO",cat:"Máy Cắt",subcat:"Cắt Sắt",img:null,hot:false},
  {id:6,name:"Máy Siết Bulong 555Nm M21-IW555PLUS",price:2800000,orig:3200000,desc:"Brushless · 555Nm · Pin 21V.",stock:20,sku:"M21-IW555PLUS",cat:"Máy Siết Bulong",subcat:"Siết Bulong",img:null,hot:true},
];

async function sendTG(text){try{const r=await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:TG_CHAT,text,parse_mode:"HTML"})});return(await r.json()).ok;}catch{return false;}}
async function callAI(messages,sys){const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,system:sys,messages})});const d=await r.json();return d.content?.[0]?.text||"Có lỗi!";}

// ── WATERMARK ─────────────────────────────────────────────────────
function Watermark(){
  return(
    <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
      <svg width="600" height="660" viewBox="0 0 100 110" style={{opacity:0.03}}>
        <polygon points="50,3 96,28 96,82 50,107 4,82 4,28" fill="#c91a1a"/>
        <polygon points="50,11 88,32 88,78 50,99 12,78 12,32" fill="none" stroke="#c91a1a" strokeWidth="1.5"/>
        <rect x="21" y="35" width="58" height="12" rx="2.5" fill="#030305"/>
        <rect x="40" y="35" width="20" height="44" rx="2.5" fill="#030305"/>
        <text x="50" y="21" textAnchor="middle" fontSize="7" fill="#c8920e" fontWeight="bold" fontFamily="serif">天明</text>
      </svg>
    </div>
  );
}

// ── BANNER EDIT MODAL ─────────────────────────────────────────────
function BannerEditModal({b,onSave,onClose}){
  const [f,setF]=useState({...b});
  const imgRef=useRef();
  const upd=(k,v)=>setF(x=>({...x,[k]:v}));
  const handleImg=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=ev=>upd("img",ev.target.result);r.readAsDataURL(file);};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:4000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid #f5a62340`,borderRadius:18,width:520,maxHeight:"92vh",overflow:"auto",padding:24,boxShadow:"0 20px 60px #f5a62320"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontWeight:900,fontSize:15,color:"#f5a623",marginBottom:16}}>🖼 Chỉnh sửa Banner</div>

        {/* Image upload */}
        <div onClick={()=>imgRef.current.click()} style={{height:120,border:`2px dashed ${f.img?"transparent":"#f5a62330"}`,borderRadius:10,cursor:"pointer",overflow:"hidden",background:f.img?"transparent":C.surface,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,position:"relative"}}>
          <input ref={imgRef} type="file" accept="image/*" onChange={handleImg} style={{display:"none"}}/>
          {f.img?<img src={f.img} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            :<div style={{textAlign:"center"}}><div style={{fontSize:28,opacity:0.3,marginBottom:4}}>📷</div><div style={{fontSize:11,color:C.muted}}>Upload ảnh banner (khuyến mãi, sản phẩm, thương hiệu...)</div></div>}
          {f.img&&<div style={{position:"absolute",bottom:6,right:6,background:"rgba(0,0,0,0.7)",borderRadius:5,padding:"3px 8px",fontSize:9,color:"#fff"}}>🔄 Thay ảnh</div>}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {/* Badge */}
          <div>
            <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:3,textTransform:"uppercase",letterSpacing:0.8}}>Badge / Nhãn</div>
            <input value={f.badge||""} onChange={e=>upd("badge",e.target.value)} placeholder="VD: 🔥 SALE HÈ 2026"
              style={{width:"100%",background:C.surface,border:`1px solid #f5a62330`,borderRadius:7,padding:"8px 12px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:3,textTransform:"uppercase",letterSpacing:0.8}}>Tiêu đề chính</div>
            <input value={f.title||""} onChange={e=>upd("title",e.target.value)}
              style={{width:"100%",background:C.surface,border:`1px solid #f5a62330`,borderRadius:7,padding:"8px 12px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:3,textTransform:"uppercase",letterSpacing:0.8}}>Mô tả phụ</div>
            <input value={f.sub||""} onChange={e=>upd("sub",e.target.value)}
              style={{width:"100%",background:C.surface,border:`1px solid #f5a62330`,borderRadius:7,padding:"8px 12px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
          </div>

          {/* Opacity */}
          <div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:0.8}}>
              <span>Độ mờ ảnh nền</span><span style={{color:"#f5a623",fontFamily:"monospace"}}>{Math.round(f.opacity*100)}%</span>
            </div>
            <input type="range" min="0.05" max="1" step="0.05" value={f.opacity} onChange={e=>upd("opacity",parseFloat(e.target.value))}
              style={{width:"100%",accentColor:"#f5a623"}}/>
          </div>

          {/* Height */}
          <div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:0.8}}>
              <span>Chiều cao banner</span><span style={{color:"#f5a623",fontFamily:"monospace"}}>{f.height}px</span>
            </div>
            <input type="range" min="80" max="360" step="10" value={f.height} onChange={e=>upd("height",parseInt(e.target.value))}
              style={{width:"100%",accentColor:"#f5a623"}}/>
          </div>

          {/* Flex (width proportion) */}
          <div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:0.8}}>
              <span>Tỷ lệ chiều rộng</span><span style={{color:"#f5a623",fontFamily:"monospace"}}>{f.flex}</span>
            </div>
            <input type="range" min="1" max="5" step="1" value={f.flex} onChange={e=>upd("flex",parseInt(e.target.value))}
              style={{width:"100%",accentColor:"#f5a623"}}/>
          </div>

          {/* Visibility */}
          <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"10px 14px",background:C.surface,borderRadius:9,border:`1px solid ${C.border}`}}>
            <input type="checkbox" checked={f.visible} onChange={e=>upd("visible",e.target.checked)} style={{accentColor:"#f5a623",width:15,height:15}}/>
            <span style={{fontSize:12,color:C.text}}>👁 Hiển thị banner này</span>
          </label>

          {/* Remove image */}
          {f.img&&<button onClick={()=>upd("img",null)} style={{background:"#e5353518",border:"1px solid #e5353530",borderRadius:7,padding:"7px",color:C.redB,fontSize:11,fontWeight:600,cursor:"pointer"}}>🗑 Xóa ảnh, dùng màu nền</button>}
        </div>

        <div style={{display:"flex",gap:10,marginTop:18}}>
          <button onClick={()=>onSave(f)} style={{flex:2,background:"linear-gradient(135deg,#c8920e,#e8aa20)",border:"none",borderRadius:10,padding:"11px",color:"#000",fontWeight:800,fontSize:14,cursor:"pointer"}}>💾 Lưu Banner</button>
          <button onClick={onClose} style={{flex:1,background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,padding:"11px",color:C.muted,fontSize:13,cursor:"pointer"}}>Huỷ</button>
        </div>
      </div>
    </div>
  );
}

// ── BANNER MODULE ─────────────────────────────────────────────────
function BannerModule({b,editMode,onClick}){
  if(!b.visible&&!editMode)return null;
  const maxH=Math.max(...[b.height]);
  return(
    <div onClick={()=>editMode&&onClick()} style={{flex:b.flex,minWidth:0,height:b.height,borderRadius:12,overflow:"hidden",position:"relative",cursor:editMode?"pointer":"default",border:`1px solid ${editMode?"#f5a62340":C.borderRed}`,opacity:b.visible?1:0.35,transition:"all 0.2s"}}>
      {/* Background */}
      {b.img
        ?<img src={b.img} style={{width:"100%",height:"100%",objectFit:"cover",opacity:b.opacity}}/>
        :<div style={{width:"100%",height:"100%",background:b.bg,opacity:b.opacity}}/>
      }
      {/* Text overlay */}
      <div style={{position:"absolute",inset:0,padding:"16px 20px",display:"flex",flexDirection:"column",justifyContent:b.align||"flex-end",background:"linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 60%)"}}>
        {b.badge&&<span style={{fontSize:9,fontWeight:800,color:C.redB,background:C.redDim,border:`1px solid ${C.borderRed}`,padding:"2px 9px",borderRadius:99,alignSelf:"flex-start",marginBottom:5,letterSpacing:0.3}}>{b.badge}</span>}
        <div style={{fontSize:b.flex>=3?18:14,fontWeight:900,color:"#fff",lineHeight:1.2,letterSpacing:-0.3}}>{b.title}</div>
        {b.sub&&<div style={{fontSize:11,color:"rgba(255,255,255,0.65)",marginTop:4}}>{b.sub}</div>}
      </div>
      {/* Edit overlay */}
      {editMode&&(
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:5}}>
          <div style={{fontSize:20,color:"#f5a623"}}>✏️</div>
          <div style={{fontSize:10,color:"#fff",fontWeight:700}}>Chỉnh sửa</div>
          {!b.visible&&<span style={{fontSize:8,color:C.muted,background:C.border,borderRadius:99,padding:"1px 7px"}}>Đang ẩn</span>}
        </div>
      )}
    </div>
  );
}

// ── BANNER SECTION ────────────────────────────────────────────────
function BannerSection({banners,setBanners,editMode}){
  const [editingId,setEditingId]=useState(null);
  const rows=[1,2];
  const saveBanner=updated=>{setBanners(bs=>bs.map(b=>b.id===updated.id?updated:b));setEditingId(null);};
  const editingBanner=banners.find(b=>b.id===editingId);
  return(
    <>
      {rows.map(row=>{
        const rowBanners=banners.filter(b=>b.row===row);
        const anyVisible=rowBanners.some(b=>b.visible)||editMode;
        if(!anyVisible)return null;
        return(
          <div key={row} style={{display:"flex",gap:10,marginBottom:10}}>
            {rowBanners.map(b=>(
              <BannerModule key={b.id} b={b} editMode={editMode} onClick={()=>setEditingId(b.id)}/>
            ))}
          </div>
        );
      })}
      {editingBanner&&<BannerEditModal b={editingBanner} onSave={saveBanner} onClose={()=>setEditingId(null)}/>}
    </>
  );
}

// ── LOGIN MODAL ───────────────────────────────────────────────────
function LoginModal({onLogin,onClose}){
  const [u,setU]=useState("");const [p,setP]=useState("");const [err,setErr]=useState("");const [loading,setLoading]=useState(false);
  const go=()=>{setLoading(true);setTimeout(()=>{if(u===ADMIN.user&&p===ADMIN.pass){onLogin();}else{setErr("Sai tài khoản hoặc mật khẩu!");setLoading(false);}},600);};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.borderRed}`,borderRadius:18,width:360,padding:28}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{width:50,height:50,borderRadius:13,background:`linear-gradient(135deg,${C.red},${C.redB})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:"#fff",margin:"0 auto 10px"}}>T</div>
          <div style={{fontWeight:900,fontSize:15,color:C.text}}>Đăng nhập Quản trị</div>
          <div style={{fontSize:10,color:C.muted,marginTop:2}}>Thiên Minh Group · Admin</div>
        </div>
        {[["Tài khoản",u,setU,"text"],["Mật khẩu",p,setP,"password"]].map(([lbl,val,set,type])=>(
          <div key={lbl} style={{marginBottom:11}}>
            <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:3,textTransform:"uppercase",letterSpacing:0.8}}>{lbl}</div>
            <input type={type} value={val} onChange={e=>{set(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&go()}
              style={{width:"100%",background:C.surface,border:`1px solid ${C.borderRed}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
          </div>
        ))}
        {err&&<div style={{background:"#e5353518",border:"1px solid #e5353530",borderRadius:7,padding:"8px 12px",color:C.redB,fontSize:12,marginBottom:10}}>⚠️ {err}</div>}
        <button onClick={go} disabled={loading||!u||!p} style={{width:"100%",background:`linear-gradient(135deg,${C.red},${C.redB})`,border:"none",borderRadius:9,padding:"11px",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer"}}>
          {loading?"Đang vào...":"Đăng nhập →"}
        </button>
      </div>
    </div>
  );
}

// ── CATEGORY SIDEBAR ──────────────────────────────────────────────
function CatSidebar({products,selCat,selSub,onSelect}){
  const [open,setOpen]=useState({});
  const cnt=(cat,sub)=>products.filter(p=>p.cat===cat&&(!sub||p.subcat===sub)).length;
  const isOpen=cat=>open[cat]||(selCat===cat);
  return(
    <aside style={{width:200,flexShrink:0,paddingRight:14}}>
      <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8,paddingLeft:4}}>Danh mục</div>
      <button onClick={()=>onSelect(null,null)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 11px",borderRadius:8,border:`1px solid ${!selCat?C.borderRed:"transparent"}`,background:!selCat?C.redDim:"transparent",color:!selCat?C.redB:C.mutedL,fontWeight:!selCat?700:400,fontSize:11,cursor:"pointer",marginBottom:5}}>
        <span>🏪 Tất cả</span><span style={{fontSize:9,background:C.border,borderRadius:99,padding:"1px 7px",color:C.muted}}>{products.length}</span>
      </button>
      <div style={{height:1,background:C.border,marginBottom:6}}/>
      {Object.entries(CATS).map(([cat,info])=>{
        const total=cnt(cat,null);if(!total)return null;
        const active=selCat===cat&&!selSub;const expanded=isOpen(cat);
        return(
          <div key={cat} style={{marginBottom:1}}>
            <button onClick={()=>{setOpen(o=>({...o,[cat]:!o[cat]}));onSelect(cat,null);}} style={{width:"100%",display:"flex",alignItems:"center",gap:6,padding:"7px 9px",borderRadius:7,border:`1px solid ${active?`${info.color}30`:"transparent"}`,background:active?`${info.color}12`:"transparent",color:active?info.color:C.mutedL,fontWeight:active?700:500,fontSize:11,cursor:"pointer",textAlign:"left"}}>
              <span style={{flexShrink:0}}>{info.icon}</span><span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cat}</span>
              <span style={{fontSize:8,background:`${info.color}20`,color:info.color,borderRadius:99,padding:"1px 6px",flexShrink:0}}>{total}</span>
              <span style={{fontSize:7,opacity:0.4,display:"inline-block",transition:"transform 0.2s",transform:expanded?"rotate(90deg)":"none",flexShrink:0}}>▶</span>
            </button>
            {expanded&&(
              <div style={{marginLeft:9,marginTop:1,marginBottom:3,borderLeft:`2px solid ${info.color}22`,paddingLeft:7}}>
                {info.subs.filter(s=>cnt(cat,s)>0).map(sub=>{
                  const subActive=selCat===cat&&selSub===sub;
                  return(
                    <button key={sub} onClick={()=>onSelect(cat,sub)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 7px",borderRadius:5,border:`1px solid ${subActive?`${info.color}30`:"transparent"}`,background:subActive?`${info.color}15`:"transparent",color:subActive?info.color:C.muted,fontSize:10,fontWeight:subActive?700:400,cursor:"pointer"}}>
                      <span>└ {sub}</span><span style={{fontSize:8,color:C.muted}}>{cnt(cat,sub)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}

// ── HELPERS ───────────────────────────────────────────────────────
function PBar({val,color=C.red,h=4}){return <div style={{background:C.border,borderRadius:99,height:h,overflow:"hidden"}}><div style={{width:`${Math.max(0,Math.min(100,val))}%`,height:"100%",background:color,borderRadius:99,transition:"width 0.4s"}}/></div>;}

function ProdCard({p,onOrder,isAdmin,onEdit,onDelete}){
  const info=CATS[p.cat];const col=info?.color||C.red;
  const disc=p.orig&&p.orig>p.price?Math.round((1-p.price/p.orig)*100):0;
  const [hov,setHov]=useState(false);
  return(
    <div style={{background:C.card,border:`1px solid ${hov?"#3a1515":C.borderRed}`,borderRadius:13,overflow:"hidden",display:"flex",flexDirection:"column",transition:"all 0.2s",transform:hov?"translateY(-3px)":"none",boxShadow:hov?`0 10px 30px ${col}12`:""}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{height:180,position:"relative",overflow:"hidden",background:`linear-gradient(135deg,${col}18,${col}06)`}}>
        {p.img?<img src={p.img} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          :<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5}}><div style={{fontSize:48,opacity:0.2}}>{info?.icon||"📦"}</div><div style={{fontSize:8,color:C.muted,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>DEKTON® Professional</div></div>}
        <div style={{position:"absolute",top:9,left:9,display:"flex",flexDirection:"column",gap:3}}>
          {p.hot&&<span style={{background:"linear-gradient(135deg,#e53030,#991111)",color:"#fff",fontSize:8,fontWeight:800,padding:"2px 8px",borderRadius:99}}>🔥 HOT</span>}
          {disc>0&&<span style={{background:C.gold,color:"#000",fontSize:8,fontWeight:800,padding:"2px 8px",borderRadius:99}}>-{disc}%</span>}
        </div>
        {p.stock>0&&p.stock<=5&&<div style={{position:"absolute",bottom:6,right:6,background:"rgba(229,53,53,0.9)",borderRadius:99,padding:"2px 8px",fontSize:8,fontWeight:700,color:"#fff"}}>⚠ Còn {p.stock}</div>}
        {p.stock===0&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{background:"#e53535",color:"#fff",padding:"7px 16px",borderRadius:9,fontSize:12,fontWeight:800}}>HẾT HÀNG</span></div>}
      </div>
      <div style={{padding:13,flex:1,display:"flex",flexDirection:"column",gap:5}}>
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <span style={{fontSize:8,fontWeight:700,color:col,background:`${col}15`,padding:"2px 6px",borderRadius:3}}>{p.cat}</span>
          {p.subcat&&<span style={{fontSize:8,color:C.muted,background:C.border,padding:"2px 5px",borderRadius:3}}>/ {p.subcat}</span>}
          <span style={{marginLeft:"auto",fontSize:8,color:C.muted,fontFamily:"monospace"}}>{p.sku}</span>
        </div>
        <div style={{fontSize:12,fontWeight:700,color:C.text,lineHeight:1.35}}>{p.name}</div>
        <div style={{fontSize:10,color:C.muted,lineHeight:1.4,flex:1}}>{p.desc}</div>
        <div style={{display:"flex",alignItems:"baseline",gap:7}}>
          <span style={{fontSize:18,fontWeight:900,color:C.gold,fontFamily:"monospace",letterSpacing:-0.5}}>{fmtV(p.price)}</span>
          {p.orig&&p.orig>p.price&&<span style={{fontSize:10,color:C.muted,textDecoration:"line-through"}}>{fmtV(p.orig)}</span>}
        </div>
        <div><div style={{display:"flex",justifyContent:"space-between",fontSize:8,marginBottom:2}}><span style={{color:C.muted}}>Tồn kho</span><span style={{color:p.stock>10?C.green:p.stock>0?C.gold:C.red,fontWeight:700}}>{p.stock} cái</span></div><PBar val={p.stock/50*100} color={p.stock>10?C.green:p.stock>0?C.gold:C.red}/></div>
        {isAdmin
          ?<div style={{display:"flex",gap:5}}><button onClick={()=>onEdit(p)} style={{flex:1,background:C.blueDim,border:`1px solid ${C.blue}25`,borderRadius:6,padding:"6px",color:C.blue,fontWeight:700,fontSize:10,cursor:"pointer"}}>✏ Sửa</button><button onClick={()=>onDelete(p.id)} style={{background:C.redDim,border:`1px solid ${C.borderRed}`,borderRadius:6,padding:"6px 10px",color:C.redB,fontWeight:700,fontSize:10,cursor:"pointer"}}>🗑</button></div>
          :<button onClick={()=>p.stock>0&&onOrder(p)} disabled={p.stock===0} style={{background:p.stock>0?`linear-gradient(135deg,${C.red},${C.redB})`:"#1a1a22",border:`1px solid ${p.stock>0?C.borderRed:"#222"}`,borderRadius:8,padding:"9px",color:p.stock>0?"#fff":"#444",fontWeight:700,fontSize:11,cursor:p.stock>0?"pointer":"not-allowed",boxShadow:p.stock>0&&hov?`0 4px 16px ${C.redDim}`:""}}>
            {p.stock>0?"🛒 Đặt hàng ngay →":"Hết hàng"}
          </button>}
      </div>
    </div>
  );
}

// ── PRODUCT MODAL ─────────────────────────────────────────────────
function ProdModal({prod,onSave,onClose}){
  const init=prod||{name:"",price:0,orig:0,desc:"",sku:"",cat:"Máy Xịt Rửa Xe",subcat:"",stock:0,img:null,hot:false};
  const [f,setF]=useState(init);const imgRef=useRef();
  const upd=(k,v)=>setF(x=>({...x,[k]:v}));
  const handleImg=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=ev=>upd("img",ev.target.result);r.readAsDataURL(file);};
  const NUM=({lbl,k})=>(<div><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:3,textTransform:"uppercase",letterSpacing:0.8}}>{lbl}</div><input type="text" inputMode="numeric" value={(f[k]||0)===0?"":Number(f[k]).toLocaleString("vi-VN")} onChange={e=>{const raw=e.target.value.replace(/[.,\s]/g,"");if(/^\d*$/.test(raw))upd(k,Number(raw)||0);}} placeholder="0" style={{width:"100%",background:C.surface,border:`1px solid ${C.borderRed}`,borderRadius:7,padding:"9px 11px",color:C.gold,fontSize:13,fontFamily:"monospace",fontWeight:700,outline:"none",boxSizing:"border-box"}}/></div>);
  const TXT=({lbl,k,area=false})=>(<div><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:3,textTransform:"uppercase",letterSpacing:0.8}}>{lbl}</div>{area?<textarea value={f[k]||""} onChange={e=>upd(k,e.target.value)} rows={2} style={{width:"100%",background:C.surface,border:`1px solid ${C.borderRed}`,borderRadius:7,padding:"9px 11px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box",resize:"vertical"}}/>:<input type="text" value={f[k]||""} onChange={e=>upd(k,e.target.value)} style={{width:"100%",background:C.surface,border:`1px solid ${C.borderRed}`,borderRadius:7,padding:"9px 11px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/>}</div>);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:14}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.borderRed}`,borderRadius:16,width:540,maxHeight:"94vh",overflow:"auto",padding:24}} onClick={e=>e.stopPropagation()}>
        <div style={{fontWeight:900,fontSize:15,color:C.text,marginBottom:16}}>{prod?"✏️ Sửa sản phẩm":"➕ Thêm sản phẩm mới"}</div>
        <div onClick={()=>imgRef.current.click()} style={{height:130,border:`2px dashed ${f.img?"transparent":C.borderRed}`,borderRadius:10,marginBottom:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",background:f.img?"transparent":C.surface,position:"relative"}}>
          <input ref={imgRef} type="file" accept="image/*" onChange={handleImg} style={{display:"none"}}/>
          {f.img?<img src={f.img} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{textAlign:"center",pointerEvents:"none"}}><div style={{fontSize:30,opacity:0.2,marginBottom:4}}>📷</div><div style={{fontSize:11,color:C.muted}}>Upload ảnh sản phẩm</div></div>}
          {f.img&&<div style={{position:"absolute",bottom:6,right:6,background:"rgba(0,0,0,0.7)",borderRadius:5,padding:"3px 8px",fontSize:9,color:"#fff"}}>🔄 Thay</div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <TXT lbl="Tên sản phẩm" k="name"/>
          <TXT lbl="Mô tả" k="desc" area/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:3,textTransform:"uppercase",letterSpacing:0.8}}>Danh mục chính</div><select value={f.cat} onChange={e=>setF(x=>({...x,cat:e.target.value,subcat:""}))} style={{width:"100%",background:C.surface,border:`1px solid ${C.borderRed}`,borderRadius:7,padding:"9px 11px",color:C.text,fontSize:11,outline:"none",cursor:"pointer"}}>{Object.keys(CATS).map(c=><option key={c}>{c}</option>)}</select></div>
            <div><div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:3,textTransform:"uppercase",letterSpacing:0.8}}>Danh mục con</div><select value={f.subcat} onChange={e=>upd("subcat",e.target.value)} style={{width:"100%",background:C.surface,border:`1px solid ${C.borderRed}`,borderRadius:7,padding:"9px 11px",color:C.text,fontSize:11,outline:"none",cursor:"pointer"}}><option value="">-- Chọn nhóm --</option>{(CATS[f.cat]?.subs||[]).map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9}}><NUM lbl="Giá bán (đ)" k="price"/><NUM lbl="Giá gốc (đ)" k="orig"/><NUM lbl="Tồn kho" k="stock"/></div>
          <TXT lbl="SKU / Mã hàng" k="sku"/>
          <label style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",padding:"9px 12px",background:C.surface,borderRadius:8,border:`1px solid ${C.border}`}}><input type="checkbox" checked={f.hot||false} onChange={e=>upd("hot",e.target.checked)} style={{accentColor:C.red,width:14,height:14}}/><span style={{fontSize:12,color:C.text}}>🔥 Đánh dấu sản phẩm <b style={{color:C.redB}}>HOT</b></span></label>
        </div>
        <div style={{display:"flex",gap:9,marginTop:16}}><button onClick={()=>onSave(f)} style={{flex:2,background:`linear-gradient(135deg,${C.red},${C.redB})`,border:"none",borderRadius:9,padding:"11px",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer"}}>💾 Lưu</button><button onClick={onClose} style={{flex:1,background:"transparent",border:`1px solid ${C.border}`,borderRadius:9,padding:"11px",color:C.muted,fontSize:12,cursor:"pointer"}}>Huỷ</button></div>
      </div>
    </div>
  );
}

// ── ORDER CHAT ────────────────────────────────────────────────────
function OrderChat({product,onClose,onOrderPlaced}){
  const [msgs,setMsgs]=useState([]);const [input,setInput]=useState("");const [busy,setBusy]=useState(false);const [done,setDone]=useState(null);const [tgOk,setTgOk]=useState(null);
  const endRef=useRef();const inRef=useRef();const catInfo=CATS[product.cat];
  const SYS=`Bạn là nhân viên tư vấn AI của THIÊN MINH GROUP — DEKTON® Professional Tools.
SẢN PHẨM: ${product.name} (${product.cat}/${product.subcat}) · Giá: ${fmtV(product.price)} · SKU: ${product.sku}
Thu thập: 1.Họ tên 2.SĐT 3.Địa chỉ đầy đủ 4.Số lượng
Khi đủ+xác nhận → cuối tin: [ORDER_JSON]{"name":"...","phone":"...","address":"...","qty":1}[/ORDER_JSON]
Tiếng Việt, thân thiện, chuyên nghiệp.`;
  useEffect(()=>{(async()=>{setBusy(true);const txt=await callAI([{role:"user",content:"Xin chào, tôi muốn đặt hàng."}],SYS);setMsgs([{role:"assistant",content:txt}]);setBusy(false);setTimeout(()=>inRef.current?.focus(),100);})();},[]);
  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[msgs,busy]);
  const send=async()=>{
    const txt=input.trim();if(!txt||busy||done)return;
    const hist=[...msgs,{role:"user",content:txt}];setMsgs(hist);setInput("");setBusy(true);
    const reply=await callAI(hist.map(m=>({role:m.role,content:m.content})),SYS);
    setMsgs([...hist,{role:"assistant",content:reply}]);setBusy(false);
    const m=reply.match(/\[ORDER_JSON\]([\s\S]*?)\[\/ORDER_JSON\]/);
    if(m){try{const od=JSON.parse(m[1].trim());setDone(od);const order=await onOrderPlaced({...od,product,total:product.price*od.qty});const ok=await sendTG(`🛒 <b>ĐƠN HÀNG MỚI!</b> #${order.id}\n📦 ${product.name}\n👤 ${od.name} · 📱 ${od.phone}\n📍 ${od.address}\n💰 ${fmtV(product.price*od.qty)}\n🕐 ${new Date().toLocaleString("vi-VN")}\n<i>thienminhgroup.net</i>`);setTgOk(ok);}catch{}}
  };
  const clean=t=>t.replace(/\[ORDER_JSON\][\s\S]*?\[\/ORDER_JSON\]/g,"").trim();
  const col=catInfo?.color||C.red;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:2000,display:"flex",alignItems:"flex-end",justifyContent:"flex-end",padding:20}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.borderRed}`,borderRadius:18,width:400,maxHeight:580,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:`0 20px 60px ${C.redDim}`}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"13px 16px",background:"linear-gradient(135deg,#150404,#0e0e16)",borderBottom:`1px solid ${C.borderRed}`,display:"flex",alignItems:"center",gap:9,flexShrink:0}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${C.red},${C.redB})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🤖</div>
          <div style={{flex:1}}><div style={{fontWeight:800,fontSize:12,color:C.text}}>AI Tư Vấn Đặt Hàng</div><div style={{fontSize:9,color:C.green,display:"flex",alignItems:"center",gap:3}}><span style={{width:4,height:4,borderRadius:"50%",background:C.green,display:"inline-block"}}/>Đang hoạt động</div></div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>
        </div>
        <div style={{padding:"9px 14px",background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",gap:9,alignItems:"center",flexShrink:0}}>
          <div style={{width:38,height:38,borderRadius:7,background:`${col}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{catInfo?.icon||"📦"}</div>
          <div style={{flex:1,minWidth:0}}><div style={{fontSize:10,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{product.name}</div><div style={{fontSize:12,fontWeight:900,color:C.gold,fontFamily:"monospace"}}>{fmtV(product.price)}</div></div>
        </div>
        <div style={{flex:1,overflow:"auto",padding:12,display:"flex",flexDirection:"column",gap:9}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",gap:5,alignItems:"flex-end"}}>
              {m.role==="assistant"&&<div style={{width:22,height:22,borderRadius:"50%",background:C.redDim,border:`1px solid ${C.borderRed}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0}}>🤖</div>}
              <div style={{maxWidth:"80%",padding:"9px 13px",borderRadius:13,fontSize:11,lineHeight:1.6,whiteSpace:"pre-wrap",background:m.role==="user"?`linear-gradient(135deg,${C.red},${C.redB})`:C.surface,color:C.text,border:m.role==="assistant"?`1px solid ${C.borderRed}`:"none",borderBottomRightRadius:m.role==="user"?2:13,borderBottomLeftRadius:m.role==="assistant"?2:13}}>{clean(m.content)}</div>
            </div>
          ))}
          {busy&&<div style={{display:"flex",gap:5,alignItems:"flex-end"}}><div style={{width:22,height:22,borderRadius:"50%",background:C.redDim,border:`1px solid ${C.borderRed}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0}}>🤖</div><div style={{padding:"9px 13px",background:C.surface,border:`1px solid ${C.borderRed}`,borderRadius:13,borderBottomLeftRadius:2,display:"flex",gap:3}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:C.redB,animation:`tmgB 1.2s ${i*0.2}s ease-in-out infinite`}}/>)}</div></div>}
          {done&&<div style={{background:C.greenDim,border:`1px solid ${C.green}30`,borderRadius:13,padding:14,textAlign:"center"}}><div style={{fontSize:24,marginBottom:4}}>✅</div><div style={{fontSize:12,fontWeight:800,color:C.green,marginBottom:3}}>Đặt hàng thành công!</div><div style={{fontSize:10,color:C.mutedL}}>{tgOk===true?"📱 Đã gửi Telegram ✓":tgOk===false?"⚠️ Telegram lỗi":"📱 Đang gửi..."}</div></div>}
          <div ref={endRef}/>
        </div>
        {!done&&<div style={{padding:"11px 13px",borderTop:`1px solid ${C.border}`,display:"flex",gap:7,flexShrink:0}}><input ref={inRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder={busy?"AI đang trả lời...":"Nhập tin nhắn..."} disabled={busy} style={{flex:1,background:C.surface,border:`1px solid ${C.borderRed}`,borderRadius:9,padding:"8px 11px",color:C.text,fontSize:11,outline:"none"}}/><button onClick={send} disabled={busy||!input.trim()} style={{background:!busy&&input.trim()?`linear-gradient(135deg,${C.red},${C.redB})`:"#1a0808",border:`1px solid ${C.borderRed}`,borderRadius:9,padding:"8px 14px",color:!busy&&input.trim()?"#fff":"#444",fontWeight:700,fontSize:11,cursor:!busy&&input.trim()?"pointer":"not-allowed"}}>→</button></div>}
        {done&&<div style={{padding:"11px 13px",borderTop:`1px solid ${C.border}`,flexShrink:0}}><button onClick={onClose} style={{width:"100%",background:`linear-gradient(135deg,${C.red},${C.redB})`,border:"none",borderRadius:9,padding:"9px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>Đóng ×</button></div>}
      </div>
    </div>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────
function Footer(){
  return(
    <footer style={{background:C.surface,borderTop:`1px solid ${C.borderRed}`,marginTop:48,position:"relative",zIndex:1}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${C.red},${C.gold},transparent)`}}/>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"36px 20px 24px",display:"grid",gridTemplateColumns:"2fr 1.2fr 1.5fr 1.5fr",gap:28}}>
        {/* Brand */}
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:38,height:38,borderRadius:10,background:`linear-gradient(135deg,${C.red},${C.redB})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:18,color:"#fff",boxShadow:`0 0 12px #c91a1a30`}}>T</div>
            <div>
              <div style={{fontSize:12,fontWeight:900,color:C.text,textTransform:"uppercase",letterSpacing:0.5}}>Thiên Minh Group</div>
              <div style={{fontSize:8,color:C.red,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"}}>DEKTON® Official Partner</div>
            </div>
          </div>
          <div style={{fontSize:11,color:C.muted,lineHeight:1.8,marginBottom:12}}>Phân phối độc quyền DEKTON® Professional Tools tại Việt Nam. Chuyên cung cấp công cụ điện chuyên nghiệp chất lượng cao.</div>
          <div style={{display:"flex",gap:8}}>
            {["🏪 Cửa Hàng","🛡 Chính Hãng","🚚 Giao Nhanh"].map(t=><span key={t} style={{fontSize:9,color:C.mutedL,background:C.border,borderRadius:4,padding:"2px 7px"}}>{t}</span>)}
          </div>
        </div>
        {/* Hotline */}
        <div>
          <div style={{fontSize:10,color:C.red,fontWeight:800,marginBottom:12,textTransform:"uppercase",letterSpacing:1,display:"flex",alignItems:"center",gap:6}}><span style={{width:16,height:2,background:C.red,display:"inline-block"}}/>Hotline</div>
          {[["0909.41.81.51","Kinh doanh"],["0909.858.011","Hỗ trợ KH"],["0937.858.011","Kỹ thuật"]].map(([num,role])=>(
            <div key={num} style={{marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:800,color:C.text,fontFamily:"monospace",letterSpacing:0.5}}>📱 {num}</div>
              <div style={{fontSize:9,color:C.muted,marginTop:1}}>{role}</div>
            </div>
          ))}
        </div>
        {/* Address */}
        <div>
          <div style={{fontSize:10,color:C.red,fontWeight:800,marginBottom:12,textTransform:"uppercase",letterSpacing:1,display:"flex",alignItems:"center",gap:6}}><span style={{width:16,height:2,background:C.red,display:"inline-block"}}/>Địa chỉ</div>
          <div style={{fontSize:11,color:C.mutedL,lineHeight:2}}>
            <div>📍 108 Võ Văn Kiệt</div>
            <div style={{paddingLeft:18}}>Phường Bến Thành</div>
            <div style={{paddingLeft:18}}>Quận 1, TP. Hồ Chí Minh</div>
            <div style={{paddingLeft:18}}>Việt Nam</div>
          </div>
        </div>
        {/* Legal */}
        <div>
          <div style={{fontSize:10,color:C.red,fontWeight:800,marginBottom:12,textTransform:"uppercase",letterSpacing:1,display:"flex",alignItems:"center",gap:6}}><span style={{width:16,height:2,background:C.red,display:"inline-block"}}/>Doanh nghiệp</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {[
              {l:"Tên VN",v:"Công Ty TNHH Việt Nam Thiên Minh Group"},
              {l:"Tên EN",v:"Thien Minh Viet Nam Group Co., Ltd"},
              {l:"MST",v:"0319414767"},
              {l:"Người đại diện",v:"Minh Hiền Dekton"},
            ].map(({l,v})=>(
              <div key={l}>
                <div style={{fontSize:8,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.6,marginBottom:1}}>{l}</div>
                <div style={{fontSize:10,color:C.mutedL,lineHeight:1.4}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Bottom bar */}
      <div style={{borderTop:`1px solid ${C.border}`,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",maxWidth:1400,margin:"0 auto"}}>
        <div style={{fontSize:9,color:C.muted}}>© 2024–2026 Thiên Minh Group · MST: 0319414767 · All rights reserved</div>
        <div style={{display:"flex",gap:12,fontSize:9,color:C.muted}}>
          <span>Chính sách bảo mật</span><span>·</span><span>Điều khoản sử dụng</span><span>·</span><span>Bảo hành & Đổi trả</span>
        </div>
      </div>
    </footer>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────
export default function App(){
  const [products,setProducts]=useState(INIT_P);
  const [orders,setOrders]=useState([]);
  const [customers,setCustomers]=useState([]);
  const [banners,setBanners]=useState(INIT_BANNERS);
  const [view,setView]=useState("store");
  const [isAdmin,setIsAdmin]=useState(false);
  const [bannerEditMode,setBannerEditMode]=useState(false);
  const [showLogin,setShowLogin]=useState(false);
  const [chatProd,setChatProd]=useState(null);
  const [editProd,setEditProd]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [selCat,setSelCat]=useState(null);
  const [selSub,setSelSub]=useState(null);
  const [search,setSearch]=useState("");

  const shown=products.filter(p=>{
    const mc=!selCat||p.cat===selCat;const ms=!selSub||p.subcat===selSub;
    const mq=!search||p.name.toLowerCase().includes(search.toLowerCase())||p.sku.toLowerCase().includes(search.toLowerCase());
    return mc&&ms&&mq;
  });

  const handleOrder=useCallback(async(od)=>{
    const order={...od,id:`TMG-${Date.now()}`,status:"Mới",date:new Date().toLocaleDateString("vi-VN")};
    setOrders(o=>[order,...o]);
    setCustomers(cs=>{const ex=cs.find(c=>c.phone===od.phone);if(ex)return cs.map(c=>c.phone===od.phone?{...c,orders:c.orders+1,total:c.total+od.total,lastOrder:order.date}:c);return[{id:_uid++,name:od.name,phone:od.phone,address:od.address,orders:1,total:od.total,since:order.date,lastOrder:order.date},...cs];});
    setProducts(ps=>ps.map(p=>p.id===od.product.id?{...p,stock:Math.max(0,p.stock-od.qty)}:p));
    return order;
  },[]);

  const saveProd=p=>{if(p.id)setProducts(ps=>ps.map(x=>x.id===p.id?p:x));else setProducts(ps=>[...ps,{...p,id:_uid++}]);setEditProd(null);setShowAdd(false);};

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"system-ui,sans-serif",position:"relative"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}select option{background:#0e0e16}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#2c1010;border-radius:99px}input:focus,textarea:focus,select:focus{border-color:${C.red}!important;outline:none}@keyframes tmgB{0%,100%{transform:translateY(0);opacity:0.5}50%{transform:translateY(-5px);opacity:1}}button{transition:all 0.15s}`}</style>
      <Watermark/>

      {/* ── HEADER ── */}
      <header style={{background:`${C.surface}ee`,backdropFilter:"blur(10px)",borderBottom:`1px solid ${C.borderRed}`,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 20px #00000060"}}>
        <div style={{maxWidth:1400,margin:"0 auto",padding:"0 20px",height:56,display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:9,flexShrink:0}}>
            <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#c91a1a,#8a0808)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,color:"#fff",boxShadow:"0 0 10px #c91a1a35"}}>T</div>
            <div><div style={{fontSize:11,fontWeight:900,color:C.text,letterSpacing:0.5,textTransform:"uppercase"}}>Thiên Minh Group</div><div style={{fontSize:8,color:C.red,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"}}>DEKTON® Official</div></div>
          </div>
          <div style={{flex:1,maxWidth:340,position:"relative"}}>
            <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:11,color:C.muted}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm sản phẩm, SKU..."
              style={{width:"100%",background:C.card,border:`1px solid ${C.borderRed}`,borderRadius:8,padding:"6px 10px 6px 28px",color:C.text,fontSize:11,outline:"none"}}/>
          </div>
          <div style={{flex:1}}/>
          <div style={{display:"flex",gap:3,background:C.bg,borderRadius:9,padding:3}}>
            <button onClick={()=>{setView("store");setBannerEditMode(false);}} style={{padding:"5px 12px",borderRadius:6,border:"none",background:view==="store"&&!bannerEditMode?C.card:"transparent",color:view==="store"&&!bannerEditMode?C.redB:C.muted,fontWeight:view==="store"&&!bannerEditMode?700:400,fontSize:10,cursor:"pointer"}}>🏪 Cửa hàng</button>
            {isAdmin&&<>
              <button onClick={()=>{setView("store");setBannerEditMode(!bannerEditMode);}} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${bannerEditMode?"#f5a62340":"transparent"}`,background:bannerEditMode?"#f5a62315":"transparent",color:bannerEditMode?"#f5a623":C.muted,fontWeight:bannerEditMode?700:400,fontSize:10,cursor:"pointer"}}>🖼 Banner</button>
              <button onClick={()=>setView("admin")} style={{padding:"5px 11px",borderRadius:6,border:"none",background:view==="admin"?C.card:"transparent",color:view==="admin"?C.redB:C.muted,fontWeight:view==="admin"?700:400,fontSize:10,cursor:"pointer"}}>⚙️ SP</button>
              <button onClick={()=>setView("orders")} style={{padding:"5px 11px",borderRadius:6,border:"none",background:view==="orders"?C.card:"transparent",color:view==="orders"?C.redB:C.muted,fontWeight:view==="orders"?700:400,fontSize:10,cursor:"pointer"}}>📦 {orders.length}</button>
              <button onClick={()=>setView("customers")} style={{padding:"5px 11px",borderRadius:6,border:"none",background:view==="customers"?C.card:"transparent",color:view==="customers"?C.redB:C.muted,fontWeight:view==="customers"?700:400,fontSize:10,cursor:"pointer"}}>👥 {customers.length}</button>
              <button onClick={()=>{setIsAdmin(false);setBannerEditMode(false);setView("store");}} style={{padding:"5px 9px",borderRadius:6,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:10,cursor:"pointer"}}>Thoát</button>
            </>}
            {!isAdmin&&<button onClick={()=>setShowLogin(true)} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${C.borderRed}`,background:"transparent",color:C.redB,fontWeight:600,fontSize:10,cursor:"pointer"}}>🔐 Đăng nhập</button>}
          </div>
        </div>
        {bannerEditMode&&<div style={{background:"#f5a62312",borderTop:"1px solid #f5a62325",padding:"6px 20px",fontSize:10,color:"#f5a623",fontWeight:700,display:"flex",alignItems:"center",gap:8}}><span>✏️ Chế độ chỉnh sửa Banner — Click vào banner để chỉnh ảnh, text, opacity, kích thước</span><button onClick={()=>setBannerEditMode(false)} style={{marginLeft:"auto",background:"transparent",border:"1px solid #f5a62340",borderRadius:5,padding:"3px 10px",color:"#f5a623",fontSize:9,cursor:"pointer",fontWeight:700}}>Xong ✓</button></div>}
      </header>

      <main style={{maxWidth:1400,margin:"0 auto",padding:"20px 20px 0",position:"relative",zIndex:1}}>
        {/* ═══ STORE ═══ */}
        {view==="store"&&(
          <>
            <BannerSection banners={banners} setBanners={setBanners} editMode={bannerEditMode}/>
            <div style={{display:"flex",gap:0,alignItems:"flex-start",marginTop:4}}>
              <CatSidebar products={products} selCat={selCat} selSub={selSub} onSelect={(c,s)=>{setSelCat(c);setSelSub(s);setSearch("");}}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:12,fontSize:10,color:C.muted}}>
                  <span onClick={()=>{setSelCat(null);setSelSub(null);}} style={{cursor:"pointer",color:C.redB}}>Tất cả</span>
                  {selCat&&<><span>›</span><span onClick={()=>setSelSub(null)} style={{cursor:"pointer",color:selSub?C.redB:C.text,fontWeight:selSub?400:700}}>{selCat}</span></>}
                  {selSub&&<><span>›</span><span style={{color:C.text,fontWeight:700}}>{selSub}</span></>}
                  <span style={{color:C.muted}}>({shown.length} sản phẩm)</span>
                </div>
                {shown.length===0
                  ?<div style={{textAlign:"center",padding:50,color:C.muted,background:C.card,borderRadius:12,border:`1px dashed ${C.border}`}}><div style={{fontSize:36,marginBottom:8,opacity:0.15}}>🔍</div><div>Không tìm thấy sản phẩm</div></div>
                  :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(215px,1fr))",gap:12}}>
                    {shown.map(p=><ProdCard key={p.id} p={p} onOrder={setChatProd} isAdmin={false}/>)}
                  </div>
                }
              </div>
            </div>
          </>
        )}

        {/* ═══ ADMIN ═══ */}
        {view==="admin"&&isAdmin&&(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><div><h2 style={{fontSize:17,fontWeight:900,color:C.text}}>⚙️ Quản lý sản phẩm</h2><div style={{fontSize:10,color:C.muted,marginTop:1}}>{products.length} sản phẩm</div></div><button onClick={()=>setShowAdd(true)} style={{background:`linear-gradient(135deg,${C.red},${C.redB})`,border:"none",borderRadius:8,padding:"8px 18px",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer"}}>+ Thêm SP</button></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(215px,1fr))",gap:12}}>
              {products.map(p=><ProdCard key={p.id} p={p} isAdmin onEdit={setEditProd} onDelete={id=>setProducts(ps=>ps.filter(x=>x.id!==id))}/>)}
            </div>
          </>
        )}

        {/* ═══ ORDERS ═══ */}
        {view==="orders"&&isAdmin&&(
          <>
            <h2 style={{fontSize:17,fontWeight:900,color:C.text,marginBottom:14}}>📦 Đơn hàng ({orders.length})</h2>
            {orders.length===0?<div style={{textAlign:"center",padding:50,color:C.muted,background:C.card,borderRadius:12,border:`1px dashed ${C.border}`}}><div style={{fontSize:36,marginBottom:8,opacity:0.15}}>📦</div><div>Chưa có đơn</div></div>
              :<div style={{background:C.card,border:`1px solid ${C.borderRed}`,borderRadius:12,overflow:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}><thead><tr style={{background:C.surface,borderBottom:`1px solid ${C.border}`}}>{["Mã ĐH","Sản phẩm","Nhóm","Khách","SĐT","Địa chỉ","SL","Tổng","Ngày","Trạng thái"].map(h=><th key={h} style={{padding:"9px 11px",textAlign:"left",fontSize:8,color:C.muted,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead><tbody>
                {orders.map((o,i)=>(<tr key={o.id} style={{borderBottom:i<orders.length-1?`1px solid ${C.border}`:"none"}}>
                  <td style={{padding:"10px 11px",fontSize:9,color:C.gold,fontFamily:"monospace",fontWeight:700}}>{o.id}</td>
                  <td style={{padding:"10px 11px",fontSize:10,color:C.text,maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.product.name}</td>
                  <td style={{padding:"10px 11px",fontSize:9,color:CATS[o.product.cat]?.color||C.muted}}>{o.product.subcat}</td>
                  <td style={{padding:"10px 11px",fontSize:11,fontWeight:600,color:C.text,whiteSpace:"nowrap"}}>{o.name}</td>
                  <td style={{padding:"10px 11px",fontSize:10,color:C.mutedL,fontFamily:"monospace"}}>{o.phone}</td>
                  <td style={{padding:"10px 11px",fontSize:9,color:C.muted,maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.address}</td>
                  <td style={{padding:"10px 11px",fontSize:11,fontWeight:700,textAlign:"center"}}>{o.qty}</td>
                  <td style={{padding:"10px 11px",fontSize:11,color:C.gold,fontFamily:"monospace",fontWeight:700,whiteSpace:"nowrap"}}>{fmtV(o.total)}</td>
                  <td style={{padding:"10px 11px",fontSize:9,color:C.muted}}>{o.date}</td>
                  <td style={{padding:"10px 11px"}}><select value={o.status} onChange={e=>setOrders(os=>os.map(x=>x.id===o.id?{...x,status:e.target.value}:x))} style={{background:o.status==="Đã giao"?C.greenDim:o.status==="Đang giao"?C.blueDim:C.redDim,border:"none",borderRadius:4,color:o.status==="Đã giao"?C.green:o.status==="Đang giao"?C.blue:C.redB,fontSize:8,fontWeight:700,padding:"2px 6px",cursor:"pointer",outline:"none"}}>{["Mới","Xác nhận","Đang giao","Đã giao","Huỷ"].map(s=><option key={s}>{s}</option>)}</select></td>
                </tr>))}
              </tbody></table></div>}
          </>
        )}

        {/* ═══ CUSTOMERS ═══ */}
        {view==="customers"&&isAdmin&&(
          <>
            <h2 style={{fontSize:17,fontWeight:900,color:C.text,marginBottom:14}}>👥 Tệp khách hàng ({customers.length})</h2>
            {customers.length===0?<div style={{textAlign:"center",padding:50,color:C.muted,background:C.card,borderRadius:12,border:`1px dashed ${C.border}`}}><div style={{fontSize:36,marginBottom:8,opacity:0.15}}>👥</div><div>Tự động lưu từ AI chat</div></div>
              :<div style={{background:C.card,border:`1px solid ${C.borderRed}`,borderRadius:12,overflow:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{background:C.surface,borderBottom:`1px solid ${C.border}`}}>{["Khách hàng","SĐT","Địa chỉ","Đơn","Tổng chi","Từ","Lần cuối"].map(h=><th key={h} style={{padding:"9px 13px",textAlign:"left",fontSize:8,color:C.muted,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase"}}>{h}</th>)}</tr></thead><tbody>
                {customers.map((c,i)=>(<tr key={c.id} style={{borderBottom:i<customers.length-1?`1px solid ${C.border}`:"none"}}>
                  <td style={{padding:"11px 13px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:"50%",background:C.redDim,border:`1px solid ${C.borderRed}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:C.redB,flexShrink:0}}>{c.name.charAt(0)}</div><span style={{fontSize:12,fontWeight:700,color:C.text}}>{c.name}</span></div></td>
                  <td style={{padding:"11px 13px",fontSize:10,color:C.mutedL,fontFamily:"monospace"}}>{c.phone}</td>
                  <td style={{padding:"11px 13px",fontSize:9,color:C.muted,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.address}</td>
                  <td style={{padding:"11px 13px",textAlign:"center"}}><span style={{background:C.blueDim,color:C.blue,borderRadius:99,padding:"2px 9px",fontSize:10,fontWeight:700}}>{c.orders}</span></td>
                  <td style={{padding:"11px 13px",fontSize:12,color:C.gold,fontFamily:"monospace",fontWeight:700}}>{fmtV(c.total)}</td>
                  <td style={{padding:"11px 13px",fontSize:9,color:C.muted}}>{c.since}</td>
                  <td style={{padding:"11px 13px",fontSize:9,color:C.mutedL}}>{c.lastOrder}</td>
                </tr>))}
              </tbody></table></div>}
          </>
        )}
      </main>

      <Footer/>

      {/* ── MODALS ── */}
      {showLogin&&<LoginModal onLogin={()=>{setIsAdmin(true);setShowLogin(false);setView("admin");}} onClose={()=>setShowLogin(false)}/>}
      {chatProd&&<OrderChat product={chatProd} onClose={()=>setChatProd(null)} onOrderPlaced={handleOrder}/>}
      {(showAdd||editProd)&&<ProdModal prod={editProd} onSave={saveProd} onClose={()=>{setEditProd(null);setShowAdd(false);}}/>}
    </div>
  );
}
