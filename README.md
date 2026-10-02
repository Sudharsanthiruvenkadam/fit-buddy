# Fit Buddy — Stronger Together. Fitter Forever.

A full-stack fitness web app: browse workouts, pick a plan, set goals, log daily activity and follow your progress.

**Stack:** React + Vite + React Router (client) · Node.js + Express 5 (server) · MongoDB + Mongoose (database)

```
fit-buddy/
  client/   React app            -> http://localhost:5173
  server/   Express REST API     -> http://localhost:5000
  docs/     Project report, API reference, viva Q&A
```

---

## 1. Install the tools (one time)

1. **Node.js LTS** (v20 or newer): https://nodejs.org → download the "LTS" installer → Next, Next, Finish.
2. **VS Code**: https://code.visualstudio.com
3. **MongoDB** — pick ONE:
   - **Easiest: MongoDB Atlas (free, in the cloud).** Create a free account at https://www.mongodb.com/atlas → create a free cluster → *Database Access*: add a user + password → *Network Access*: add your current IP address → *Connect → Drivers*: copy the connection string (looks like `mongodb+srv://user:password@cluster0.xxxx.mongodb.net/`). Add `fitbuddy` after the `/`.
   - **Or local:** install *MongoDB Community Server* from https://www.mongodb.com/try/download/community (tick "Install as a Service"). Your connection string is then `mongodb://127.0.0.1:27017/fitbuddy`.

**Check Node and npm** — open VS Code → *Terminal → New Terminal* (this is PowerShell) and run:

```powershell
node -v
npm -v
```
Both should print a version number (e.g. `v22.x.x`, `10.x.x`). If you see "not recognized", reinstall Node.js, then **close and reopen VS Code**.

## 2. Open the project

*File → Open Folder…* → choose the `fit-buddy` folder (the one that contains `client` and `server`).

## 3. Set up the backend

In the VS Code terminal (**Terminal → New Terminal**):

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Now open `server/.env` in VS Code and set:

- `MONGODB_URI` — your connection string from step 1.
- `JWT_SECRET` — any long random text (32+ characters). To generate one:
  ```powershell
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
  Copy the output into `JWT_SECRET=`.

Load the starter workouts and plans, then start the API:

```powershell
npm run seed
npm run dev
```
You should see `MongoDB connected` and `Fit Buddy API running on http://localhost:5000`. **Leave this terminal running.**

Check it: open http://localhost:5000/api/health in your browser. You want `"status":"ok"` and `"database":"connected"`.

## 4. Set up the frontend (second terminal)

Click the **+** in the terminal panel to open a **new** terminal, then:

```powershell
cd client
npm install
npm run dev
```
Open **http://localhost:5173**. Create an account with *Get Started* and try the app.

## 5. Stop / restart

- Stop either server: click its terminal and press `Ctrl + C`.
- Start again: `npm run dev` inside `server` and inside `client`.

## 6. Troubleshooting

| Problem | Fix |
|---|---|
| `npm is not recognized` | Install Node.js, then close and reopen VS Code. |
| `running scripts is disabled on this system` (PowerShell) | Run once: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then retry. |
| `Missing required settings in server/.env` | You skipped `Copy-Item .env.example .env`, or left values empty. |
| `Could not connect to MongoDB` | Local: start the "MongoDB" Windows service. Atlas: check the password (special characters must be URL-encoded) and that your IP is allowed in *Network Access*. |
| Website says "Cannot reach the server" | The backend isn't running — start it in the `server` terminal. |
| Workouts / Plans pages are empty | Run `npm run seed` inside `server`. |
| Port 5000 already in use | Change `PORT` in `server/.env` **and** the proxy target in `client/vite.config.js`. |

---

## Features

| Module | What it does |
|---|---|
| Accounts | Register, log in/out, protected pages. Passwords hashed with bcrypt (12 rounds). Session is an **HttpOnly** cookie, not localStorage. |
| Workouts | 10 seeded workouts; search by name, filter by category and difficulty; detail page; **Mark as completed** records an activity. |
| Plans | 3 seeded plans with weekly schedules; select/remove your current plan. |
| Goals | Create, edit, delete, mark complete. Minutes / sessions / water goals are **calculated from logged activity** between start date and deadline; custom goals are updated by hand. Status: in progress / overdue / completed. |
| Activity tracker | Add and delete activities (minutes, water, optional calorie estimate). Double-clicks and retries don't create duplicates. |
| Progress | Totals, week summary, streak, goal completion, 7/30/90-day charts, history, empty states for new users. |
| Contact | Validated form; messages are **saved to the database** (not emailed). |

### Rules worth knowing (good for your viva)

- **Streak:** consecutive days (ending today) each with ≥1 workout of >0 minutes. If today has no workout yet, the streak counts back from yesterday; one fully missed day resets it.
- **Goal completion %** on the home card and Progress page = average percent across all your goals (0 if you have none).
- **Calories** are rough estimates (`minutes × per-minute estimate`), always labelled as estimates.
- **Dates** are stored as `YYYY-MM-DD` strings using the user's *local* day, so streaks don't shift with time zones.
- The Home page's Today's Activity card shows **clearly labelled demo data** when logged out and your own data when logged in. Homepage counts are real counts from the database.

## Security measures implemented

