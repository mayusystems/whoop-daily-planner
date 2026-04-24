import { useState, useEffect, useCallback, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const TODAY = new Date();
const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAME = DAY_NAMES[TODAY.getDay()];
const IS_DANCE_DAY = [2,4,6].includes(TODAY.getDay());
const TODAY_STR = `${TODAY.getFullYear()}-${String(TODAY.getMonth()+1).padStart(2,"0")}-${String(TODAY.getDate()).padStart(2,"0")}`;

const P = {
  forMe:{bg:"#FFFDE7",border:"#F59E0B",labelColor:"#92400E"},
  deep:{bg:"#EFF6FF",border:"#60A5FA",labelColor:"#1E40AF"},
  admin:{bg:"#FFF7ED",border:"#F97316",labelColor:"#9A3412"},
  play:{bg:"#F5F0FF",border:"#A78BFA",labelColor:"#5B21B6"},
  dark:"#0F0F1A",red:"#E53935",cream:"#FFFDF7",
};

const DEFAULT_SLOTS={6:"",7:"💪 Workout",8:"🪥 Get ready + breakfast",9:"",10:"",11:"",12:"🥗 Lunch",13:"",14:"",15:"",16:"",17:"",18:"",19:IS_DANCE_DAY?"💃 Latin/Salsa":"🌅 Free evening",20:"",21:"🌙 Wind down",22:"😴 Sleep",23:""};

const SESSIONS=[
  {id:"forMe",label:"My Mornings",hours:[6,7,8,9],...P.forMe},
  {id:"deep",label:"Deep Focus",hours:[10,11,12,13],...P.deep},
  {id:"admin",label:"Admin",hours:[14,15,16,17],...P.admin},
  {id:"play",label:"Fun, Chill, Creative",hours:[18,19,20,21,22,23],...P.play},
];

const PILLARS=[
  {id:"hwit",label:"🌺 HWIT",color:"#EFF6FF",border:"#60A5FA",tasks:[
    {id:"h1",text:"🔄 Renew HWIT Slack Business+ (trial ends Apr 24)",urgency:"today"},
    {id:"h2",text:"📋 Review & update HWIT Operational Accounts doc — add missing accounts",urgency:"week"},
    {id:"h3",text:"📝 Review HWIT Board Meeting notes (Apr 14)",urgency:"week"},
    {id:"h4",text:"💬 Log into new HWIT Slack ecosystem",urgency:"week"},
    {id:"h5",text:"👤 Add Jenn + Tiffany as admins in HWIT Operational Accounts doc",urgency:"week"},
    {id:"h6",text:"📹 Check with Board: replace Zoom with Google Meet?",urgency:"week"},
    {id:"h7",text:"📱 Social media access: confirm Tiffany's needs, remove Maddy from IG, add Tiffany",urgency:"week"},
  ]},
  {id:"mayu",label:"🧠 Mayu Systems",color:"#F5F0FF",border:"#A78BFA",tasks:[
    {id:"m1",text:"🏢 File Hawaii Annual Business Report",urgency:"today"},
    {id:"m2",text:"🔌 Disconnect MCP from Claude Code",urgency:"week"},
    {id:"m3",text:"📱 Change phone bill to business account",urgency:"week"},
    {id:"m4",text:"⚙️ Create automations tracker checklist",urgency:"someday"},
  ]},
  {id:"personal",label:"📋 Personal Admin",color:"#F0FDF4",border:"#4ADE80",tasks:[
    {id:"a1",text:"💊 Pick up prescriptions from Kaiser",urgency:"today"},
    {id:"a2",text:"✈️ Book Big Island Flight May 14–17",urgency:"week"},
    {id:"a3",text:"💰 Pay collections",urgency:"week"},
    {id:"a4",text:"🔄 Update RO Roth contributions ASAP",urgency:"week"},
    {id:"a5",text:"🗑️ Inbox zero unsubscribe sweep",urgency:"week"},
  ]},
];

const CHORES=["🍽️ Unload dishwasher","🐾 Feed Kilo","🧹 Sweep/vacuum","📬 Check mail","✨ Skincare","🪴 Water plants"];

const GADGETS_DEFAULT=[
  {id:"g1",name:"Compowder Compact",ep:"S2E1",status:"R&D",progress:34,color:"#FFF8F0",dot:"#F4A261",desc:"Nano-pigment powder + holographic decoy. WHOOP HRV data calibrates optimal deployment heart rate threshold."},
  {id:"g2",name:"Tamagachi Aura Fitness Agent",ep:"NEW",status:"Concept → Build",progress:12,color:"#F5F0FF",dot:"#A78BFA",desc:"WHOOP-powered virtual companion that mirrors your biometrics. Low recovery = Aura sleeps. High strain = Aura leveled up."},
];

const PROJECTS_DEFAULT=[
  {id:"p1",name:"Hawaii Testify",emoji:"🏛️",status:"stalled",health:"stalled",nextAction:"Identify next testimony deadline + prep talking points",tags:["civic","advocacy"],progress:20},
  {id:"p2",name:"Aloha Collective Mutual Aid Dashboard",emoji:"🌺",status:"active",health:"on-track",nextAction:"Wireframe the request intake flow + data model",tags:["tech","community"],progress:45},
  {id:"p3",name:"Paca Paca",emoji:"🦙",status:"active",health:"needs-attention",nextAction:"Schedule co-founder session — define MVP scope",tags:["fashion","startup"],progress:28},
  {id:"p4",name:"Closet OS",emoji:"👗",status:"new",health:"needs-attention",nextAction:"Define scope and add details",tags:["fashion","tech"],progress:5},
];

const HEALTH_MAP={"on-track":{label:"On track",bg:"#D1FAE5",color:"#065F46"},"needs-attention":{label:"Needs attention",bg:"#FEF3C7",color:"#92400E"},"stalled":{label:"Stalled",bg:"#FEE2E2",color:"#991B1B"}};

// ─── Reminders (from Apple Reminders dump Apr 22) ─────────────────────────────
const TODOS_DEFAULT=[
  // OVERDUE
  {id:"r01",text:"🏢 File Hawaii Annual Business Report (File #350170C5) — ehawaii.gov",date:"2026-04-17",done:false},
  {id:"r02",text:"🚗 Go to DMV — change BMW address & get stickers",date:"2026-03-16",done:false},
  {id:"r03",text:"🏥 Reschedule Kaiser appointment",date:"2026-04-15",done:false},
  {id:"r04",text:"📝 Review HWIT Board Meeting notes (Apr 14) + next steps — check Fireflies recap",date:"2026-04-18",done:false},
  {id:"r05",text:"📋 Review & update HWIT Operational Accounts Google Doc — Sandra needs Zoom login response",date:"2026-04-18",done:false},
  {id:"r06",text:"📊 Review Jackie's impact report",date:"2026-04-17",done:false},
  {id:"r07",text:"📬 Reply to recruiter David Kant — decide: ignore, resume, or Mayu pitch",date:"2026-04-18",done:false},
  // TODAY
  {id:"r08",text:"💊 Pick up prescriptions from Kaiser or add to app",date:"2026-04-23",done:false},
  // THIS WEEK
  {id:"r09",text:"💬 Log into new HWIT Slack — explore channels, reset passwords",date:"2026-04-24",done:false},
  {id:"r10",text:"📢 Send HWIT Slack migration update — sunset old Slack",date:"2026-04-24",done:false},
  {id:"r11",text:"🗑️ Unsubscribe sweep — Maven, Ruben Substack, AI Actually HI, UNICEF Peru, aggregate-intellect. Block recruiter.",date:"2026-04-25",done:false},
  {id:"r12",text:"✈️ Book Big Island Flight May 14–17 (HNL → KOA/ITO) — Southwest, Hawaiian, Mokulele",date:"2026-04-24",done:false},
  {id:"r13",text:"🧴 Buy shampoo travel size for girls trip (AA card)",date:"2026-04-24",done:false},
  {id:"r14",text:"💻 Create GitHub for TASI",date:"2026-04-23",done:false},
  {id:"r15",text:"🔄 Update Roth contributions ASAP",date:"2026-04-25",done:false},
  {id:"r16",text:"🤖 Check in with Sandra about Otter AI sunsetting",date:"2026-04-25",done:false},
  {id:"r17",text:"💰 Pay collections",date:"2026-04-25",done:false},
  // NEXT WEEK+
  {id:"r18",text:"💬 Connect with Paul for mentorship — send Slack message",date:"2026-04-28",done:false},
  {id:"r19",text:"🤝 Reach out to Michelle — connect speaker at Summit for Rachel",date:"2026-04-28",done:false},
  {id:"r20",text:"💸 Set up mom's reoccurring monthly deposit",date:"2026-04-28",done:false},
  {id:"r21",text:"👁️ Schedule optometrist appointment",date:"2026-04-29",done:false},
  {id:"r22",text:"👓 Find & book eye doctor — update night glasses",date:"2026-04-29",done:false},
  {id:"r23",text:"📱 Change phone bill to business account",date:"2026-04-28",done:false},
  {id:"r24",text:"🔌 Disconnect MCP connection from Claude Code",date:"2026-04-28",done:false},
  {id:"r25",text:"🎁 Buy Bebe's birthday present (headphones) Sonny — gift card",date:"2026-04-30",done:false},
  {id:"r26",text:"🐾 Find Kilo sitter for Bay trip (Jess)",date:"2026-04-30",done:false},
  {id:"r27",text:"🏝️ Set up Big Island trip for the girls",date:"2026-04-30",done:false},
  {id:"r28",text:"📧 Add @Talk to Moura email to personal and email",date:"2026-04-28",done:false},
  {id:"r29",text:"🛍️ Buy Shane and Shaw extra small white linen cover",date:"2026-05-01",done:false},
  {id:"r30",text:"🛍️ T.J. Maxx — get stuff for travel in May",date:"2026-05-02",done:false},
  // SOMEDAY
  {id:"r31",text:"⚙️ Create automations tracker checklist",date:"2026-05-15",done:false},
  {id:"r32",text:"🚗 Get car wash at Kapiʻolani",date:"2026-05-10",done:false},
  {id:"r33",text:"🗳️ Update voter registration address",date:"2026-05-10",done:false},
  {id:"r34",text:"✈️ Renew Global Entry",date:"2026-05-15",done:false},
  {id:"r35",text:"💰 401k transfer",date:"2026-05-15",done:false},
  {id:"r36",text:"📢 Send out Slack sunset email and remove old accounts",date:"2026-05-01",done:false},
  // HWIT — from board thread Apr 23
  {id:"r37",text:"📋 Update HWIT Operational Accounts doc — add missing accounts",date:"2026-04-25",done:false},
  {id:"r38",text:"👤 Add Jenn M. + Tiffany as admins in HWIT accounts doc",date:"2026-04-25",done:false},
  {id:"r39",text:"📹 Check with Board: Zoom vs Google Meet — any objections?",date:"2026-04-28",done:false},
  {id:"r40",text:"📱 IG access: verify Maddy removed, get Tiffany added",date:"2026-04-25",done:false},
  {id:"r41",text:"🔑 List all Marketing/Social accounts Tiffany needs access to",date:"2026-04-28",done:false},
];
const healthColor=h=>({"on-track":"#059669","needs-attention":"#D97706","stalled":"#DC2626"})[h]||"#999";
const urgDot=u=>u==="today"?"#EF4444":u==="week"?"#F59E0B":"#D1D5DB";

// ─── News data (pre-fetched) ──────────────────────────────────────────────────
const AI_NEWS=[
  {src:"MIT Tech Review",headline:"10 Things That Matter in AI: Multi-agent cooperation, deepfake threats, neuro-symbolic efficiency breakthroughs",date:"Apr 21",tag:"🔬"},
  {src:"Stanford AI Index",headline:"Anthropic leads AI model rankings; top models now match PhD-level experts on science benchmarks",date:"Apr 13",tag:"📊"},
  {src:"PwC",headline:"74% of AI's economic value captured by top 20% of companies using AI for reinvention, not just productivity",date:"Apr 13",tag:"💰"},
  {src:"ScienceDaily",headline:"Tufts neuro-symbolic AI cuts energy use 100x while boosting robot task accuracy",date:"Apr 22",tag:"⚡"},
  {src:"Bloomberg",headline:"Google plans new AI inference chips to challenge NVIDIA's data center dominance",date:"Apr 20",tag:"🔧"},
  {src:"Crescendo AI",headline:"Anthropic MCP crosses 97M installs — now foundational infrastructure for AI agents worldwide",date:"Apr",tag:"🔌"},
];

const HI_NEWS=[
  {src:"Star-Advertiser",headline:"Former Governor George Ariyoshi passes away; tributes pour in statewide",date:"Apr 21",tag:"🌺"},
  {src:"Hawaii News Now",headline:"Lt. Gov. Sylvia Luke won't seek re-election; Kauai Mayor Kawakami emerges as frontrunner",date:"Apr 20",tag:"🗳️"},
  {src:"Hawaii News Now",headline:"New Rainbow Wahine basketball head coach Khalilah Mitchell named",date:"Apr 20",tag:"🏀"},
  {src:"Hawaii.gov",headline:"Presidential disaster declaration approved for March/April 2026 storm damage across islands",date:"Apr 8",tag:"🌧️"},
  {src:"Hawaii News Now",headline:"SPAM JAM returns April 25 — Kirin Restaurant brings SPAM spring rolls and pork hash",date:"Apr 20",tag:"🍱"},
  {src:"Maui Now",headline:"Senate designates April 2026 as National Native Plant Month",date:"Apr 17",tag:"🪴"},
  {src:"Hawaii News Now",headline:"Possible first coconut rhinoceros beetle detection on Molokaʻi near Kaunakakai Harbor",date:"Apr 9",tag:"🪲"},
];

const CAL_UPCOMING=[
  {date:"Apr 24 (Fri)",time:"6:00 AM HST",title:"⚡ Maven LIVE: Building Agents with Self-Learning Loops — Mahesh Yadav",action:"Attend",color:"#A78BFA"},
  {date:"Apr 27 (Mon)",time:"10 AM–2 PM",title:"🧠 Mayu Systems Growth Work Block — Substack, funnel, outreach",action:"Prep content",color:"#A78BFA"},
  {date:"Apr 29 (Wed)",time:"10 AM–2 PM",title:"🧠 Mayu Systems Growth Work Block",action:"Continue momentum",color:"#A78BFA"},
  {date:"Apr 30 (Thu)",time:"10 AM–12 PM",title:"🚀 Planner V3: Vercel Deploy Build Session",action:"Bring GitHub + Vercel access",color:"#60A5FA"},
  {date:"May 1 (Fri)",time:"1:30–2 PM",title:"🌺 [HWIT] Governance & Ops Biweekly — Jackie, Sandra, team",action:"Review meeting doc",color:"#60A5FA"},
  {date:"May 14–17",time:"All day",title:"✈️ Big Island Trip — NOT YET BOOKED",action:"Book flights ASAP!",color:"#EF4444"},
];

const MISSION_ITEMS=[
  {icon:"🔴",text:"Renew HWIT Slack Business+ — trial expires in 2 days",pillar:"HWIT"},
  {icon:"🔴",text:"File Hawaii Annual Business Report at ehawaii.gov",pillar:"Mayu"},
  {icon:"🔴",text:"Pick up prescriptions from Kaiser",pillar:"Personal"},
  {icon:"🟡",text:"Respond to recruiter David Kant — pitch Mayu Systems",pillar:"Mayu"},
  {icon:"🟡",text:"Reply to Sandra in HWIT Slack — acknowledge board meeting",pillar:"HWIT"},
];

// ─── Storage ──────────────────────────────────────────────────────────────────
const SK="planner_v3";
function loadS(){try{const raw=localStorage.getItem(SK);return raw?JSON.parse(raw):null;}catch{return null;}}
function saveS(s){try{localStorage.setItem(SK,JSON.stringify(s));}catch(e){console.error("[WHOOP] Save failed:",e);}}

// ─── Migrate v2 data ──────────────────────────────────────────────────────────
function migrateV2(){
  try{const raw=localStorage.getItem("planner_v2");return raw?JSON.parse(raw):null;}catch{return null;}
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
function Confetti({show}){
  if(!show)return null;
  return(<div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:9999}}>
    {Array.from({length:28},(_,i)=>({left:`${Math.random()*100}%`,color:["#FFD700","#FF69B4","#00CED1","#FF6347","#7B68EE","#A78BFA"][i%6],delay:`${Math.random()*.6}s`,size:`${6+Math.random()*7}px`})).map((p,i)=>
      <div key={i} style={{position:"absolute",top:"-10px",left:p.left,width:p.size,height:p.size,background:p.color,borderRadius:"50%",animation:"fall 2s ease-in forwards",animationDelay:p.delay}}/>
    )}
    <style>{`@keyframes fall{to{transform:translateY(110vh) rotate(720deg);opacity:0}}`}</style>
  </div>);
}

