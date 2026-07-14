# Questify 🌟
Level up your learning, one quest at a time.

## Table of Contents 📖
- [About the Project](#about-the-project)
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About the Project 📃

**Questify** is a gamified learning management platform designed to make education engaging, competitive, and rewarding. Built for students, teachers, and administrators, Questify transforms the everyday academic experience — attending classes, submitting assignments, reading course materials — into a point-scoring adventure.

Students earn XP points for every action they take, climb per-course leaderboards, and track their academic progress in one unified dashboard. Teachers and admins manage courses and users through purpose-built dashboards, keeping the platform organised and up to date.

Whether you're a student chasing the top of the leaderboard or an admin keeping the catalogue fresh, Questify turns learning into a quest worth pursuing.

---

## Project Overview 📊

| | |
|---|---|
| **Objective** | Build a gamified LMS that motivates students through points, leaderboards, and course progress tracking. |
| **Target Audience** | University students, teachers, and administrators. |
| **Status** | ✅ Core features fully implemented and verified. |
| **Deployment** | Hosted on Vercel (Frontend) and Railway (Backend). |

**Key Metrics (targets):**
- Points earned per session: tracked in real-time
- Leaderboard update frequency: instant
- Role-based access: Student · Teacher · Admin
- Daily Active Users: 10+

---

## ✨ Key Features

### 1. Gamified Point System
- Earn **+10 pts** for attendance — get marked present in a class.
- Earn **+25 pts** for assignments — submit on time for bonus points.
- Earn **+15 pts** for reading PDFs — read course materials directly on the platform.
- Every action contributes to your course rank.

### 2. Per-Course Leaderboards
- Each course maintains its own live leaderboard.
- Compete with peers and see your ranking update in real-time.
- Motivation built right into the learning flow.

### 3. Course Catalogue
- Browse courses across categories: Technology, CS, Design, AI, Cloud, Testing, and more.
- Filter by level (Bachelor / Master), semester, campus, and category.
- View detailed course information before enrolling.

### 4. Student Dashboard
- Track personal XP, course progress, and leaderboard standing.
- View assignment history and attendance records.
- All your academic activity in one place.

### 5. Teacher Dashboard
- Manage enrolled students and course content.
- Record attendance and grade assignments.
- Monitor class-level leaderboard standings.

### 6. Admin Dashboard
- Platform-wide overview: total users, teachers, students, and courses.
- **User Management:** Create, view, and manage teacher and student accounts.
- **Course Management:** Add, update, or remove courses from the catalogue.
- Role-based access control throughout.

### 7. Authentication & Role-Based Access
- Secure sign-in with Clerk integration (`@clerk/nextjs`).
- Three distinct roles: **Student**, **Teacher**, **Admin** — each with their own protected routes and dashboards.
- Middleware-level route protection.

### 8. Additional Features
- **AI Tutor Chatbot:** Connect with a virtual teaching assistant powered by LLM APIs.
- **Fully Responsive:** Accessible on desktop, tablet, and mobile devices.
- **Modern UI:** Built with Tailwind CSS v4 and HeroUI (nextui) components.
- **Lottie Animations:** Smooth, lightweight animations on the landing page.

---

## Tech Stack 🛠️

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS v4, HeroUI, Radix UI |
| **Authentication** | Clerk Authentication (`@clerk/nextjs`) |
| **Backend API** | Node.js, Express, MongoDB, Mongoose |
| **Icons / Animation** | Lucide React, React Icons, Lottie (dotlottie-react) |
| **Deployment** | Vercel (Frontend) and Railway (Backend) |

---

## Installation ⚙️

Clone the repo and set up both the backend and frontend:

```bash
git clone https://github.com/boishakhi-mukta/Questify
cd Questify
```

### 1. Set up the Backend
```bash
cd backend
npm install
```
Configure backend environment variables by creating a `.env` file in `backend/`:
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/questify
JWT_SECRET=your_32_character_jwt_secret_key
JWT_REFRESH_SECRET=your_32_character_refresh_secret
CLERK_SECRET_KEY=your_clerk_secret_key
```
Seed the database with default accounts and mock courses:
```bash
npm run seed
```
Run the backend server:
```bash
npm run dev
```

### 2. Set up the Frontend
```bash
cd ../frontend-next
npm install
```
Configure frontend environment variables by creating a `.env.local` file in `frontend-next/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```
Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Contributing 🤝

Contributions are welcome! Steps to contribute:

1. Fork the Project
2. Create a branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License 📜

Distributed under the MIT License. See `LICENSE` for more information.

---

## Contact 📬

**Boishakhi Mukta**

- 🔗 LinkedIn: [linkedin.com/in/boishakhimukta](https://www.linkedin.com/in/boishakhimukta/)
- 🐙 GitHub: [github.com/boishakhi-mukta](https://github.com/boishakhi-mukta)
- 📧 Email: bgmukta11@gmail.com

---

> 🌟 All core modules — including the Student Dashboard, Teacher Dashboard, XP tracking, and leaderboard functionality — are fully implemented and verified.
