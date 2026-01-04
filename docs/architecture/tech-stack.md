# Technology Stack

**Version:** 1.0
**Last Updated:** 2025-12-29
**Status:** Approved

This document defines the complete technology stack for the Enterprise AI Agent Platform. All developers must use these exact versions and libraries unless explicitly approved by the architect.

---

## Core Platform

### Desktop Framework
**Tauri 2.0+**
- **Version:** 2.0.0 or later
- **Language:** Rust 1.70+
- **Why:** Smaller binary (<150MB), better security than Electron, lower memory footprint (<500MB)
- **Installation:** Via Cargo
- **Docs:** https://tauri.app

### Frontend

**React 18.2+**
- **Version:** 18.2.0 or later
- **Why:** Mature ecosystem, excellent Tauri support, large talent pool
- **Key Features Used:** Hooks, Suspense, Concurrent Rendering

**TypeScript 5.0+**
- **Version:** 5.0.0 or later
- **Config:** Strict mode enabled
- **Why:** Type safety, better IDE support, fewer runtime errors

**Build Tool: Vite 5.0+**
- **Version:** 5.0.0 or later
- **Why:** Fast HMR, optimized builds, excellent React support

### Backend/Agent Layer

**Google ADK (Agent Development Kit)**
- **Languages:** Python 3.11+ and TypeScript 5.0+
- **Version:** Latest stable
- **Why:** Purpose-built for AI agents, multi-agent workflows, Google support
- **Docs:** https://cloud.google.com/adk

**Python 3.11+**
- **Version:** 3.11.0 or later
- **Why:** Performance improvements, better type hints
- **Package Manager:** pip with requirements.txt

**Node.js 20 LTS**
- **Version:** 20.x LTS
- **Why:** Long-term support, stable for production
- **Package Manager:** npm (not yarn/pnpm)

---

## UI Libraries

### Component Library
**shadcn/ui**
- **Why:** Accessible (WCAG AA), customizable, not a dependency (copy-paste)
- **Base:** Radix UI primitives
- **Install:** Via CLI, components copied to `src/components/ui/`

**Radix UI**
- **Version:** Latest stable
- **Why:** Unstyled, accessible primitives (WCAG 2.1 AA compliant)
- **Used For:** Dialog, DropdownMenu, Select, Tooltip, etc.

### Styling
**TailwindCSS 3.4+**
- **Version:** 3.4.0 or later
- **Config:** Custom theme in `tailwind.config.js`
- **Why:** Utility-first, small bundle size, excellent DX

**PostCSS**
- **Version:** 8.4+
- **Plugins:** autoprefixer, tailwindcss

### Icons
**Lucide React**
- **Version:** Latest stable
- **Why:** Clean icons, tree-shakeable, consistent design
- **Install:** `npm install lucide-react`

---

## State Management

### Client State
**Zustand 4.4+**
- **Version:** 4.4.0 or later
- **Why:** Minimal boilerplate, excellent TypeScript support, small bundle
- **Usage:** Global app state (user, settings, UI state)

### Server State
**TanStack Query (React Query) 5.0+**
- **Version:** 5.0.0 or later
- **Why:** Caching, invalidation, background refetching
- **Usage:** LLM responses, MCP calls, API requests

---

## Data Storage

### Local Database
**SQLite 3.40+**
- **Version:** 3.40.0 or later
- **Why:** Embedded, zero-config, ACID compliant

**SQLCipher**
- **Version:** Latest compatible with SQLite version
- **Why:** AES-256 encryption at rest
- **Encryption:** Full database encryption

### ORM/Query Builder

**TypeScript: Prisma 5.0+**
- **Version:** 5.0.0 or later
- **Why:** Type-safe queries, migrations, excellent DX
- **Schema:** `prisma/schema.prisma`

**Python: SQLAlchemy 2.0+**
- **Version:** 2.0.0 or later
- **Why:** Mature, flexible, good performance
- **Usage:** ADK backend database operations

---

## LLM Integration

### Google Gemini
**@google/generative-ai**
- **Version:** Latest stable
- **Models Supported:** Gemini Pro, Gemini Pro Vision (future)
- **API:** REST API with streaming support

### OpenAI
**openai (Official SDK)**
- **Version:** 4.0.0+ (Node.js), 1.0.0+ (Python)
- **Models Supported:** GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **API:** REST API with streaming support

