# Copilot Instructions - RTO Tracker

## Project Overview

A modern full-stack application for tracking my personal Return to Office (RTO) policies compliance. Built with type-safety and developer experience as top priorities, using the latest React and tooling ecosystem.

**Target Users:** Me, an individual contributor in a global tech company.

**Key Features:** Record days spent in office or at home, policy compliance tracking, data visualization, real-time sync across devices, multi-user support with OAuth authentication.

## Tech Stack

- **Runtime & Package Manager:** Bun (latest)
- **Framework:** TanStack Start (full-stack React with SSR)
- **Routing:** TanStack Router (file-based)
- **Database:** Convex (real-time backend with built-in auth)
- **Authentication:** Convex Auth (Google + GitHub OAuth)
- **Hosting:** Cloudflare Pages (global CDN, edge runtime)
- **UI Components:** shadcn/ui with Radix UI primitives
- **Styling:** Tailwind CSS with CSS variables for theming
- **Type System:** TypeScript (strict mode)
- **Forms:** react-hook-form with Zod validation
- **Server State:** Convex React hooks (TanStack Query integration)
- **Testing:** bun:test (built-in test runner)
- **CI/CD:** GitHub Actions → Cloudflare Pages

## Architecture Overview

```
src/
  routes/              # File-based routing
    __root.tsx         # Root layout with ConvexProvider & auth wall
    index.tsx          # Dashboard (/)
  components/
    ui/                # shadcn/ui components (don't modify directly)
    features/          # Feature-specific components
      LoginPage.tsx    # OAuth login page
      QuarterView.tsx  # Quarter compliance display
      WeekCard.tsx     # Week display with day toggles
  lib/
    utils.ts           # cn() utility and helpers
    compliance.ts      # Pure calculation functions
    date-utils.ts      # Date/week/quarter utilities
    types.ts           # TypeScript type definitions
  styles/
    globals.css        # Global styles and CSS variables

convex/
  schema.ts            # Database schema definition
  dayEntries.ts        # Queries & mutations for day entries
  config.ts            # User compliance configuration
  _generated/          # Auto-generated Convex types & API
```

**Separation of Concerns:**

- Convex functions in `convex/` directory (queries, mutations, schema)
- Pure business logic in `src/lib/compliance.ts` (calculations only)
- UI primitives stay in `components/ui/`
- Feature components in `components/features/`
- Authentication handled by Convex Auth + ConvexProvider wrapper

## File and Folder Conventions

### Naming Patterns

- **Route files:** `kebab-case.tsx` (e.g., `user-profile.tsx`)
- **Components:** `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- **Utilities:** `camelCase.ts` (e.g., `formatDate.ts`)
- **Server functions:** `camelCase` (e.g., `getUserData`)
- **Types/Interfaces:** `PascalCase` (e.g., `User`, `ApiResponse`)

### Import Aliases

```typescript
@/            → app/
@/components  → app/components
@/lib         → app/lib
@/styles      → app/styles
```

### File Organization

- Colocate route-specific components near their route files
- Keep shared components in `components/features/`
- One component per file (exception: small, tightly coupled sub-components)
- Export default for components, named exports for utilities

## Routing Patterns (TanStack Start)

### File-Based Routing Rules

```typescript
// app/routes/index.tsx → /
export default function Home() {}

// app/routes/about.tsx → /about
export default function About() {}

// app/routes/posts/$id.tsx → /posts/:id
export default function Post() {}

// app/routes/dashboard/_layout.tsx → /dashboard (layout without segment)
export default function DashboardLayout() {}

// app/routes/(auth)/login.tsx → /login (grouped without segment)
export default function Login() {}
```

### Route Definition with Loaders

**ALWAYS use `createFileRoute()` for route definitions:**

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/posts/$id")({
  loader: async ({ params }) => {
    return await getPost(params.id);
  },
});

export default function Post() {
  const data = Route.useLoaderData();
  return <div>{data.title}</div>;
}
```

### Dynamic Routes

- Use `$` prefix for dynamic segments: `$id.tsx`, `$slug.tsx`
- Access params in loaders: `{ params }`
- Access params in components: `useParams()`

### Search Params

Use search params for filters, pagination, and shareable UI state:

```typescript
import { z } from "zod";

const searchSchema = z.object({
  page: z.number().optional().default(1),
  filter: z.string().optional(),
});

export const Route = createFileRoute("/posts")({
  validateSearch: searchSchema,
});

// In component
const { page, filter } = Route.useSearch();
```

## Component Patterns

### shadcn/ui Integration

**Core Principle:** shadcn/ui components are COPIED into your project. You own the code.

**Component Location:**

- UI primitives: `components/ui/` (Button, Dialog, Card, etc.)
- Feature components: `components/features/` (UserCard, PostList, etc.)

