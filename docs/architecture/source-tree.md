# Source Tree Structure

**Version:** 1.0
**Last Updated:** 2025-12-29
**Status:** Approved

This document defines the complete directory structure for the Enterprise AI Agent Platform. All developers must follow this structure when creating new files.

---

## Repository Root

```
dive-app/
├── .github/                    # GitHub-specific files
│   ├── workflows/              # CI/CD pipelines
│   │   ├── ci.yml             # Main CI pipeline
│   │   ├── release.yml        # Release automation
│   │   └── security.yml       # Security scans
│   ├── ISSUE_TEMPLATE/        # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .bmad-core/                 # BMAD project management
│   ├── core-config.yaml
│   ├── agents/
│   ├── tasks/
│   ├── templates/
│   └── checklists/
│
├── docs/                       # Documentation
│   ├── architecture/           # Architecture docs (sharded)
│   ├── prd/                    # PRD docs (sharded)
│   ├── stories/                # User stories
│   ├── qa/                     # QA documentation
│   ├── mrd.md                  # Market Requirements
│   ├── techstack.txt           # Tech stack diagram
│   └── epic-*.md               # Epic files
│
├── src/                        # Source code (monorepo)
│   ├── frontend/               # Tauri frontend (React/TypeScript)
│   ├── backend/                # ADK backend (Python/TypeScript)
│   ├── mcp-defender/           # Security layer
│   └── tauri/                  # Tauri Rust backend
│
├── tests/                      # Test suites
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
│
├── scripts/                    # Build and deployment scripts
│   ├── build.sh
│   ├── deploy.sh
│   └── setup-dev.sh
│
├── prisma/                     # Database schema and migrations
│   ├── schema.prisma
│   └── migrations/
│
├── .env.example                # Environment variables template
├── .env.local                  # Local env (gitignored)
├── .gitignore
├── .nvmrc                      # Node version
├── .python-version             # Python version
├── package.json                # Node dependencies
├── package-lock.json
├── pyproject.toml              # Python project config
├── requirements.txt            # Python dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config
├── tailwind.config.js          # Tailwind config
├── eslint.config.js            # ESLint config
├── .prettierrc                 # Prettier config
├── ruff.toml                   # Python linting/formatting
└── README.md
```

---

## Frontend Structure (`src/frontend/`)

