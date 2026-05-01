# TeamTask - Full-Stack Team Task Manager

A professional-grade, full-stack project management application built with Next.js, MongoDB, and Tailwind CSS.

## 🚀 Features

- **Secure Authentication**: JWT-based auth with hashed passwords (bcrypt).
- **Role-Based Access Control**:
  - **Admin**: Create projects, manage team members, create/assign/delete tasks.
  - **Member**: View projects, track and update status of assigned tasks.
- **Dynamic Dashboard**: Real-time stats for tasks (Total, Completed, Pending, Overdue).
- **Project Management**: Group tasks by project with member assignment.
- **Modern UI**: Sleek, responsive design using Tailwind CSS 4 and Framer Motion.
- **Overdue Highlighting**: Automatic visual cues for tasks past their due date.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS 4, Framer Motion, Lucide Icons.
- **Backend**: Next.js API Routes, Mongoose (MongoDB ODM).
- **Auth**: JSON Web Tokens (JWT), bcrypt.js.
- **Deployment**: Railway
- .

## 📦 Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd team-task-manager
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.


<<<<<<< HEAD

=======
1. **Push your code to GitHub**.
2. **Login to Railway** ([railway.app](https://railway.app/)).
3. **New Project** -> **Deploy from GitHub repo**.
4. **Configure Variables**:
   - Add `MONGO_URI` and `JWT_SECRET` in the Railway "Variables" tab.
   - (Optional) `NEXT_PUBLIC_APP_URL` should be your Railway assigned URL.
5. **Railway Settings**:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
   - **Output**: The project is optimized with `output: 'standalone'` in `next.config.mjs`.
>>>>>>> 9e96417 (Initial commit - Team Task Manager)

## 🛠 Troubleshooting Railway Deployment

- **Build Time Issues**: We use `export const dynamic = 'force-dynamic'` in the root layout to ensure Next.js doesn't try to fetch data from MongoDB during the build phase.
- **Environment Variables**: Ensure `MONGO_URI` and `JWT_SECRET` are present in the Railway dashboard before building.

