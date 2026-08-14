# 💰 Trackee

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)

Precision analytics for your **capital & savings**. Track income flows, monitor recurring expenses, and optimize your financial trajectory with an enterprise-ready analytical workspace.


## 🛠️️ Tech Stack

### Frontend & UI
- **Framework**: [Next.js](https://nextjs.org/) (App Router, React)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components & Icons**: [shadcn/ui](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/)

### Backend & Database
- **Backend as a Service**: [Supabase](https://supabase.com/) (Auth, PostgreSQL Database, Row Level Security)

### Deployment
- **Platform**: [Vercel](https://vercel.com/)

---


## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/zoerlyx/trackee.git
```

### 2. Navigate to the project

```bash
cd trackee
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your Supabase project credentials in .env.local:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 5. Start the development server

```bash
npm run dev
```

Open your browser and visit:

```
http://localhost:3000
```

---