### Local LLMs (Offline Mode)
**Ollama** (or alternatives: llama.cpp, LM Studio)
- **Version:** Latest stable
- **Models:** Llama 3 8B Instruct, Mistral 7B Instruct
- **Why:** Offline capability, privacy, no API costs

---

## MCP (Model Context Protocol)

### MCP Client
**@modelcontextprotocol/sdk**
- **Version:** Latest stable
- **Transports:** stdio, SSE
- **Why:** Official MCP implementation

**MCPToolset**
- **Version:** Latest stable
- **Why:** Higher-level abstractions for MCP operations
- **Docs:** MCP documentation

### MCP-Defender (Security Layer)
**Custom Fork/Enhancement**
- **Base:** MCP-Defender open source
- **Version:** Custom enterprise edition
- **Features:** Threat detection, consent management, traffic logging
- **Language:** TypeScript/Python

---

## Authentication & Security

### SSO/SAML
**passport-saml (Node.js)**
- **Version:** 3.2.0 or later
- **Why:** Mature, supports Okta/Azure/Google

**python-saml (Python)**
- **Version:** 1.15.0 or later
- **Alternative:** python3-saml
- **Why:** Standard Python SAML library

### Token Management
**jsonwebtoken**
- **Version:** 9.0.0 or later
- **Why:** JWT creation/validation
- **Algorithm:** RS256 (asymmetric)

### Encryption
**Node.js crypto (built-in)**
- **Why:** No dependencies, native performance
- **Usage:** AES-256-GCM encryption

**cryptography (Python)**
- **Version:** 41.0.0 or later
- **Why:** Industry standard, secure defaults

### Secure Storage
**keytar**
- **Version:** 7.9.0 or later
- **Why:** Cross-platform OS keychain access (Keychain/Credential Manager/Secret Service)
- **Usage:** Store auth tokens, API keys

---

## Testing

### Frontend Testing

**Unit Tests: Vitest**
- **Version:** 1.0.0 or later
- **Why:** Fast, Vite-native, Jest-compatible API
- **Config:** `vitest.config.ts`

**Component Tests: React Testing Library**
- **Version:** 14.0.0 or later
- **Why:** Best practices, user-centric tests
- **Companion:** @testing-library/jest-dom

**E2E Tests: Playwright**
- **Version:** 1.40.0 or later
- **Why:** Desktop app support, multi-platform, reliable
- **Browsers:** Chromium (primary for Tauri)

### Backend Testing

**Python: pytest**
- **Version:** 7.4.0 or later
- **Plugins:** pytest-asyncio, pytest-mock, pytest-cov
- **Coverage Target:** >80%

**TypeScript: Vitest**
- **Version:** Same as frontend
- **Why:** Consistent tooling across stack

### Security Testing
**OWASP ZAP**
- **Version:** Latest stable
- **Usage:** Automated security scanning in CI/CD

**npm audit / pip-audit**
- **Usage:** Dependency vulnerability scanning
- **Frequency:** Every PR build

---

## Code Quality

### Linting

**ESLint 8.0+**
- **Version:** 8.0.0 or later
- **Config:** `eslint.config.js`
- **Plugins:**
  - @typescript-eslint
  - eslint-plugin-react
  - eslint-plugin-react-hooks
  - eslint-plugin-security (for security rules)

**Ruff (Python)**
- **Version:** 0.1.0 or later
- **Why:** Fast Python linter/formatter (replaces Black + isort + Flake8)
- **Config:** `ruff.toml`

### Formatting

**Prettier 3.0+**
- **Version:** 3.0.0 or later
- **Config:** `.prettierrc`
- **Integration:** ESLint via eslint-config-prettier

**Ruff (Python)**
- **Why:** Single tool for linting + formatting

### Type Checking

**TypeScript Compiler (tsc)**
- **Strict Mode:** Enabled
- **NoImplicitAny:** true
- **StrictNullChecks:** true

**Pyright (Python)**
- **Version:** Latest stable
- **Why:** Fast, excellent type inference
- **Config:** `pyrightconfig.json`

---

## Markdown & Documentation

**react-markdown**
- **Version:** 9.0.0 or later
- **Why:** Render AI responses with markdown support
- **Plugins:** remark-gfm (GitHub Flavored Markdown)

