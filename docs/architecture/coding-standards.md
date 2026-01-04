# Coding Standards

**Version:** 1.0
**Last Updated:** 2025-12-29
**Status:** Approved

These coding standards ensure consistency, maintainability, and quality across the Enterprise AI Agent Platform codebase. All developers must follow these standards.

---

## General Principles

### Code Philosophy
1. **Readability First** - Code is read 10x more than written
2. **Explicit Over Clever** - Prefer clarity over cleverness
3. **KISS** - Keep It Simple, Stupid
4. **DRY** - Don't Repeat Yourself (but avoid premature abstraction)
5. **YAGNI** - You Aren't Gonna Need It (don't over-engineer)
6. **Fail Fast** - Detect errors early, fail loudly

### Security First
- Never log sensitive data (passwords, tokens, PII)
- Always sanitize user input
- Use parameterized queries (never string concatenation)
- Validate all external data
- Follow principle of least privilege

---

## TypeScript / JavaScript Standards

### File Naming
```
PascalCase: Components, Classes
camelCase: functions, variables, files (non-components)
kebab-case: CSS files, config files
UPPER_SNAKE_CASE: Constants

Examples:
✅ ChatInterface.tsx (React component)
✅ authService.ts (service)
✅ userTypes.ts (types/interfaces)
✅ API_ENDPOINTS.ts (constants)
❌ chatinterface.tsx
❌ AuthService.ts (not a component)
```

### Code Style

**Indentation:** 2 spaces (no tabs)
**Line Length:** 100 characters max
**Quotes:** Single quotes for strings, double quotes for JSX attributes
**Semicolons:** Required
**Trailing Commas:** Always (except in JSON files)

**Example:**
```typescript
// ✅ Good
const user = {
  name: 'John',
  age: 30,
};

// ❌ Bad
const user = {
  name: "John",
  age: 30
}
```

### TypeScript Specific

**Type Annotations:**
```typescript
// ✅ Explicit return types for functions
function getUser(id: string): Promise<User> {
  return fetchUser(id);
}

// ✅ Explicit types for complex objects
interface User {
  id: string;
  email: string;
  role: UserRole;
}

// ❌ Avoid 'any'
function process(data: any) { } // Bad

// ✅ Use unknown or specific types
function process(data: unknown) { } // Better
function process(data: UserData) { } // Best
```

**Type vs Interface:**
```typescript
// ✅ Use interface for object shapes
interface User {
  id: string;
  name: string;
}

// ✅ Use type for unions, intersections, utilities
type UserRole = 'admin' | 'user' | 'guest';
type ReadonlyUser = Readonly<User>;
```

**Enums:**
```typescript
// ✅ Use const enums for better tree-shaking
const enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

// ❌ Avoid numeric enums
enum Status { Active, Inactive } // Bad
```

### React Standards

**Component Structure:**
```typescript
// ✅ Function components with named exports
export function ChatInterface({ userId }: ChatInterfaceProps) {
  // 1. Hooks
  const [messages, setMessages] = useState<Message[]>([]);
  const user = useUser(userId);

  // 2. Derived state
  const messageCount = messages.length;

  // 3. Effects
  useEffect(() => {
    loadMessages();
  }, [userId]);

  // 4. Event handlers
  const handleSendMessage = useCallback((text: string) => {
    // ...
  }, []);

  // 5. Conditional early returns
  if (!user) return <LoadingSpinner />;

  // 6. Main render
  return (
    <div className="chat-interface">
      {/* ... */}
    </div>
  );
}

// ❌ Default exports (harder to refactor)
export default ChatInterface; // Avoid
```

**Props:**
```typescript
// ✅ Explicit interface for props
interface ChatInterfaceProps {
  userId: string;
  onMessageSent?: (message: Message) => void;
  className?: string;
}

// ✅ Destructure props in function signature
export function ChatInterface({ userId, onMessageSent, className }: ChatInterfaceProps) {
  // ...
}

// ❌ Props without types
export function ChatInterface(props) { } // Bad
```

**Hooks:**
```typescript
// ✅ Custom hooks start with 'use'
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  // ...
  return { user, login, logout };
}

// ✅ Dependency arrays must be complete
useEffect(() => {
  fetchData(userId);
}, [userId]); // Include all dependencies

// ❌ Missing dependencies
useEffect(() => {
  fetchData(userId);
}, []); // Bad - missing userId
```

