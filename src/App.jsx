import { useState, useRef, useCallback, useEffect } from "react";

// ── COLORS ───────────────────────────────────────────────────────
const C={bg:"#05050a",surface:"#09090f",card:"#0e0e16",border:"#181028",borderRed:"#2c1010",red:"#c91a1a",redB:"#e53030",redDim:"#c91a1a15",gold:"#c8920e",goldDim:"#c8920e15",green:"#22c55e",greenDim:"#22c55e15",blue:"#3b82f6",blueDim:"#3b82f615",purple:"#9333ea",text:"#eceef8",muted:"#5a5272",mutedL:"#8a82a0"};

// ── CONFIG ────────────────────────────────────────────────────────
const TG_TOKEN="8966525578:AAH62aZrvqphdGaYMiOipQ_RJNwStasc_6E";
const TG_CHAT="968664794";
const fmtV=n=>new Intl.NumberFormat("vi-VN").format(n)+"đ";
let _uid=1000;

async function sendTG(text){
  try{
    const r=await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:TG_CHAT,text,parse_mode:"HTML"})});
    return(await r.json()).ok;
  }catch(e){console.log("TG err:",e);return false;}
}

async function callAI(messages,sys){
  const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,system:sys,messages})});
  const d=await r.json();
  return d.content?.[0]?.text||"Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!";
}

// ── DATA ─────────────────────────────────────────────────────────
const CAT_COL={"Máy khoan":C.blue,"Máy nén khí":C.gold,"Máy cắt":C.red,"Máy rửa xe":C.green,"Máy siết":C.purple,"Máy mài":C.gold,"Khác":C.muted};
const CAT_ICO={"Máy khoan":"🔧","Máy nén khí":"💨","Máy cắt":"⚡","Máy rửa xe":"💧","Máy siết":"🔩","Máy mài":"⚙️","Khác":"📦"};

const INIT_P=[
  {id:1,name:"Máy Khoan 3 Chức Năng DEKTON M21-RH2603C",price:1250000,orig:1500000,desc:"Brushless · 3.2J · 0-900RPM · Pin 18V. Khoan bê tông, gỗ, kim loại cực kỳ đa dụng.",stock:45,sku:"M21-RH2603C",cat:"Máy khoan",img:null,hot:true},
  {id:2,name:"Máy Nén Khí Không Dầu DK-AC2918X",price:3200000,orig:3800000,desc:"1.1HP · 800W · Bình 18L · Không dầu, sạch. Sơn phun, bơm lốp xe chuyên nghiệp.",stock:12,sku:"DK-AC2918X",cat:"Máy nén khí",img:null,hot:true},
  {id:3,name:"Máy Cắt Sắt DEKTON DK-CS2400XPRO",price:2150000,orig:2500000,desc:"355mm · 2400W · Xanh Olive. Cắt thép nhanh, lưỡi cắt siêu bền.",stock:8,sku:"DK-CS2400XPRO",cat:"Máy cắt",img:null,hot:false},
  {id:4,name:"Máy Rửa Áp Lực DK-CWR2200PRO",price:890000,orig:1100000,desc:"790W · 6L/phút · 120bar. Rửa xe, sân nhà, tường nhanh chóng.",stock:30,sku:"DK-CWR2200PRO",cat:"Máy rửa xe",img:null,hot:true},
  {id:5,name:"Máy Siết Bulong 555Nm M21-IW555PLUS",price:2800000,orig:3200000,desc:"Brushless · 555Nm · Pin 21V. Siết bu-lông, ốc vít mạnh như kẹp vít.",stock:20,sku:"M21-IW555PLUS",cat:"Máy siết",img:null,hot:true},
  {id:6,name:"Máy Rửa Xe Mini DK-CWR2200XMAX",price:1350000,orig:1600000,desc:"790W · 6L/phút · Có chỉnh áp. Dùng gia đình tiện lợi, gọn nhẹ.",stock:25,sku:"DK-CWR2200XMAX",cat:"Máy rửa xe",img:null,hot:false},
];

// ── HELPERS ───────────────────────────────────────────────────────
function PBar({val,color=C.red,h=4}){
  return <div style={{background:C.border,borderRadius:99,height:h,overflow:"hidden"}}><div style={{width:`${Math.max(0,Math.min(100,val))}%`,height:"100%",background:color,borderRadius:99,transition:"width 0.4s"}}/></div>;
}

