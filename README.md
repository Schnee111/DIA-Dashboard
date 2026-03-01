<div align="center">
  <img src="public/logo-upi.png" alt="UPI Logo" width="200"/>
  <h1>DIA Dashboard</h1>
  <p><strong>Sistem Manajemen Kerjasama — Direktorat Urusan Internasional UPI</strong></p>
  <p>
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-project-structure">Project Structure</a> •
    <a href="#-database-schema">Database Schema</a> •
    <a href="#-usage">Usage</a>
  </p>
</div>

---

## 📋 Overview

**DIA Dashboard** is a full-stack web application for managing and visualizing international cooperation (kerjasama) data at **Universitas Pendidikan Indonesia (UPI)**. It is built for the **Direktorat Urusan Internasional (DIA)** to track partner institutions, cooperation agreements, and personnel involved in international collaborations.

The system supports two roles:
- **Admin** — full access to data management and all dashboard features
- **Guest** — read-only access to the public dashboard and data views

---

## ✨ Features

### 📊 Dashboard
- Summary statistics: total partners, cooperation agreements, active cooperations, and countries involved
- Expiring cooperation alerts (within 3 months) with expandable detail table
- Interactive charts powered by **Recharts**:
  - Yearly cooperation trend
  - Status distribution (pie/donut)
  - Document type distribution
  - Country distribution (top 10)
  - Partner distribution (top 10)

### 🗃️ Data Management
- **Data Mitra** — manage partner institutions (name, country, address, partner type)
- **Data Kerjasama** — manage cooperation agreements (title, document number, period, status, output, and signatories)
- **Data Personel** — manage personnel involved in cooperations
- Year-range filtering across all data tabs
- Search and export functionality

### 🔐 Authentication & Authorization
- Admin login with username/password (bcrypt-hashed)
- Guest access (no credentials required)
- Role-based navigation (admin-only routes protected)

### 🎨 UI/UX
- Responsive layout with collapsible sidebar
- Dark/light theme support via `next-themes`
- Toast notifications for user feedback

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Charts | [Recharts](https://recharts.org/) |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| Auth | Custom (bcrypt password hashing) |
| Form Handling | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Icons | [Lucide React](https://lucide.dev/) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [pnpm](https://pnpm.io/) (recommended) or npm
- A [Supabase](https://supabase.com/) project

### 1. Clone the Repository

```bash
git clone https://github.com/Schnee111/DIA-Dashboard.git
cd DIA-Dashboard
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Configure Supabase

Update the Supabase URL and anon key in `lib/supabaseClient.ts`:

```ts
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
```

> **Tip:** It is recommended to use environment variables. Create a `.env.local` file in the project root:
>
> ```env
> NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
> NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
> ```

### 4. Set Up the Database

Apply the SQL schema found in `lib/db.sql` to your Supabase project using the **SQL Editor** in the Supabase dashboard. The schema creates the following tables and views:

- Tables: `mitra`, `kerjasama`, `personel`, `jabatan`, `negara`, `jenis_dokumen`, `jenis_partner`, `users`, `roles`, `user_roles`, `permissions`, `role_permissions`
- Views: `v_semua_kerjasama`, `v_semua_mitra`, `v_statistik_negara`

### 5. Run the Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
DIA-Dashboard/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin data management page
│   ├── api/auth/           # Authentication API routes (login, register)
│   ├── dashboard/          # Main dashboard page
│   ├── data/               # Public data view page
│   ├── login/              # Login page
│   ├── layout.tsx          # Root layout with theme provider
│   └── page.tsx            # Root redirect to /login
├── components/             # Reusable UI components
│   ├── dashboard/          # Dashboard-specific charts and stat cards
│   ├── tabs/               # Data tab components (Mitra, Kerjasama, Personel)
│   ├── ui/                 # shadcn/ui base components
│   ├── dashboard-layout.tsx
│   ├── header.tsx
│   ├── sidebar.tsx
│   └── theme-provider.tsx
├── hooks/                  # Custom React hooks
│   ├── use-data-fetch.ts
│   ├── use-form-handlers.ts
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/                    # Utilities and services
│   ├── auth.ts             # Authentication helpers
│   ├── dataService.ts      # Supabase data fetching functions
│   ├── db.sql              # Database schema
│   ├── exportUtils.tsx     # Data export utilities
│   ├── supabaseClient.ts   # Supabase client initialization
│   └── utils.ts            # General utilities
├── types/                  # TypeScript type definitions
├── utils/                  # Formatting utilities
├── public/                 # Static assets (logos, images)
└── styles/                 # Global CSS
```

---

## 🗄️ Database Schema

The core domain tables are:

| Table | Description |
|---|---|
| `mitra` | Partner institutions |
| `kerjasama` | Cooperation agreements |
| `personel` | Personnel involved in cooperations |
| `jabatan` | Position/role of personnel |
| `negara` | Countries |
| `jenis_dokumen` | Document types (MoU, MoA, etc.) |
| `jenis_partner` | Partner categories |
| `users` | System users |
| `roles` | User roles (admin, etc.) |
| `permissions` | Granular permissions |

Key views pre-join related tables for efficient querying (`v_semua_kerjasama`, `v_semua_mitra`, `v_statistik_negara`).

---

## 📖 Usage

### Logging In

Navigate to `http://localhost:3000`. You will be redirected to the login page.

- **Admin:** Enter your username and password, then click **Login sebagai Admin**.
- **Guest:** Click **Lanjutkan sebagai Tamu** to access read-only views.

### Navigation

| Page | Route | Access |
|---|---|---|
| Dashboard | `/dashboard` | Admin & Guest |
| Data Publik | `/data` | Admin & Guest |
| Manajemen Data | `/admin` | Admin only |

### Available Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Create production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is developed for internal use by **Direktorat Urusan Internasional, Universitas Pendidikan Indonesia**.

---

<div align="center">
  &copy; 2025 Direktorat Urusan Internasional — Universitas Pendidikan Indonesia
</div>
