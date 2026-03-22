# 🔧 SureFix Frontend

Electronic Repair Appointment & Availability Platform

## Stack
- React 18
- Axios (API calls)
- Vite (build tool)
- CSS-in-JS (no external UI library needed)

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your backend URL
npm run dev
```

## Default Credentials (from seed data)
| Role     | Email                    | Password     |
|----------|--------------------------|--------------|
| Customer | alice@example.com        | Password@123 |
| Repairer | techfix@surefix.com      | Password@123 |
| Admin    | admin@surefix.com        | Password@123 |

## Folder Structure
```
src/
├── api/           # All Axios API calls (one file per route group)
├── context/       # AuthContext — global login state
├── styles/        # Color tokens + global CSS
├── components/
│   ├── layout/    # Sidebar, Topbar, PageWrap
│   └── shared/    # StatusBadge, Stars, Skeleton, Toast, ConfirmModal
└── pages/
    ├── customer/  # 7 customer menu pages
    └── shop/      # 7 shop menu pages + CustomerDetail
```

## Backend
Connect to the Express + MySQL backend.
All API routes are proxied through Vite dev server to avoid CORS.