// ── PRODUCT CARD ─────────────────────────────────────────────────
function ProdCard({p,onOrder,isAdmin,onEdit,onDelete}){
  const disc=p.orig&&p.orig>p.price?Math.round((1-p.price/p.orig)*100):0;
  const col=CAT_COL[p.cat]||C.red;
  const [hov,setHov]=useState(false);
  return(
    <div style={{background:C.card,border:`1px solid ${hov?"#3a1515":C.borderRed}`,borderRadius:14,overflow:"hidden",display:"flex",flexDirection:"column",transition:"all 0.2s",transform:hov?"translateY(-3px)":"none",boxShadow:hov?`0 8px 30px ${col}15`:""}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      
      {/* Image area */}
      <div style={{height:190,position:"relative",overflow:"hidden",background:`linear-gradient(135deg,${col}18 0%,${col}06 100%,#050508 100%)`}}>
        {p.img
          ?<img src={p.img} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          :<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
            <div style={{fontSize:52,opacity:0.25}}>{CAT_ICO[p.cat]||"📦"}</div>
            <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>DEKTON® Professional</div>
          </div>
        }
        {/* Badges */}
        <div style={{position:"absolute",top:10,left:10,display:"flex",flexDirection:"column",gap:4}}>
          {p.hot&&<span style={{background:"linear-gradient(135deg,#e53030,#991111)",color:"#fff",fontSize:9,fontWeight:800,padding:"3px 9px",borderRadius:99,letterSpacing:0.5,display:"inline-flex",alignItems:"center",gap:3}}>🔥 HOT</span>}
          {disc>0&&<span style={{background:C.gold,color:"#000",fontSize:9,fontWeight:800,padding:"3px 9px",borderRadius:99}}>-{disc}%</span>}
        </div>
        {p.stock>0&&p.stock<=5&&<div style={{position:"absolute",bottom:8,right:8,background:"rgba(229,53,53,0.9)",borderRadius:99,padding:"2px 8px",fontSize:9,fontWeight:700,color:"#fff"}}>⚠ Còn {p.stock}</div>}
        {p.stock===0&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{background:"#e53535",color:"#fff",padding:"8px 20px",borderRadius:10,fontSize:13,fontWeight:800,letterSpacing:0.5}}>HẾT HÀNG</span></div>}
      </div>

      {/* Content */}
      <div style={{padding:16,flex:1,display:"flex",flexDirection:"column",gap:7}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:9,fontWeight:700,color:col,background:`${col}15`,padding:"2px 8px",borderRadius:4,letterSpacing:0.3}}>{p.cat}</span>
          <span style={{fontSize:9,color:C.muted,fontFamily:"monospace"}}>{p.sku}</span>
        </div>
        <div style={{fontSize:13,fontWeight:700,color:C.text,lineHeight:1.35}}>{p.name}</div>
        <div style={{fontSize:11,color:C.muted,lineHeight:1.45,flex:1}}>{p.desc}</div>
        
        {/* Price */}
        <div style={{display:"flex",alignItems:"baseline",gap:8,paddingTop:4}}>
          <span style={{fontSize:20,fontWeight:900,color:C.gold,fontFamily:"monospace",letterSpacing:-0.5}}>{fmtV(p.price)}</span>
          {p.orig&&p.orig>p.price&&<span style={{fontSize:11,color:C.muted,textDecoration:"line-through"}}>{fmtV(p.orig)}</span>}
        </div>

        {/* Stock */}
        <div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,marginBottom:3}}>
            <span style={{color:C.muted}}>Tồn kho</span>
            <span style={{color:p.stock>10?C.green:p.stock>0?C.gold:C.red,fontWeight:700}}>{p.stock} cái</span>
          </div>
          <PBar val={p.stock/50*100} color={p.stock>10?C.green:p.stock>0?C.gold:C.red}/>
        </div>

        {/* Buttons */}
        {isAdmin
          ?<div style={{display:"flex",gap:6}}>
            <button onClick={()=>onEdit(p)} style={{flex:1,background:C.blueDim,border:`1px solid ${C.blue}25`,borderRadius:7,padding:"7px",color:C.blue,fontWeight:700,fontSize:11,cursor:"pointer"}}>✏ Sửa</button>
            <button onClick={()=>onDelete(p.id)} style={{background:C.redDim,border:`1px solid ${C.borderRed}`,borderRadius:7,padding:"7px 12px",color:C.redB,fontWeight:700,fontSize:11,cursor:"pointer"}}>🗑</button>
          </div>
          :<button onClick={()=>p.stock>0&&onOrder(p)} disabled={p.stock===0}
            style={{background:p.stock>0?`linear-gradient(135deg,${C.red},${C.redB})`:"#1a1a22",border:`1px solid ${p.stock>0?C.borderRed:"#222"}`,borderRadius:9,padding:"10px",color:p.stock>0?"#fff":"#444",fontWeight:700,fontSize:12,cursor:p.stock>0?"pointer":"not-allowed",boxShadow:p.stock>0&&hov?`0 4px 18px ${C.redDim}`:""}}>
            {p.stock>0?"🛒 Đặt hàng ngay →":"Hết hàng"}
          </button>
        }
      </div>
    </div>
  );
}

