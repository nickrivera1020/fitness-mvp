# Ember (working title)

**Live at: https://fitness-mvp-mvpfirst.vercel.app**

A Duolingo-inspired web app for fitness beginners: short **lessons** that teach one concept, and real-world **challenges** you check off day by day to build streaks. Mobile-first, runs in any browser.

**Stack:** Next.js (React) · Tailwind CSS · Supabase (database + auth) · Vercel (hosting) · GitHub (code)

---

## Running it on a new machine (Mac or PC)

You only do this once per computer.

1. **Install Node.js** — version 20 or newer, from [nodejs.org](https://nodejs.org) (pick the "LTS" download). This also installs `npm`.
2. **Install Git** — from [git-scm.com](https://git-scm.com) (on Mac it may already be installed; check with `git --version` in a terminal).
3. **Get the code:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/fitness-mvp.git
   cd fitness-mvp
   ```
4. **Install dependencies:**
   ```bash
   npm install
   ```
5. **Add the secret keys.** Copy `.env.example` to a new file named `.env.local`, then fill in the two values from the Supabase dashboard (**Project Settings → API**). `.env.local` is deliberately *not* in Git — each machine gets its own copy, and secrets never end up on GitHub.
6. **Run it:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser (works great in a phone-sized browser window).

## Supabase project setup (done once, ever)

1. At [supabase.com](https://supabase.com) create a new project (free tier).
2. In **Authentication → Sign In / Providers → Email**, turn **off** "Confirm email" for now — otherwise every test signup requires clicking an email link.
3. Copy the Project URL and the anon/publishable key into `.env.local` (step 5 above).

> **Free-tier note:** Supabase pauses projects after ~7 days with no traffic. Once the app is deployed, a keepalive ping will be set up so this doesn't happen.

## Deploying

Hosting is on Vercel, connected to this GitHub repo: every `git push` to `main` deploys automatically. The two `NEXT_PUBLIC_SUPABASE_*` values must also be added in Vercel under **Project → Settings → Environment Variables**.

## How the code is organized

```
src/
  app/            pages (each folder = a URL)
    login/        log-in page
    signup/       sign-up page
    auth/         server-side login/signup/logout logic
  components/     reusable UI pieces
  lib/supabase/   database connection helpers
  proxy.ts        runs before every page: refreshes login session,
                  redirects logged-out visitors to /login
```

## Build status

- [x] **Phase 1** — scaffold, Supabase connection, email/password auth
- [x] **Phase 2** — database schema (see `supabase/migrations/`)
- [x] **Phase 3** — seeded "Nutrition Basics" track (5 lessons + 3 challenges, placeholder copy — see `supabase/seed.sql`)
- [x] **Phase 4** — core loop UI (track → module → complete → streak)
- [x] **Phase 5** — profile / streak page
