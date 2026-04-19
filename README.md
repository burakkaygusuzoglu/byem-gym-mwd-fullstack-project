# BYEM GYM — Web-Based Gym Management System

A full-stack web application for managing gym members, classes, memberships, and exercise recommendations.

---

## 👥 Team Members

| Name | Role |
|---|---|
| Burak Kaygusuzoğlu | Frontend Developer, Auth, Admin Panel, Deployment |
| Nevzat Berk Akkaş | Frontend Developer, Membership, Booking, Exercise API |

---

## 🚀 Features

- User Registration & Login (Supabase Auth)
- Membership Plan Management
- Gym Class Booking System
- User Profile Management
- Exercise Recommendation (External API)
- Admin Dashboard

---

## 🛠️ Technologies

- HTML5, CSS3 (Flexbox, Grid, Media Queries)
- JavaScript (ES6+)
- jQuery 3.7.1
- Fetch API / AJAX
- Supabase (Authentication + Database)
- Font Awesome 6
- Google Fonts (Bebas Neue, DM Sans)

---

## ⚙️ Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/byem-gym.git
   cd byem-gym
   ```

2. Configure Supabase:
   - Create a project at [supabase.com](https://supabase.com)
   - Copy your **Project URL** and **anon key**
   - Open `assets/js/supabase-config.js` and replace:
     ```js
     const SUPABASE_URL      = 'YOUR_SUPABASE_URL';
     const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
     ```

3. Open `index.html` in a browser.  
   > Recommended: Use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code for best results.

---

## 🌐 External APIs

| API | Purpose | Link |
|---|---|---|
| ExerciseDB / API Ninjas Exercises | Exercise recommendations by body part | [api-ninjas.com/api/exercises](https://api-ninjas.com/api/exercises) |

---

## 🗄️ Database Schema (Supabase)

Tables:
- `profiles` — user profile data (linked to auth.users)
- `memberships` — membership plans and user subscriptions
- `classes` — gym class schedule
- `bookings` — class reservations

---

## 📸 Screenshots

> *(Add screenshots here after development)*

---

## 🌍 Deployment

Live URL: *(will be added after deployment to Netlify/Vercel)*

---

## 📁 Project Structure

```
byem-gym/
├── index.html
├── pages/
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── membership.html
│   ├── booking.html
│   ├── profile.html
│   ├── exercises.html
│   └── admin.html
├── assets/
│   ├── css/        (main.css + per-page stylesheets)
│   ├── js/         (main.js, supabase-config.js + per-page scripts)
│   └── images/
├── .gitignore
└── README.md
```
