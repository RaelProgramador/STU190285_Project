# FireGuitar — Guitar Learning Platform

A structured online guitar course that takes the student **from absolute zero to a professional level**.
Lessons unlock one at a time as the student completes them, progress is tracked in %, and students can set personal practice goals.

## Quick start

Requirements: **Node.js 18 or newer**.

```bash
npm install
npm start
```

Open **http://localhost:3000**.

On the first start the database (`database.sqlite`) is created automatically and filled with the full curriculum and two demo accounts — no extra setup is needed.

### Demo accounts

| Role    | Email                    | Password      |
|---------|--------------------------|---------------|
| Student | student@fireguitar.com   | Student1234   |
| Admin   | admin@fireguitar.com     | Admin1234     |

The student account already has some lessons completed and goals created, so the dashboard shows real data.

### Scripts

| Command        | What it does                                                  |
|----------------|---------------------------------------------------------------|
| `npm start`    | Starts the server                                             |
| `npm run dev`  | Starts the server with auto-reload (nodemon)                  |
| `npm run seed` | Resets the database to the initial curriculum and demo users  |

### Configuration (optional)

The app runs without any configuration. To customise it, copy `.env.example` to `.env` and adjust the values (port, database path, JWT secret, token lifetime).
In production (`NODE_ENV=production`) a `JWT_SECRET` is mandatory.

## Features

- **Accounts & permissions** — registration and login with hashed passwords (bcrypt) and JWT authentication. Two roles: `student` and `admin`.
- **Progressive unlocking** — each lesson becomes available only after the previous one is completed. Guests can browse the curriculum but lessons stay locked. This is enforced by the API, not just the interface.
- **Learning path from zero to pro** — 6 stages, 18 modules and 54 lessons:
  1. Foundations (Absolute Beginner)
  2. Open Chords & First Songs (Beginner)
  3. Power, Barre & Blues (Improver)
  4. Lead Guitar & Improvisation (Intermediate)
  5. Fretboard Mastery & Theory (Advanced)
  6. The Professional Guitarist (Professional)
- **Simple teaching method** — every lesson follows the same steps: *Watch* (video) → *Understand* (explanation) → *Read the TAB* → *Practise* (checklist) → *Mark complete*.
- **Progress in %** — overall, per stage and per module, plus minutes practised, streak and weekly activity on the dashboard.
- **Goals** — lessons or minutes per day/week/month/total, or custom goals ticked off manually. Progress is calculated automatically.
- **Admin panel** — platform statistics, user role management and editing of lesson videos (YouTube link or ID).
- **Light and dark theme** — follows the system preference and remembers the user's choice.
- **Responsive** — desktop header with navigation on the right; on mobile a compact header plus a bottom tab bar.

## Tech stack

- **Backend:** Node.js, Express 5, SQLite (`sqlite3`), bcryptjs, jsonwebtoken, dotenv
- **Frontend:** HTML, CSS and vanilla JavaScript (ES modules), Bootstrap Icons, Inter font — no build step

## Project structure

```
├── public/                     # Frontend (served statically)
│   ├── *.html                  # Pages: index, login, register, course, lesson, dashboard, goals, admin
│   └── assets/
│       ├── css/
│       │   ├── base.css        # Design tokens (light/dark), reset, layout utilities
│       │   ├── components.css  # Header, buttons, cards, forms, progress, tables...
│       │   └── pages/          # One stylesheet per page
│       ├── js/
│       │   ├── core/           # API client, session, theme, layout, forms, UI helpers
│       │   └── pages/          # One script per page
│       └── images/
└── src/                        # Backend
    ├── server.js               # Entry point (creates schema, seeds if empty, starts server)
    ├── app.js                  # Express app: middleware, API routes, static files
    ├── routes.js               # Mounts every feature router under /api
    ├── config/                 # Environment variables and database connection
    ├── database/
    │   ├── schema.js           # Tables and indexes
    │   ├── seed.js             # Seeder (npm run seed)
    │   └── seeds/              # Curriculum (6 stages) and demo users
    ├── middlewares/            # authenticate, authorize (roles), error handler
    ├── modules/                # Feature modules: routes → controller → service (+ validator)
    │   ├── auth/
    │   ├── courses/
    │   ├── lessons/
    │   ├── learning-path/      # Unlock rules and progress calculation
    │   ├── progress/
    │   ├── goals/
    │   └── admin/
    └── utils/                  # AppError, asyncHandler, validation, date helpers
```

## API overview

All endpoints are under `/api`. Protected routes expect `Authorization: Bearer <token>`.

| Method | Endpoint                         | Access   | Description                              |
|--------|----------------------------------|----------|------------------------------------------|
| POST   | `/auth/register`                 | Public   | Create an account                        |
| POST   | `/auth/login`                    | Public   | Log in and receive a token               |
| GET    | `/auth/me`                       | User     | Current user                             |
| GET    | `/courses`                       | Public*  | All stages with progress                 |
| GET    | `/courses/:slug`                 | Public*  | Stage details, modules and lessons       |
| GET    | `/lessons/:id`                   | User     | Lesson content (403 if locked)           |
| POST   | `/lessons/:id/complete`          | User     | Complete a lesson and unlock the next    |
| GET    | `/progress/summary`              | User     | Dashboard data                           |
| GET/POST | `/goals`                       | User     | List / create goals                      |
| PATCH/DELETE | `/goals/:id`               | User     | Update / delete own goal                 |
| GET    | `/admin/stats`, `/admin/users`, `/admin/lessons` | Admin | Admin data              |
| PATCH  | `/admin/users/:id/role`          | Admin    | Change a user's role                     |
| PATCH  | `/admin/lessons/:id/video`       | Admin    | Set or remove a lesson video             |

\* Progress and lesson status are included when a valid token is sent.