**Adding shadcn/ui Components:**

```bash
bunx shadcn-ui@latest add button
bunx shadcn-ui@latest add dialog card
```

**Usage Pattern - Don't Modify UI Components Directly:**

```typescript
// ❌ BAD: Modifying ui/button.tsx directly
// components/ui/button.tsx
export function Button() {
  /* custom business logic */
}

// ✅ GOOD: Wrap or compose ui components
// components/features/SubmitButton.tsx
import { Button } from "@/components/ui/button";

export function SubmitButton({ isLoading }: Props) {
  return (
    <Button disabled={isLoading}>
      {isLoading ? "Submitting..." : "Submit"}
    </Button>
  );
}
```

**Customizing Styles:**

```typescript
// Use cn() utility for conditional classes
import { cn } from "@/lib/utils";

<Button
  className={cn(
    "custom-class",
    isActive && "bg-primary",
    isDisabled && "opacity-50"
  )}
/>;
```

**Composition:**

```typescript
// shadcn/ui uses composition patterns
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>;
```

### Component Structure

```typescript
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  className?: string;
  variant?: "default" | "outlined";
}

export function FeatureComponent({
  children,
  className,
  variant = "default",
}: Props) {
  return <div className={cn("base-classes", className)}>{children}</div>;
}
```

## Convex Integration Patterns

### Schema Definition

**Define tables with user isolation:**

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  dayEntries: defineTable({
    userId: v.string(),
    date: v.string(),
    location: v.union(
      v.literal("office"),
      v.literal("home"),
      v.literal("vacation"),
      v.literal("sick")
    ),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"]),
});
```

### Queries and Mutations

**ALWAYS filter by authenticated user:**

```typescript
// convex/dayEntries.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getDay = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("dayEntries")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", identity.subject).eq("date", args.date)
      )
      .first();
  },
});

export const setDay = mutation({
  args: {
    date: v.string(),
    location: v.union(
      v.literal("office"),
      v.literal("home"),
      v.literal("vacation"),
      v.literal("sick")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Upsert logic
    const existing = await ctx.db
      .query("dayEntries")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", identity.subject).eq("date", args.date)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { location: args.location });
      return existing._id;
    } else {
      return await ctx.db.insert("dayEntries", {
        userId: identity.subject,
        date: args.date,
        location: args.location,
      });
    }
  },
});
```

### Using Convex in Components

**Use Convex React hooks for data fetching:**

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Dashboard() {
  // Query data
  const dayEntries = useQuery(api.dayEntries.getDaysInRange, {
    startDate: "2025-01-01",
    endDate: "2025-12-31",
  });

  // Mutation
  const setDay = useMutation(api.dayEntries.setDay);

  const handleUpdate = (date: string, location: WorkLocation) => {
    void setDay({ date, location });
  };

  // Handle loading state
  if (dayEntries === undefined) {
    return <div>Loading...</div>;
  }

  return <div>{/* UI */}</div>;
}
```

### Authentication Patterns

**Wrap app with ConvexProvider and auth checks:**

```typescript
// src/routes/__root.tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { LoginPage } from "@/components/features/LoginPage";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <Authenticated>
        <Header />
        {children}
      </Authenticated>
      <Unauthenticated>
        <LoginPage />
      </Unauthenticated>
    </ConvexProvider>
  );
}
```

**OAuth sign in/out:**

```typescript
import { useAuthActions } from "convex/react";

export function AuthButtons() {
  const { signIn, signOut } = useAuthActions();

  return (
    <>
      <Button onClick={() => void signIn("google")}>Sign in with Google</Button>
      <Button onClick={() => void signIn("github")}>Sign in with GitHub</Button>
      <Button onClick={() => void signOut()}>Sign out</Button>
    </>
  );
}
```

## Deployment and CI/CD

### Development Workflow

**Run both Convex and Vite concurrently:**

```bash
bun run dev  # Runs: concurrently "bunx convex dev" "vite dev --port 3000"
```

This starts:

- Convex backend dev server (syncs schema and functions)
- Vite frontend dev server on port 3000

### Environment Variables

**Development (.env.local - auto-generated by Convex):**

```bash
CONVEX_DEPLOYMENT=dev:your-deployment-name
VITE_CONVEX_URL=https://your-deployment-name.convex.cloud
```

**Production (set in GitHub Secrets & Cloudflare):**

- `CONVEX_DEPLOY_KEY` - From Convex dashboard → Settings → Deploy Keys
- `VITE_CONVEX_URL` - Production Convex URL
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Pages edit permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

### Cloudflare Pages Configuration

**vite.config.ts - Uses Cloudflare Pages preset in production:**