// ─── Header ───────────────────────────────────────────────────────────────────
const TICKER=[
  "🎯 MISSION: 3 red-priority items today — Slack renewal, business report, prescriptions",
  "🔬 Compowder Compact enters HRV calibration · Tamagachi Aura schema design begins",
  "📡 Anthropic MCP hits 97M installs — agent infrastructure going mainstream",
  "🌺 Gov. Ariyoshi passes away — tributes statewide",
  "✈️ Big Island trip May 14–17 UNBOOKED — 22 days out",
  "👗 NEW PROJECT: Closet OS added to pipeline — needs scoping",
];

function Header(){
  return(<div style={{background:P.dark,color:"white",padding:"10px 18px",borderRadius:"14px 14px 0 0"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{background:P.red,borderRadius:6,padding:"3px 9px",fontWeight:700,fontSize:12,letterSpacing:2}}>WHOOP</div>
        <div><div style={{fontSize:16,fontWeight:700,letterSpacing:.5}}>TOTALLY SPIES GADGET LAB</div>
        <div style={{fontSize:9,color:"#999",letterSpacing:2}}>CLASSIFIED DAILY BRIEFING · BEVERLY HILLS</div></div>
      </div>
      <div style={{textAlign:"right",fontSize:11,color:"#ccc"}}>
        <div style={{fontWeight:700,fontSize:13,color:"white"}}>{DAY_NAME.toUpperCase()}, {MONTH_NAMES[TODAY.getMonth()].toUpperCase()} {TODAY.getDate()}, {TODAY.getFullYear()}</div>
        <div>🕐 11:53 AM HST</div>
      </div>
    </div>
    <div style={{marginTop:8,background:"rgba(229,57,53,.12)",borderRadius:6,padding:"4px 10px",overflow:"hidden"}}>
      <div style={{display:"flex",gap:36,animation:"ticker 32s linear infinite",whiteSpace:"nowrap"}}>
        {[...TICKER,...TICKER].map((h,i)=><span key={i} style={{fontSize:10,color:"#FFCDD2",paddingRight:36}}>▶ {h}</span>)}
      </div>
    </div>
    <style>{`@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
  </div>);
}

function WhoopBar(){
  const s=[{i:"💚",l:"Recovery",v:"71%",s:"Optimal"},{i:"📈",l:"HRV",v:"58ms",s:"+4 baseline"},{i:"⚡",l:"Strain",v:"8.2",s:"Light"},{i:"🌙",l:"Sleep",v:"7h 22m",s:"91%"}];
  return(<div style={{display:"flex",gap:6,padding:"8px 14px",background:"#F9F9F9",borderBottom:"1px solid #eee",flexWrap:"wrap"}}>
    {s.map(x=><div key={x.l} style={{flex:"1 1 80px",background:"white",border:"1px solid #eee",borderRadius:8,padding:"5px 8px",textAlign:"center",minWidth:75}}>
      <div style={{fontSize:14}}>{x.i}</div><div style={{fontWeight:700,fontSize:14,color:P.dark}}>{x.v}</div>
      <div style={{fontSize:8,fontWeight:600,color:"#999",textTransform:"uppercase",letterSpacing:.6}}>{x.l}</div>
    </div>)}
  </div>);
}

// ─── TimeSlot ─────────────────────────────────────────────────────────────────
function TimeSlot({hour,value,onChange,onDrop}){
  const[editing,setE]=useState(false);const[draft,setD]=useState(value);
  useEffect(()=>setD(value),[value]);
  const fmt=h=>`${h>12?h-12:h}:00 ${h>=12?"PM":"AM"}`;
  return(<div style={{display:"flex",alignItems:"flex-start",gap:6,padding:"2px 0",minHeight:24}}
    onDragOver={e=>e.preventDefault()} onDrop={e=>{const t=e.dataTransfer.getData("text/plain");if(t)onDrop(hour,t);}}>
    <span style={{fontSize:9,color:"#bbb",minWidth:40,paddingTop:3,fontWeight:500}}>{fmt(hour)}</span>
    {editing?<input autoFocus value={draft} onChange={e=>setD(e.target.value)}
      onBlur={()=>{onChange(hour,draft);setE(false);}} onKeyDown={e=>{if(e.key==="Enter"){onChange(hour,draft);setE(false);}}}
      style={{flex:1,border:"1px solid #d1d5db",borderRadius:4,fontSize:11,padding:"1px 5px"}}/>
    :<div onClick={()=>{setD(value);setE(true);}} style={{flex:1,fontSize:11,color:value?"#333":"#ddd",cursor:"text",padding:"1px 4px",minHeight:16}}>
      {value||<span style={{fontStyle:"italic"}}>+ add</span>}
    </div>}
  </div>);
}

// ─── GadgetCard ───────────────────────────────────────────────────────────────
function GadgetCard({g,onUpdate}){
  const[open,setO]=useState(false);const[prog,setP]=useState(g.progress);
  return(<div style={{background:g.color,border:`1.5px solid ${g.dot}`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
    <div style={{display:"flex",justifyContent:"space-between",cursor:"pointer"}} onClick={()=>setO(o=>!o)}>
      <div><div style={{fontWeight:700,fontSize:13,color:P.dark}}>{g.name}</div><div style={{fontSize:10,color:"#888"}}>{g.ep} · {g.status}</div></div>
      <div style={{background:g.dot,color:"white",fontSize:9,fontWeight:600,padding:"2px 7px",borderRadius:10}}>{g.progress}%</div>
    </div>
    <div style={{marginTop:5,background:"#fff6",borderRadius:3,height:4,overflow:"hidden"}}><div style={{width:`${g.progress}%`,height:"100%",background:g.dot,transition:"width .4s"}}/></div>
    {open&&<div style={{marginTop:8,borderTop:`1px solid ${g.dot}33`,paddingTop:8}}>
      <div style={{fontSize:11,color:"#555",lineHeight:1.5,marginBottom:8}}>{g.desc}</div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <input type="range" min="0" max="100" value={prog} step="1" onChange={e=>setP(+e.target.value)} onMouseUp={()=>onUpdate(g.id,{progress:prog})} onTouchEnd={()=>onUpdate(g.id,{progress:prog})} style={{flex:1,accentColor:g.dot}}/>
        <span style={{fontSize:10,fontWeight:600,color:g.dot,minWidth:28}}>{prog}%</span>
      </div>
    </div>}
  </div>);
}

// ─── ProjectCard ──────────────────────────────────────────────────────────────
function ProjectCard({p,onUpdate}){
  const[open,setO]=useState(false);const[action,setA]=useState(p.nextAction);const[ed,setEd]=useState(false);
  const h=HEALTH_MAP[p.health]||HEALTH_MAP.stalled;const sc=healthColor(p.health);
  return(<div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:12,padding:"10px 12px",marginBottom:8,borderLeft:`3px solid ${sc}`}}>
    <div style={{display:"flex",justifyContent:"space-between",cursor:"pointer"}} onClick={()=>setO(o=>!o)}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:18}}>{p.emoji}</span>
        <div><div style={{fontWeight:600,fontSize:13,color:P.dark}}>{p.name}</div>
          <div style={{display:"flex",gap:4,marginTop:2}}>{p.tags.map(t=><span key={t} style={{fontSize:8,background:"#f3f4f6",color:"#6b7280",padding:"1px 5px",borderRadius:8}}>{t}</span>)}</div>
        </div>
      </div>
      <span style={{fontSize:9,fontWeight:600,padding:"2px 8px",borderRadius:10,background:h.bg,color:h.color,whiteSpace:"nowrap",height:"fit-content"}}>{h.label}</span>
    </div>
    <div style={{marginTop:6,background:"#f3f4f6",borderRadius:3,height:4,overflow:"hidden"}}><div style={{width:`${p.progress}%`,height:"100%",background:sc,transition:"width .4s"}}/></div>
    {open&&<div style={{marginTop:8,borderTop:"1px solid #f3f4f6",paddingTop:8}}>
      <div style={{fontSize:10,color:"#9ca3af",fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Next action</div>
      {ed?<input autoFocus value={action} onChange={e=>setA(e.target.value)} onBlur={()=>{onUpdate(p.id,{nextAction:action});setEd(false);}} onKeyDown={e=>{if(e.key==="Enter"){onUpdate(p.id,{nextAction:action});setEd(false);}}} style={{width:"100%",border:"1px solid #d1d5db",borderRadius:5,fontSize:11,padding:"4px 8px",boxSizing:"border-box"}}/>
      :<div onClick={()=>setEd(true)} style={{fontSize:11,color:"#374151",cursor:"text",lineHeight:1.5,padding:"2px 4px",border:"1px dashed #e5e7eb",borderRadius:4}}>{action||"Click to add…"}</div>}
      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8}}>
        <input type="range" min="0" max="100" value={p.progress} step="1" onChange={e=>onUpdate(p.id,{progress:+e.target.value})} style={{flex:1,accentColor:sc}}/>
        <span style={{fontSize:10,fontWeight:600,color:sc,minWidth:28}}>{p.progress}%</span>
      </div>
      <div style={{display:"flex",gap:6,marginTop:8}}>
        {["on-track","needs-attention","stalled"].map(s=><button key={s} onClick={()=>onUpdate(p.id,{health:s})}
          style={{flex:1,fontSize:9,padding:"3px 0",borderRadius:6,border:"1px solid",background:p.health===s?HEALTH_MAP[s].bg:"transparent",color:HEALTH_MAP[s].color,borderColor:HEALTH_MAP[s].color,cursor:"pointer",fontWeight:p.health===s?600:400}}>{HEALTH_MAP[s].label}</button>)}
      </div>
    </div>}
  </div>);
}

// ─── Todo list ────────────────────────────────────────────────────────────────
function TodoList({items,onChange}){
  const[text,setText]=useState("");const[date,setDate]=useState(TODAY_STR);const[filter,setFilter]=useState("all");
  const add=()=>{if(!text.trim())return;onChange([...items,{id:Date.now().toString(),text:text.trim(),date,done:false}]);setText("");setDate(TODAY_STR);};
  const toggle=id=>onChange(items.map(i=>i.id===id?{...i,done:!i.done}:i));
  const remove=id=>onChange(items.filter(i=>i.id!==id));
  const filtered=items.filter(i=>{if(filter==="today")return i.date===TODAY_STR;if(filter==="upcoming")return i.date>TODAY_STR;return true;}).sort((a,b)=>a.date.localeCompare(b.date));
  const tc=items.filter(i=>i.date===TODAY_STR&&!i.done).length;
  return(<div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:12,padding:"12px 14px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <div><span style={{fontWeight:600,fontSize:13,color:P.dark}}>📌 To-Do</span>{tc>0&&<span style={{marginLeft:6,background:"#FEE2E2",color:"#991B1B",fontSize:9,fontWeight:600,padding:"1px 6px",borderRadius:8}}>{tc} today</span>}</div>
      <div style={{display:"flex",gap:3}}>{["all","today","upcoming"].map(f=><button key={f} onClick={()=>setFilter(f)} style={{fontSize:9,padding:"2px 7px",borderRadius:7,border:"1px solid",cursor:"pointer",fontWeight:filter===f?600:400,background:filter===f?P.dark:"transparent",color:filter===f?"white":"#6b7280",borderColor:filter===f?P.dark:"#e5e7eb"}}>{f}</button>)}</div>
    </div>
    <div style={{display:"flex",gap:5,marginBottom:8}}>
      <input value={text} onChange={e=>setText(e.target.value)} placeholder="Add a task…" onKeyDown={e=>{if(e.key==="Enter")add();}} style={{flex:1,border:"1px solid #e5e7eb",borderRadius:6,fontSize:11,padding:"4px 7px"}}/>
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{border:"1px solid #e5e7eb",borderRadius:6,fontSize:10,padding:"4px 5px"}}/>
      <button onClick={add} style={{background:P.dark,color:"white",border:"none",borderRadius:6,padding:"4px 11px",fontSize:11,cursor:"pointer",fontWeight:600}}>+</button>
    </div>
    <div style={{maxHeight:200,overflowY:"auto"}}>{filtered.length===0?<div style={{fontSize:11,color:"#d1d5db",textAlign:"center",padding:"10px 0",fontStyle:"italic"}}>Nothing here yet</div>
    :filtered.map(item=>{const isT=item.date===TODAY_STR;const isP=item.date<TODAY_STR;return(
      <div key={item.id} style={{display:"flex",alignItems:"flex-start",gap:6,padding:"4px 0",borderBottom:"1px solid #fafafa"}}>
        <input type="checkbox" checked={item.done} onChange={()=>toggle(item.id)} style={{marginTop:2,accentColor:P.red,flexShrink:0}}/>
        <div style={{flex:1}}><span style={{fontSize:11,color:item.done?"#d1d5db":"#374151",textDecoration:item.done?"line-through":"none"}}>{item.text}</span>
          <div style={{fontSize:9,color:isP&&!item.done?"#DC2626":isT?"#D97706":"#9ca3af",fontWeight:isT||isP?600:400}}>{isT?"📍 Today":isP&&!item.done?"⚠️ Overdue":item.date}</div>
        </div>
        <button onClick={()=>remove(item.id)} style={{background:"none",border:"none",color:"#e5e7eb",cursor:"pointer",fontSize:12,padding:"0 2px"}}>×</button>
      </div>);})}</div>
  </div>);
}

// ─── News Tab ─────────────────────────────────────────────────────────────────
function NewsTab(){
  return(<div style={{maxWidth:1000,margin:"0 auto",width:"100%"}}>
    {/* Mission Briefing */}
    <div style={{background:P.dark,borderRadius:12,padding:"16px 20px",marginBottom:16,color:"white"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{background:P.red,borderRadius:6,padding:"3px 10px",fontWeight:700,fontSize:11,letterSpacing:1}}>MISSION</div>
        <span style={{fontSize:15,fontWeight:700}}>Today's Needle Movers</span>
      </div>
      <div style={{fontSize:11,color:"#999",marginBottom:10,fontStyle:"italic"}}>Complete these to move the mission forward. Everything else is bonus ops.</div>
      {MISSION_ITEMS.map((m,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"6px 0",borderTop:i?"1px solid #ffffff0d":"none"}}>
        <span style={{fontSize:14,flexShrink:0}}>{m.icon}</span>
        <div style={{flex:1}}><div style={{fontSize:12,color:"white",lineHeight:1.5}}>{m.text}</div><div style={{fontSize:9,color:"#666",marginTop:1}}>{m.pillar}</div></div>
      </div>)}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      {/* AI / Tech */}
      <div>
        <div style={{fontSize:12,fontWeight:700,color:P.dark,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
          <span style={{background:"#EEF2FF",padding:"2px 8px",borderRadius:6,fontSize:10,fontWeight:600,color:"#4338CA"}}>AI / TECH</span>
          Intel Feed
        </div>
        {AI_NEWS.map((n,i)=><div key={i} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:10,padding:"10px 12px",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
            <span style={{fontSize:16,flexShrink:0}}>{n.tag}</span>
            <div><div style={{fontSize:11,fontWeight:600,color:P.dark,lineHeight:1.4}}>{n.headline}</div>
              <div style={{fontSize:9,color:"#9ca3af",marginTop:3}}>{n.src} · {n.date}</div></div>
          </div>
        </div>)}
      </div>

      {/* Hawaii Local */}
      <div>
        <div style={{fontSize:12,fontWeight:700,color:P.dark,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
          <span style={{background:"#FEF3C7",padding:"2px 8px",borderRadius:6,fontSize:10,fontWeight:600,color:"#92400E"}}>HAWAII</span>
          Local Brief
        </div>
        {HI_NEWS.map((n,i)=><div key={i} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:10,padding:"10px 12px",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
            <span style={{fontSize:16,flexShrink:0}}>{n.tag}</span>
            <div><div style={{fontSize:11,fontWeight:600,color:P.dark,lineHeight:1.4}}>{n.headline}</div>
              <div style={{fontSize:9,color:"#9ca3af",marginTop:3}}>{n.src} · {n.date}</div></div>
          </div>
        </div>)}
      </div>
    </div>

    {/* Upcoming Calendar */}
    <div style={{marginTop:16}}>
      <div style={{fontSize:12,fontWeight:700,color:P.dark,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
        <span style={{background:"#E0F2FE",padding:"2px 8px",borderRadius:6,fontSize:10,fontWeight:600,color:"#0369A1"}}>UPCOMING</span>
        Ops on the Radar — Next 14 Days
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:8}}>
        {CAL_UPCOMING.map((c,i)=><div key={i} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:10,padding:"10px 12px",borderLeft:`3px solid ${c.color}`}}>
          <div style={{fontSize:10,fontWeight:700,color:c.color}}>{c.date} · {c.time}</div>
          <div style={{fontSize:12,fontWeight:600,color:P.dark,marginTop:3,lineHeight:1.4}}>{c.title}</div>
          <div style={{fontSize:10,color:"#6b7280",marginTop:3}}>→ {c.action}</div>
        </div>)}
      </div>
    </div>
  </div>);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Planner(){
  const[loaded,setLoaded]=useState(false);const[saving,setSaving]=useState(false);
  const[slots,setSlots]=useState(DEFAULT_SLOTS);
  const[tasks,setTasks]=useState(()=>Object.fromEntries(PILLARS.flatMap(p=>p.tasks.map(t=>[t.id,false]))));
  const[taggedToday,setTaggedToday]=useState({});
  const[chores,setChores]=useState(()=>Object.fromEntries(CHORES.map(c=>[c,false])));
  const[anchors,setAnchors]=useState({workout:false,ready:false,agenda:false});
  const[dump,setDump]=useState("");
  const[todos,setTodos]=useState(TODOS_DEFAULT);
  const[projects,setProjects]=useState(PROJECTS_DEFAULT);
  const[gadgets,setGadgets]=useState(GADGETS_DEFAULT);
  const[points,setPoints]=useState(0);
  const[mood,setMood]=useState(null);
  const[word,setWord]=useState("");
  const[learned,setLearned]=useState([""]);
  const[rewardName,setRewardName]=useState("");
  const[rewardCost,setRewardCost]=useState(500);
  const[taskEdits,setTaskEdits]=useState({});
  const[confetti,setConfetti]=useState(false);
  const[tab,setTab]=useState("schedule");
  const[lastSaved,setLastSaved]=useState(null);

  // Load
  useEffect(()=>{
    let saved=loadS();
    if(!saved) saved=migrateV2();
    if(saved){
      if(saved.slots)setSlots(saved.slots);if(saved.tasks)setTasks(saved.tasks);if(saved.taggedToday)setTaggedToday(saved.taggedToday);
      if(saved.chores)setChores(saved.chores);if(saved.anchors)setAnchors(saved.anchors);
      if(saved.dump!=null)setDump(saved.dump);
      if(saved.todos){
        // Merge: keep saved state for default items + any user-added items
        const savedIds=new Set(saved.todos.map(t=>t.id));
        const defaultIds=new Set(TODOS_DEFAULT.map(t=>t.id));
        const merged=[
          ...saved.todos,
          ...TODOS_DEFAULT.filter(t=>!savedIds.has(t.id))
        ];
        setTodos(merged);
      }
      if(saved.projects)setProjects(saved.projects);if(saved.gadgets)setGadgets(saved.gadgets);
      if(saved.points)setPoints(saved.points);if(saved.mood)setMood(saved.mood);
      if(saved.word)setWord(saved.word);if(saved.learned)setLearned(saved.learned);
      if(saved.rewardName)setRewardName(saved.rewardName);if(saved.rewardCost)setRewardCost(saved.rewardCost);
      if(saved.taskEdits)setTaskEdits(saved.taskEdits);
    }
    setLoaded(true);
  },[]);

  // Auto-save — uses ref to avoid stale closure bugs
  const timer=useRef(null);
  const stateRef=useRef(null);

  // Always keep ref in sync with latest state
  const currentState={slots,tasks,taggedToday,chores,anchors,dump,todos,projects,gadgets,points,mood,word,learned,rewardName,rewardCost,taskEdits};
  stateRef.current=currentState;

  const persist=useCallback(()=>{
    clearTimeout(timer.current);
    setSaving(true);
    timer.current=setTimeout(()=>{
      try{
        const snap={...stateRef.current};
        saveS(snap);
        setLastSaved(new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",second:"2-digit"}));
        console.log("[WHOOP] State saved");
      }catch(e){console.error("[WHOOP] Save failed:",e);}
      setSaving(false);
    },400);
  },[]);

  // Trigger save on ANY state change (after initial load)
  useEffect(()=>{if(loaded)persist();},[slots,tasks,taggedToday,chores,anchors,dump,todos,projects,gadgets,points,mood,word,learned,rewardName,rewardCost,taskEdits,loaded]);

  // Emergency save when closing/navigating away
  useEffect(()=>{
    const emergencySave=()=>{
      if(stateRef.current){
        try{saveS(stateRef.current);}catch{}
      }
    };
    window.addEventListener("beforeunload",emergencySave);
    window.addEventListener("pagehide",emergencySave);
    document.addEventListener("visibilitychange",()=>{
      if(document.visibilityState==="hidden"&&stateRef.current){
        try{saveS(stateRef.current);}catch{}
      }
    });
    return()=>{
      window.removeEventListener("beforeunload",emergencySave);
      window.removeEventListener("pagehide",emergencySave);
    };
  },[]);

  // Force immediate save (used for critical actions like checking off tasks)
  const saveNow=useCallback(()=>{
    clearTimeout(timer.current);
    setSaving(true);
    try{
      saveS({...stateRef.current});
      setLastSaved(new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",second:"2-digit"}));
      console.log("[WHOOP] Immediate save complete");
    }catch(e){console.error("[WHOOP] Save error:",e);}
    setSaving(false);
  },[]);

  const award=useCallback(pts=>{setPoints(p=>{const n=p+pts;if(Math.floor(p/25)<Math.floor(n/25)){setConfetti(true);setTimeout(()=>setConfetti(false),2200);}return n;});},[]);
  const toggleTask=id=>{if(!tasks[id])award(10);setTasks(prev=>({...prev,[id]:!prev[id]}));};
  const toggleChore=c=>{if(!chores[c])award(8);setChores(prev=>({...prev,[c]:!prev[c]}));};
  const toggleAnchor=k=>{if(!anchors[k])award(12);setAnchors(prev=>({...prev,[k]:!prev[k]}));};
  const tagToday=id=>{setTaggedToday(prev=>({...prev,[id]:true}));};
  const untagToday=id=>{setTaggedToday(prev=>{const n={...prev};delete n[id];return n;});};
  const updateGadget=(id,patch)=>setGadgets(gs=>gs.map(g=>g.id===id?{...g,...patch}:g));
  const updateProject=(id,patch)=>setProjects(ps=>ps.map(p=>p.id===id?{...p,...patch}:p));
  const editTaskText=(id,newText)=>setTaskEdits(prev=>({...prev,[id]:newText}));
  const getTaskText=(t)=>taskEdits[t.id]!=null?taskEdits[t.id]:t.text;

  // Today pillar tasks: urgency=today OR tagged as today
  const todayTasks=PILLARS.flatMap(p=>p.tasks.filter(t=>t.urgency==="today"||taggedToday[t.id]).map(t=>({...t,text:getTaskText(t),pillar:p.label,pillarBorder:p.border})));
  // Tasks NOT shown in schedule (not tagged today and not urgency=today)
  const remainingTasks=pid=>PILLARS.find(p=>p.id===pid).tasks.filter(t=>t.urgency!=="today"&&!taggedToday[t.id]);

  const tabs=[{id:"schedule",label:"📅 Schedule"},{id:"tasks",label:"🎯 Tasks"},{id:"news",label:"📰 News"},{id:"projects",label:"🚀 Projects"},{id:"gadgets",label:"🔬 Lab"}];

  if(!loaded)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:P.cream}}>
    <div style={{textAlign:"center"}}><div style={{fontSize:32,marginBottom:8}}>🔬</div><div style={{fontSize:13,color:"#888",fontStyle:"italic"}}>Loading classified briefing…</div></div></div>);

  return(<div style={{fontFamily:"'Inter',system-ui,sans-serif",background:P.cream,minHeight:"100vh"}}>
    <Confetti show={confetti}/><Header/><WhoopBar/>

    {/* Nav */}
    <div style={{background:"#F9FAFB",borderBottom:"1px solid #eee",padding:"4px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:4}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)}
        style={{fontSize:11,padding:"4px 11px",borderRadius:8,border:"1px solid",cursor:"pointer",fontWeight:500,background:tab===t.id?P.dark:"transparent",color:tab===t.id?"white":"#6b7280",borderColor:tab===t.id?P.dark:"#e5e7eb",transition:"all .15s"}}>{t.label}</button>)}</div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <button onClick={saveNow} style={{fontSize:9,padding:"2px 8px",borderRadius:6,border:"1px solid #e5e7eb",background:"white",cursor:"pointer",color:"#374151",fontWeight:500}}>💾 Save now</button>
        <div style={{fontSize:9,color:saving?"#F59E0B":"#10B981",fontWeight:500}}>
          {saving?"💾 Saving…":"✅ Saved"}{lastSaved&&!saving?` · ${lastSaved}`:""}
        </div>
      </div>
    </div>

    <div style={{maxWidth:1300,margin:"0 auto",padding:14,display:"grid",gridTemplateColumns:tab==="news"||tab==="projects"||tab==="gadgets"?"1fr":"1fr 1fr",gap:14}}>

      {/* ═══ SCHEDULE ═══ */}
      {tab==="schedule"&&<>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <h2 style={{margin:0,fontSize:15,fontWeight:700,color:P.dark}}>Today's Schedule</h2>
            <span style={{background:P.red,color:"white",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10}}>{DAY_NAME}</span>
          </div>
          {/* Anchors */}
          <div style={{background:"white",border:"1px solid #eee",borderRadius:10,padding:8,marginBottom:8}}>
            <div style={{fontSize:10,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.7,marginBottom:4}}>Morning anchors</div>
            {[["workout","💪 Workout done"],["ready","🪥 Got ready"],["agenda","📋 Reviewed agenda"]].map(([k,l])=>
              <label key={k} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",marginBottom:3}}>
                <input type="checkbox" checked={anchors[k]} onChange={()=>toggleAnchor(k)} style={{accentColor:P.red,width:14,height:14}}/>
                <span style={{fontSize:11,color:anchors[k]?"#d1d5db":"#374151",textDecoration:anchors[k]?"line-through":"none"}}>{l}</span>
              </label>)}
          </div>
          {/* Today's pillar tasks in schedule — editable */}
          {todayTasks.length>0&&<div style={{background:"#FFF5F5",border:"1.5px solid #FCA5A5",borderRadius:10,padding:"8px 12px",marginBottom:8}}>
            <div style={{fontSize:10,fontWeight:700,color:"#991B1B",textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>🔴 Today's Priority Tasks</div>
            {todayTasks.map(t=><EditablePriorityTask key={t.id} t={t} checked={tasks[t.id]||false} text={getTaskText(t)}
              onToggle={()=>toggleTask(t.id)} onEdit={(txt)=>editTaskText(t.id,txt)}
              onUntag={taggedToday[t.id]?()=>untagToday(t.id):null}/>)}
          </div>}
          {/* Time blocks */}
          {SESSIONS.map(s=><div key={s.id} style={{background:s.bg,border:`1.5px solid ${s.border}`,borderRadius:10,marginBottom:6,overflow:"hidden"}}>
            <div style={{background:s.border,color:"white",fontSize:10,fontWeight:700,padding:"3px 10px",letterSpacing:.7}}>{s.label.toUpperCase()}</div>
            <div style={{padding:"5px 10px"}}>{s.hours.map(h=><TimeSlot key={h} hour={h} value={slots[h]} onChange={(hr,v)=>setSlots(prev=>({...prev,[hr]:v}))} onDrop={(hr,v)=>setSlots(prev=>({...prev,[hr]:v}))}/>)}</div>
          </div>)}
        </div>

        {/* Right: reflection */}
        <div>
          <TodoList items={todos} onChange={setTodos}/>
          {/* Brain dump */}
          <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:12,padding:"12px 14px",marginTop:10,marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
              <span style={{fontWeight:600,fontSize:13,color:P.dark}}>🧠 Brain Dump</span>
              <span style={{fontSize:9,color:"#10B981",fontWeight:500}}>✅ auto-saved</span>
            </div>
            <textarea value={dump} onChange={e=>setDump(e.target.value)} placeholder="Everything on your mind…"
              style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:7,fontSize:11,padding:8,minHeight:80,resize:"vertical",boxSizing:"border-box",lineHeight:1.6}}/>
          </div>
          {/* Learned */}
          <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:12,padding:"12px 14px",marginBottom:10}}>
            <div style={{fontWeight:600,fontSize:13,color:P.dark,marginBottom:5}}>📖 What I Learned</div>
            {learned.map((l,i)=><div key={i} style={{display:"flex",gap:5,marginBottom:3}}>
              <span style={{fontSize:10,color:"#9ca3af",width:14,paddingTop:3}}>{i+1}.</span>
              <input value={l} onChange={e=>{const a=[...learned];a[i]=e.target.value;setLearned(a);}} placeholder="Add a learning…" style={{flex:1,border:"1px solid #e5e7eb",borderRadius:5,fontSize:11,padding:"3px 6px"}}/>
            </div>)}
            <button onClick={()=>setLearned([...learned,""])} style={{fontSize:10,color:P.red,background:"none",border:`1px solid ${P.red}`,borderRadius:5,padding:"2px 8px",cursor:"pointer",marginTop:2}}>+ Add</button>
          </div>
          {/* Points + Reward */}
          <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:12,padding:"12px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontWeight:700,fontSize:14,color:P.dark}}>⭐ {points} pts</span>
              <span style={{fontSize:9,color:rewardCost>0?"#6b7280":"#d1d5db"}}>{rewardCost>0?`${Math.max(0,rewardCost-points)} to go!`:""}</span>
            </div>
            <div style={{background:"#f3f4f6",borderRadius:4,height:8,overflow:"hidden",marginBottom:6}}>
              <div style={{width:`${rewardCost>0?Math.min(100,(points/rewardCost)*100):0}%`,height:"100%",background:`linear-gradient(90deg,${P.red},#FF6F61)`,borderRadius:4,transition:"width .4s"}}/>
            </div>
            {/* Reward goal */}
            <div style={{background:"#FFFBEB",border:"1px solid #FCD34D",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:600,color:"#92400E",marginBottom:4}}>🎁 Reward Goal</div>
              <div style={{display:"flex",gap:6}}>
                <input value={rewardName} onChange={e=>setRewardName(e.target.value)} placeholder="What are you saving for?"
                  style={{flex:1,border:"1px solid #FCD34D",borderRadius:5,fontSize:11,padding:"3px 7px"}}/>
                <div style={{display:"flex",alignItems:"center",gap:3}}>
                  <input type="number" value={rewardCost} onChange={e=>setRewardCost(+e.target.value)} min="0" step="50"
                    style={{width:60,border:"1px solid #FCD34D",borderRadius:5,fontSize:11,padding:"3px 5px",textAlign:"center"}}/>
                  <span style={{fontSize:9,color:"#92400E"}}>pts</span>
                </div>
              </div>
              {rewardName&&<div style={{marginTop:5,fontSize:11,color:"#92400E"}}>
                {points>=rewardCost?"🎉 You earned it! Treat yourself!":
                `${Math.round((points/rewardCost)*100)}% toward ${rewardName}`}
              </div>}
            </div>
            {/* Mood */}
            <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:8}}>
              {["😴","😐","🙂","😄","🤩"].map(m=><button key={m} onClick={()=>setMood(m)}
                style={{fontSize:20,background:mood===m?"#FFF3E0":"none",border:`2px solid ${mood===m?"#F4A261":"transparent"}`,borderRadius:8,cursor:"pointer",padding:2}}>{m}</button>)}
            </div>
            <input value={word} onChange={e=>setWord(e.target.value)} placeholder="Today in one word…"
              style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:6,fontSize:12,padding:"4px 8px",textAlign:"center",boxSizing:"border-box"}}/>
          </div>
        </div>
      </>}

      {/* ═══ TASKS ═══ */}
      {tab==="tasks"&&<>
        <div>
          <h2 style={{margin:"0 0 6px",fontSize:15,fontWeight:700,color:P.dark}}>🎯 Pillar Tasks</h2>
          <div style={{fontSize:10,color:"#9ca3af",marginBottom:8,fontStyle:"italic"}}>Hover over any task → click 📌 to tag it as today (moves to Schedule)</div>
          {PILLARS.map(p=><div key={p.id} style={{background:p.color,border:`1.5px solid ${p.border}`,borderRadius:10,marginBottom:8}}>
            <div style={{fontWeight:700,fontSize:12,padding:"5px 12px",borderBottom:`1px solid ${p.border}44`,color:P.dark}}>{p.label}</div>
            <div style={{padding:"6px 12px"}}>
              {p.tasks.filter(t=>!taggedToday[t.id]).map(tk=><TaskRow key={tk.id} tk={tk} checked={tasks[tk.id]||false} onToggle={()=>toggleTask(tk.id)} onTagToday={()=>tagToday(tk.id)} border={p.border} displayText={getTaskText(tk)}/>)}
              {p.tasks.filter(t=>taggedToday[t.id]).length>0&&<div style={{fontSize:9,color:"#9ca3af",fontStyle:"italic",marginTop:4}}>
                {p.tasks.filter(t=>taggedToday[t.id]).length} task(s) moved to Schedule → Today
              </div>}
            </div>
          </div>)}
        </div>
        <div>
          <h2 style={{margin:"0 0 8px",fontSize:15,fontWeight:700,color:P.dark}}>🧹 Chores</h2>
          <div style={{background:"#FFFDE7",border:"1.5px solid #FCD34D",borderRadius:10,marginBottom:12}}>
            <div style={{padding:"8px 12px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:3}}>
              {CHORES.map(c=><label key={c} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
                <input type="checkbox" checked={chores[c]||false} onChange={()=>toggleChore(c)} style={{accentColor:"#F59E0B"}}/>
                <span style={{fontSize:10,color:chores[c]?"#d1d5db":"#374151",textDecoration:chores[c]?"line-through":"none"}}>{c}</span>
              </label>)}
            </div>
          </div>
          <h2 style={{margin:"0 0 8px",fontSize:15,fontWeight:700,color:P.dark}}>📌 To-Do</h2>
          <TodoList items={todos} onChange={setTodos}/>
        </div>
      </>}

      {/* ═══ NEWS ═══ */}
      {tab==="news"&&<NewsTab/>}

      {/* ═══ PROJECTS ═══ */}
      {tab==="projects"&&<div style={{maxWidth:900,margin:"0 auto",width:"100%"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <h2 style={{margin:0,fontSize:15,fontWeight:700,color:P.dark}}>🚀 Side Projects Pipeline</h2>
          <div style={{display:"flex",gap:6}}>{Object.entries(HEALTH_MAP).map(([k,v])=>
            <span key={k} style={{background:v.bg,color:v.color,padding:"2px 7px",borderRadius:8,fontSize:9,fontWeight:500}}>{v.label}</span>)}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:8}}>
          {projects.map(p=><ProjectCard key={p.id} p={p} onUpdate={updateProject}/>)}
        </div>
      </div>}

      {/* ═══ GADGETS ═══ */}
      {tab==="gadgets"&&<div style={{maxWidth:900,margin:"0 auto",width:"100%"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{background:P.dark,color:"white",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:6,letterSpacing:1}}>ACTIVE</div>
          <h2 style={{margin:0,fontSize:15,fontWeight:700,color:P.dark}}>WHOOP Gadget Lab</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10}}>
          {gadgets.map(g=><GadgetCard key={g.id} g={g} onUpdate={updateGadget}/>)}
        </div>
        <div style={{marginTop:14,background:P.dark,color:"white",borderRadius:12,padding:"14px 16px",fontSize:11,lineHeight:1.7,textAlign:"center"}}>
          <div style={{fontSize:20,marginBottom:4}}>🕵️‍♀️</div>
          <em>"Recovery is a weapon. Plan accordingly."</em>
          <div style={{fontSize:9,color:"#666",marginTop:4}}>— WHOOP Gadget Lab · Totally Spies Division</div>
        </div>
      </div>}
    </div>
  </div>);
}

