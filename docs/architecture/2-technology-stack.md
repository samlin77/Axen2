# 2. Technology Stack

## 2.1 Frontend Layer

**Framework:** Tauri 2.0+ (Rust-based desktop framework)
- **Why Tauri:** Smaller binary size (<150MB), better security, native performance, lower memory footprint than Electron
- **UI Framework:** React 18+ with TypeScript
- **State Management:** Zustand (lightweight, minimal boilerplate)
- **Styling:** TailwindCSS + shadcn/ui component library
- **Icons:** Lucide React
- **Accessibility:** Radix UI primitives (WCAG 2.1 AA compliant)

**Key Libraries:**
- `@tanstack/react-query` - Server state management
- `react-markdown` - Render AI responses with markdown
- `highlight.js` - Code syntax highlighting
- `recharts` - Admin dashboard charts and analytics

## 2.2 Backend/Agent Layer

**Framework:** Google ADK (Agent Development Kit)
- **Languages:** Python 3.11+ and TypeScript 5.0+
- **Agent Orchestration:** ADK's multi-agent workflow engine
- **LLM Integration:** Native SDKs (Google Generative AI SDK, OpenAI SDK)
- **MCP Client:** MCPToolset library (stdio + SSE transports)

**Key Libraries:**
- `google-adk` - Agent orchestration
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `langchain` - LLM abstraction layer (optional, for advanced features)
- `pydantic` - Data validation and settings management

## 2.3 Security Layer

**MCP-Defender:** Enhanced fork with enterprise features
- Real-time threat detection engine
- Signature-based scanning (SQL injection, path traversal, etc.)
- User consent workflow engine
- Traffic inspection and logging

**Additional Security:**
- `bcrypt` - Password hashing (if local auth fallback needed)
- `jsonwebtoken` - JWT token management
- `crypto` (Node.js built-in) - AES-256 encryption

## 2.4 Data Storage

**Primary Database:** SQLite 3.40+ with SQLCipher (encrypted)
- **Why SQLite:** Embedded, zero-configuration, ACID compliant, supports millions of rows
- **Encryption:** AES-256 encryption at rest via SQLCipher
- **ORM:** Prisma (TypeScript) or SQLAlchemy (Python)

**Data Stored:**
- User sessions and authentication tokens
- Conversation history (messages, metadata)
- MCP server configurations
- Audit logs
- User preferences and settings
- RBAC policies and permissions

## 2.5 Authentication & Identity

**SSO/SAML Integration:**
- `passport-saml` (Node.js) or `python-saml` (Python)
- Support for Okta, Azure Entra ID, Google Workspace, Keycloak

**Session Management:**
- OS keychain integration: `keytar` (cross-platform secure credential storage)
- Token refresh mechanism with automatic re-authentication

## 2.6 Testing Stack

**Unit Testing:**
- Frontend: Jest + React Testing Library
- Backend: pytest (Python), Vitest (TypeScript)

**Integration Testing:**
- Playwright - E2E testing for desktop app
- Testcontainers - Spin up test databases

**Security Testing:**
- OWASP ZAP - Automated security scanning
- Custom MCP-Defender test suite

---