```typescript
import { nitro } from "nitro/vite";

nitro({
  preset:
    process.env.NODE_ENV === "production" ? "cloudflare-pages" : undefined,
});
```

**wrangler.toml:**

```toml
name = "rto-tracker"
compatibility_date = "2025-01-14"
pages_build_output_dir = ".output/public"
```

### CI/CD Workflow

**Automated deployment on push to main:**

1. Install dependencies with Bun
2. Deploy Convex functions to production (`bunx convex deploy --prod`)
3. Build app with production environment variables
4. Deploy to Cloudflare Pages

See [.github/workflows/deploy.yml](.github/workflows/deploy.yml) for full workflow.

### Manual Deployment

```bash
bun run deploy  # Runs: bunx convex deploy --prod && vite build && wrangler pages deploy
```

## Data Fetching and Business Logic

**Pure calculation functions in `src/lib/compliance.ts`:**

```typescript
// NO database calls - pure functions only
export function calculateWeekSummary(
  year: number,
  weekNumber: number,
  config: ComplianceConfig,
  allEntries: DayEntry[]
): WeekSummary {
  // Calculate compliance from entries
  return {
    /* ... */
  };
}
```

**Convex handles all data persistence:**

- Queries: `useQuery(api.dayEntries.getDaysInRange, { startDate, endDate })`
- Mutations: `useMutation(api.dayEntries.setDay)`
- Real-time updates handled automatically by Convex
- No need for manual refetching or cache invalidation

## Styling Conventions

### Tailwind Usage

**Follow utility-first approach:**

```typescript
// ✅ GOOD: Utility classes
<div className="flex items-center gap-4 rounded-lg bg-card p-6">

// ❌ BAD: Inline styles
<div style={{ display: 'flex', padding: '24px' }}>
```

**Responsive Design:**

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

**Dark Mode:**

```typescript
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
```

### Theme Customization

**Use CSS variables defined in `globals.css`:**

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

**Reference in Tailwind:**

```typescript
<Button className="bg-primary text-primary-foreground">
```

### Class Organization

**Order classes logically:**

1. Layout (flex, grid, block)
2. Positioning (absolute, relative, top, left)
3. Spacing (p-, m-, gap-)
4. Sizing (w-, h-, max-w-)
5. Typography (text-, font-)
6. Visual (bg-, border-, rounded-)
7. Interactive (hover:, focus:, active:)
8. Responsive (md:, lg:)
9. Dark mode (dark:)

```typescript
<div className="flex items-center gap-4 p-6 w-full max-w-2xl text-lg font-semibold bg-card rounded-lg hover:bg-accent md:p-8 dark:bg-slate-800">
```

## Code Style

### Import Order

```typescript
// 1. External libraries
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. Internal absolute imports
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/api";

// 3. Relative imports
import { UserAvatar } from "./UserAvatar";

// 4. Types
import type { User } from "@/types";
```

### TypeScript Strictness

- **Always use strict mode**
- **Prefer interfaces for objects, types for unions/primitives**
- **No `any` - use `unknown` if type is truly unknown**
- **Use type inference where obvious**

```typescript
// ✅ GOOD
interface User {
  id: string;
  name: string;
}

type Status = "active" | "inactive";

function getUser(id: string): Promise<User> {}

// ❌ BAD
function getUser(id: any): any {}
```

### Async/Await

**Always use async/await over promises:**

```typescript
// ✅ GOOD
async function fetchData() {
  try {
    const data = await getUser("123");
    return data;
  } catch (error) {
    console.error(error);
  }
}

// ❌ BAD
function fetchData() {
  return getUser("123")
    .then((data) => data)
    .catch((error) => console.error(error));
}
```

### Error Handling

```typescript
// Always handle errors explicitly
try {
  const result = await riskyOperation();
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
  } else {
    // Handle other errors
    throw error;
  }
}
```

### Naming Conventions

- **Boolean variables:** `is`, `has`, `should` prefix (`isLoading`, `hasAccess`)
- **Event handlers:** `handle` prefix (`handleClick`, `handleSubmit`)
- **React Query keys:** Array format (`['users', userId]`)
- **Constants:** `UPPER_SNAKE_CASE` for true constants

## Package Management (Bun)

### Installing Dependencies

**ALWAYS use Bun commands, never npm/yarn/pnpm:**

```bash
# Install dependencies
bun install

# Add new dependency
bun add package-name

# Add dev dependency
bun add -d package-name

# Remove dependency
bun remove package-name

# Run scripts
bun run dev
bun run build
bun test
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vinxi dev",
    "build": "vinxi build",
    "start": "vinxi start",
    "test": "bun test",
    "lint": "eslint ."
  }
}
```

### Lockfile

- **Commit `bun.lockb`** to version control
- Binary format (not human-readable, by design)
- Ensures reproducible builds

## Testing Approach

