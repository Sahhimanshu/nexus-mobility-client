# 🌐 Nexus Mobility — International Education SaaS Platform

A full-stack, multi-tenant SaaS platform for universities to manage international partnerships, student mobility programs, MoU documents, events, and global education analytics.

---

## 🏗️ Architecture

```
nexus-mobility/           ← Next.js 14 Frontend (App Router)
nexus-mobility-backend/   ← Spring Boot 3.2 Backend (REST API)
docker-compose.yml        ← Full stack orchestration
```

### Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 14, TypeScript, Tailwind CSS, Recharts |
| Backend     | Spring Boot 3.2, Java 21, Spring Security |
| Database    | PostgreSQL 16 (multi-tenant schema) |
| Migrations  | Flyway                              |
| Auth        | JWT (HS256, 24h access + 7d refresh)|
| Deployment  | Docker + Docker Compose             |

---

## 📁 Project Structure

### Frontend (`nexus-mobility/`)

```
src/
├── app/
│   ├── page.tsx               ← Dashboard
│   ├── partnerships/page.tsx  ← Partnerships list + detail panel
│   ├── students/page.tsx      ← Student management
│   ├── programs/page.tsx      ← Mobility programs (card grid)
│   ├── countries/page.tsx     ← Country-level analytics
│   ├── documents/page.tsx     ← MoU & document vault
│   └── events/page.tsx        ← Events & university visits
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx        ← Navigation sidebar
│   │   ├── Topbar.tsx         ← Page header + search
│   │   └── AppShell.tsx       ← Layout wrapper
│   └── ui/
│       └── index.tsx          ← MetricCard, Badge, SectionCard, ProgressBar
└── lib/
    ├── data.ts                ← Mock data (replace with API calls)
    └── api.ts                 ← API client (fetch wrapper for backend)
```

### Backend (`nexus-mobility-backend/`)

```
src/main/java/com/nexus/mobility/
├── NexusMobilityApplication.java
├── config/
│   └── SecurityConfig.java         ← JWT + CORS config
├── controller/
│   ├── AuthController.java         ← POST /auth/login|refresh|logout
│   ├── DashboardController.java    ← GET /dashboard/overview
│   └── PartnershipController.java  ← CRUD + stats + expiring
├── dto/
│   └── PartnershipDto.java         ← Request/response records
├── entity/
│   ├── Partnership.java
│   └── Entities.java               ← Student, Program, Document, User
├── exception/
│   ├── ResourceNotFoundException.java
│   └── GlobalExceptionHandler.java ← RFC 9457 ProblemDetail
├── repository/
│   └── PartnershipRepository.java  ← JPA + custom JPQL queries
└── service/
    └── PartnershipService.java     ← Business logic + scheduled jobs

src/main/resources/
├── application.yml
└── db/migration/
    └── V1__initial_schema.sql      ← Full PostgreSQL schema
```

---

## 🚀 Quick Start

### Option 1 — Docker Compose (Recommended)

```bash
# Clone and start everything
git clone <your-repo>
cd nexus-mobility
docker-compose up --build
```

- Frontend → http://localhost:3000  
- Backend API → http://localhost:8080/api/v1  
- PostgreSQL → localhost:5432

### Option 2 — Local Dev

**Backend:**
```bash
cd nexus-mobility-backend

# Start PostgreSQL (or use Docker)
docker run -d --name pg \
  -e POSTGRES_DB=nexus_mobility \
  -e POSTGRES_USER=nexus \
  -e POSTGRES_PASSWORD=nexus_secret \
  -p 5432:5432 postgres:16-alpine

# Run Spring Boot
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd nexus-mobility
npm install
npm run dev
# → http://localhost:3000
```

---

## 🔌 API Reference

All endpoints are prefixed with `/api/v1`.  
Protected routes require:
- `Authorization: Bearer <jwt_token>`
- `X-Tenant-Id: <uuid>` (university identifier)

### Authentication
| Method | Endpoint        | Description          |
|--------|-----------------|----------------------|
| POST   | /auth/login     | Get JWT token        |
| POST   | /auth/refresh   | Refresh access token |
| POST   | /auth/logout    | Invalidate token     |

### Partnerships
| Method | Endpoint                  | Description                    |
|--------|---------------------------|--------------------------------|
| GET    | /partnerships             | List (paginated, filterable)   |
| GET    | /partnerships/:id         | Get single                     |
| POST   | /partnerships             | Create new                     |
| PUT    | /partnerships/:id         | Update                         |
| DELETE | /partnerships/:id         | Delete                         |
| GET    | /partnerships/expiring    | Expiring within N days         |
| GET    | /partnerships/stats       | Dashboard KPIs                 |

### Dashboard
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| GET    | /dashboard/overview | All KPI + chart data |

---

## 🗄️ Database Design

Multi-tenant architecture — every university is a **tenant**.  
All tables have `tenant_id UUID` to isolate data per university.

Key tables:
- `tenants` — University accounts
- `users` — Staff with roles (SUPER_ADMIN, ADMIN, COORDINATOR, STUDENT)
- `partnerships` — MoU agreements with partner universities
- `programs` — Exchange, joint degree, summer school programs
- `students` + `student_applications` — Student profiles and mobility applications
- `documents` — MoU files, contracts, student agreements
- `events` — University visits, fairs, orientations
- `audit_logs` — Full activity trail

---

## 🎨 UI Modules

| Page         | Features                                                        |
|--------------|-----------------------------------------------------------------|
| Dashboard    | KPI cards, Students by Destination chart, Mobility trend, Expiring alerts |
| Partnerships | List table + filter + detail side panel + MoU download          |
| Students     | Table + profile panel + status filter + GPA display             |
| Programs     | Card grid + scholarship badge + enrollment progress bar         |
| Countries    | Country cards + share bars + regional breakdown                 |
| Documents    | File upload zone + table + status badges                        |
| Events       | Event cards with date block + type filter + location            |

---

## 🔐 Environment Variables

### Backend
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nexus_mobility
DB_USER=nexus
DB_PASS=nexus_secret
JWT_SECRET=your-256-bit-secret
CORS_ORIGINS=http://localhost:3000
PORT=8080
```

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

---

## 📈 Roadmap (Post-MVP)

- [ ] Student-facing portal (university discovery + applications)
- [ ] Scholarship listing & matching engine
- [ ] Email notifications for MoU renewals
- [ ] Multi-language support (i18n)
- [ ] Analytics export (PDF reports)
- [ ] Stripe billing for SaaS subscription tiers
- [ ] Mobile app (React Native)

---

## 👥 User Roles

| Role         | Permissions                                              |
|--------------|----------------------------------------------------------|
| SUPER_ADMIN  | Full access across all tenants                          |
| ADMIN        | Full access within own university                       |
| COORDINATOR  | Manage partnerships, students, programs                 |
| STUDENT      | View programs, submit applications, track status        |
