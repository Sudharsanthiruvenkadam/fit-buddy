# Fit Buddy — Project Report (Nan Mudhalvan)

## Abstract
Fit Buddy is a web application that helps people build exercise habits. Users can explore a workout library, follow a fitness plan, set measurable goals, record daily activity and view their progress in charts and summaries. It is built with React, Node.js/Express and MongoDB.

## Problem statement
Beginners often struggle to keep a routine because workouts, goals and records are scattered across notes and apps. They need one simple place to plan, record and review.

## Objectives
1. Provide a searchable library of workouts with clear instructions.
2. Offer simple weekly fitness plans.
3. Let users set goals whose progress updates automatically from real activity.
4. Record daily activity (minutes, water, estimated calories).
5. Show progress, history and streaks in an easy-to-read dashboard.
6. Protect each user's private data.

## Existing system
Typical approaches are paper diaries, generic notes apps or spreadsheets: no automatic progress calculation, no built-in workout guidance, and easy to abandon.

## Proposed system
A single web platform where goals are computed from logged activity, workouts can be completed with one click, and progress is shown visually. (Describe differences from your original submission here after comparing it with this build.)

## Technology stack
React 18 + Vite + React Router · Express 5 · MongoDB + Mongoose · bcryptjs · JSON Web Token in an HttpOnly cookie · zod · helmet · express-rate-limit · node:test + Supertest.

## Architecture
Browser (React) → `/api` (Vite proxy in development) → Express routes → Mongoose models → MongoDB. Authentication is a signed JWT held in an HttpOnly cookie; middleware loads the user and every private query filters by that user's id.

## Database design
- **User**: name, email (unique), passwordHash, currentPlan → FitnessPlan
- **Workout**: name, category, difficulty, durationMinutes, caloriesPerMinute, equipment, muscleGroups, instructions
- **FitnessPlan**: name, goal, durationWeeks, difficulty, sessionsPerWeek, schedule[{day,title,workout→Workout}]
- **Goal**: user→User, title, type, targetValue, manualValue, unit, startDate, deadline, completedAt
- **Activity**: user→User, date, title, workout→Workout, minutes, calories, waterMl, clientRequestId (unique per user)
- **ContactMessage**: name, email, subject, message

Indexes: Activity `{user,date}` and unique `{user,clientRequestId}`; Workout `category`, `difficulty`; Goal `user`; User `email` unique.

## Modules
Authentication · Workouts · Plans · Goals · Activity tracker · Progress dashboard · Contact. See README for behaviour and API.

## Testing
See the results table in README (what passed, what was not tested).

## Limitations & future work
See README.

## Demonstration script (5 minutes)
1. Home page: explain the demo card is labelled sample data. (30 s)
2. Register an account. (30 s)
3. Workouts: filter by *Beginner*, open one, mark completed. (60 s)
4. Goals: create "60 minutes" goal; show it now reads 50%+. (60 s)
5. Progress: streak, chart range buttons, add water, delete an entry. (60 s)
6. Plans: select a plan. (30 s)
7. Show `/api/health` and the MongoDB collections. (30 s)

## Viva questions and answers
**Why a cookie instead of localStorage for login?** An HttpOnly cookie can't be read by JavaScript, so a cross-site scripting bug can't steal the session token.

**How do you stop one user seeing another's data?** The user id comes from the verified cookie, never from the request body, and every goal/activity query includes `user: req.user._id`.

**Why hash passwords?** So a database leak doesn't reveal passwords. bcrypt is slow on purpose and adds a salt automatically.

**How is goal progress calculated?** For minutes/sessions/water goals the server sums activities between the goal's start date and deadline each time it is requested, so it can never go out of sync. Custom goals use a stored number.

**What is a streak?** Consecutive days ending today with at least one workout; it stays alive until the end of today, and one fully missed day resets it.

**How do you avoid duplicate entries on double-click?** The button is disabled while saving, and the client sends a unique `clientRequestId`; the database has a unique index on `(user, clientRequestId)` and the server returns the existing record on retry.

**Why store dates as text like 2025-03-01?** It represents the user's local calendar day, avoiding time-zone shifts, and sorts correctly as text.

**What is CSRF and how is it handled?** A malicious site tricking your browser into sending requests with your cookie. We use SameSite=Lax cookies, restricted CORS, and require a custom header on all writes.

**Are calories accurate?** No. They are estimates, labelled as such.

**What is not finished?** Password reset/email, activity edit screen, buddy matching, frontend automated tests.
