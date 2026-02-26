// ── MOCK DATABASE ──────────────────────────────────────────────────────────────
export const DB = {
    users: {
        "customer-001": {
            id: "customer-001",
            role: "customer",
            firstName: "Blaise",
            lastName: "Manishimwe",
            email: "blaise@example.com",
            phone: "+250 78 123 4567",
            location: "Kigali, Rwanda",
            avatar: "BM",
            memberSince: "Feb 2026",
            preferences: { email: true, sms: false, marketing: true },
        },
        "shop-001": {
            id: "shop-001",
            role: "shop",
            companyName: "TechFix Pro Centre",
            ownerName: "Alice K.",
            email: "techfix@example.com",
            phone: "+250 78 000 1234",
            address: "KG 15 Ave, Kicukiro, Kigali",
            tinNumber: "TIN-123456789",
            openHours: "9:00 AM - 7:00 PM",
            specialization: "Mobile Devices",
            rating: 4.8,
            verified: true,
            avatar: "TF",
        },
    },
    repairCenters: [
        { id: "rc-001", name: "TechFix Pro Centre", address: "KG 15 Ave, Kicukiro, Kigali", distance: "1.2 km", phone: "+250 78 000 1234", hours: "9:00 AM - 7:00 PM", rating: 4.8, reviews: 124, specializations: ["Smartphone", "Tablet", "Laptop"], status: "Open", waitTime: "~20 min", capacity: "3 slots today" },
        { id: "rc-002", name: "DigiCare Solutions", address: "KN 5 Rd, Nyarugenge, Kigali", distance: "2.4 km", phone: "+250 78 111 2222", hours: "8:00 AM - 6:00 PM", rating: 4.5, reviews: 89, specializations: ["Laptop", "Desktop", "Printer"], status: "Open", waitTime: "~45 min", capacity: "1 slot today" },
        { id: "rc-003", name: "SmartRepair Hub", address: "KG 7 Rd, Gasabo, Kigali", distance: "3.1 km", phone: "+250 78 333 4444", hours: "9:00 AM - 7:00 PM", rating: 4.2, reviews: 56, specializations: ["Smartphone", "Tablet"], status: "Busy", waitTime: "~1.5 hr", capacity: "Full today" },
    ],
    services: [
        { id: "svc-001", category: "Screen Repair", name: "Screen Replacement", duration: "2-4 hours", icon: "mobile-alt" },
        { id: "svc-002", category: "Battery", name: "Battery Replacement", duration: "30-60 min", icon: "battery-full" },
        { id: "svc-003", category: "Water Damage", name: "Water Damage Repair", duration: "24-48 hours", icon: "tint" },
        { id: "svc-004", category: "Software", name: "Software Fix / Virus Removal", duration: "1-3 hours", icon: "laptop" },
        { id: "svc-005", category: "Charging", name: "Charging Port Repair", duration: "1-2 hours", icon: "bolt" },
        { id: "svc-006", category: "Keyboard", name: "Keyboard Replacement", duration: "2-3 hours", icon: "keyboard" },
    ],
    devices: [
        { id: "dev-001", userId: "customer-001", name: "Samsung Galaxy S22", type: "Smartphone", brand: "Samsung", model: "Galaxy S22", serial: "SG22-KGL-001", status: "needs_repair", issue: "Screen cracked after fall, touch still works", addedAt: "2026-02-01" },
        { id: "dev-002", userId: "customer-001", name: "HP Laptop 15", type: "Laptop", brand: "HP", model: "Laptop 15s", serial: "HP15-KGL-002", status: "healthy", issue: "", addedAt: "2026-01-15" },
    ],
    appointments: [
        { id: "apt-001", customerId: "customer-001", shopId: "rc-001", deviceId: "dev-001", serviceId: "svc-001", status: "in_progress", date: "2026-02-19", time: "10:30 AM", device: "Samsung Galaxy S22", service: "Screen Replacement", shop: "TechFix Pro Centre", address: "KG 15 Ave, Kicukiro, Kigali", technicianNote: "Device received. Screen sourced.", createdAt: "2026-02-15" },
        { id: "apt-002", customerId: "customer-001", shopId: "rc-002", deviceId: "dev-002", serviceId: "svc-004", status: "completed", date: "2026-01-28", time: "2:00 PM", device: "HP Laptop 15", service: "Software Fix", shop: "DigiCare Solutions", address: "KN 5 Rd, Nyarugenge, Kigali", technicianNote: "Virus removed. System restored.", createdAt: "2026-01-25" },
    ],
    shopAppointments: [
        { id: "sapt-001", customerName: "Blaise M.", device: "Samsung Galaxy S22", service: "Screen Replacement", date: "2026-02-19", time: "10:30 AM", status: "in_progress", phone: "+250 78 123 4567" },
        { id: "sapt-002", customerName: "Jean P.", device: "iPhone 13", service: "Battery Replacement", date: "2026-02-20", time: "9:00 AM", status: "confirmed", phone: "+250 78 555 6666" },
        { id: "sapt-003", customerName: "Marie N.", device: "Samsung Tab S7", service: "Screen Replacement", date: "2026-02-21", time: "11:00 AM", status: "pending", phone: "+250 78 777 8888" },
    ],
    customers: [
        { id: "c-001", name: "Blaise M.", email: "blaise@example.com", phone: "+250 78 123 4567", devices: 2, totalRepairs: 4, joinedAt: "2026-02-01", lastVisit: "2026-02-19" },
        { id: "c-002", name: "Jean P.", email: "jean@example.com", phone: "+250 78 555 6666", devices: 1, totalRepairs: 1, joinedAt: "2026-01-10", lastVisit: "2026-02-20" },
        { id: "c-003", name: "Marie N.", email: "marie@example.com", phone: "+250 78 777 8888", devices: 3, totalRepairs: 5, joinedAt: "2025-12-01", lastVisit: "2026-02-21" },
    ],
};

// Demo login credentials
export const CREDENTIALS = {
    customer: { email: "blaise@example.com", password: "demo123" },
    shop: { email: "techfix@example.com", password: "demo123" },
};

// Simulate async API call
export const api = (key, delay = 350) =>
    new Promise((res) =>
        setTimeout(() => res(JSON.parse(JSON.stringify(DB[key]))), delay)
    );