**Conditional Rendering:**
```typescript
// ✅ Use early returns for loading/error states
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;

// ✅ Ternary for simple conditions
{isAdmin ? <AdminPanel /> : <UserPanel />}

// ✅ && for conditional display
{messages.length > 0 && <MessageList messages={messages} />}

// ❌ Nested ternaries
{status === 'loading' ? <Spinner /> : status === 'error' ? <Error /> : <Content />} // Bad
```

### Async/Await

```typescript
// ✅ Always use try/catch with async
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch user', { id, error });
    throw new UserFetchError('User not found', { cause: error });
  }
}

// ✅ Use Promise.all for parallel operations
async function loadDashboard() {
  const [users, metrics, logs] = await Promise.all([
    fetchUsers(),
    fetchMetrics(),
    fetchLogs(),
  ]);
  return { users, metrics, logs };
}

// ❌ Sequential awaits (slower)
const users = await fetchUsers();
const metrics = await fetchMetrics(); // Could be parallel
```

### Error Handling

```typescript
// ✅ Custom error classes
class AuthenticationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// ✅ Specific error handling
try {
  await authenticateUser(credentials);
} catch (error) {
  if (error instanceof AuthenticationError) {
    showLoginError(error.message);
  } else if (error instanceof NetworkError) {
    showNetworkError();
  } else {
    showGenericError();
  }
}
```

---

## Python Standards

### File Naming
```
snake_case: All Python files and modules
PascalCase: Classes only

Examples:
✅ auth_service.py
✅ mcp_client.py
✅ user_types.py
❌ authService.py
❌ MCPClient.py (file name)
```

### Code Style

**Follow PEP 8 with modifications:**
- **Indentation:** 4 spaces (no tabs)
- **Line Length:** 100 characters (not 79)
- **Quotes:** Single quotes for strings (consistent with TypeScript)
- **Imports:** Grouped and sorted (isort)

**Example:**
```python
# ✅ Good imports
import os
import sys
from typing import Optional, List

from sqlalchemy import create_engine
from pydantic import BaseModel

from app.models import User
from app.services.auth import AuthService

# ✅ Type hints
def get_user(user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

# ✅ List comprehensions for simple transformations
user_ids = [user.id for user in users if user.is_active]

# ❌ Nested comprehensions (hard to read)
result = [[y*2 for y in x if y > 0] for x in matrix if len(x) > 3] # Bad
```

### Type Hints

```python
from typing import List, Dict, Optional, Union, Callable

# ✅ Always use type hints
def process_users(
    users: List[User],
    filter_fn: Optional[Callable[[User], bool]] = None
) -> Dict[str, User]:
    """Process users and return a mapping of user IDs to users."""
    filtered = [u for u in users if not filter_fn or filter_fn(u)]
    return {user.id: user for user in filtered}

# ✅ Use Optional for nullable values
def find_user(email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

# ❌ Missing type hints
def process(data): # Bad
    return transform(data)
```

### Classes and Objects

```python
# ✅ Use dataclasses for simple data containers
from dataclasses import dataclass

@dataclass
class User:
    id: str
    email: str
    role: str
    is_active: bool = True

# ✅ Use Pydantic for validation
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str

    class Config:
        str_strip_whitespace = True

# ✅ Class naming
class AuthenticationService:  # PascalCase
    def __init__(self, db_session):
        self.db = db_session

    def authenticate(self, credentials: Credentials) -> User:
        # ...
        pass
```

### Error Handling

```python
# ✅ Specific exceptions
class UserNotFoundError(Exception):
    """Raised when a user cannot be found."""
    pass

# ✅ Context managers for resources
def read_config():
    with open('config.json', 'r') as f:
        return json.load(f)

# ✅ Explicit exception handling
try:
    user = authenticate(credentials)
except AuthenticationError as e:
    logger.error(f'Auth failed: {e}')
    raise
except DatabaseError as e:
    logger.error(f'DB error: {e}')
    raise ServiceUnavailableError('Database unavailable')
```

### Async Python

```python
# ✅ Use async/await for I/O operations
async def fetch_user(user_id: str) -> User:
    async with aiohttp.ClientSession() as session:
        async with session.get(f'/users/{user_id}') as response:
            data = await response.json()
            return User(**data)

# ✅ Use asyncio.gather for parallel operations
async def load_dashboard():
    users, metrics, logs = await asyncio.gather(
        fetch_users(),
        fetch_metrics(),
        fetch_logs(),
    )
    return {'users': users, 'metrics': metrics, 'logs': logs}
```

---

## SQL & Database

### Query Style

