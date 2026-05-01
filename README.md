# Team Task Manager

A full-stack team task management application built with Next.js, MongoDB, and JWT authentication.

## Features

- **Authentication** – Sign up / login with JWT tokens stored in httpOnly cookies
- **Role-based access** – First registered user becomes admin; subsequent users are members
- **Projects** – Admins can create projects and add members; members can view their projects
- **Tasks** – Create, update, and delete tasks with status, priority, due date, and assignee
- **Dashboard** – Overview of total, completed, in-progress, and overdue tasks with recent activity

## Tech Stack

- **Next.js 14+** (App Router, TypeScript)
- **MongoDB** with Mongoose
- **Tailwind CSS**
- **JWT** (`jsonwebtoken`) + **bcryptjs**

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Set environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/team-task-manager
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The first user to sign up will automatically be assigned the **admin** role.

## Project Structure

```
app/
  (auth)/         # Login and signup pages
  (dashboard)/    # Protected dashboard, projects, and tasks pages
  api/            # API routes (auth, projects, tasks, dashboard, users)
lib/              # DB connection, auth helpers, middleware
models/           # Mongoose models (User, Project, Task)
middleware.ts     # Route protection middleware
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| GET/POST | `/api/projects` | List / create projects |
| GET/PUT/DELETE | `/api/projects/[id]` | Project detail / update / delete |
| POST | `/api/projects/[id]/members` | Add member to project |
| GET/POST | `/api/tasks` | List / create tasks |
| GET/PUT/DELETE | `/api/tasks/[id]` | Task detail / update / delete |
| GET | `/api/dashboard` | Dashboard stats |
| GET | `/api/users` | List all users |
