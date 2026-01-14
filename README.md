# RTO Tracker

A personal Return to Office (RTO) compliance tracker to help you stay on top of your workplace attendance requirements.

## Overview

RTO Tracker is a multi-user application designed to track daily office attendance and visualize compliance with your company's RTO policy. Log your work location each day and instantly see whether you're meeting your weekly and quarterly requirements. Data syncs in real-time across all your devices.

## Core Features

### Authentication & Multi-User Support

- **OAuth login** with Google and GitHub
- **User-specific data** - each user has their own private tracking data
- **Real-time sync** across all your devices

### Day Logging

- **Weekly view** for logging Monday through Friday
- **Quick toggle** between Office, Home, Vacation, and Sick days
- **Simple interface** for fast daily updates
- **Instant sync** to cloud database

### Compliance Tracking

- **Week-level compliance**: Visual indicator showing if you met the required office days for each week
- **Quarter-level compliance**: Summary view showing if you have enough compliant weeks in the quarter to meet policy requirements
- **Annual overview**: Full year view organized by quarters and weeks
- **Real-time calculations**: Compliance updates instantly as you log days

### Visualization

- **Quarterly breakdown**: Year divided into Q1, Q2, Q3, Q4
- **Weekly cards**: Each week shows daily attendance at a glance
- **Status indicators**: Clear visual feedback for compliant vs non-compliant periods
- **Current week highlighting**: Automatically highlights your current week

## Tech Stack

- **Runtime:** Bun
- **Framework:** TanStack Start (full-stack React with SSR)
- **Database:** Convex (real-time backend)
- **Authentication:** Convex Auth (Google + GitHub OAuth)
- **Hosting:** Cloudflare Pages
- **UI Components:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS
- **Type System:** TypeScript (strict mode)
- **State Management:** Convex React (TanStack Query integration)

## Getting Started

### Prerequisites

- Bun installed on your machine
- A Convex account (free at [convex.dev](https://convex.dev))
- (Optional) Google/GitHub OAuth credentials for authentication

### Environment Setup

1. Clone the repository:

```bash
git clone <your-repo-url>
cd rto-tracker
```

2. Install dependencies:

```bash
bun install
```

3. Set up Convex:

```bash
bunx convex dev
```

This will:

- Create a Convex account (if needed)
- Create a new Convex project
- Generate your `.env.local` file with `VITE_CONVEX_URL`

4. Configure OAuth (in Convex dashboard):
   - Go to your Convex dashboard
   - Navigate to Settings → Authentication
   - Enable Google and/or GitHub OAuth providers
   - Configure redirect URLs:
     - Development: `http://localhost:3000`
     - Production: Your Cloudflare Pages URL

### Development

Run the development server (starts both Convex and Vite):

```bash
bun run dev
```

The app will be available at `http://localhost:3000`

### Testing

```bash
bun test
```

### Deployment

The application automatically deploys to Cloudflare Pages via GitHub Actions when you push to the `main` branch.

#### Required GitHub Secrets

Set these in your repository Settings → Secrets and variables → Actions:

- `CONVEX_DEPLOY_KEY` - Get from Convex dashboard → Settings → Deploy Keys
- `VITE_CONVEX_URL` - Your production Convex URL (format: `https://xxx.convex.cloud`)
- `CLOUDFLARE_API_TOKEN` - Create in Cloudflare dashboard with "Edit Pages" permissions
- `CLOUDFLARE_ACCOUNT_ID` - Find in Cloudflare dashboard URL or Account settings

#### Manual Deployment

```bash
bun run deploy
```

## Project Structure

```
src/
  routes/                 # File-based routing
    __root.tsx           # Root layout with ConvexProvider & auth
    index.tsx            # Dashboard/main view
  components/
    ui/                  # shadcn/ui primitives
    features/            # Feature components
      LoginPage.tsx      # OAuth login page
      QuarterView.tsx    # Quarter compliance summary
      WeekCard.tsx       # Individual week display
  lib/
    utils.ts             # Utilities and cn() helper
    compliance.ts        # Compliance calculation logic
    date-utils.ts        # Date/week/quarter calculations
    types.ts             # TypeScript type definitions

convex/
  schema.ts              # Database schema (dayEntries, complianceConfig)
  dayEntries.ts          # Queries & mutations for day entries
  config.ts              # User compliance configuration
  _generated/            # Auto-generated Convex types
```

## Data Model

### Day Entry

```typescript
{
  userId: string,          // Convex-managed user ID
  date: string,            // ISO format (YYYY-MM-DD)
  location: 'office' | 'home' | 'vacation' | 'sick',
  notes?: string           // Optional notes
}
```

### Compliance Configuration

```typescript
{
  userId: string,
  requiredOfficeDaysPerWeek: number,        // Default: 2
  requiredCompliantWeeksPerQuarter: number, // Default: 8
  warningThresholdWeeks: number             // Default: 7
}
```

### Week Summary (Calculated)

```typescript
{
  weekNumber: number,
  year: number,
  startDate: string,
  endDate: string,
  officeDays: number,
  isCompliant: boolean,
  days: DayEntry[]
}
```

### Quarter Summary (Calculated)

```typescript
{
  quarter: 1 | 2 | 3 | 4,
  year: number,
  compliantWeeks: number,
  totalWeeks: number,
  status: 'compliant' | 'warning' | 'danger',
  weeks: WeekSummary[]
}
```

## Compliance Rules

**Weekly Requirement:** 2 office days per week (configurable per user)  
**Quarterly Requirement:** 8 compliant weeks per quarter (configurable)  
**Warning Threshold:** 7 weeks (shows warning if between 7-8 compliant weeks)

Compliance configuration can be customized per user through Convex mutations.

## Architecture

### Convex Backend

- **Real-time database**: All data changes sync instantly across devices
- **User isolation**: Each user's data is automatically filtered by authentication context
- **Type-safe API**: Generated TypeScript types for all queries and mutations
- **Optimistic updates**: UI updates immediately while data syncs in background

### Cloudflare Pages Deployment

- **Global CDN**: Fast loading times worldwide
- **Serverless**: No servers to manage, scales automatically
- **CI/CD**: Automatic deployments from GitHub
- **Edge runtime**: Server-side rendering at the edge

## Future Enhancements

- **Policy customization UI**: In-app settings for compliance rules
- **Data export**: Download your tracking data as CSV/JSON
- **Calendar integration**: Sync with Google Calendar or Outlook
- **Notifications**: Reminders when falling behind on compliance
- **Team views**: Share anonymized compliance stats with managers
- **Analytics**: Historical trends and insights
- **Mobile app**: Native mobile experience

## Contributing

This is currently a personal project. Feel free to fork and adapt for your own use.

## License

MIT