**highlight.js**
- **Version:** 11.9.0 or later
- **Why:** Syntax highlighting for code blocks
- **Languages:** Auto-detect common languages

---

## Charts & Visualization

**Recharts**
- **Version:** 2.10.0 or later
- **Why:** React-native charts, composable, good documentation
- **Usage:** Admin dashboard analytics

---

## Build & Deployment

### CI/CD
**GitHub Actions**
- **Why:** Native GitHub integration, free for public repos
- **Workflows:** `.github/workflows/`

### Code Signing

**Windows: signtool**
- **Certificate:** EV Code Signing Certificate
- **Provider:** DigiCert or similar

**macOS: codesign**
- **Certificate:** Apple Developer ID Application
- **Notarization:** Required for macOS 10.15+

**Linux: GPG**
- **Key:** Project GPG key for package signing

---

## Development Tools

### IDE/Editor
**VS Code** (Recommended)
- **Extensions:**
  - Tauri (tauri-apps.tauri-vscode)
  - ESLint
  - Prettier
  - Pylance (Python)
  - Rust Analyzer

### Version Control
**Git 2.40+**
- **Branch Strategy:** GitFlow (main, develop, feature/*, release/*)
- **Commit Convention:** Conventional Commits

### Package Managers
- **Node.js:** npm (lock with package-lock.json)
- **Python:** pip (lock with requirements.txt)
- **Rust:** Cargo (Cargo.lock committed)

---

## Performance & Monitoring

### Logging
**pino (Node.js)**
- **Version:** 8.16.0 or later
- **Why:** Fast, structured JSON logging

**structlog (Python)**
- **Version:** 23.2.0 or later
- **Why:** Structured logging, excellent context support

### Error Tracking
**Local File Logs**
- **Format:** JSON structured logs
- **Rotation:** 10MB max, keep 5 files
- **Location:** OS-specific app data directory

---

## Environment Variables

**dotenv**
- **Version:** 16.3.0 or later
- **Files:** `.env.local` (not committed), `.env.example` (committed)
- **Usage:** Development only (not production)

---

## Networking

### HTTP Client

**axios (TypeScript/Node.js)**
- **Version:** 1.6.0 or later
- **Why:** Interceptors, timeout support, familiar API

**httpx (Python)**
- **Version:** 0.25.0 or later
- **Why:** Async support, HTTP/2, modern API

### Proxy Support
**proxy-agent**
- **Version:** Latest stable
- **Protocols:** HTTP, HTTPS, SOCKS5

---

## Compliance & Standards

### Accessibility
**Target:** WCAG 2.1 AA Compliance
- **Tools:** axe-core, eslint-plugin-jsx-a11y
- **Testing:** Manual + automated testing

### Security Standards
- **Encryption:** AES-256 (at rest), TLS 1.3 (in transit)
- **Password Hashing:** bcrypt (if needed)
- **Random Generation:** crypto.randomBytes (not Math.random)

---

## Version Management

### Node.js Version Manager
**nvm** (macOS/Linux) or **nvm-windows**
- **Node Version:** 20.x LTS (locked in `.nvmrc`)

### Python Version Manager
**pyenv**
- **Python Version:** 3.11+ (locked in `.python-version`)

---

## Deprecated / Do Not Use

❌ **Electron** - Use Tauri instead
❌ **Redux** - Use Zustand instead
❌ **Axios Interceptors for Global Error Handling** - Use TanStack Query
❌ **Class Components** - Use Function Components + Hooks
❌ **Moment.js** - Use native Date or date-fns
❌ **Lodash** - Use native ES6+ methods where possible
❌ **yarn/pnpm** - Use npm for consistency

---

## Technology Approval Process

If you need to add a new library:

1. **Check** if existing libraries can solve the problem
2. **Research** alternatives (minimum 2 options)
3. **Document** decision rationale (bundle size, security, maintenance)
4. **Get Approval** from Architect (Winston)
5. **Update** this document with new library

---

## References

- [Tauri Docs](https://tauri.app)
- [React Docs](https://react.dev)
- [Google ADK Docs](https://cloud.google.com/adk)
- [MCP Specification](https://modelcontextprotocol.io)
- [Architecture Document](./index.md)

---

**Last Review:** 2025-12-29
**Next Review:** 2026-01-29 (monthly)
