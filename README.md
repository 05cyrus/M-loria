# 🌿 Méloria — AI-Powered Meal Tracker

A private, production-ready Next.js 14 + Firebase meal tracking app for a close group of friends. Uses AI to estimate calories, protein, and price from simple meal inputs.

---

## ✨ Features

- **AI Nutrition Estimation** — Enter a meal name + quantity, get calories/protein/price via AI
- **Personalised Goals** — First-time setup calculates maintenance calories and goal calories using AI
- **Real-Time Dashboard** — Dual circular progress rings for maintenance and goal calories
- **Meal Management** — Add, edit, and delete meals; view today's meals and monthly history
- **Firebase Auth** — Email/password login with protected routes
- **Responsive UI** — Works beautifully on mobile and desktop

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) → Create a project
2. Enable **Authentication** → Email/Password
3. Enable **Firestore Database** (start in production mode)
4. Copy your web app config

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Firebase config and optionally an Anthropic API key:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Optional — if not set, app uses smart mock estimates
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Set up Firestore Security Rules

In Firebase Console → Firestore → Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only read/write their own meals
    match /meals/{userId}/entries/{mealId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Create Firestore Indexes

In Firebase Console → Firestore → Indexes, create these composite indexes:

**Collection:** `meals/{userId}/entries`
| Field | Order |
|-------|-------|
| date | Ascending |
| timestamp | Descending |

**Collection:** `meals/{userId}/entries`
| Field | Order |
|-------|-------|
| date | Ascending |
| timestamp | Ascending |

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
meloria/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login screen
│   │   ├── register/page.tsx       # Registration screen
│   │   └── layout.tsx              # Auth layout (centered, blurred bg)
│   ├── (app)/
│   │   ├── dashboard/page.tsx      # Main dashboard
│   │   ├── setup/page.tsx          # First-time goal setup (3-step)
│   │   ├── meals/page.tsx          # Full meal history
│   │   └── layout.tsx              # App layout with sidebar guard
│   ├── api/
│   │   └── ai/
│   │       ├── meal/route.ts       # AI meal nutrition endpoint
│   │       └── goals/route.ts      # AI goal calculation endpoint
│   ├── globals.css                 # Design tokens + global styles
│   ├── layout.tsx                  # Root layout with fonts + AuthProvider
│   └── page.tsx                    # Root redirect logic
├── components/
│   ├── dashboard/
│   │   └── CalorieRing.tsx         # SVG circular progress ring
│   ├── meals/
│   │   ├── AddMealModal.tsx        # AI meal input + review modal
│   │   ├── TodaysMeals.tsx         # Today's meal grid with inline edit
│   │   └── MonthlyOverview.tsx     # Monthly calendar overview
│   └── ui/
│       ├── Sidebar.tsx             # Nav sidebar + mobile header
│       ├── LoadingScreen.tsx       # Full-page loading state
│       └── DashboardSkeleton.tsx   # Dashboard loading skeleton
├── hooks/
│   ├── useAuth.tsx                 # Auth context + user profile
│   └── useMeals.ts                 # Real-time meal subscriptions
├── lib/
│   ├── ai.ts                       # AI service client (calls API routes)
│   ├── auth.ts                     # Firebase Auth helpers
│   ├── firebase.ts                 # Firebase app initialization
│   ├── firestore.ts                # Firestore CRUD operations
│   └── utils.ts                    # Shared utilities
├── types/
│   └── index.ts                    # TypeScript interfaces
└── middleware.ts                   # Next.js middleware
```

---

## 🔥 Firestore Data Model

```
users/{userId}
  name: string
  email: string
  phone: string
  dob: string (ISO date)
  age: number
  height: number (cm)
  weight: number (kg)
  maintenanceCalories: number
  goalCalories: number
  goalType: "weight_loss" | "muscle_gain" | "maintain"
  recommendation: string
  setupComplete: boolean
  createdAt: string

meals/{userId}/entries/{mealId}
  userId: string
  name: string
  quantity: string
  calories: number
  protein: number
  price: number | null
  timestamp: string (ISO)
  date: string (YYYY-MM-DD)
```

---

## 🧠 AI Integration

- Uses **Anthropic Claude** (claude-sonnet-4) via server-side API routes
- Falls back to **smart mock estimation** if no API key is configured
- Two AI capabilities:
  1. **Meal estimation** — calories, protein, price in ₹ for Indian context
  2. **Goal calculation** — Mifflin-St Jeor formula + activity multiplier + BMI-based recommendation

---

## 🎨 Design

- **Aesthetic:** Dark organic / refined brutalist with forest greens + amber accents
- **Fonts:** DM Serif Display (headings) + DM Sans (body) + DM Mono (numbers)
- **Glass morphism** cards with subtle grain overlay
- **Animated** circular SVG progress rings
- Mobile-first responsive layout

---

## 🚀 Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add all environment variables in Vercel dashboard → Settings → Environment Variables.
