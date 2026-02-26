// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
export const T = {
  navy:        "#0f2044",
  navyMid:     "#1a3260",
  blue:        "#1d4ed8",
  blueHover:   "#2563eb",
  accent:      "#0ea5e9",
  teal:        "#0891b2",
  bg:          "#eef2fb",
  bgCard:      "#ffffff",
  text:        "#0c1830",
  muted:       "#5a6a8a",
  border:      "#d8e1f3",
  green:       "#16a34a",
  red:         "#dc2626",
  amber:       "#d97706",
  profileGrad: "linear-gradient(135deg, #1d8fe0 0%, #0f6bb5 60%, #0a4d8f 100%)",
};

// Booking wizard constants
export const DEVICE_IMGS = {
  Smartphone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
  Laptop:     "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400&q=80",
  Tablet:     "https://images.unsplash.com/photo-1544244015-0df4592c5635?w=400&q=80",
  Console:    "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&q=80",
};

export const HERO_IMG = "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80";

export const ISSUES = {
  Smartphone: ["Cracked Screen","Battery Replacement","Charging Port","Speaker / Mic","Water Damage","Software Issue"],
  Laptop:     ["Screen Damage","Battery","Keyboard","Overheating","Boot Failure","Data Recovery"],
  Tablet:     ["Cracked Screen","Battery","Charging Port","Button / Speaker","Software Issue","Other"],
  Console:    ["Disc Drive","HDMI Port","Controller","Overheating","Software / Firmware","Other"],
};

export const SHOPS_BK = [
  { name:"TechCare Centre",  addr:"KG 11 Ave, Kigali",   rating:4.8, dist:"1.2 km", wait:"24 hrs" },
  { name:"FixIt Pro",        addr:"KN 5 Rd, Nyarugenge", rating:4.6, dist:"2.4 km", wait:"48 hrs" },
  { name:"QuickRepair Hub",  addr:"KK 15 Ave, Gasabo",   rating:4.5, dist:"3.1 km", wait:"36 hrs" },
  { name:"Device Doctors",   addr:"KG 7 St, Remera",     rating:4.7, dist:"4.0 km", wait:"24 hrs" },
];

export const TIMES_BK = [
  "09:00 AM","10:00 AM","11:00 AM","01:00 PM","02:00 PM","03:00 PM","04:00 PM",
];

export const BOOKING_STEPS = ["Device","Issue","Schedule","Shop","Confirm"];
