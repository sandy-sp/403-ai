# Testing Documentation

This project uses a comprehensive testing strategy with multiple types of tests to ensure code quality and reliability.

## Testing Stack

- **Jest**: JavaScript testing framework
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing
- **Playwright** (optional): End-to-end testing framework

## Test Types

### 1. Unit Tests
Located in `__tests__/lib/services/`

Tests individual service classes and utility functions in isolation.

**Examples:**
- `settings.service.test.ts` - Tests SettingsService methods
- `analytics.service.test.ts` - Tests AnalyticsService methods

**Run unit tests:**
```bash
npm test -- --testPathPattern=lib/services
```

### 2. Integration Tests
Located in `__tests__/app/api/`

Tests API routes and their integration with services and database.

**Examples:**
- `settings/route.test.ts` - Tests settings API endpoints
- `analytics/route.test.ts` - Tests analytics API endpoints

**Run integration tests:**
```bash
npm test -- --testPathPattern=app/api
```

### 3. Component Tests
Located in `__tests__/components/`

Tests React components in isolation with mocked dependencies.

**Examples:**
- `CommentCard.test.tsx` - Tests comment display and interactions
- `CommentForm.test.tsx` - Tests comment submission form
- `SettingsForm.test.tsx` - Tests settings management form

**Run component tests:**
```bash
npm test -- --testPathPattern=components
```

### 4. End-to-End Tests
Located in `__tests__/e2e/`

Tests complete user workflows across the entire application.

**Examples:**
- `comments.spec.ts` - Tests comment creation and moderation workflows
- `settings.spec.ts` - Tests settings management workflows
- `analytics.spec.ts` - Tests analytics dashboard interactions

**Note:** E2E tests require Playwright installation:
```bash
npm install -D @playwright/test
npx playwright install
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### CI Mode
```bash
npm run test:ci
```

## Test Configuration

### Jest Configuration
- **Config file**: `jest.config.js`
- **Setup file**: `jest.setup.js`
- **Environment**: jsdom (for React component testing)

### Coverage Thresholds
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### Mocked Dependencies
The following are automatically mocked in `jest.setup.js`:
- Next.js router (`next/navigation`)
- Next.js image component
- Prisma database client
- Resend email service
- Environment variables

## Writing Tests

### Unit Test Example
```typescript
import { SettingsService } from '@/lib/services/settings.service'

describe('SettingsService', () => {
  it('should validate required fields', () => {
    const result = SettingsService.validateSetting('site_name', '')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('This field is required')
  })
})
```

### Component Test Example
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { CommentForm } from '@/components/comments/CommentForm'

describe('CommentForm', () => {
  it('should submit comment successfully', async () => {
    render(<CommentForm postId="post-1" />)
    
    const textarea = screen.getByPlaceholderText('Share your thoughts...')
    fireEvent.change(textarea, { target: { value: 'Test comment' } })
    fireEvent.click(screen.getByText('Post Comment'))
    
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalled()
    })
  })
})
```

### Integration Test Example
```typescript
import { GET } from '@/app/api/admin/settings/route'
import { NextRequest } from 'next/server'

describe('/api/admin/settings', () => {
  it('should return settings', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/settings')
    const response = await GET(request)
    
    expect(response.status).toBe(200)
  })
})
```

## Test Coverage Areas

### ✅ Implemented Tests

1. **SettingsService Unit Tests**
   - Input sanitization
   - Validation logic
   - CRUD operations
   - Error handling

2. **AnalyticsService Unit Tests**
   - Dashboard analytics
   - Detailed analytics
   - Page view tracking
   - Error handling

3. **Settings API Integration Tests**
   - GET /api/admin/settings
   - PUT /api/admin/settings
   - POST /api/admin/settings
   - Authentication and authorization

4. **Comment Component Tests**
   - CommentCard rendering and interactions
   - CommentForm submission and validation
   - Error handling and loading states

5. **Settings Component Tests**
   - SettingsForm rendering and interactions
   - Tab switching and form validation
   - Save and reset functionality

6. **E2E Test Examples**
   - Comment creation and moderation workflows
   - Settings management workflows
   - Analytics dashboard interactions

### 🔄 Additional Tests to Consider

1. **More Unit Tests**
   - CommentService methods
   - EmailService methods
   - Rate limiting utilities
   - Error boundary components

2. **More Integration Tests**
   - Comment API routes
   - Analytics API routes
   - Authentication flows

3. **More Component Tests**
   - Analytics components
   - Admin dashboard components
   - Blog components

4. **Performance Tests**
   - Large dataset handling
   - Concurrent user scenarios
   - Memory usage optimization

## Best Practices

1. **Test Structure**: Follow AAA pattern (Arrange, Act, Assert)
2. **Descriptive Names**: Use clear, descriptive test names
3. **Mock External Dependencies**: Mock APIs, databases, and external services
4. **Test Edge Cases**: Include error scenarios and boundary conditions
5. **Keep Tests Independent**: Each test should be able to run in isolation
6. **Use Appropriate Test Types**: Unit tests for logic, integration tests for APIs, E2E tests for workflows

## Continuous Integration

Tests are configured to run in CI environments with:
- Coverage reporting
- Fail-fast on test failures
- Parallel test execution
- Artifact collection for failed tests

## Debugging Tests

### Debug Individual Test
```bash
npm test -- --testNamePattern="should validate required fields"
```

### Debug with Verbose Output
```bash
npm test -- --verbose
```

### Debug Component Tests
```bash
npm test -- --testPathPattern=CommentCard --watch
```

This comprehensive testing setup ensures high code quality, catches regressions early, and provides confidence when deploying changes to production.