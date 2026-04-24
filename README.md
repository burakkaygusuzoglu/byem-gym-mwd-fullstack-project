# BYEM GYM — Web-Based Gym Management System

> A full-stack web application for managing gym members, classes, memberships, and exercise recommendations.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![jQuery](https://img.shields.io/badge/jQuery-0769AD?style=flat&logo=jquery&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)

---

## 🌐 Live URLs

| Service | URL |
|---|---|
| Frontend (Vercel) | https://byemgym.vercel.app |
| Backend API (Railway) | https://byemgym.up.railway.app |

---

## 👥 Team Members

| Name | Role |
|---|---|
| Burak Kaygusuzoglu | Frontend Developer, Admin Panel, DevOps & Deployment |
| Nevzat Berk Akkas | Backend Developer (Node.js + Express, REST API, JWT) |

---

## 🚀 Features

- **User Authentication** — Register, login, JWT-based session management
- **Membership Plans** — Basic, Classic, Elite with monthly/annual billing toggle
- **Class Booking** — Real-time capacity tracking, conflict detection, cancellation
- **Exercise Guide** — 1,300+ exercises via API Ninjas, filterable by muscle group & difficulty
- **User Profile** — Edit personal info, change password, view stats
- **Admin Panel** — Manage classes, users, memberships, bookings (CRUD)
- **TR / EN Language Toggle** — Bilingual support with localStorage persistence
- **Fully Responsive** — Desktop, tablet, and mobile tested

---

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3 (Flexbox, Grid, Media Queries)
- JavaScript (ES6+), jQuery 3.7.1
- Fetch API / AJAX
- Font Awesome 6, Google Fonts (Bebas Neue, DM Sans)

### Backend
- Node.js + Express
- JSON Web Token (JWT) — 7-day expiry, Bearer token
- bcryptjs — Password hashing
- CORS, dotenv

### Database
- Supabase (PostgreSQL)
- Tables: `profiles`, `classes`, `bookings`, `memberships`

### DevOps
- GitHub — Branching strategy (main → dev → feature/*)
- Vercel — Frontend hosting
- Railway — Backend hosting

---

## ⚙️ Running Locally

### Prerequisites
- Node.js v18+
- A Supabase project (free tier works)
- API Ninjas account (free tier)

### 1. Clone the repository

```bash
git clone https://github.com/burakkaygusuzoglu/byem-gym-mwd-fullstack-project.git
cd byem-gym-mwd-fullstack-project
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_secret_key_here
PORT=3000
```

Start the backend server:

```bash
node server.js
# Server running on http://localhost:3000
```

### 3. Set up the Frontend

Open `assets/js/api.js` and update the base URL:

```js
const API_BASE = 'http://localhost:3000/api';
```

Open `index.html` with [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code.

### 4. Set up the Database

In your Supabase project, open **SQL Editor** and run:

```sql
-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade,
  full_name text,
  email text,
  role text default 'member',
  created_at timestamp default now(),
  primary key (id)
);

-- Memberships table
create table memberships (
  id serial primary key,
  user_id uuid references profiles(id),
  plan_name text,
  start_date date,
  end_date date,
  status text default 'active'
);

-- Classes table
create table classes (
  id serial primary key,
  name text,
  instructor text,
  schedule timestamp,
  capacity int,
  created_at timestamp default now()
);

-- Bookings table
create table bookings (
  id serial primary key,
  user_id uuid references profiles(id),
  class_id int references classes(id),
  booked_at timestamp default now(),
  status text default 'confirmed'
);

-- Auto-create profile on user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'member'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 🌐 API Endpoints

**Base URL:** `https://byemgym.up.railway.app/api`

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login — returns JWT | No |
| GET | `/auth/me` | Get current user | JWT |
| PUT | `/auth/password` | Change password | JWT |

### Classes
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/classes` | List all classes | No |
| GET | `/classes/:id` | Get single class | No |
| POST | `/classes` | Create class | Admin JWT |
| PUT | `/classes/:id` | Update class | Admin JWT |
| DELETE | `/classes/:id` | Delete class | Admin JWT |

### Bookings
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/bookings` | Get own bookings | JWT |
| POST | `/bookings` | Create booking | JWT |
| DELETE | `/bookings/:id` | Cancel booking | JWT |

### Memberships
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/memberships/me` | Get active membership | JWT |
| POST | `/memberships` | Purchase membership | JWT |
| DELETE | `/memberships/me` | Cancel membership | JWT |

### Users
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/users` | List all users | Admin JWT |
| GET | `/users/me` | Get own profile | JWT |
| PUT | `/users/me` | Update profile | JWT |
| PUT | `/users/:id/role` | Change user role | Admin JWT |

> **Authentication:** Include `Authorization: Bearer <token>` header for protected routes.

---

## 🔗 External APIs

| API | Purpose | Link |
|---|---|---|
| API Ninjas Exercises | 1,300+ exercise database | [api-ninjas.com/api/exercises](https://api-ninjas.com/api/exercises) |
| Supabase | PostgreSQL database & auth | [supabase.com](https://supabase.com) |

---

## 📁 Project Structure

```
byem-gym-mwd-fullstack-project/
├── index.html                  ← Landing page
├── pages/
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── membership.html
│   ├── booking.html
│   ├── exercises.html
│   ├── profile.html
│   └── admin.html
├── assets/
│   ├── css/                    ← Per-page stylesheets + main.css
│   └── js/
│       ├── api.js              ← Unified API client (Auth, Classes, Bookings, etc.)
│       ├── main.js             ← Global utilities, auth guard, navbar
│       ├── i18n.js             ← TR/EN language system
│       ├── auth.js             ← Login & register logic
│       ├── dashboard.js
│       ├── membership.js
│       ├── booking.js
│       ├── exercises.js
│       ├── profile.js
│       └── admin.js
├── backend/
│   ├── server.js               ← Express app entry point
│   ├── supabase.js             ← Supabase client
│   ├── middleware/
│   │   └── auth.js             ← JWT verification middleware
│   ├── routes/
│   │   ├── auth.js
│   │   ├── classes.js
│   │   ├── bookings.js
│   │   ├── memberships.js
│   │   └── users.js
│   ├── package.json
│   ├── .env.example
│   └── README.md               ← Backend-specific documentation
├── .gitignore
└── README.md
```

---

## 📸 Screenshots

<img width="945" height="470" alt="image" src="https://github.com/user-attachments/assets/960abceb-ae0b-4d24-acb0-363ffb4b549e" />


---

## 📋 Version Control

This project follows a structured Git branching strategy:

- `main` — Production-ready code, deployed to Vercel
- `dev` — Integration branch, all features merged here first
- `feature/*` — Individual feature branches (e.g. `feature/auth-dashboard`, `feature/membership-booking`)

All features developed via Pull Requests into `dev`, with final merge to `main` for deployment.

---

## 📄 License

This project was developed for academic purposes at International Balkan University, Faculty of Engineering — Computer Engineering, Multimedia and Web Design course (2025/2026).
