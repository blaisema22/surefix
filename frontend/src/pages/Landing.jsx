import { useState } from "react";

const HERO_REPAIR  = "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80";
const LOGIN_LAPTOP = "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&q=80";
const DEVICE_IMGS  = {
  Smartphone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
  Laptop:     "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400&q=80",
  Tablet:     "https://images.unsplash.com/photo-1544244015-0df4592c5635?w=400&q=80",
  Console:    "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&q=80",
};

// ── Icons ──────────────────────────────────────────────────────────────
const MailIcon  = () => <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>;
const LockIcon  = () => <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>;
const UserIcon  = () => <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>;
const PhoneIcon = () => <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>;
const ChevronR  = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>;
const ChevronL  = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>;

// ── Auth Modal ─────────────────────────────────────────────────────────
function AuthModal({ onClose }) {
  const [view, setView]       = useState("login");
  const [regType, setRegType] = useState("Customer");
  const inp = "w-full bg-gray-100 rounded-full pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <Overlay onClose={onClose}>
      <div className="relative flex rounded-2xl overflow-hidden shadow-2xl w-[760px] max-w-[95vw]" onClick={e=>e.stopPropagation()}>
        <div className="hidden sm:block w-[45%] relative">
          <img src={LOGIN_LAPTOP} alt="Repair" className="w-full h-full object-cover"/>
          {view==="register" && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
              {["Customer","Repair"].map(t=>(
                <button key={t} onClick={()=>setRegType(t)}
                  className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${regType===t?"bg-blue-700 text-white":"bg-white/70 text-gray-700 hover:bg-white"}`}>{t}</button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 bg-[#2c3e6b] flex flex-col items-center justify-center px-8 py-10">
          <p className="text-white text-xl font-bold mb-1">SureFix</p>
          {view==="login" ? (
            <>
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-6 text-2xl">🔧</div>
              <div className="w-full space-y-3">
                <Field icon={<MailIcon/>} placeholder="E-mail" type="email" inp={inp}/>
                <Field icon={<LockIcon/>} placeholder="Password" type="password" inp={inp}/>
              </div>
              <button className="mt-5 w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-2.5 rounded-full transition-colors">Login</button>
              <p className="mt-4 text-sm text-gray-300">Forgot Password? <b className="text-white">or</b> <button onClick={()=>setView("register")} className="text-white underline font-semibold">Signup</button></p>
            </>
          ) : (
            <>
              <p className="text-white/80 text-sm font-semibold mb-4">{regType} Form</p>
              <div className="w-full space-y-3">
                <Field icon={<MailIcon/>} placeholder="E-mail" type="email" inp={inp}/>
                <Field icon={<UserIcon/>} placeholder="Names" inp={inp}/>
                <Field icon={<PhoneIcon/>} placeholder="Phone number" inp={inp}/>
                <Field icon={<LockIcon/>} placeholder="Password" type="password" inp={inp}/>
              </div>
              <button className="mt-5 w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-2.5 rounded-full transition-colors">Sign Up</button>
              <p className="mt-4 text-sm text-gray-300">Forgot Password? <b className="text-white">or</b> <button onClick={()=>setView("login")} className="text-white underline font-semibold">Login</button></p>
            </>
          )}
        </div>
        <CloseBtn onClose={onClose}/>
      </div>
    </Overlay>
  );
}

// ── Booking Wizard ─────────────────────────────────────────────────────
const STEPS = ["Device","Issue","Schedule","Shop","Confirm"];

const ISSUES = {
  Smartphone: ["Cracked Screen","Battery Replacement","Charging Port","Speaker / Mic","Water Damage","Software Issue"],
  Laptop:     ["Screen Damage","Battery","Keyboard","Overheating","Boot Failure","Data Recovery"],
  Tablet:     ["Cracked Screen","Battery","Charging Port","Button / Speaker","Software Issue","Other"],
  Console:    ["Disc Drive","HDMI Port","Controller","Overheating","Software / Firmware","Other"],
};

const SHOPS = [
  { name:"TechCare Centre",  addr:"KG 11 Ave, Kigali",    rating:4.8, dist:"1.2 km", wait:"24 hrs" },
  { name:"FixIt Pro",        addr:"KN 5 Rd, Nyarugenge",  rating:4.6, dist:"2.4 km", wait:"48 hrs" },
  { name:"QuickRepair Hub",  addr:"KK 15 Ave, Gasabo",    rating:4.5, dist:"3.1 km", wait:"36 hrs" },
  { name:"Device Doctors",   addr:"KG 7 St, Remera",      rating:4.7, dist:"4.0 km", wait:"24 hrs" },
];

const TIMES = ["09:00 AM","10:00 AM","11:00 AM","01:00 PM","02:00 PM","03:00 PM","04:00 PM"];

function BookingWizard({ onClose }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ device:"", issue:"", date:"", time:"", shop:null, name:"", phone:"", note:"" });
  const [done, setDone] = useState(false);

  const upd = (k,v) => setData(p=>({...p,[k]:v}));

  const canNext = () => {
    if(step===0) return !!data.device;
    if(step===1) return !!data.issue;
    if(step===2) return !!data.date && !!data.time;
    if(step===3) return !!data.shop;
    if(step===4) return !!data.name && !!data.phone;
    return true;
  };

  const next = () => { if(step<4) setStep(s=>s+1); else setDone(true); };
  const prev = () => setStep(s=>s-1);

  return (
    <Overlay onClose={onClose}>
      <div className="relative bg-white rounded-2xl shadow-2xl w-[700px] max-w-[95vw] overflow-hidden" onClick={e=>e.stopPropagation()}>
        {/* Header with step bar */}
        <div className="bg-gradient-to-r from-[#1a2a5e] to-[#2c4a8c] px-8 pt-7 pb-5">
          <p className="text-white font-extrabold text-lg mb-5">📱 Book a Repair</p>
          <div className="flex items-center">
            {STEPS.map((s,i)=>(
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                    ${i<step  ? "bg-green-400 border-green-400 text-white"
                    : i===step? "bg-white border-white text-blue-900"
                               : "bg-transparent border-white/30 text-white/40"}`}>
                    {i<step ? "✓" : i+1}
                  </div>
                  <p className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${i<=step?"text-white":"text-white/35"}`}>{s}</p>
                </div>
                {i<STEPS.length-1 && (
                  <div className={`flex-1 h-0.5 mb-4 mx-1 ${i<step?"bg-green-400":"bg-white/20"}`}/>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="px-8 py-6 min-h-[340px]">
          {done ? <SuccessScreen data={data} onClose={onClose}/> : (
            <>
              {step===0 && <StepDevice   data={data} upd={upd}/>}
              {step===1 && <StepIssue    data={data} upd={upd}/>}
              {step===2 && <StepSchedule data={data} upd={upd}/>}
              {step===3 && <StepShop     data={data} upd={upd}/>}
              {step===4 && <StepConfirm  data={data} upd={upd}/>}
            </>
          )}
        </div>

        {/* Footer buttons */}
        {!done && (
          <div className="flex items-center justify-between px-8 pb-7 pt-2 border-t">
            <button onClick={prev} disabled={step===0}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-blue-700 disabled:opacity-25 transition-colors">
              <ChevronL/> Back
            </button>
            <span className="text-xs text-gray-400 font-medium">Step {step+1} / {STEPS.length}</span>
            <button onClick={next} disabled={!canNext()}
              className="flex items-center gap-2 bg-blue-800 hover:bg-blue-900 disabled:opacity-35 text-white text-sm font-bold px-7 py-2.5 rounded-full transition-colors">
              {step===4?"Confirm Booking":"Continue"} <ChevronR/>
            </button>
          </div>
        )}

        <CloseBtn onClose={onClose} dark/>
      </div>
    </Overlay>
  );
}

// Step 1 – Device selection
function StepDevice({ data, upd }) {
  return (
    <div>
      <h3 className="font-extrabold text-gray-900 text-xl mb-1">Select Your Device</h3>
      <p className="text-gray-400 text-sm mb-6">What type of device needs repair?</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(DEVICE_IMGS).map(([d,img])=>(
          <button key={d} onClick={()=>upd("device",d)}
            className={`rounded-xl overflow-hidden border-2 transition-all duration-200 ${data.device===d?"border-blue-700 shadow-xl scale-105":"border-gray-100 hover:border-blue-300 hover:scale-102"}`}>
            <img src={img} alt={d} className="w-full h-24 object-cover"/>
            <p className={`text-xs font-bold py-2.5 ${data.device===d?"text-blue-700 bg-blue-50":"text-gray-600 bg-gray-50"}`}>{d}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 2 – Issue
function StepIssue({ data, upd }) {
  const issues = ISSUES[data.device] || [];
  return (
    <div>
      <h3 className="font-extrabold text-gray-900 text-xl mb-1">Describe the Issue</h3>
      <p className="text-gray-400 text-sm mb-5">Select the problem with your <span className="text-blue-700 font-semibold">{data.device}</span></p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {issues.map(iss=>(
          <button key={iss} onClick={()=>upd("issue",iss)}
            className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${data.issue===iss?"border-blue-700 bg-blue-50 text-blue-800":"border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/40"}`}>
            {iss}
          </button>
        ))}
      </div>
      <textarea rows={2} placeholder="Additional details (optional)…" value={data.note} onChange={e=>upd("note",e.target.value)}
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-400 resize-none placeholder-gray-300"/>
    </div>
  );
}

