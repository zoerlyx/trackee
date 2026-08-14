# 💰 Trackee

Precision analytics for your **capital & savings**. Track income flows, monitor recurring expenses, and optimize your financial trajectory with an enterprise-ready analytical workspace.


## ✨ Key Features

- 🔐 **Secure Authentication**: Multi-device auth powered by Supabase.
- 📊 **Financial Overview**: Real-time capital monitoring with active notes & balance indicators.
- 💸 **Capital Flow & Expense Analytics**: Modern category-based expense breakdown and interactive analytics.
- 💵 **Income & Outflow Tracking**: Comprehensive history of active capital movements.
- 📈 **Interactive Charts**: Donut charts, balance trends, and comparison analytics built with Recharts.
- 🗂️ **Category Management**: Tailor categories with dynamic colors and icons.
- 📱 **Glassmorphism UI**: Beautiful, fully responsive UI built with Tailwind CSS & Lucide Icons.

---

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