// ─── TaskRow with hover-to-tag ────────────────────────────────────────────────
function TaskRow({tk,checked,onToggle,onTagToday,border,displayText}){
  const[hov,setHov]=useState(false);
  const txt=displayText||tk.text;
  return(<div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
    draggable onDragStart={e=>e.dataTransfer.setData("text/plain",txt)}
    style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:4,cursor:"grab",position:"relative"}}>
    <div style={{width:7,height:7,borderRadius:"50%",background:urgDot(tk.urgency),flexShrink:0,marginTop:4}}/>
    <input type="checkbox" checked={checked} onChange={onToggle} style={{marginTop:1,accentColor:border}}/>
    <span style={{fontSize:11,color:checked?"#d1d5db":"#374151",textDecoration:checked?"line-through":"none",lineHeight:1.4,flex:1}}>{txt}</span>
    {hov&&!checked&&<button onClick={e=>{e.stopPropagation();onTagToday();}} title="Move to today"
      style={{background:"#FEF3C7",border:"1px solid #FCD34D",borderRadius:5,fontSize:10,padding:"1px 6px",cursor:"pointer",color:"#92400E",fontWeight:600,flexShrink:0,whiteSpace:"nowrap"}}>
      📌 today
    </button>}
  </div>);
}

// ─── EditablePriorityTask ─────────────────────────────────────────────────────
function EditablePriorityTask({t,checked,text,onToggle,onEdit,onUntag}){
  const[editing,setEditing]=useState(false);
  const[draft,setDraft]=useState(text);
  useEffect(()=>setDraft(text),[text]);
  return(<div draggable onDragStart={e=>e.dataTransfer.setData("text/plain",text)}
    style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:4,cursor:"grab"}}>
    <input type="checkbox" checked={checked} onChange={onToggle} style={{marginTop:2,accentColor:"#EF4444",flexShrink:0}}/>
    <div style={{flex:1}}>
      {editing
        ?<input autoFocus value={draft} onChange={e=>setDraft(e.target.value)}
          onBlur={()=>{onEdit(draft);setEditing(false);}}
          onKeyDown={e=>{if(e.key==="Enter"){onEdit(draft);setEditing(false);}if(e.key==="Escape")setEditing(false);}}
          style={{width:"100%",border:"1px solid #FCA5A5",borderRadius:4,fontSize:11,padding:"2px 6px",boxSizing:"border-box"}}/>
        :<div onClick={()=>{if(!checked){setDraft(text);setEditing(true);}}}
          style={{fontSize:11,color:checked?"#d1d5db":"#374151",textDecoration:checked?"line-through":"none",lineHeight:1.4,cursor:checked?"default":"text",
            padding:"1px 4px",borderRadius:4,border:"1px solid transparent",transition:"border .15s"}}
          onMouseEnter={e=>{if(!checked)e.currentTarget.style.borderColor="#FCA5A5";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="transparent";}}>
          {text}
        </div>}
      <div style={{fontSize:9,color:"#9ca3af"}}>{t.pillar}</div>
    </div>
    {onUntag&&<button onClick={onUntag} title="Remove from today" style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:"#EF4444",padding:0,flexShrink:0}}>✕</button>}
  </div>);
}
