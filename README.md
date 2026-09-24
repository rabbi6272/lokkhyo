# CSE-2100 — Academic Progress Tracker

An offline-first-style academic progress tracking app for university students. Track your **continuous assessment (CT) marks**, keep a **weekly class routine**, and set **academic targets** (GPA / CGPA / attendance) — all synced to a Firebase backend.

Built with **Expo SDK 54** (React Native 0.81, React 19), **TypeScript**, **expo-router v6**, the **Firebase JS SDK** (Auth + Firestore), and **TanStack Query v5** for server state.

---

## Features

| Tab | What it does |
| --- | --- |
| **Home** | Dashboard: greeting, next class from your routine, CT progress summary, target progress |
| **Courses** | Course cards with live CT progress; tap through to a course detail screen |
| **Routine** | Weekly class grid (Sun–Sat) with times and rooms; "today" pre-selected |
| **Targets** | GPA / CGPA / attendance / custom targets with progress bars |
| **Profile** | Edit your profile (name, university, department, semester, target CGPA), sign out |

Course detail lets you add/delete assessments (CT, quiz, assignment, lab) with marks, weights, and dates, and shows weighted progress toward the course total.

---

## Tech stack

- **Expo SDK 54** with the managed workflow — runs in **Expo Go**, no dev build required
- **expo-router v6** — file-based routing with typed routes and protected routes
- **React 19** + **TypeScript** (strict)
- **Firebase JS SDK v12** (`firebase` npm package)
  - **Firebase Auth** — email/password authentication
  - **Cloud Firestore** — NoSQL document database
- **TanStack Query v5** — server-state caching, queries, mutations, invalidation
- **@react-native-async-storage/async-storage** — auth session persistence on native
- Inline form validation — no form/validation libraries

---

## Architecture

The app follows a strict **layered** structure. UI screens never talk to Firebase directly; they go through hooks → services → the Firebase client.

```
┌────────────────────────────────────────────────────────────┐
│  Screens (app/**)                                          │
│  expo-router routes, themed components, forms              │
└──────────────────────────────┬─────────────────────────────┘
                               │ useQuery / useMutation
┌──────────────────────────────▼─────────────────────────────┐
│  Hooks (hooks/use-*.ts)                                    │
│  TanStack Query: queryKey, enabled: !!user, invalidate     │
└──────────────────────────────┬─────────────────────────────┘
                               │ typed functions
┌──────────────────────────────▼─────────────────────────────┐
│  Services (services/*.ts)                                  │
│  Firestore CRUD: getDocs / setDoc / addDoc / updateDoc     │
└──────────────────────────────┬─────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────┐
│  Firebase (lib/firebase.ts)                                │
│  initializeApp + initializeAuth (RN persistence) + Firestore│
└────────────────────────────────────────────────────────────┘
```

Pure business logic lives in **`lib/`** (no framework imports):

- `lib/firebase.ts` — Firebase app/auth/db initialization (platform-aware)
- `lib/types.ts` — TypeScript interfaces mirroring Firestore documents
- `lib/gpa.ts` — progress math (`courseProgress`, `weightedPercent`)
- `lib/validate.ts` — tiny inline validation helpers
- `lib/constants.ts` — day names, assessment/target types, GPA scale
- `lib/firebase-auth.d.ts` — type shim for the RN auth persistence helper

### Why TanStack Query?

All server data goes through TanStack Query so screens get automatic loading/error/refetch handling, caching, and consistent optimistic UI. Mutations invalidate their query keys to keep the UI in sync:

```ts
useMutation({ mutationFn: addAssessment, onSuccess: () => invalidateQueries(['assessments', courseId]) })
```

### Why services on top of Firestore directly?

The services layer keeps Firestore paths and document mapping in one place and gives screens/hooks typed, testable functions instead of scattering `collection(db, ...)` calls through components.

---

## Project structure

```
app/
  _layout.tsx                Root layout: providers + protected routes (Stack.Protected)
  (auth)/
    _layout.tsx              Auth stack
    login.tsx                Sign-in screen
    signup.tsx               Sign-up (also creates profile + default semester)
  (tabs)/
    _layout.tsx              Bottom tab bar (Home, Courses, Routine, Targets, Profile)
    index.tsx                Dashboard
    courses.tsx              Course list with CT progress
    routine.tsx              Weekly routine
    targets.tsx              Target list
    profile.tsx              Profile + sign out
  course/
    [id].tsx                 Course detail + assessment list
    new.tsx                  Create course (modal)
  assessment/
    new.tsx                  Add assessment / CT mark (modal)
  routine/
    new.tsx                  Add class slot (modal)
  target/
    new.tsx                  Add target (modal)
components/
  themed-*.tsx               Existing themed Text/View wrappers
  course-card.tsx            Reusable course card with progress bar
  ui/
    button.tsx chip.tsx field.tsx progress-bar.tsx 
constants/theme.ts           Light/dark color tokens
hooks/                       use-auth, use-profile, use-courses, use-assessments,
                             use-routines, use-targets, use-semesters
lib/                         firebase init, types, gpa/validate/constants logic
providers/
  auth-provider.tsx          AuthContext: user + initializing (onAuthStateChanged)
  query-provider.tsx         QueryClientProvider
services/                    auth, profile, semesters, courses, assessments,
                             routines, targets (typed Firestore CRUD)
```

