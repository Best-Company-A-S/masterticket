## 🔧 Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, ShadCN UI, TailwindCSS
- **Monitoring**: Uptime Kuma (status), Sentry (error reporting)
- **Analytics**: PostHog
- **Backend:** Convex for realtime and fast backend
- **Hosting**: Vercel, Railway, or Docker (for open-source contributors)

---

## 🧩 Core Features Overview

### 🧑‍💼 Customer Portal

- ✅ **Create tickets** (title, description, optional file upload)
- ✅ **Set visibility**: Public (visible on public board) or Hidden (default)
- ✅ **View personal tickets**: Status, updates, assigned agent/team
- ✅ **Comment on tickets**
- ✅ **Receive updates via email or in-app**

---

### 🌐 Public Ticket Board

- ✅ Lists all **public tickets with comments**
- ✅ Filter/sort by: status, category, recency, popularity
- ✅ SEO-friendly public ticket URLs (e.g., `yourapp.com/board/ticket-title`)
- ✅ Markdown support in comments
- ✅ Upvotes (optional for community feedback)

---

### 🏢 Company Dashboard (for support teams)

- ✅ Full ticket list (filter by priority, status, team, assignee)
- ✅ **Edit ticket**: title, description, status, priority
- ✅ Assign to: individual user or team
- ✅ **Moderate comments** (delete/report)
- ✅ Internal notes (visible only to staff)
- ✅ Notification system (e.g., email/Slack/Discord/web UI)

---

### 🔒 Internal Company Ticketing

- ✅ Teams can **create tickets internally** for other teams
- ✅ Team-based visibility & permissions
- ✅ Tagging system (e.g., `#infrastructure`, `#design`)
- ✅ Priority & deadline setting
- ✅ Slack-style mentions `@user` or `@team`

---

### 📊 Admin / System Dashboard

- ✅ Metrics via PostHog
- ✅ Errors via Sentry
- ✅ Uptime status (embedded Uptime Kuma)
- ✅ Ticket stats (resolved, pending, average response time)
- ✅ Team performance metrics

---

### 📬 Notifications

- Email, Web Push, and/or Discord via webhooks
- Alert users on: new comments, ticket status change, assignment, resolution

---

## 🧠 Optional Future Features

- AI-powered ticket categorization or reply suggestions
- Customer satisfaction rating after ticket closure
- Feedback loops / feature voting
- API access for developers
