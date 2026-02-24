# AGENTS.md

This file guides agentic coding assistants working in the gamasa-properties repository.

## Build/Lint/Test Commands

```bash
# Development
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run build        # Build production bundle
npm start           # Start production server

# Linting/Type Checking
npm run lint        # Run ESLint (configured with high warning limit)
```

**Running tests**: Currently tests are in `src/tests/` using Jest, but there's no test script defined in package.json. Add one or run tests directly with your test runner.

**Running a single test**:
```bash
# Add this script to package.json first, then use:
npm test -- sql-injection.test.ts
# Or:
npm test -- --testNamePattern="SQL Injection"
```

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router) with React 19.2.3
- **Language**: TypeScript 5 with strict mode enabled
- **Styling**: Tailwind CSS 3.4 with custom theme
- **Database/Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State Management**: React Context (AuthProvider, ThemeProvider)
- **Testing**: Jest with `@jest/globals`
- **Icons**: Material Symbols Outlined
- **Maps**: Leaflet + react-leaflet
- **Forms**: @tailwindcss/forms

## Project Structure

```
src/
├── app/              # Next.js App Router pages and routes
│   ├── [id]/         # Dynamic route pages
│   ├── admin/        # Admin pages
│   ├── auth/         # Authentication routes
│   ├── property/     # Property-related pages
│   └── ...
├── components/       # React components
│   ├── auth/         # Authentication components
│   ├── booking/      # Booking flow components
│   ├── chat/         # Messaging/chat components
│   ├── notifications/# Notification components
│   ├── ui/           # UI components (buttons, cards, inputs)
│   └── ...
├── hooks/            # Custom React hooks
├── lib/              # Utilities, helpers, Supabase clients
├── services/         # Business logic layer (supabaseService)
├── types/            # TypeScript type definitions
├── utils/            # Helper functions (validation, etc.)
└── tests/            # Jest test files
```

## Code Style Guidelines

### Imports and Modules
- Use ES modules: `import { X } from 'module'`
- Path alias: `@/` maps to `src/` (e.g., `@/components/PropertyCard`)
- Group imports: external libs first, then internal
- For client components: start file with `'use client';`

### Naming Conventions
- **Components**: PascalCase (e.g., `PropertyCard`, `useAuth`)
- **Variables/Functions**: camelCase (e.g., `getProperties`, `userProfile`)
- **Types/Interfaces**: PascalCase (e.g., `UserProfile`, `Booking`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `ROLE_LANDLORD`, `COMMISSION_AMOUNT`)
- **Database columns**: snake_case (from Supabase - e.g., `created_at`, `user_id`)

### TypeScript
- Strict mode enabled (`"strict": true`)
- Define interfaces for all data structures (see `src/types/index.ts`)
- Use type assertions sparingly; prefer proper typing
- Export types from `src/types/index.ts` for reuse
- Database types: use generated `database.types.ts`

### Components
- Use functional components with hooks
- Separate client components (add `'use client';` at top)
- Define props interfaces explicitly
- Use `export function ComponentName` pattern
- Keep components focused and composable

### Error Handling
- Always handle errors from Supabase/async operations
- Use try-catch for async functions
- Return consistent error shapes: `{ error: Error | null }` or `Promise<{ error: any }>`
- Log errors with `console.error()` for debugging
- User-facing errors in Arabic (matching UI language)

### Services Layer
- All database operations go through `src/services/supabaseService.ts`
- Service methods return consistent shapes: `{ data, error }` or throw errors
- Use parameterized queries (Supabase handles this automatically)
- Mock mode support: check `IS_MOCK_MODE` flag for development

### Security
- All user inputs must be validated before database operations
- Use validation functions from `src/utils/validation.ts`:
  - `validateDateString()` - date format validation
  - `validateUUID()` - UUID validation
  - `sanitizeText()` - text sanitization
- Never interpolate user input into SQL strings (use Supabase methods)
- Check permissions before operations (auth user roles)

### Styling
- Use Tailwind CSS utility classes
- Custom colors via CSS variables in theme
- Glass morphism components in `src/components/ui/glass/`
- Dark mode support via `next-themes`
- Responsive design with mobile-first approach

### State Management
- Use React Context for global state (Auth, Theme)
- Local component state with `useState`
- API data fetched through service layer
- Optimistic UI updates where appropriate

### File Validation
- Image upload validation: `src/lib/utils/fileValidation.ts`
- File size, type, and dimensions checks
- Validate on upload, not just on submit

## ESLint Configuration

ESLint is configured with permissive warnings:
- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/no-unused-vars`: warn
- React hooks rules: some disabled temporarily
- `max-warnings` set high (999999) - warnings won't block builds

## Testing

Tests are located in `src/tests/`:
- Focus on security and validation
- Use `@jest/globals` for test utilities
- Mock Supabase for isolation
- Test both success and failure paths
- Security tests: SQL injection, payment bypass prevention

## Environment Variables

Required env variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_IS_MOCK_MODE` - for development/testing

## Internationalization

Primary UI language: Arabic
- All user-facing text in Arabic
- Comments can be in Arabic or English
- Error messages in Arabic

## Database

- Supabase PostgreSQL
- Tables include: properties, profiles, bookings, messages, conversations, etc.
- Row Level Security (RLS) enabled
- Use generated types from Supabase
- Foreign keys for relationships

## Best Practices

1. **Type Safety**: Always type function parameters and returns
2. **Error Boundaries**: Use ErrorBoundary component for route error handling
3. **Loading States**: Show loading indicators during async operations
4. **Optimistic UI**: Update UI immediately, revert on error (e.g., favorites)
5. **Code Organization**: Keep business logic in services, UI in components
6. **Mock Mode**: Support mock mode for offline development/testing
7. **Security First**: Validate all inputs, check permissions
8. **Performance**: Use Next.js Image component, optimize images
9. **Accessibility**: Use semantic HTML, ARIA labels where needed
10. **Testing**: Write tests for critical paths (security, validation)

## Adding New Features

1. Define types in `src/types/` first
2. Add service methods in `src/services/supabaseService.ts`
3. Create components in `src/components/`
4. Add pages in `src/app/` following App Router conventions
5. Write tests for new functionality
6. Update this AGENTS.md if patterns change