bcrypt hashing · HttpOnly + SameSite=Lax cookie (Secure in production) · CSRF header check on all state-changing requests · restricted CORS · helmet headers · rate limits (auth: 30/15 min, contact: 5/hour) · zod validation on every write · 10 kb body limit · ownership checks (every goal/activity query filters by the logged-in user, never by an ID from the browser) · generic 500 errors with no stack traces · secrets only in `.env` (git-ignored).

## Tests — results actually run

Run: `cd server; npm test` (no database needed).

| Area | Result |
|---|---|
| Streak, percent, goal status, date helpers (21 tests incl. month/leap-year boundaries) | **Passed** |
| Health endpoint | **Passed** |
| Protected endpoints return 401 without login (5 endpoints) | **Passed** |
| CSRF header enforced | **Passed** |
| Register validation (bad name/email/password, mismatched confirmation) | **Passed** |
| Contact validation | **Passed** |
| Malformed JSON → 400 without stack trace; unknown route → 404 | **Passed** |
| Client production build (`npm run build`) | **Passed** |
| Registration/login against a real database, duplicate registration, invalid credentials | **Not Tested** (no MongoDB available where this was built) |
| Cross-user data access, goal/activity CRUD, progress aggregation, contact persistence, seed script | **Not Tested** — use the checklist below |
| Browser UI, responsive widths (375/768/1024/1440), keyboard navigation, screen reader | **Not Tested** |
| Frontend unit tests (Vitest) | **Not written** |

## Manual test checklist (run this once after setup)

- [ ] `/api/health` shows `database: connected`
- [ ] Register → lands on Progress; refresh the page → still logged in
- [ ] Register the same email again → "already exists" message
- [ ] Log out, log in with a wrong password → generic error
- [ ] Visit `/goals` logged out → redirected to login
- [ ] Workouts: search, category and difficulty filters work; "Clear filters" resets; nonsense search shows empty state
- [ ] Open a workout → **Mark as completed** → appears in Progress history; double-click only adds one entry
- [ ] Plans: View schedule, Select plan → shows "Current plan"; reload keeps it
- [ ] Goals: create a *minutes* goal (target 60) → add a 30-minute activity → goal shows 50%
- [ ] Goal with deadline before start date → validation error
- [ ] Custom goal: update progress; Mark complete; Reopen; Delete
- [ ] Activity with 0 minutes and 0 water → validation error; negative numbers rejected
- [ ] Progress: chart ranges 7/30/90 and metric buttons change; streak = 1 after today's workout
- [ ] Create a **second** account → it sees none of the first account's goals or activities
- [ ] Contact: submit short message → field errors; valid message → success; check the `contactmessages` collection in MongoDB
- [ ] Resize browser to phone width → hamburger menu works, no sideways scrolling
- [ ] Tab through pages with the keyboard → focus ring visible

## Known limitations

- No password reset, email verification or email sending (contact messages are only stored).
- Activities can be added and deleted in the UI; the API also supports editing (`PATCH`) but there is no edit screen yet.
- No payment features; no admin screen for the workout/plan catalogue (use `npm run seed`).
- Workout images are not included (cards are text-based) to avoid broken image links.
- No automated frontend tests; backend tests don't cover database flows.
- Buddy discovery (partner matching) is **not implemented** — it is future scope, as your spec marks it optional.
- I could not view your original project or screenshots; the layout follows your written description, so compare the look with your original and tell me what to adjust.

## Future improvements

Edit-activity screen · password reset by email · workout images · weekly goal templates · buddy discovery with opt-in profiles and privacy controls · Vitest/Playwright tests · deployment guide.

## API reference

All responses: `{ "success": true, "data": ... }` or `{ "success": false, "message": "...", "errors": { field: msg } }`.
Every `POST/PUT/PATCH/DELETE` must send header `X-Requested-With: fitbuddy` (the React app does this). 🔒 = login required.

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | API + database status |
| POST | `/api/auth/register` | `{name,email,password,confirmPassword?}` |
| POST | `/api/auth/login` | `{email,password}` |
| POST | `/api/auth/logout` | clears cookie |
| GET 🔒 | `/api/auth/me` | current user |
| GET | `/api/workouts` | `?q=&category=&difficulty=` |
| GET | `/api/workouts/:id` | |
| GET | `/api/plans`, `/api/plans/:id` | |
| GET/PUT 🔒 | `/api/users/me/plan` | PUT `{planId}` or `{planId:null}` |
| GET/POST 🔒 | `/api/goals` | `?today=YYYY-MM-DD` |
| GET/PATCH/DELETE 🔒 | `/api/goals/:id` | PATCH accepts `completed`, `manualValue` |
| GET/POST 🔒 | `/api/activities` | GET `?from=&to=&limit=`; POST `{date,minutes?,waterMl?,calories?,title?,workout?,clientRequestId?}` |
| GET/PATCH/DELETE 🔒 | `/api/activities/:id` | |
| GET 🔒 | `/api/progress/summary` | `?today=` |
| GET 🔒 | `/api/progress/history` | `?days=7\|30\|90&today=` |
| POST | `/api/contact` | `{name,email,subject?,message}` |

Note: routes and handlers live together in `server/src/routes/*.js` (no separate controllers folder) to keep the project easy for a beginner to follow.