### Using bun:test

**Test files:** Colocate tests next to source files with `.test.ts` or `.test.tsx` suffix

```typescript
// UserProfile.test.tsx
import { describe, test, expect } from "bun:test";
import { render, screen } from "@testing-library/react";
import { UserProfile } from "./UserProfile";

describe("UserProfile", () => {
  test("renders user name", () => {
    render(<UserProfile user={{ name: "John" }} />);
    expect(screen.getByText("John")).toBeDefined();
  });
});
```

### What to Test

- **Critical business logic**
- **Complex utilities and helpers**
- **Form validation**
- **Integration tests for key user flows**
- **Don't test:** Simple components, third-party libraries, obvious code

### Running Tests

```bash
bun test                    # Run all tests
bun test UserProfile.test   # Run specific test
bun test --watch            # Watch mode
```

## Common Operations

### Adding a New Route

1. Create file in `app/routes/` following naming convention
2. Define route with `createFileRoute()`
3. Add loader if data is needed
4. Export default component

```typescript
// app/routes/dashboard/settings.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/settings")({
  loader: async () => {
    return await getSettings();
  },
});

export default function Settings() {
  const settings = Route.useLoaderData();
  return <div>{/* Component JSX */}</div>;
}
```

### Adding a New Component

1. Determine if it's a UI primitive or feature component
2. Create in appropriate directory
3. Use TypeScript interface for props
4. Export as default or named export

```typescript
// components/features/UserCard.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { User } from "@/types";

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Card>
      <CardHeader>{user.name}</CardHeader>
      <CardContent>{user.email}</CardContent>
    </Card>
  );
}
```

### Adding a Convex Query or Mutation

1. Define in `convex/` directory (e.g., `convex/myFeature.ts`)
2. Import from `convex/server` and `./_generated/server`
3. Use `query()` or `mutation()` with args validation
4. Always check authentication with `ctx.auth.getUserIdentity()`
5. Filter by `userId` for user-scoped data

```typescript
// convex/myFeature.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getData = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("myTable")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();
  },
});

export const updateData = mutation({
  args: { id: v.string(), value: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const doc = await ctx.db
      .query("myTable")
      .withIndex("by_user_and_id", (q) =>
        q.eq("userId", identity.subject).eq("id", args.id)
      )
      .first();

    if (!doc) throw new Error("Not found");

    await ctx.db.patch(doc._id, { value: args.value });
  },
});
```

### Adding a shadcn/ui Component

1. Run the CLI command
2. Verify the component is in `components/ui/`
3. Check for new Radix dependencies in `package.json`
4. Use the component by importing from `@/components/ui/`

```bash
bunx shadcn-ui@latest add dialog
```

```typescript
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
```

### Adding Form Handling

1. Install react-hook-form if not present: `bun add react-hook-form @hookform/resolvers zod`
2. Create Zod schema for validation
3. Use `useForm` hook with resolver
4. Create server function for form submission
5. Use TanStack Query mutation for submission

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

type FormData = z.infer<typeof schema>;

export function UserForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createUserMutation = useMutation(api.users.create);

  const onSubmit = (data: FormData) => {
    void createUserMutation(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}
      <Button type="submit" disabled={createUserMutation.isLoading}>
        Submit
      </Button>
    </form>
  );
}
```

## Key Principles

1. **Type Safety First:** Leverage TypeScript across client-server boundary
2. **Convex for Data:** All data persistence through Convex queries/mutations
3. **Pure Calculation Functions:** Keep business logic separate in `lib/` directory
4. **Own Your UI:** shadcn/ui components are yours to modify
5. **Bun for Everything:** Use Bun commands, not npm/yarn
6. **File-Based Routing:** Routes are defined by file structure
7. **Composition Over Props:** Prefer composing components over complex prop APIs
8. **Accessibility Matters:** Maintain ARIA attributes and keyboard navigation
9. **Test What Matters:** Focus testing on business logic and critical paths
10. **Explicit Over Implicit:** Clear, verbose code is better than clever code
    </form>
    );
    }

```

## Key Principles

1. **Type Safety First:** Leverage TypeScript across client-server boundary
2. **Server Functions for Logic:** Keep business logic on the server
3. **Loaders for SSR:** Use loaders for SEO-critical, initial render data
4. **Own Your UI:** shadcn/ui components are yours to modify
5. **Bun for Everything:** Use Bun commands, not npm/yarn
6. **File-Based Routing:** Routes are defined by file structure
7. **Composition Over Props:** Prefer composing components over complex prop APIs
8. **Accessibility Matters:** Maintain ARIA attributes and keyboard navigation
9. **Test What Matters:** Focus testing on business logic and critical paths
10. **Explicit Over Implicit:** Clear, verbose code is better than clever code
```