```
src/frontend/
├── src/
│   ├── main.tsx                    # Application entry point
│   ├── App.tsx                     # Root component
│   ├── index.css                   # Global styles
│   │
│   ├── components/                 # React components
│   │   ├── ui/                     # shadcn/ui components (copy-paste)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   │
│   │   ├── chat/                   # Chat-related components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── ChatInterface.test.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── ConversationSidebar.tsx
│   │   │
│   │   ├── auth/                   # Authentication components
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SSOButton.tsx
│   │   │   └── SessionExpired.tsx
│   │   │
│   │   ├── mcp/                    # MCP-related components
│   │   │   ├── MCPServerConfig.tsx
│   │   │   ├── MCPServerList.tsx
│   │   │   ├── MCPHealthStatus.tsx
│   │   │   └── MCPToolCallIndicator.tsx
│   │   │
│   │   ├── admin/                  # Admin dashboard components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── SecurityMonitoring.tsx
│   │   │   ├── AuditLogViewer.tsx
│   │   │   └── ComplianceReports.tsx
│   │   │
│   │   ├── settings/               # Settings components
│   │   │   ├── SettingsPanel.tsx
│   │   │   ├── ModelSelection.tsx
│   │   │   ├── ProxyConfig.tsx
│   │   │   └── CertificateManager.tsx
│   │   │
│   │   └── shared/                 # Shared/common components
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── Toast.tsx
│   │       └── Modal.tsx
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useChat.ts
│   │   ├── useMCPServers.ts
│   │   ├── useAuditLogs.ts
│   │   └── useUser.ts
│   │
│   ├── services/                   # API clients and business logic
│   │   ├── api/                    # API clients
│   │   │   ├── apiClient.ts        # Base API client (axios)
│   │   │   ├── authApi.ts
│   │   │   ├── chatApi.ts
│   │   │   ├── mcpApi.ts
│   │   │   └── adminApi.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── authService.ts      # SSO/SAML logic
│   │   │   └── sessionManager.ts
│   │   │
│   │   ├── chat/
│   │   │   ├── llmService.ts       # LLM integration
│   │   │   └── conversationService.ts
│   │   │
│   │   ├── mcp/
│   │   │   ├── mcpClient.ts        # MCP protocol client
│   │   │   └── mcpHealthMonitor.ts
│   │   │
│   │   └── storage/
│   │       ├── databaseService.ts  # SQLite wrapper
│   │       └── keychainService.ts  # OS keychain access
│   │
│   ├── stores/                     # Zustand stores
│   │   ├── authStore.ts            # User session state
│   │   ├── chatStore.ts            # Chat/conversation state
│   │   ├── mcpStore.ts             # MCP server state
│   │   ├── settingsStore.ts        # User preferences
│   │   └── uiStore.ts              # UI state (modals, toasts)
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── user.ts
│   │   ├── chat.ts
│   │   ├── mcp.ts
│   │   ├── audit.ts
│   │   └── api.ts
│   │
│   ├── utils/                      # Utility functions
│   │   ├── formatters.ts           # Date, number formatting
│   │   ├── validators.ts           # Input validation
│   │   ├── crypto.ts               # Encryption helpers
│   │   ├── logger.ts               # Logging utility
│   │   └── errorHandler.ts
│   │
│   ├── constants/                  # Constants and enums
│   │   ├── apiEndpoints.ts
│   │   ├── userRoles.ts
│   │   ├── errorCodes.ts
│   │   └── config.ts
│   │
│   └── assets/                     # Static assets
│       ├── images/
│       ├── icons/
│       └── fonts/
│
├── public/                         # Public static files
│   └── favicon.ico
│
├── index.html                      # HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## Backend Structure (`src/backend/`)

```
src/backend/
├── src/
│   ├── main.py                     # Application entry point (FastAPI/Flask)
│   ├── config.py                   # Configuration management
│   │
│   ├── agents/                     # ADK agents
│   │   ├── __init__.py
│   │   ├── chat_agent.py           # Chat orchestration agent
│   │   ├── mcp_agent.py            # MCP interaction agent
│   │   └── admin_agent.py          # Admin operations agent
│   │
│   ├── services/                   # Business logic services
│   │   ├── __init__.py
│   │   ├── auth/
│   │   │   ├── __init__.py
│   │   │   ├── sso_service.py      # SSO/SAML logic
│   │   │   ├── session_manager.py
│   │   │   └── rbac_service.py     # RBAC enforcement
│   │   │
│   │   ├── llm/
│   │   │   ├── __init__.py
│   │   │   ├── gemini_client.py
│   │   │   ├── openai_client.py
│   │   │   ├── local_llm_client.py
│   │   │   └── llm_router.py       # LLM selection/failover
│   │   │
│   │   ├── mcp/
│   │   │   ├── __init__.py
│   │   │   ├── mcp_client.py       # MCPToolset wrapper
│   │   │   ├── mcp_manager.py      # Server lifecycle
│   │   │   ├── stdio_transport.py
│   │   │   ├── sse_transport.py
│   │   │   └── health_monitor.py
│   │   │
│   │   ├── security/
│   │   │   ├── __init__.py
│   │   │   ├── encryption_service.py
│   │   │   ├── pii_detector.py
│   │   │   └── audit_logger.py
│   │   │
│   │   └── storage/
│   │       ├── __init__.py
│   │       ├── database_service.py # SQLAlchemy wrapper
│   │       └── migration_runner.py
│   │
│   ├── models/                     # Data models (SQLAlchemy/Pydantic)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── session.py
│   │   ├── conversation.py
│   │   ├── message.py
│   │   ├── mcp_server.py
│   │   ├── audit_log.py
│   │   └── rbac_policy.py
│   │
│   ├── api/                        # API routes (if using FastAPI)
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── chat.py
│   │   ├── mcp.py
│   │   └── admin.py
│   │
│   ├── database/                   # Database setup
│   │   ├── __init__.py
│   │   ├── connection.py           # DB connection pool
│   │   ├── migrations/             # Alembic migrations
│   │   └── seeds/                  # Seed data
│   │
│   ├── utils/                      # Utility functions
│   │   ├── __init__.py
│   │   ├── logger.py
│   │   ├── validators.py
│   │   ├── crypto.py
│   │   └── error_handler.py
│   │
│   └── constants/                  # Constants
│       ├── __init__.py
│       ├── user_roles.py
│       └── error_codes.py
│
├── tests/                          # Backend-specific tests
│   ├── test_auth.py
│   ├── test_llm.py
│   ├── test_mcp.py
│   └── conftest.py                 # pytest fixtures
│
├── pyproject.toml
├── requirements.txt
└── alembic.ini                     # Database migrations config
```

---

## MCP-Defender Structure (`src/mcp-defender/`)

```
src/mcp-defender/
├── src/
│   ├── index.ts                    # Entry point
│   │
│   ├── detector/                   # Threat detection engine
│   │   ├── ThreatDetector.ts
│   │   ├── SignatureScanner.ts     # Signature-based detection
│   │   ├── HeuristicAnalyzer.ts    # Heuristic analysis
│   │   ├── RulesEngine.ts          # Configurable rules
│   │   └── rules/                  # Detection rules
│   │       ├── sqlInjection.ts
│   │       ├── pathTraversal.ts
│   │       ├── commandInjection.ts
│   │       └── dataExfiltration.ts
│   │
│   ├── consent/                    # User consent workflow
│   │   ├── ConsentManager.ts
│   │   ├── RiskScorer.ts
│   │   └── ApprovalWorkflow.ts
│   │
│   ├── logger/                     # Traffic inspection & logging
│   │   ├── TrafficInspector.ts
│   │   ├── AuditLogger.ts
│   │   └── PIIMasker.ts
│   │
│   ├── proxy/                      # MCP proxy
│   │   ├── MCPProxy.ts             # Main proxy logic
│   │   └── RequestInterceptor.ts
│   │
│   ├── types/
│   │   ├── threat.ts
│   │   ├── consent.ts
│   │   └── audit.ts
│   │
│   └── utils/
│       ├── logger.ts
│       └── config.ts
│
├── tests/
│   ├── detector.test.ts
│   ├── consent.test.ts
│   └── proxy.test.ts
│
├── package.json
└── tsconfig.json
```

---

## Tauri Structure (`src/tauri/`)

```
src/tauri/
├── src/
│   ├── main.rs                     # Tauri main entry
│   ├── lib.rs
│   │
│   ├── commands/                   # Tauri commands (exposed to frontend)
│   │   ├── mod.rs
│   │   ├── auth.rs
│   │   ├── database.rs
│   │   ├── keychain.rs
│   │   └── system.rs
│   │
│   ├── services/                   # Rust services
│   │   ├── mod.rs
│   │   ├── backend_process.rs      # Spawn ADK backend
│   │   └── config_manager.rs
│   │
│   └── utils/
│       ├── mod.rs
│       └── logger.rs
│
├── Cargo.toml
├── Cargo.lock
├── tauri.conf.json                 # Tauri configuration
└── build.rs
```

---

## Tests Structure (`tests/`)

```
tests/
├── unit/                           # Unit tests
│   ├── frontend/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   │
│   └── backend/
│       ├── services/
│       ├── models/
│       └── utils/
│
├── integration/                    # Integration tests
│   ├── auth-flow.test.ts
│   ├── mcp-integration.test.ts
│   ├── llm-integration.test.ts
│   └── database.test.ts
│
├── e2e/                            # End-to-end tests
│   ├── chat-flow.spec.ts
│   ├── admin-dashboard.spec.ts
│   ├── mcp-workflow.spec.ts
│   └── settings.spec.ts
│
├── security/                       # Security tests
│   ├── mcp-defender.test.ts
│   ├── rbac.test.ts
│   ├── encryption.test.ts
│   └── pii-masking.test.ts
│
├── fixtures/                       # Test data
│   ├── users.json
│   ├── conversations.json
│   └── mcp-servers.json
│
└── helpers/                        # Test utilities
    ├── testUtils.ts
    ├── mockData.ts
    └── setup.ts