// ── ADD/EDIT PRODUCT MODAL ────────────────────────────────────────
function ProdModal({prod,onSave,onClose}){
  const init=prod||{name:"",price:0,orig:0,desc:"",sku:"",cat:"Máy khoan",stock:0,img:null,hot:false};
  const [f,setF]=useState(init);
  const imgRef=useRef();
  const upd=(k,v)=>setF(x=>({...x,[k]:v}));
  const handleImg=e=>{
    const file=e.target.files[0];if(!file)return;
    const r=new FileReader();r.onload=ev=>upd("img",ev.target.result);r.readAsDataURL(file);
  };
  const I=({lbl,k,type="text"})=>(
    <div>
      <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:3,textTransform:"uppercase",letterSpacing:0.8}}>{lbl}</div>
      <input type={type} value={f[k]||""} onChange={e=>upd(k,type==="number"?Number(e.target.value):e.target.value)}
        style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 10px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
  return(
    <div style={{position:"fixed",inset:0,background:"#000000aa",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.borderRed}`,borderRadius:18,width:540,maxHeight:"92vh",overflow:"auto",padding:28}} onClick={e=>e.stopPropagation()}>
        <div style={{fontWeight:900,fontSize:16,color:C.text,marginBottom:20}}>{prod?"✏️ Sửa sản phẩm":"➕ Thêm sản phẩm mới"}</div>

        {/* Image upload zone */}
        <div onClick={()=>imgRef.current.click()} style={{height:130,border:`2px dashed ${f.img?"transparent":C.borderRed}`,borderRadius:12,marginBottom:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",background:f.img?"transparent":C.surface,position:"relative"}}>
          <input ref={imgRef} type="file" accept="image/*" onChange={handleImg} style={{display:"none"}}/>
          {f.img
            ?<img src={f.img} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            :<div style={{textAlign:"center",pointerEvents:"none"}}>
              <div style={{fontSize:32,opacity:0.25,marginBottom:6}}>📷</div>
              <div style={{fontSize:12,color:C.muted,fontWeight:600}}>Click để upload ảnh sản phẩm</div>
              <div style={{fontSize:10,color:C.muted,marginTop:2}}>JPG, PNG, WEBP</div>
            </div>
          }
          {f.img&&<div style={{position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,0.7)",borderRadius:6,padding:"3px 8px",fontSize:9,color:"#fff",cursor:"pointer"}}>🔄 Thay ảnh</div>}
        </div>

        <div style={{display:"grid",gap:10}}>
          <I lbl="Tên sản phẩm" k="name"/>
          <I lbl="Mô tả ngắn" k="desc"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <I lbl="Giá bán (đ)" k="price" type="number"/>
            <I lbl="Giá gốc (đ)" k="orig" type="number"/>
            <I lbl="Tồn kho" k="stock" type="number"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <I lbl="SKU / Mã hàng" k="sku"/>
            <div>
              <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:3,textTransform:"uppercase",letterSpacing:0.8}}>Danh mục</div>
              <select value={f.cat} onChange={e=>upd("cat",e.target.value)} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 10px",color:C.text,fontSize:12,outline:"none"}}>
                {Object.keys(CAT_COL).map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"10px 12px",background:C.surface,borderRadius:8,border:`1px solid ${C.border}`}}>
            <input type="checkbox" checked={f.hot||false} onChange={e=>upd("hot",e.target.checked)} style={{accentColor:C.red,width:14,height:14}}/>
            <span style={{fontSize:12,color:C.text}}>🔥 Đánh dấu sản phẩm <b style={{color:C.redB}}>HOT</b></span>
          </label>
        </div>
        <div style={{display:"flex",gap:8,marginTop:18}}>
          <button onClick={()=>onSave(f)} style={{flex:2,background:`linear-gradient(135deg,${C.red},${C.redB})`,border:"none",borderRadius:9,padding:"11px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>💾 Lưu sản phẩm</button>
          <button onClick={onClose} style={{flex:1,background:"transparent",border:`1px solid ${C.border}`,borderRadius:9,padding:"11px",color:C.muted,fontSize:13,cursor:"pointer"}}>Huỷ</button>
        </div>
      </div>
    </div>
  );
}

// ── AI ORDER CHAT ─────────────────────────────────────────────────
function OrderChat({product,onClose,onOrderPlaced}){
  const [msgs,setMsgs]=useState([]);
  const [input,setInput]=useState("");
  const [busy,setBusy]=useState(false);
  const [done,setDone]=useState(null);
  const [tgStatus,setTgStatus]=useState(null);
  const endRef=useRef();
  const inputRef=useRef();

  const SYS=`Bạn là nhân viên tư vấn bán hàng AI của THIÊN MINH GROUP — nhà phân phối độc quyền DEKTON® Professional Tools tại Việt Nam.

THÔNG TIN SẢN PHẨM KHÁCH QUAN TÂM:
- Tên: ${product.name}
- Giá: ${fmtV(product.price)}${product.orig>product.price?" (giảm từ "+fmtV(product.orig)+")":""}
- SKU: ${product.sku}
- Mô tả: ${product.desc}
- Tồn kho: ${product.stock} cái

NHIỆM VỤ: Thu thập đủ 4 thông tin để hoàn tất đơn:
1. ✅ Họ tên đầy đủ
2. ✅ Số điện thoại (10 số)
3. ✅ Địa chỉ giao hàng chi tiết (số nhà + đường + phường + quận + tỉnh/thành)
4. ✅ Số lượng muốn mua

Khi đã có ĐỦ 4 thông tin + khách XÁC NHẬN → CUỐI tin nhắn ghi CHÍNH XÁC:
[ORDER_JSON]{"name":"họ tên","phone":"số điện thoại","address":"địa chỉ đầy đủ","qty":số_lượng}[/ORDER_JSON]

PHONG CÁCH: Thân thiện, chuyên nghiệp, tiếng Việt. Hỏi từng thông tin một. Tóm tắt đơn hàng trước khi xác nhận. KHÔNG được bịa đặt thông tin của khách.`;

  useEffect(()=>{
    (async()=>{
      setBusy(true);
      const txt=await callAI([{role:"user",content:"Xin chào, tôi muốn đặt mua sản phẩm này."}],SYS);
      setMsgs([{role:"assistant",content:txt}]);
      setBusy(false);
      setTimeout(()=>inputRef.current?.focus(),100);
    })();
  },[]);

  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[msgs,busy]);

  const send=async()=>{
    const txt=input.trim();
    if(!txt||busy||done)return;
    const um={role:"user",content:txt};
    const hist=[...msgs,um];
    setMsgs(hist);setInput("");setBusy(true);

    const reply=await callAI(hist.map(m=>({role:m.role,content:m.content})),SYS);
    const nm=[...hist,{role:"assistant",content:reply}];
    setMsgs(nm);setBusy(false);

    // Detect order completion
    const m=reply.match(/\[ORDER_JSON\]([\s\S]*?)\[\/ORDER_JSON\]/);
    if(m){
      try{
        const od=JSON.parse(m[1].trim());
        setDone(od);
        const order=await onOrderPlaced({...od,product,total:product.price*od.qty});
        // Send Telegram
        const tgMsg=`🛒 <b>ĐƠN HÀNG MỚI!</b> #${order.id}

📦 <b>${product.name}</b>
   SKU: ${product.sku} · SL: ${od.qty} · Giá: ${fmtV(product.price*od.qty)}

👤 <b>${od.name}</b>
📱 ${od.phone}
📍 ${od.address}

💰 <b>Tổng: ${fmtV(product.price*od.qty)}</b>
🕐 ${new Date().toLocaleString("vi-VN")}

<i>via tmg.thienminhgroup.net · AI Order Bot</i>`;
        const ok=await sendTG(tgMsg);
        setTgStatus(ok);
      }catch(e){console.log("Order parse err:",e);}
    }
  };

  const clean=t=>t.replace(/\[ORDER_JSON\][\s\S]*?\[\/ORDER_JSON\]/g,"").trim();

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:2000,display:"flex",alignItems:"flex-end",justifyContent:"flex-end",padding:24}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.borderRed}`,borderRadius:18,width:420,maxHeight:620,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:`0 20px 60px ${C.redDim}`}} onClick={e=>e.stopPropagation()}>
        
        {/* Header */}
        <div style={{padding:"14px 18px",background:"linear-gradient(135deg,#150404,#0e0e16)",borderBottom:`1px solid ${C.borderRed}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{width:38,height:38,borderRadius:"50%",background:`linear-gradient(135deg,${C.red},${C.redB})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🤖</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:13,color:C.text}}>AI Tư Vấn Đặt Hàng</div>
            <div style={{fontSize:10,color:C.green,display:"flex",alignItems:"center",gap:4}}><span style={{width:5,height:5,borderRadius:"50%",background:C.green,display:"inline-block"}}/>Đang hoạt động · THIÊN MINH GROUP</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22,lineHeight:1,padding:0}}>×</button>
        </div>

        {/* Product strip */}
        <div style={{padding:"10px 16px",background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",gap:10,alignItems:"center",flexShrink:0}}>
          <div style={{width:42,height:42,borderRadius:8,background:`${CAT_COL[product.cat]||C.red}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>
            {product.img?<img src={product.img} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:8}}/> : CAT_ICO[product.cat]||"📦"}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:11,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{product.name}</div>
            <div style={{fontSize:14,fontWeight:900,color:C.gold,fontFamily:"monospace"}}>{fmtV(product.price)}</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{flex:1,overflow:"auto",padding:14,display:"flex",flexDirection:"column",gap:10}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
              {m.role==="assistant"&&<div style={{width:26,height:26,borderRadius:"50%",background:C.redDim,border:`1px solid ${C.borderRed}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,marginRight:6,flexShrink:0,alignSelf:"flex-end"}}>🤖</div>}
              <div style={{maxWidth:"80%",padding:"10px 14px",borderRadius:14,fontSize:12,lineHeight:1.6,whiteSpace:"pre-wrap",
                background:m.role==="user"?`linear-gradient(135deg,${C.red},${C.redB})`:C.surface,
                color:C.text,border:m.role==="assistant"?`1px solid ${C.borderRed}`:"none",
                borderBottomRightRadius:m.role==="user"?2:14,
                borderBottomLeftRadius:m.role==="assistant"?2:14,
              }}>{clean(m.content)}</div>
            </div>
          ))}
          {busy&&(
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:C.redDim,border:`1px solid ${C.borderRed}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>🤖</div>
              <div style={{padding:"10px 14px",background:C.surface,border:`1px solid ${C.borderRed}`,borderRadius:14,borderBottomLeftRadius:2,display:"flex",gap:4,alignItems:"center"}}>
                {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.redB,animation:`tmgBounce 1.2s ${i*0.2}s ease-in-out infinite`}}/>)}
              </div>
            </div>
          )}
          {done&&(
            <div style={{background:C.greenDim,border:`1px solid ${C.green}30`,borderRadius:14,padding:"16px",textAlign:"center",margin:"4px 0"}}>
              <div style={{fontSize:28,marginBottom:6}}>✅</div>
              <div style={{fontSize:13,fontWeight:800,color:C.green,marginBottom:4}}>Đặt hàng thành công!</div>
              <div style={{fontSize:11,color:C.mutedL}}>
                {tgStatus===true?"📱 Đã gửi thông báo qua Telegram ✓":tgStatus===false?"⚠️ Không gửi được Telegram":"📱 Đang gửi Telegram..."}
              </div>
              <div style={{fontSize:10,color:C.muted,marginTop:6}}>Nhân viên TMG sẽ liên hệ xác nhận trong 15-30 phút</div>
            </div>
          )}
          <div ref={endRef}/>
        </div>

        {/* Input */}
        {!done&&(
          <div style={{padding:"12px 14px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0}}>
            <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
              placeholder={busy?"AI đang trả lời...":"Nhập câu trả lời của bạn..."} disabled={busy}
              style={{flex:1,background:C.surface,border:`1px solid ${C.borderRed}`,borderRadius:10,padding:"9px 12px",color:C.text,fontSize:12,outline:"none"}}/>
            <button onClick={send} disabled={busy||!input.trim()} style={{background:busy||!input.trim()?"#1a0808":`linear-gradient(135deg,${C.red},${C.redB})`,border:`1px solid ${C.borderRed}`,borderRadius:10,padding:"9px 16px",color:busy||!input.trim()?"#444":"#fff",fontWeight:700,fontSize:12,cursor:busy||!input.trim()?"not-allowed":"pointer"}}>
              →
            </button>
          </div>
        )}
        {done&&(
          <div style={{padding:"12px 14px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
            <button onClick={onClose} style={{width:"100%",background:`linear-gradient(135deg,${C.red},${C.redB})`,border:"none",borderRadius:10,padding:"10px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>Đóng ×</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────
export default function App(){
  const [products,setProducts]=useState(INIT_P);
  const [orders,setOrders]=useState([]);
  const [customers,setCustomers]=useState([]);
  const [view,setView]=useState("store");
  const [chatProd,setChatProd]=useState(null);
  const [editProd,setEditProd]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");

  const handleOrder=useCallback(async(orderData)=>{
    const order={...orderData,id:`TMG-${Date.now()}`,status:"Mới",date:new Date().toLocaleDateString("vi-VN")};
    setOrders(o=>[order,...o]);
    setCustomers(cs=>{
      const ex=cs.find(c=>c.phone===orderData.phone);
      if(ex)return cs.map(c=>c.phone===orderData.phone?{...c,orders:c.orders+1,total:c.total+orderData.total,lastOrder:order.date}:c);
      return[{id:_uid++,name:orderData.name,phone:orderData.phone,address:orderData.address,orders:1,total:orderData.total,since:order.date,lastOrder:order.date},...cs];
    });
    setProducts(ps=>ps.map(p=>p.id===orderData.product.id?{...p,stock:Math.max(0,p.stock-orderData.qty)}:p));
    return order;
  },[]);

  const saveProd=p=>{
    if(p.id)setProducts(ps=>ps.map(x=>x.id===p.id?p:x));
    else setProducts(ps=>[...ps,{...p,id:_uid++}]);
    setEditProd(null);setShowAdd(false);
  };

  const cats=["all",...[...new Set(products.map(p=>p.cat))]];
  const shown=products.filter(p=>{
    const matchCat=filter==="all"||p.cat===filter;
    const matchSearch=!search||p.name.toLowerCase().includes(search.toLowerCase())||p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat&&matchSearch;
  });

  const NAV=[{v:"store",l:"🏪 Cửa hàng"},{v:"admin",l:"⚙️ Quản lý SP"},{v:"orders",l:`📦 Đơn (${orders.length})`},{v:"customers",l:`👥 KH (${customers.length})`}];

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"system-ui,sans-serif"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        select option{background:#0e0e16}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#2c1010;border-radius:99px}
        input:focus,textarea:focus,select:focus{border-color:${C.red}!important;outline:none}
        @keyframes tmgBounce{0%,100%{transform:translateY(0);opacity:0.5}50%{transform:translateY(-5px);opacity:1}}
        button{transition:all 0.15s}
      `}</style>

      {/* ── HEADER ── */}
      <header style={{background:C.surface,borderBottom:`1px solid ${C.borderRed}`,position:"sticky",top:0,zIndex:100,boxShadow:`0 2px 20px #00000060`}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"0 20px",height:58,display:"flex",alignItems:"center",gap:14}}>
          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            <div style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,#c91a1a,#8a0808)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:17,color:"#fff",boxShadow:`0 0 12px #c91a1a40`}}>T</div>
            <div>
              <div style={{fontSize:11,fontWeight:900,color:C.text,letterSpacing:0.5,textTransform:"uppercase"}}>Thiên Minh Group</div>
              <div style={{fontSize:8,color:C.red,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"}}>DEKTON® Official</div>
            </div>
          </div>

          {/* Search (store only) */}
          {view==="store"&&(
            <div style={{flex:1,maxWidth:340,position:"relative"}}>
              <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:12,color:C.muted}}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm sản phẩm, SKU..."
                style={{width:"100%",background:C.card,border:`1px solid ${C.borderRed}`,borderRadius:9,padding:"7px 10px 7px 30px",color:C.text,fontSize:12,outline:"none"}}/>
            </div>
          )}
          <div style={{flex:1}}/>

          {/* Nav */}
          <div style={{display:"flex",gap:3,background:C.bg,borderRadius:10,padding:3}}>
            {NAV.map(n=>(
              <button key={n.v} onClick={()=>setView(n.v)} style={{padding:"6px 12px",borderRadius:7,border:"none",background:view===n.v?C.card:"transparent",color:view===n.v?C.redB:C.muted,fontWeight:view===n.v?700:400,fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}}>
                {n.l}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={{maxWidth:1280,margin:"0 auto",padding:"24px 20px"}}>

        {/* ════ STORE ════ */}
        {view==="store"&&(
          <>
            {/* Hero banner */}
            <div style={{background:"linear-gradient(135deg,#160404 0%,#0e0e18 60%,#060618 100%)",border:`1px solid ${C.borderRed}`,borderRadius:16,padding:"26px 32px",marginBottom:22,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${C.red},${C.gold},${C.green},transparent)`}}/>
              <div style={{position:"absolute",right:0,top:0,bottom:0,width:300,background:`radial-gradient(ellipse at right,${C.red}10,transparent 70%)`}}/>
              <div style={{fontSize:9,color:C.red,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Thiên Minh Group · DEKTON® Official Partner Việt Nam</div>
              <h1 style={{fontSize:26,fontWeight:900,color:C.text,letterSpacing:-0.5,marginBottom:5}}>Công Cụ Điện Chuyên Nghiệp</h1>
              <p style={{fontSize:12,color:C.mutedL,marginBottom:14}}>Phân phối độc quyền DEKTON® Professional Tools · Bảo hành chính hãng · Giao hàng toàn quốc</p>
              <div style={{display:"flex",gap:18,flexWrap:"wrap"}}>
                {["🚚 Giao toàn quốc","🛡 Bảo hành chính hãng","💬 Tư vấn AI 24/7","✅ 100% hàng chính hãng","📱 Báo đơn Telegram tức thì"].map((t,i)=>(
                  <span key={i} style={{fontSize:11,color:C.mutedL}}>{t}</span>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap",alignItems:"center"}}>
              {cats.map(c=>(
                <button key={c} onClick={()=>setFilter(c)} style={{padding:"5px 14px",borderRadius:99,border:`1px solid ${filter===c?C.red:C.border}`,background:filter===c?C.redDim:"transparent",color:filter===c?C.redB:C.muted,fontSize:11,fontWeight:filter===c?700:400,cursor:"pointer"}}>
                  {c==="all"?`Tất cả (${products.length})`:c}
                </button>
              ))}
              {shown.length!==products.length&&<span style={{fontSize:10,color:C.muted,marginLeft:4}}>{shown.length} sản phẩm</span>}
            </div>

            {/* Grid */}
            {shown.length===0
              ?<div style={{textAlign:"center",padding:60,color:C.muted}}>
                <div style={{fontSize:40,marginBottom:10,opacity:0.2}}>🔍</div>
                <div style={{fontSize:13}}>Không tìm thấy sản phẩm phù hợp</div>
              </div>
              :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:16}}>
                {shown.map(p=><ProdCard key={p.id} p={p} onOrder={setChatProd} isAdmin={false}/>)}
              </div>
            }
          </>
        )}

        {/* ════ ADMIN ════ */}
        {view==="admin"&&(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <h2 style={{fontSize:18,fontWeight:900,color:C.text}}>⚙️ Quản lý sản phẩm</h2>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>{products.length} sản phẩm · Kéo thả ảnh để thay đổi</div>
              </div>
              <button onClick={()=>setShowAdd(true)} style={{background:`linear-gradient(135deg,${C.red},${C.redB})`,border:"none",borderRadius:9,padding:"9px 20px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",boxShadow:`0 4px 14px ${C.redDim}`}}>+ Thêm sản phẩm</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:16}}>
              {products.map(p=><ProdCard key={p.id} p={p} isAdmin onEdit={setEditProd} onDelete={id=>setProducts(ps=>ps.filter(x=>x.id!==id))}/>)}
            </div>
          </>
        )}

        {/* ════ ORDERS ════ */}
        {view==="orders"&&(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <h2 style={{fontSize:18,fontWeight:900,color:C.text}}>📦 Đơn hàng</h2>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>{orders.length} đơn · Tự động gửi Telegram khi có đơn mới</div>
              </div>
              {orders.length>0&&(
                <div style={{display:"flex",gap:12,fontSize:11}}>
                  {[["Tổng đơn",orders.length,C.blue],["Doanh thu",fmtV(orders.reduce((a,o)=>a+o.total,0)),C.gold],["Đã giao",orders.filter(o=>o.status==="Đã giao").length,C.green]].map(([l,v,c])=>(
                    <div key={l} style={{background:C.card,border:`1px solid ${C.borderRed}`,borderRadius:8,padding:"8px 14px",textAlign:"center"}}>
                      <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:2,textTransform:"uppercase"}}>{l}</div>
                      <div style={{fontSize:15,fontWeight:800,color:c,fontFamily:"monospace"}}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {orders.length===0
              ?<div style={{textAlign:"center",padding:70,color:C.muted,background:C.card,borderRadius:14,border:`1px dashed ${C.border}`}}>
                <div style={{fontSize:48,marginBottom:10,opacity:0.15}}>📦</div>
                <div style={{fontSize:14,fontWeight:600}}>Chưa có đơn hàng</div>
                <div style={{fontSize:11,marginTop:4}}>Khách hàng đặt qua AI chat → đơn tự động lưu vào đây</div>
              </div>
              :<div style={{background:C.card,border:`1px solid ${C.borderRed}`,borderRadius:14,overflow:"hidden"}}>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
                    <thead>
                      <tr style={{background:C.surface,borderBottom:`1px solid ${C.border}`}}>
                        {["Mã ĐH","Sản phẩm","Khách hàng","SĐT","Địa chỉ","SL","Tổng tiền","Ngày","Trạng thái"].map(h=>(
                          <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:9,color:C.muted,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o,i)=>(
                        <tr key={o.id} style={{borderBottom:i<orders.length-1?`1px solid ${C.border}`:"none"}}>
                          <td style={{padding:"11px 14px",fontSize:10,color:C.gold,fontFamily:"monospace",fontWeight:700,whiteSpace:"nowrap"}}>{o.id}</td>
                          <td style={{padding:"11px 14px",fontSize:11,color:C.text,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.product.name}</td>
                          <td style={{padding:"11px 14px",fontSize:12,color:C.text,fontWeight:600,whiteSpace:"nowrap"}}>{o.name}</td>
                          <td style={{padding:"11px 14px",fontSize:11,color:C.mutedL,fontFamily:"monospace",whiteSpace:"nowrap"}}>{o.phone}</td>
                          <td style={{padding:"11px 14px",fontSize:10,color:C.muted,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.address}</td>
                          <td style={{padding:"11px 14px",fontSize:12,fontWeight:700,color:C.text,textAlign:"center"}}>{o.qty}</td>
                          <td style={{padding:"11px 14px",fontSize:12,color:C.gold,fontFamily:"monospace",fontWeight:700,whiteSpace:"nowrap"}}>{fmtV(o.total)}</td>
                          <td style={{padding:"11px 14px",fontSize:10,color:C.muted,whiteSpace:"nowrap"}}>{o.date}</td>
                          <td style={{padding:"11px 14px"}}>
                            <select value={o.status} onChange={e=>setOrders(os=>os.map(x=>x.id===o.id?{...x,status:e.target.value}:x))}
                              style={{background:o.status==="Đã giao"?C.greenDim:o.status==="Đang giao"?C.blueDim:C.redDim,border:"none",borderRadius:5,color:o.status==="Đã giao"?C.green:o.status==="Đang giao"?C.blue:C.redB,fontSize:9,fontWeight:700,padding:"3px 7px",cursor:"pointer",outline:"none"}}>
                              {["Mới","Đang xử lý","Đang giao","Đã giao","Huỷ"].map(s=><option key={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </>
        )}

        {/* ════ CUSTOMERS ════ */}
        {view==="customers"&&(
          <>
            <div style={{marginBottom:20}}>
              <h2 style={{fontSize:18,fontWeight:900,color:C.text}}>👥 Tệp khách hàng</h2>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{customers.length} khách · Tự động lưu từ đơn hàng qua AI chat</div>
            </div>
            {customers.length===0
              ?<div style={{textAlign:"center",padding:70,color:C.muted,background:C.card,borderRadius:14,border:`1px dashed ${C.border}`}}>
                <div style={{fontSize:48,marginBottom:10,opacity:0.15}}>👥</div>
                <div style={{fontSize:14,fontWeight:600}}>Chưa có dữ liệu khách hàng</div>
                <div style={{fontSize:11,marginTop:4}}>Thông tin tự động lưu khi khách đặt qua AI chat</div>
              </div>
              :<div style={{background:C.card,border:`1px solid ${C.borderRed}`,borderRadius:14,overflow:"hidden"}}>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{background:C.surface,borderBottom:`1px solid ${C.border}`}}>
                        {["Khách hàng","Số điện thoại","Địa chỉ","Đơn hàng","Tổng chi tiêu","Khách từ","Lần cuối"].map(h=>(
                          <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:9,color:C.muted,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c,i)=>(
                        <tr key={c.id} style={{borderBottom:i<customers.length-1?`1px solid ${C.border}`:"none"}}>
                          <td style={{padding:"12px 14px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:9}}>
                              <div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${C.red}30,${C.redDim})`,border:`1px solid ${C.borderRed}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:C.redB,flexShrink:0}}>{c.name.charAt(0)}</div>
                              <span style={{fontSize:13,fontWeight:700,color:C.text}}>{c.name}</span>
                            </div>
                          </td>
                          <td style={{padding:"12px 14px",fontSize:11,color:C.mutedL,fontFamily:"monospace"}}>{c.phone}</td>
                          <td style={{padding:"12px 14px",fontSize:10,color:C.muted,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.address}</td>
                          <td style={{padding:"12px 14px",textAlign:"center"}}>
                            <span style={{background:C.blueDim,color:C.blue,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700}}>{c.orders}</span>
                          </td>
                          <td style={{padding:"12px 14px",fontSize:13,color:C.gold,fontFamily:"monospace",fontWeight:700}}>{fmtV(c.total)}</td>
                          <td style={{padding:"12px 14px",fontSize:10,color:C.muted}}>{c.since}</td>
                          <td style={{padding:"12px 14px",fontSize:10,color:C.mutedL}}>{c.lastOrder}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </>
        )}
      </main>

      {/* ── MODALS ── */}
      {chatProd&&<OrderChat product={chatProd} onClose={()=>setChatProd(null)} onOrderPlaced={handleOrder}/>}
      {(showAdd||editProd)&&<ProdModal prod={editProd} onSave={saveProd} onClose={()=>{setEditProd(null);setShowAdd(false);}}/>}
    </div>
  );
}