```sql
-- ✅ Keywords in UPPERCASE, identifiers in snake_case
SELECT
  user_id,
  email,
  created_at
FROM users
WHERE is_active = 1
  AND role IN ('admin', 'user')
ORDER BY created_at DESC
LIMIT 100;

-- ✅ Use parameterized queries (never string concatenation)
-- TypeScript
const users = await db.query(
  'SELECT * FROM users WHERE email = ?',
  [email]
);

-- Python
users = db.execute(
    'SELECT * FROM users WHERE email = :email',
    {'email': email}
)

-- ❌ String concatenation (SQL INJECTION RISK!)
const query = `SELECT * FROM users WHERE email = '${email}'`; // NEVER DO THIS
```

### Schema Naming

```sql
-- ✅ Tables: plural snake_case
CREATE TABLE users (...);
CREATE TABLE mcp_servers (...);

-- ✅ Columns: snake_case
user_id, created_at, is_active

-- ✅ Indexes: idx_{table}_{columns}
CREATE INDEX idx_users_email ON users(email);

-- ✅ Foreign keys: fk_{table}_{referenced_table}
CONSTRAINT fk_sessions_users FOREIGN KEY (user_id) REFERENCES users(id)
```

---

## Git Standards

### Branch Naming

```
main              - Production-ready code
develop           - Integration branch
feature/EPIC-123  - Feature branches (from develop)
bugfix/fix-login  - Bug fixes (from develop)
hotfix/security   - Urgent fixes (from main)
release/v1.0.0    - Release preparation (from develop)
```

### Commit Messages

**Format:** Conventional Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring (no feature/fix)
- `test`: Adding or updating tests
- `chore`: Tooling, dependencies, config

**Examples:**
```
✅ feat(auth): add SSO/SAML authentication

Implements SSO integration with Okta, Azure Entra ID, and Google Workspace.
Includes session management and token refresh.

Closes #123

✅ fix(mcp): handle connection timeout gracefully

Previously, MCP connection timeouts would crash the app.
Now displays user-friendly error message and retries.

✅ docs(architecture): update tech stack versions

❌ Fixed stuff  // Too vague
❌ WIP  // Not descriptive
❌ asdfasdf  // Meaningless
```

### Pull Requests

**PR Title:** Same format as commits
```
feat(chat): implement streaming LLM responses
```

**PR Description Template:**
```markdown
## Description
Brief description of changes

## Related Issues
Closes #123
Relates to #456

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console.log or print statements
```

---

## Testing Standards

### Test File Naming

```
src/components/ChatInterface.tsx
src/components/ChatInterface.test.tsx  // Unit tests

tests/integration/auth.test.ts
tests/e2e/chat-flow.spec.ts
```

### Test Structure

```typescript
// ✅ AAA Pattern: Arrange, Act, Assert
describe('AuthService', () => {
  describe('login', () => {
    it('should return user on successful login', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'pass123' };
      const mockUser = { id: '1', email: 'test@example.com' };
      mockAuthApi.login.mockResolvedValue(mockUser);

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockAuthApi.login).toHaveBeenCalledWith(credentials);
    });

    it('should throw error on invalid credentials', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'wrong' };
      mockAuthApi.login.mockRejectedValue(new AuthError('Invalid'));

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow(AuthError);
    });
  });
});
```

### Test Coverage

**Targets:**
- **Overall:** >80%
- **Critical Paths:** >95% (auth, security, MCP-Defender)
- **UI Components:** >70%

**What to Test:**
- ✅ Business logic (services, utilities)
- ✅ Critical user flows (auth, MCP calls)
- ✅ Error handling
- ✅ Edge cases
- ❌ Trivial getters/setters
- ❌ Third-party library code

---

## Comments & Documentation

### When to Comment

```typescript
// ✅ Complex algorithms
// Use binary search for O(log n) performance
const index = binarySearch(array, target);

// ✅ Non-obvious business logic
// Retention policy requires 1-year minimum for compliance
const RETENTION_DAYS = 365;

// ✅ Workarounds
// HACK: Gemini API sometimes returns null; fallback to empty string
const response = data.text || '';

// ✅ TODOs (with ticket number)
// TODO(EPIC-123): Implement caching for performance

// ❌ Obvious code
const name = user.getName(); // Gets the user name  // Redundant!

// ❌ Commented-out code (use git history instead)
// function oldFunction() { ... }  // Delete it!
```

### Function Documentation