```

---

## Configuration Files Location

```
Repository Root:
├── .env.example                # Environment template
├── .env.local                  # Local overrides (gitignored)
├── .gitignore
├── .nvmrc                      # Node version (20.x)
├── .python-version             # Python version (3.11+)
│
Frontend Config:
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite bundler
├── tailwind.config.js          # Tailwind CSS
├── postcss.config.js           # PostCSS
├── eslint.config.js            # ESLint
├── .prettierrc                 # Prettier
│
Backend Config:
├── pyproject.toml              # Python project
├── requirements.txt            # Python dependencies
├── ruff.toml                   # Ruff (linting/formatting)
├── alembic.ini                 # Database migrations
│
Database:
├── prisma/schema.prisma        # Prisma schema
│
Tauri:
└── src/tauri/tauri.conf.json  # Tauri configuration
```

---

## File Naming Conventions

### React Components
```
PascalCase.tsx for components
PascalCase.test.tsx for tests
PascalCase.module.css for CSS modules (if needed)

Example:
ChatInterface.tsx
ChatInterface.test.tsx
```

### TypeScript/JavaScript
```
camelCase.ts for services, utilities, hooks
camelCase.test.ts for tests

Example:
authService.ts
authService.test.ts
useAuth.ts
```

### Python
```
snake_case.py for all files
test_*.py for tests

