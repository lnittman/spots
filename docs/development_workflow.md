# Development Workflow

This document outlines the development process, environment setup, and best practices for contributing to the Spots project.

## Development Environment Setup

### Prerequisites

- Node.js v20.0.0 or higher
- pnpm v8.0.0 or higher
- Git
- GitHub account with access to the repository

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/spots.git
   cd spots
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and fill in the required values (see [Environment Variables](#environment-variables)).

4. Start the development server:
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`.

## Environment Variables

The following environment variables are required for the application to run properly:

```
# Base
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/spots

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI
OPENAI_API_KEY=your-openai-api-key

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token

# Cache and Rate Limiting
UPSTASH_REDIS_REST_URL=your-upstash-redis-rest-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-rest-token
```

For local development, you can create a free tier account for the following services:
- [OpenAI](https://platform.openai.com/) for AI API access
- [Mapbox](https://www.mapbox.com/) for maps integration
- [Upstash](https://upstash.com/) for Redis caching and rate limiting

## Development Process

### Branch Strategy

We follow a branch-based workflow:

1. Main Branch: `main` - Always deployable, represents production code
2. Development Branch: `develop` - Integration branch for features
3. Feature Branches: `feature/feature-name` - For new features
4. Bug Fix Branches: `fix/bug-name` - For bug fixes
5. Release Branches: `release/version` - For release preparation
6. Hotfix Branches: `hotfix/issue` - For urgent production fixes

### Creating a New Feature

1. Create a new branch from `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/your-feature-name
   ```

2. Implement your feature, making logical, incremental commits:
   ```bash
   git add .
   git commit -m "feat: clear description of change"
   ```

3. Push your branch and create a pull request:
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. Open a pull request to the `develop` branch on GitHub.

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Changes that don't affect code functionality (formatting, etc.)
- `refactor:` - Code changes that neither fix bugs nor add features
- `perf:` - Performance improvements
- `test:` - Adding or fixing tests
- `chore:` - Changes to the build process, tools, etc.

Example: `feat: add user profile page`

## Testing

### Test Types

1. **Unit Tests**: Test individual functions and components in isolation
2. **Integration Tests**: Test interactions between components
3. **End-to-End Tests**: Test complete user flows in a browser-like environment

### Running Tests

```bash
# Run all tests
pnpm test

# Run unit tests
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run e2e tests
pnpm test:e2e

# Run tests in watch mode
pnpm test:watch
```

### Writing Tests

We use Vitest for unit and integration tests and Playwright for end-to-end tests.

#### Unit Test Example

```tsx
// components/Button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    await userEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### End-to-End Test Example

```ts
// e2e/home.spec.ts
import { test, expect } from '@playwright/test';

test('home page has title and search input', async ({ page }) => {
  await page.goto('/');
  
  // Check title
  await expect(page).toHaveTitle(/Spots/);
  
  // Check search input
  const searchInput = page.getByPlaceholder('Search for places...');
  await expect(searchInput).toBeVisible();
  
  // Enter search and submit
  await searchInput.fill('Coffee');
  await searchInput.press('Enter');
  
  // Check results appear
  await expect(page.getByTestId('search-results')).toBeVisible();
});
```

### Test Coverage

We aim for at least 80% test coverage for critical application logic. Run the following command to check coverage:

```bash
pnpm test:coverage
```

## Code Quality

### Linting and Formatting

We use ESLint and Prettier to maintain code quality and consistency:

```bash
# Run linter
pnpm lint

# Fix linter issues automatically
pnpm lint:fix

# Format code
pnpm format
```

### TypeScript

All code should be written in TypeScript with proper type definitions. Avoid using `any` type whenever possible.

### Code Reviews

All pull requests must be reviewed by at least one team member before merging. Code reviewers should check for:

1. Code quality and adherence to project standards
2. Proper test coverage
3. Performance considerations
4. Accessibility
5. Security issues

## Building for Production

To build the application for production:

```bash
pnpm build
```

To preview the production build locally:

```bash
pnpm start
```

## Deployment

### Deployment Pipeline

We use Vercel for deployment with the following pipeline:

1. **Preview Environments**: Automatically deployed for each PR
2. **Staging**: Automatically deployed when changes are merged to `develop`
3. **Production**: Deployed when changes are merged to `main` after approval

### Vercel Configuration

The project includes a `vercel.json` configuration file with the following settings:

```json
{
  "buildCommand": "pnpm build",
  "ignoreCommand": "pnpm lint && pnpm test",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": true
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Environment Variables on Vercel

Environment variables should be configured in the Vercel dashboard:

1. Go to your project on Vercel
2. Navigate to Settings > Environment Variables
3. Add all required environment variables
4. Specify which environments (Production, Preview, Development) each variable applies to

### Deployment Checks

The following checks are performed before deployment:

1. All tests pass
2. No linting errors
3. Type checking passes
4. Build completes successfully

### Rollback Process

If issues are discovered after deployment:

1. Go to the Vercel dashboard
2. Select the project
3. Navigate to Deployments
4. Find the last known good deployment
5. Click "..." and select "Promote to Production"

## Monitoring and Error Tracking

### Performance Monitoring

We use [Vercel Analytics](https://vercel.com/analytics) to monitor Web Vitals and user experience metrics:

- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to First Byte (TTFB)

### Error Tracking

We use [Sentry](https://sentry.io/) for error tracking and monitoring:

```tsx
// app/sentry.client.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Logging

For server-side logging, we use structured logging with [Pino](https://getpino.io/):

```ts
// lib/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

export default logger;
```

## Database Migrations

We use Prisma for database migrations:

```bash
# Create a new migration
pnpm prisma migrate dev --name descriptive-name

# Apply migrations in production
pnpm prisma migrate deploy

# Generate Prisma client
pnpm prisma generate
```

## Performance Optimization

### Server Components

Take advantage of React 19 Server Components to reduce client-side JavaScript:

```tsx
// app/page.tsx - Server Component (no 'use client' directive)
import { fetchLatestPlaces } from '@/lib/db/places';

export default async function HomePage() {
  const places = await fetchLatestPlaces();
  
  return (
    <div className="home-page">
      <h1>Discover Amazing Places</h1>
      <div className="places-grid">
        {places.map(place => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    </div>
  );
}
```

### Image Optimization

Use Next.js Image component with proper sizing and formats:

```tsx
import Image from 'next/image';

<Image
  src={place.imageUrl}
  alt={place.name}
  width={600}
  height={400}
  priority={isAboveFold}
  quality={85}
  className="rounded-lg object-cover"
/>
```

### Route Prefetching

Take advantage of Next.js route prefetching:

```tsx
import Link from 'next/link';

<Link href={`/places/${place.id}`} prefetch={isPriority}>
  {place.name}
</Link>
```

## Accessibility (A11y)

Ensure all components meet WCAG 2.1 AA standards:

- Use semantic HTML
- Ensure proper keyboard navigation
- Maintain adequate color contrast
- Provide text alternatives for non-text content
- Ensure forms have proper labels and error states

## Mobile Development

### Responsive Design Principles

- Mobile-first design approach
- Test on various screen sizes and devices
- Use relative units (rem, em, vh, vw) instead of fixed pixels
- Test touch interactions (tap areas, swipe gestures)

### Device Testing

Test the application on:
- iOS Safari
- Android Chrome
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## Security

### Authentication

We use NextAuth.js for authentication with the following providers:
- Email/Password
- Google OAuth
- GitHub OAuth

### API Security

- Use API rate limiting to prevent abuse
- Validate all user inputs on the server side
- Implement proper CORS headers
- Use CSRF protection for forms

### Data Protection

- Never expose sensitive information on the client
- Encrypt sensitive data in the database
- Implement proper access control for all resources

## Troubleshooting Common Issues

### Development Server Not Starting

1. Ensure Node.js version is v20.0.0 or higher
2. Delete `node_modules` and reinstall dependencies
3. Check for port conflicts (3000 is the default)

### Database Connection Issues

1. Verify your database is running
2. Check the `DATABASE_URL` in your `.env.local` file
3. Run `pnpm prisma generate` to regenerate the Prisma client

### Build Failures

1. Check for TypeScript errors with `pnpm type-check`
2. Fix linting issues with `pnpm lint:fix`
3. Clear the `.next` directory and rebuild

## Collaborative Development

### Code Sharing

For sharing code snippets and reproduction cases:
- Use GitHub Gists for short snippets
- Create a minimal reproduction repository for complex issues
- Use CodeSandbox for live examples

### Documentation

Keep documentation up-to-date:
- Update READMEs when adding new features
- Document API changes in the API documentation
- Create or update user guides for UI changes

## Additional Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev/)
- [Tailwind 4 Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Contribution Guides

For more detailed guides:
- [Contributing to the Project](CONTRIBUTING.md)
- [Pull Request Guidelines](PULL_REQUEST_TEMPLATE.md)
- [Issue Reporting Guidelines](ISSUE_TEMPLATE.md)
- [Code of Conduct](CODE_OF_CONDUCT.md) 