```typescript
/**
 * Authenticates user with SSO provider and creates session.
 *
 * @param provider - SSO provider (okta, azure, google)
 * @param samlResponse - SAML assertion from provider
 * @returns Authenticated user with session tokens
 * @throws {AuthenticationError} If SAML validation fails
 * @throws {DatabaseError} If session creation fails
 *
 * @example
 * const user = await authenticateSSO('okta', samlResponse);
 */
async function authenticateSSO(
  provider: SSOProvider,
  samlResponse: string
): Promise<AuthenticatedUser> {
  // ...
}
```

```python
def authenticate_sso(provider: str, saml_response: str) -> User:
    """
    Authenticate user with SSO provider and create session.

    Args:
        provider: SSO provider (okta, azure, google)
        saml_response: SAML assertion from provider

    Returns:
        Authenticated user with session tokens

    Raises:
        AuthenticationError: If SAML validation fails
        DatabaseError: If session creation fails

    Example:
        >>> user = authenticate_sso('okta', saml_response)
        >>> print(user.email)
        'user@example.com'
    """
    # ...
```

---

## Security Guidelines

### Never Log Sensitive Data

```typescript
// ❌ BAD - Logs passwords and tokens
logger.info('User login', { email, password, token });

// ✅ GOOD - Sanitize sensitive fields
logger.info('User login', { email, userId: user.id });
```

### Input Validation

```typescript
// ✅ Validate all user input
function createUser(data: unknown): User {
  const validated = UserSchema.parse(data); // Zod/Joi validation
  return db.create(validated);
}

// ❌ Trust user input
function createUser(data: any): User {
  return db.create(data); // SQL injection risk!
}
```

### Secrets Management

```typescript
// ✅ Environment variables
const apiKey = process.env.GEMINI_API_KEY;

// ✅ OS keychain for sensitive data
const token = await keytar.getPassword('dive-app', 'auth-token');

// ❌ Hardcoded secrets
const apiKey = 'sk-1234567890'; // NEVER DO THIS
```

---

## Performance Guidelines

### Avoid Premature Optimization

```typescript
// ✅ Start simple and readable
function findUser(users: User[], id: string): User | undefined {
  return users.find(u => u.id === id);
}

// ❌ Premature optimization (unless profiled bottleneck)
const userMap = new Map(users.map(u => [u.id, u]));
return userMap.get(id);
```

### Memoization

```typescript
// ✅ Memoize expensive computations
const memoizedSearch = useMemo(() => {
  return filterAndSortUsers(users, searchTerm);
}, [users, searchTerm]);

// ✅ Memoize callbacks to prevent re-renders
const handleClick = useCallback((id: string) => {
  updateUser(id);
}, [updateUser]);
```

---

## File Organization

```
src/
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── shared/      # Shared components
├── hooks/           # Custom React hooks
├── services/        # Business logic, API clients
├── utils/           # Pure utility functions
├── types/           # TypeScript type definitions
├── stores/          # Zustand stores
└── constants/       # Constants, enums
```

**Import Order:**
```typescript
// 1. External imports
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal imports (absolute paths)
import { ChatInterface } from '@/components/ChatInterface';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/user';

// 3. Relative imports
import { formatDate } from './utils';

// 4. Styles/assets
import styles from './ChatInterface.module.css';
```

---

## Code Review Checklist

Before submitting PR, verify:

- [ ] Code follows style guidelines (ESLint/Ruff passes)
- [ ] All tests pass
- [ ] No console.log/print statements
- [ ] No commented-out code
- [ ] Sensitive data not logged
- [ ] Error handling implemented
- [ ] Type safety (no `any` in TypeScript)
- [ ] Documentation/comments added for complex logic
- [ ] Performance considered (no obvious bottlenecks)
- [ ] Security reviewed (input validation, SQL injection, XSS)

---

## Tools Configuration

### ESLint (.eslintrc.js)
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier', // Must be last
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'no-console': 'warn',
    'prefer-const': 'error',
  },
};
```

### Prettier (.prettierrc)
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

### Ruff (ruff.toml)
```toml
[lint]
select = ["E", "F", "I", "N", "UP", "S", "B", "A", "C4", "PT"]
ignore = ["E501"]  # Line too long (handled by formatter)

[format]
quote-style = "single"
indent-width = 4
line-length = 100
```

---

## Enforcement

- **Pre-commit Hooks:** ESLint, Prettier, Ruff (via husky)
- **CI/CD:** Automated checks on every PR
- **Code Review:** Required approval before merge
- **Violations:** PR blocked until resolved

---

**Last Review:** 2025-12-29
**Next Review:** 2026-01-29 (monthly)