Example:
auth_service.py
test_auth_service.py
```

### Rust
```
snake_case.rs for all files

Example:
backend_process.rs
```

---

## Import Path Aliases

**TypeScript Configuration (`tsconfig.json`):**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/services/*": ["src/services/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"],
      "@/stores/*": ["src/stores/*"]
    }
  }
}
```

**Usage:**
```typescript
// ✅ Use path aliases
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useAuth } from '@/hooks/useAuth';

// ❌ Avoid relative paths for deep imports
import { ChatInterface } from '../../../components/chat/ChatInterface';
```

---

## Build Artifacts (Gitignored)

```
dist/                   # Vite build output
build/                  # Tauri build output
target/                 # Rust build output
node_modules/           # Node dependencies
__pycache__/            # Python bytecode
.pytest_cache/          # pytest cache
.venv/                  # Python virtual environment
*.egg-info/             # Python package info
.DS_Store               # macOS
Thumbs.db               # Windows
```

---

## Database Files Location

```
Development:
~/.local/share/dive-app/database.db (Linux)
~/Library/Application Support/dive-app/database.db (macOS)
%APPDATA%/dive-app/database.db (Windows)

Test:
tests/fixtures/test.db (temporary)
```

---

## Documentation Location

```
docs/
├── architecture/               # Architecture docs (generated from architecture.md)
│   ├── index.md
│   ├── 1-architecture-overview.md
│   ├── 2-technology-stack.md
│   ├── tech-stack.md          # Detailed tech stack
│   ├── coding-standards.md    # This document
│   └── source-tree.md         # This document
│
├── prd/                        # PRD docs (generated from prd.md)
│   ├── index.md
│   ├── 1-goals-and-background-context.md
│   └── ...
│
├── stories/                    # Individual user stories
│   ├── story-1.1-desktop-bootstrap.md
│   └── ...
│
├── qa/                         # QA documentation
│
├── epic-*.md                   # Epic files
├── mrd.md                      # Market Requirements
└── techstack.txt               # Visual tech stack diagram
```

---

## Adding New Features - Where Files Go

### Adding a New React Component
```
1. Create component: src/frontend/src/components/{category}/{ComponentName}.tsx
2. Create test: src/frontend/src/components/{category}/{ComponentName}.test.tsx
3. Export from index: src/frontend/src/components/{category}/index.ts
4. Add types if needed: src/frontend/src/types/{category}.ts
```

### Adding a New Service
```
Frontend:
src/frontend/src/services/{category}/{serviceName}.ts

Backend:
src/backend/src/services/{category}/{service_name}.py
```

### Adding a New API Endpoint
```
Backend Route:
src/backend/src/api/{resource}.py

Frontend API Client:
src/frontend/src/services/api/{resource}Api.ts
```

### Adding a New Database Table
```
1. Update Prisma schema: prisma/schema.prisma
2. Run migration: npx prisma migrate dev --name {migration_name}
3. Add model: src/backend/src/models/{table_name}.py
4. Add TypeScript type: src/frontend/src/types/{table_name}.ts
```

---

## Build Output Structure

```
build/
├── windows/
│   ├── DIVE-1.0.0-setup.msi
│   └── DIVE-1.0.0-portable.exe
│
├── macos/
│   ├── DIVE_1.0.0_x64.dmg
│   └── DIVE_1.0.0_arm64.dmg
│
└── linux/
    ├── dive_1.0.0_amd64.deb
    ├── dive_1.0.0_amd64.rpm
    └── dive_1.0.0_x86_64.AppImage
```

---

## Quick Reference

**Component:** `src/frontend/src/components/{category}/{Name}.tsx`
**Hook:** `src/frontend/src/hooks/use{Name}.ts`
**Service (TS):** `src/frontend/src/services/{category}/{name}Service.ts`
**Service (Py):** `src/backend/src/services/{category}/{name}_service.py`
**Type:** `src/frontend/src/types/{category}.ts`
**Store:** `src/frontend/src/stores/{name}Store.ts`
**Test:** Co-located with source file `{Name}.test.tsx` or `test_{name}.py`

---

**Last Review:** 2025-12-29
**Next Review:** 2026-01-29 (monthly)
