# Santa Maria Municipality - Digital Portal (v2)

A modern, full-stack digital platform for the Santa Maria Municipal Government, designed to streamline public announcements, service information, and community engagement. This project features a high-performance Next.js frontend and a robust Fastify backend, integrated with AI capabilities for enhanced user experience and administrative efficiency.

## 🚀 Tech Stack

### Frontend (Client-Side)

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (Radix UI based)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Data Fetching:** [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Charts:** [Recharts](https://recharts.org/)
- **Icons:** Heroicons & Lucide React

### Backend (Server-Side)

- **Framework:** [Fastify](https://fastify.dev/)
- **Language:** TypeScript
- **Runtime:** Node.js (tsx for development)
- **Security:** Helmet, CORS, CSRF Protection, Rate Limiting
- **Authentication:** JWT (JSON Web Tokens) with Cookie support

### Database & Storage

- **Database:** SQLite (via `better-sqlite3`)
- **Schema Management:** Custom migration system (`backend/src/db/migrations.ts`)
- **Seeding:** Automated data seeding (`backend/src/db/seed.ts`)

---

## 📂 Project Structure

The project follows a monorepo-like structure where both frontend and backend share the root `package.json` but maintain distinct directories.

```
├── app/                    # Next.js App Router (Frontend)
│   ├── admin/              # Admin Panel routes (Protected)
│   ├── api/                # Next.js API Routes (e.g., MariBot)
│   ├── components/         # Reusable React components
│   ├── contexts/           # React Contexts (Auth, Theme, Toast)
│   ├── hooks/              # Custom React Hooks
│   └── lib/                # Utility functions and schemas
├── backend/                # Fastify Server (Backend)
│   ├── data/               # SQLite database file location
│   └── src/
│       ├── db/             # Database connection, migrations, seeds
│       ├── plugins/        # Fastify plugins (Auth, CSRF)
│       ├── routes/         # API Route definitions
│       │   ├── admin/      # Protected Admin routes
│       │   └── public/     # Public facing routes
│       └── server.ts       # Server entry point
├── public/                 # Static assets
└── ...config files         # TSConfig, Tailwind, Next.js config
```

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd mbp-v2-test-branch
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory. You can copy the structure from `.env.example` (if available) or ensure the following keys are present:

    ```env
    # Backend
    PORT=4001
    JWT_SECRET=your-super-secret-jwt-key
    NODE_ENV=development
    LOG_LEVEL=info

    # Frontend
    NEXT_PUBLIC_API_URL=http://localhost:4001
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ```

### Running the Application

We use `concurrently` to run both the Next.js frontend and Fastify backend in a single terminal window.

```bash
npm run dev:all
```

- **Frontend:** Accessible at `http://localhost:3000`
- **Backend:** Accessible at `http://localhost:4001`

---

## 🧠 Core Engines & Features

### 1. MariBot (AI Chatbot)

Located in `app/api/maribot`, this engine provides an interactive chatbot interface for citizens. It processes natural language queries to guide users to relevant services, announcements, or departments.

### 2. AI Content Assistant

Integrated directly into the **Post Editor** (`app/admin/posts/post-editor`), this engine helps administrators:

- **Draft Content:** Generate announcements based on brief prompts.
- **Adjust Tone/Length:** Expand or shorten content automatically.
- **Language Support:** Capable of generating content in English and Tagalog.

### 3. Admin Panel

A comprehensive dashboard for municipal staff:

- **Post Management:** Create, edit, delete, and schedule announcements.
- **Analytics:** View real-time engagement metrics (views, trends).
- **User Management:** Manage admin access and roles.
- **Settings:** Configure system-wide preferences.

### 4. Custom Migration Engine

The backend utilizes a lightweight, custom-built migration system (`backend/src/db/migrations.ts`) to manage SQLite schema changes without the overhead of a heavy ORM. This ensures the database structure remains consistent across environments.

---

## 🔌 API Documentation

The backend exposes a RESTful API. Key endpoints include:

### Public Routes

- `GET /public/posts` - Fetch published announcements.
- `GET /public/posts/:slug` - Fetch a single post by slug.
- `GET /public/services` - List available municipal services.

### Admin Routes (Protected)

- `POST /auth/login` - Admin authentication.
- `GET /admin/posts` - List all posts (Draft, Published, Scheduled).
- `POST /admin/posts` - Create a new post.
- `PUT /admin/posts/:id` - Update an existing post.
- `DELETE /admin/posts/:id` - Delete a post.
- `GET /admin/analytics/posts/:id` - Get detailed analytics for a post.

---

## 🧪 Testing

- **Backend Tests:** Run using Vitest.
  ```bash
  npm run test:backend
  ```
- **E2E Tests:** Run using Playwright.
  ```bash
  npm run test:e2e
  ```

## 📄 License

This project is proprietary software of the Santa Maria Municipal Government.
