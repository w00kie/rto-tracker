# RTO Tracker

A personal Return to Office (RTO) compliance tracker to help you stay on top of your workplace attendance requirements.

## Overview

RTO Tracker is a simple, single-user application designed to track daily office attendance and visualize compliance with your company's RTO policy. Log your work location each day and instantly see whether you're meeting your weekly and quarterly requirements.

## Core Features

### Day Logging

- **Weekly view** for logging Monday through Friday
- **Quick toggle** between Office and Home (default: Home)
- **Simple interface** for fast daily updates

### Compliance Tracking

- **Week-level compliance**: Visual indicator showing if you met the required office days for each week
- **Quarter-level compliance**: Summary view showing if you have enough compliant weeks in the quarter to meet policy requirements
- **Annual overview**: Full year view organized by quarters and weeks

### Visualization

- **Quarterly breakdown**: Year divided into Q1, Q2, Q3, Q4
- **Weekly cards**: Each week shows daily attendance at a glance
- **Status indicators**: Clear visual feedback for compliant vs non-compliant periods
- **Real-time updates**: Compliance calculations update as you log days

## Tech Stack

- **Runtime:** Bun
- **Framework:** TanStack Start (full-stack React with SSR)
- **UI Components:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS
- **Type System:** TypeScript (strict mode)
- **Forms:** react-hook-form + Zod
- **State Management:** TanStack Query + TanStack Router

## Project Status

🚧 **Early Development** - Currently building core features

### Current Scope

- Single-user application (local storage)
- No authentication required
- Focus on core tracking and visualization

### Future Enhancements

- Multi-user support with authentication
- Database persistence
- Policy customization (days per week, weeks per quarter)
- Historical data import/export
- Notifications and reminders
- Team/manager views

## Getting Started

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Run tests
bun test

# Build for production
bun run build
```

## Project Structure

```
app/
  routes/                 # File-based routing
    __root.tsx           # Root layout
    index.tsx            # Dashboard/main view
  components/
    ui/                  # shadcn/ui primitives
    features/            # Feature components
      DayLogger.tsx      # Week view for logging days
      QuarterView.tsx    # Quarter compliance summary
      WeekCard.tsx       # Individual week display
  lib/
    utils.ts             # Utilities and cn() helper
    compliance.ts        # Compliance calculation logic
  styles/
    globals.css          # Global styles and theme
```

## Data Model (Planned)

### Day Entry

```typescript
{
  date: Date,
  location: 'office' | 'home',
  notes?: string
}
```

### Week Summary

```typescript
{
  weekNumber: number,
  startDate: Date,
  endDate: Date,
  officeDays: number,
  isCompliant: boolean
}
```

### Quarter Summary

```typescript
{
  quarter: 1 | 2 | 3 | 4,
  year: number,
  compliantWeeks: number,
  totalWeeks: number,
  isCompliant: boolean
}
```

## Compliance Rules

**Weekly Requirement:** Configurable office days per week (e.g., 2 days)  
**Quarterly Requirement:** Configurable number of compliant weeks (e.g., 8)

_Note: Initial version will have hardcoded rules; future versions will support customization._

## Contributing

This is currently a personal project. Feel free to fork and adapt for your own use.

## License

MIT