// Step 3 – Schedule
function StepSchedule({ data, upd }) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div>
      <h3 className="font-extrabold text-gray-900 text-xl mb-1">Choose Date & Time</h3>
      <p className="text-gray-400 text-sm mb-6">Pick a convenient drop-off slot</p>
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Preferred Date</label>
        <input type="date" min={today} value={data.date} onChange={e=>upd("date",e.target.value)}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-400"/>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">Preferred Time</label>
        <div className="flex flex-wrap gap-2">
          {TIMES.map(t=>(
            <button key={t} onClick={()=>upd("time",t)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border-2 transition-all ${data.time===t?"bg-blue-800 border-blue-800 text-white shadow-md":"border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-700"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 4 – Shop selection
function StepShop({ data, upd }) {
  return (
    <div>
      <h3 className="font-extrabold text-gray-900 text-xl mb-1">Find a Repair Shop</h3>
      <p className="text-gray-400 text-sm mb-5">
        Available shops on <span className="text-blue-700 font-semibold">{data.date}</span> at <span className="text-blue-700 font-semibold">{data.time}</span>
      </p>
      <div className="space-y-3">
        {SHOPS.map(s=>(
          <button key={s.name} onClick={()=>upd("shop",s)}
            className={`w-full text-left flex items-center gap-4 px-4 py-4 rounded-xl border-2 transition-all ${data.shop?.name===s.name?"border-blue-700 bg-blue-50 shadow-md":"border-gray-200 hover:border-blue-300"}`}>
            <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-xl shrink-0">🔧</div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-gray-900 text-sm">{s.name}</p>
              <p className="text-gray-400 text-xs truncate">{s.addr}</p>
            </div>
            <div className="text-right shrink-0 space-y-0.5">
              <p className="text-yellow-500 text-xs font-bold">★ {s.rating}</p>
              <p className="text-gray-400 text-xs">{s.dist}</p>
              <p className="text-green-600 text-xs font-semibold">{s.wait}</p>
            </div>
            {data.shop?.name===s.name && (
              <div className="w-5 h-5 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs shrink-0">✓</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 5 – Confirm
function StepConfirm({ data, upd }) {
  const inp = "w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-400";
  return (
    <div>
      <h3 className="font-extrabold text-gray-900 text-xl mb-1">Confirm Booking</h3>
      <p className="text-gray-400 text-sm mb-4">Review your details and provide contact info</p>

      {/* Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl px-5 py-4 mb-5 border border-blue-100">
        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">Booking Summary</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            ["📱 Device",   data.device],
            ["🔍 Issue",    data.issue],
            ["📅 Date",     data.date],
            ["🕐 Time",     data.time],
            ["🏪 Shop",     data.shop?.name],
            ["📍 Location", data.shop?.addr],
          ].map(([k,v])=>(
            <div key={k} className="min-w-0">
              <p className="text-gray-400 text-[10px] font-semibold">{k}</p>
              <p className="font-bold text-gray-800 text-xs truncate">{v||"—"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact fields */}
      <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Your Contact Info</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Full Name <span className="text-red-400">*</span></label>
          <input className={inp} placeholder="Jane Doe" value={data.name} onChange={e=>upd("name",e.target.value)}/>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Phone <span className="text-red-400">*</span></label>
          <input className={inp} placeholder="+250 7XX XXX XXX" value={data.phone} onChange={e=>upd("phone",e.target.value)}/>
        </div>
      </div>
    </div>
  );
}

// Success Screen
function SuccessScreen({ data, onClose }) {
  const bookingId = `SF-${Math.floor(Math.random()*90000+10000)}`;
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-5xl mb-5">✅</div>
      <h3 className="font-extrabold text-gray-900 text-2xl mb-2">Booking Confirmed!</h3>
      <p className="text-gray-500 text-sm max-w-sm mb-2">
        Your <span className="font-bold text-blue-700">{data.device}</span> ({data.issue}) repair is booked at{" "}
        <span className="font-bold text-blue-700">{data.shop?.name}</span>
      </p>
      <p className="text-gray-400 text-sm mb-4">
        {data.date} at {data.time}
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-3 mb-8">
        <p className="text-xs text-gray-500">Booking ID</p>
        <p className="text-blue-700 font-extrabold text-xl tracking-widest">#{bookingId}</p>
      </div>
      <p className="text-gray-400 text-xs mb-6">A confirmation has been sent to <span className="font-semibold">{data.phone}</span></p>
      <button onClick={onClose} className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-10 py-3 rounded-full transition-colors">
        Back to Home
      </button>
    </div>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────
function Overlay({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background:"rgba(10,20,60,0.65)", backdropFilter:"blur(6px)" }}
      onClick={onClose}>
      {children}
    </div>
  );
}
function CloseBtn({ onClose, dark }) {
  return (
    <button onClick={onClose}
      className={`absolute top-3 right-4 text-xl font-bold transition-colors ${dark?"text-gray-400 hover:text-gray-700":"text-white/60 hover:text-white"}`}>
      ✕
    </button>
  );
}
function Field({ icon, placeholder, type="text", inp }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
      <input className={inp} placeholder={placeholder} type={type}/>
    </div>
  );
}

// ── Landing Page ───────────────────────────────────────────────────────
export default function SureFixApp() {
  const [showAuth,    setShowAuth]    = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      {showAuth    && <AuthModal     onClose={()=>setShowAuth(false)}/>}
      {showBooking && <BookingWizard onClose={()=>setShowBooking(false)}/>}

      {/* HERO */}
      <section className="flex flex-col md:flex-row min-h-[420px]">
        <div className="flex-1 bg-[#eef0fa] flex flex-col justify-center px-10 py-16 md:py-0">
          <h1 className="text-4xl md:text-5xl font-extrabold italic text-gray-900 leading-tight mb-4">
            Modern Solutions for<br/>
            <span className="text-blue-700">Electronic Repairs</span>
          </h1>
          <p className="text-sm font-semibold text-gray-700 max-w-md mb-8">
            Book your repair, track progress in real-time, and get your devices back faster with{" "}
            <span className="text-blue-600">SureFix</span>. Professional service for smartphones, laptops, and more.
          </p>
          <div className="flex gap-4">
            <button onClick={()=>setShowBooking(true)} className="bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-900 transition-colors text-sm">
              Book a repair
            </button>
            <button className="border-2 border-blue-700 text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors text-sm">
              Find Repair Shop
            </button>
          </div>
        </div>
        <div className="flex-1">
          <img src={HERO_REPAIR} alt="Electronic repair" className="w-full h-full object-cover min-h-[300px]"/>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-8 bg-white text-center">
        <h2 className="text-2xl font-extrabold text-blue-700 mb-1">How It Works</h2>
        <p className="text-gray-600 font-semibold mb-12">Book your repair in 5 simple steps</p>
        <div className="flex flex-col md:flex-row items-start justify-center max-w-4xl mx-auto">
          {[
            { n:"1", icon:"📱", title:"Select Device",  desc:"Choose the type of device that needs repair." },
            { n:"2", icon:"🔍", title:"Describe Issue",  desc:"Tell us what's wrong — screen, battery, and more." },
            { n:"3", icon:"📅", title:"Pick Schedule",   desc:"Choose a date and drop-off time for you." },
            { n:"4", icon:"🏪", title:"Choose a Shop",   desc:"Find the nearest certified repair shop." },
            { n:"5", icon:"✅", title:"Confirm & Done",  desc:"Review your details and submit the booking." },
          ].map((s,i,arr)=>(
            <div key={s.n} className="flex md:flex-col items-center flex-1">
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center mb-3 text-2xl">
                  {s.icon}
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-blue-800 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">{s.n}</span>
                </div>
                <p className="font-extrabold text-gray-900 text-sm mb-1">{s.title}</p>
                <p className="text-gray-400 text-xs max-w-[110px] text-center leading-relaxed">{s.desc}</p>
              </div>
              {i<arr.length-1 && (
                <div className="hidden md:block flex-1 h-0.5 bg-blue-100 mt-[-52px] mx-1"/>
              )}
            </div>
          ))}
        </div>
        <button onClick={()=>setShowBooking(true)} className="mt-12 bg-blue-800 hover:bg-blue-900 text-white font-bold px-10 py-3 rounded-full transition-colors text-sm shadow-lg">
          Start Booking Now →
        </button>
      </section>

      {/* WHY CHOOSE */}
      <section className="py-16 px-8 bg-[#f5f6fc] text-center">
        <h2 className="text-2xl font-extrabold text-blue-700 mb-1">Why Choose SureFix?</h2>
        <p className="text-gray-700 font-semibold mb-12">A better way to repair your tech</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto text-left">
          {[
            { title:"Expert Technicians", desc:"Our certified professionals have years of experience with all major electronic brands." },
            { title:"Fast Turnaround",    desc:"Most common repairs are completed within 24–48 hours with genuine replacement parts." },
            { title:"Real-time Tracking", desc:"Know exactly where your device is in the repair process with our live status updates." },
          ].map(f=>(
            <div key={f.title}>
              <h3 className="font-extrabold text-gray-900 mb-2 text-lg">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-6 md:mx-16 my-12 rounded-2xl bg-gradient-to-br from-[#1a2a5e] to-[#2c4a8c] text-white px-10 py-14">
        <h2 className="text-3xl font-extrabold mb-3">Ready to fix your device?</h2>
        <p className="text-blue-200 mb-8 max-w-lg text-sm leading-relaxed">
          Join thousands of happy customers who trust SureFix for their electronic repairs. Fast, reliable, and transparent.
        </p>
        <button onClick={()=>setShowBooking(true)} className="border-2 border-white text-white font-bold px-8 py-3 rounded-lg hover:bg-white hover:text-blue-900 transition-colors">
          Start Your Repair
        </button>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t px-10 py-10">
        <div className="flex flex-col md:flex-row gap-8 justify-between max-w-5xl mx-auto">
          <div className="max-w-xs">
            <p className="text-xl font-extrabold italic text-gray-900 mb-3">SureFix</p>
            <p className="text-gray-500 text-sm">The SureFix simplifies the way you manage and book electronic repairs. Modern, efficient, and reliable.</p>
          </div>
          <div>
            <p className="font-bold text-gray-800 mb-3 text-sm">SUPPORT</p>
            <ul className="space-y-1 text-sm text-gray-500">
              {["Help Center","Warranty Policy","Contact Us"].map(l=><li key={l}><a href="#" className="hover:text-blue-600">{l}</a></li>)}
            </ul>
          </div>
          <div>
            <p className="font-bold text-gray-800 mb-3 text-sm">LEGAL</p>
            <ul className="space-y-1 text-sm text-gray-500">
              {["Privacy Policy","Terms of Service","Cookie Policy"].map(l=><li key={l}><a href="#" className="hover:text-blue-600">{l}</a></li>)}
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-5 text-center text-gray-400 text-xs">2026 SureFix System. All rights reserved</div>
      </footer>
    </div>
  );
}