---

## Firestore data model

Every collection is nested under the owning user, so security rules can lock down an entire user subtree with a single rule.

```
users/{uid}                          ← profile document
  fullName, university, department, currentSemester, targetCgpa, createdAt
  ├─ semesters/{semesterId}
  │     name, status ("active"|"archived"), targetGpa, createdAt
  ├─ courses/{courseId}
  │     semesterId, code, title, credits, passMarks, ctWeight, createdAt
  │     └─ assessments/{assessmentId}
  │           type (ct|quiz|assignment|lab), name, marksObtained,
  │           maxMarks, weight (%), date (YYYY-MM-DD), createdAt
  ├─ routineSlots/{slotId}
  │     courseId, courseLabel, dayOfWeek (0=Sun…6=Sat),
  │     startTime, endTime (HH:MM 24h), room, createdAt
  └─ targets/{targetId}
        type (gpa|cgpa|attendance|custom), title, targetValue,
        currentValue, unit, targetDate, createdAt
```

### Security rules

Users must only be able to read/write their own subtree. One recursive rule covers everything:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Paste this into **Firestore → Rules** in the Firebase console.

---

## State management

### Auth

`AuthProvider` subscribes to `onAuthStateChanged` and exposes `{ user, initializing }`:

- On native, the auth session persists across app restarts via `initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })` (`lib/firebase.ts`).
- `app/_layout.tsx` keeps the native splash screen visible until `initializing` is false, then mounts the router with **`Stack.Protected`** guards:
  - `guard={!!user}` → `(tabs)` and the stack screens
  - `guard={!user}` → `(auth)` login/signup

Sign-up creates the user's profile document and a default active semester (`Semester 1`).

### Data

Every `use-*` hook:

1. Reads the current user from `useAuth()`
2. Defines a `queryKey` (e.g. `['assessments', courseId]`)
3. Sets `enabled: !!user` so queries wait for auth
4. Exposes the matching mutation with invalidation

---

## Validation strategy

No form libraries — forms are controlled `TextInput` state with a small `errors` record. `lib/validate.ts` exports tiny pure helpers:

- `required(value, label)` — non-empty check
- `isNumeric(value, label)` — numeric check
- `clampMarks(value, max)` — `0 ≤ marks ≤ max`
- `gpaRange(value)` — `0–4` (BD scale)
- `isTime(value)` / `parseTime(value)` — `HH:MM` 24h format and minutes

Each screen validates on submit, shows per-field errors, and clears them as the user types.

---

## Key logic

`lib/gpa.ts` computes course progress from recorded assessments:

- `courseProgress(assessments)` → `{ obtained, max, percent }` (raw sum)
- `weightedPercent(assessments)` → weighted score across assessments using each one's `weight`, capped at 100%

These feed the progress bars on the dashboard, course cards, and course detail. The dashboard also computes the **next class** from the routine by scanning the next 7 days for the first slot at/after the current time.

---

## Getting started

### 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Add project**
2. Add a **Web app** (Project settings → Your apps → Web) — copy its config values
3. **Build → Authentication → Sign-in method** → enable **Email/Password**
4. **Build → Firestore Database** → create the database, then paste the [security rules](#security-rules) into the **Rules** tab

### 2. Configure the app

```bash
cp .env.example .env
```

Fill `.env` with your Firebase Web app values:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

`.env` is gitignored; never commit real keys.

### 3. Install and run

```bash
npm install
npx expo start        # works in Expo Go on iOS/Android
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run start` | Start the Expo dev server |
| `npm run android` | Start on Android (Expo Go / emulator) |
| `npm run ios` | Start on iOS simulator |
| `npm run web` | Start on web |
| `npm run lint` | Run ESLint (`expo lint`) |
| `npx tsc --noEmit` | Type-check the project |

## Notes

- **Expo Go compatible** — the Firebase JS SDK needs no native build.
- The Firebase **publishable/anon key** is embedded in the app by design; that is why Firestore security rules are mandatory, not optional.
- Web static export runs during `npx expo export --platform web`; Firebase requires valid `.env` values for that to complete.
