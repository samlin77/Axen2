# Enterprise AI Agent Platform - Architecture Document

**Version:** 1.0
**Date:** 2025-12-29
**Status:** Draft
**Architecture Version:** v4

---

## 1. Architecture Overview

### 1.1 System Vision

The Enterprise AI Agent Platform is a **desktop-first, security-focused** application that enables enterprise users to interact with AI models (Gemini, ChatGPT) while securely accessing corporate data sources through the Model Context Protocol (MCP). The architecture prioritizes security, offline capability, enterprise integration, and compliance.

### 1.2 Architectural Principles

1. **Security by Design** - Security is not bolted on; it's foundational
2. **Desktop-First** - Native desktop app provides best performance, offline capability, and enterprise deployment
3. **Defense in Depth** - Multiple security layers (MCP-Defender, RBAC, encryption, audit logging)
4. **Progressive Enhancement** - Core functionality works offline; enhanced features available online
5. **Data Sovereignty** - All user data stored locally; no cloud sync in v1.0
6. **Zero Trust Architecture** - Verify every MCP interaction, every user action
7. **Fail Secure** - If security check fails, deny access (never fail open)
8. **Compliance First** - Architecture designed to meet SOC2, HIPAA, GDPR from day one

### 1.3 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│             ENTERPRISE LAYER                            │
│  SSO/SAML • RBAC • Policy Mgmt • Audit • DLP           │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│           DIVE UI (Tauri - Enterprise)                  │
│  Chat Interface • MCP Config • Security Dashboard       │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│         ADK Backend (Python/TypeScript)                 │
│  Agent Orchestration • LLM Integration • MCPToolset     │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│         MCP-Defender Security Layer                     │
│  Threat Detection • Scanning • Consent • Logging        │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│         MCP Servers (Approved & Managed)                │
│  Databases • CRM • Docs • Dev Tools                     │
└─────────────────────────────────────────────────────────┘
```

### 1.4 Deployment Model

**Desktop Application Architecture:**
- Each user's machine runs a Tauri-based desktop app
- Local ADK backend embedded within the application
- Connects to corporate MCP servers (on-premises or cloud)
- Supports offline mode with local LLM fallback

---

## 2. Technology Stack

### 2.1 Frontend Layer

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

### 2.2 Backend/Agent Layer

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

### 2.3 Security Layer

**MCP-Defender:** Enhanced fork with enterprise features
- Real-time threat detection engine
- Signature-based scanning (SQL injection, path traversal, etc.)
- User consent workflow engine
- Traffic inspection and logging

**Additional Security:**
- `bcrypt` - Password hashing (if local auth fallback needed)
- `jsonwebtoken` - JWT token management
- `crypto` (Node.js built-in) - AES-256 encryption

### 2.4 Data Storage

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

### 2.5 Authentication & Identity

**SSO/SAML Integration:**
- `passport-saml` (Node.js) or `python-saml` (Python)
- Support for Okta, Azure Entra ID, Google Workspace, Keycloak

**Session Management:**
- OS keychain integration: `keytar` (cross-platform secure credential storage)
- Token refresh mechanism with automatic re-authentication

### 2.6 Testing Stack

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

## 3. System Architecture

### 3.1 Component Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Tauri Desktop App                    │
│  ┌──────────────────────────────────────────────────┐ │
│  │        React Frontend (TypeScript)               │ │
│  │  ┌────────────┐ ┌────────────┐ ┌─────────────┐  │ │
│  │  │    Chat    │ │   Admin    │ │   Settings  │  │ │
│  │  │  Interface │ │  Dashboard │ │    Panel    │  │ │
│  │  └────────────┘ └────────────┘ └─────────────┘  │ │
│  └───────────────────┬──────────────────────────────┘ │
│                      │ Tauri IPC                      │
│  ┌───────────────────▼──────────────────────────────┐ │
│  │         Rust Backend (Tauri Core)                │ │
│  │  ┌────────────┐ ┌────────────┐ ┌─────────────┐  │ │
│  │  │   Window   │ │   File     │ │    OS       │  │ │
│  │  │   Manager  │ │   System   │ │  Integration│  │ │
│  │  └────────────┘ └────────────┘ └─────────────┘  │ │
│  └───────────────────┬──────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
                       │ HTTP/IPC
┌────────────────────────────────────────────────────────┐
│              ADK Backend (Local Process)               │
│  ┌──────────────────────────────────────────────────┐ │
│  │         Agent Orchestration Layer                │ │
│  │  ┌────────────┐ ┌────────────┐ ┌─────────────┐  │ │
│  │  │  Chat      │ │    MCP     │ │   Admin     │  │ │
│  │  │  Agent     │ │   Agent    │ │   Agent     │  │ │
│  │  └────────────┘ └────────────┘ └─────────────┘  │ │
│  └───────────────────┬──────────────────────────────┘ │
│  ┌───────────────────▼──────────────────────────────┐ │
│  │            Service Layer                         │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐│ │
│  │  │   LLM   │ │   MCP   │ │  Auth   │ │ Storage││ │
│  │  │ Service │ │ Service │ │ Service │ │ Service││ │
│  │  └─────────┘ └─────────┘ └─────────┘ └────────┘│ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
                       │
┌────────────────────────────────────────────────────────┐
│             MCP-Defender (Security Layer)              │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Threat Engine • Consent Manager • Logger        │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### 3.2 Process Architecture

**Multi-Process Design:**

1. **Main Process (Tauri/Rust)**
   - Window management and OS integration
   - File system access with security controls
   - Keychain integration for credential storage
   - IPC bridge to frontend

2. **Frontend Process (React/TypeScript)**
   - UI rendering and user interactions
   - State management (Zustand)
   - Communicates with backend via Tauri IPC

3. **ADK Backend Process (Python/TypeScript)**
   - Agent orchestration and LLM interactions
   - MCP client operations
   - Database operations
   - Runs as child process spawned by Tauri

4. **MCP-Defender Process**
   - Intercepts all MCP traffic
   - Real-time threat detection
   - Runs as sidecar process

**Inter-Process Communication:**
- **Frontend ↔ Tauri:** Tauri IPC (invoke/emit pattern)
- **Tauri ↔ ADK Backend:** HTTP REST API (localhost:8000) or IPC
- **ADK Backend ↔ MCP-Defender:** HTTP proxy pattern

---

## 4. Data Architecture

### 4.1 Data Models

**User & Authentication:**
```typescript
interface User {
  id: string;              // UUID
  email: string;
  displayName: string;
  role: UserRole;          // EndUser, PowerUser, Admin, SecurityOfficer, ComplianceOfficer
  organizationId: string;
  ssoProvider: string;     // 'okta' | 'azure' | 'google' | 'keycloak'
  ssoSubjectId: string;    // External SSO user ID
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
}

interface Session {
  id: string;
  userId: string;
  accessToken: string;     // Encrypted
  refreshToken: string;    // Encrypted
  expiresAt: Date;
  createdAt: Date;
}
```

**Conversation & Messages:**
```typescript
interface Conversation {
  id: string;
  userId: string;
  title: string;           // Auto-generated from first message
  model: string;           // 'gemini-pro' | 'gpt-4' | 'gpt-3.5-turbo'
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  tokenCount: number;
}

interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: {
    model?: string;
    mcpToolCalls?: MCPToolCall[];
    tokenCount?: number;
  };
  createdAt: Date;
}

interface MCPToolCall {
  toolName: string;
  serverName: string;
  arguments: Record<string, any>;
  result?: any;
  status: 'pending' | 'success' | 'error' | 'blocked';
  blockedReason?: string;
  executionTimeMs: number;
}
```

**MCP Configuration:**
```typescript
interface MCPServer {
  id: string;
  name: string;
  description: string;
  type: 'stdio' | 'sse';
  config: StdioConfig | SSEConfig;
  isApproved: boolean;     // IT approval flag
  allowedRoles: UserRole[];
  createdBy: string;       // Admin user ID
  createdAt: Date;
}

interface StdioConfig {
  command: string;
  args: string[];
  env: Record<string, string>;
}

interface SSEConfig {
  url: string;
  authType: 'none' | 'bearer' | 'basic';
  credentials?: {
    token?: string;        // Encrypted
    username?: string;
    password?: string;     // Encrypted
  };
}

interface MCPToolPermission {
  serverId: string;
  toolName: string;
  allowedRoles: UserRole[];
  requiresConsent: boolean;
}
```

**Audit Logging:**
```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: AuditAction;     // LOGIN, LOGOUT, CHAT_MESSAGE, MCP_CALL, etc.
  resource: string;        // What was accessed
  details: {
    mcpServer?: string;
    mcpTool?: string;
    dataAccessed?: string; // PII-masked
    outcome: 'success' | 'failure' | 'blocked';
    blockedReason?: string;
  };
  ipAddress?: string;
  userAgent?: string;
}

type AuditAction =
  | 'LOGIN' | 'LOGOUT' | 'SESSION_EXPIRED'
  | 'CHAT_MESSAGE' | 'CONVERSATION_CREATED' | 'CONVERSATION_DELETED'
  | 'MCP_CALL_INITIATED' | 'MCP_CALL_COMPLETED' | 'MCP_CALL_BLOCKED'
  | 'USER_CONSENT_GRANTED' | 'USER_CONSENT_DENIED'
  | 'ADMIN_ACTION' | 'CONFIG_CHANGED' | 'EMERGENCY_KILLSWITCH';
```

**RBAC Policies:**
```typescript
interface RBACPolicy {
  id: string;
  role: UserRole;
  permissions: Permission[];
  mcpServerAccess: string[];  // Server IDs
  features: {
    canAccessAdminDashboard: boolean;
    canManageMCPServers: boolean;
    canViewAuditLogs: boolean;
    canGenerateComplianceReports: boolean;
    canManageUsers: boolean;
    canActivateKillSwitch: boolean;
  };
}

type Permission = string; // 'mcp:read' | 'mcp:write' | 'admin:users:manage' etc.
```

### 4.2 Database Schema (SQLite)

```sql
-- Users and Authentication
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  sso_provider TEXT NOT NULL,
  sso_subject_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_login_at INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Conversations and Messages
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  token_count INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT, -- JSON
  created_at INTEGER NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- MCP Configuration
CREATE TABLE mcp_servers (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  config TEXT NOT NULL, -- JSON (encrypted credentials)
  is_approved INTEGER NOT NULL DEFAULT 0,
  allowed_roles TEXT NOT NULL, -- JSON array
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE mcp_tool_permissions (
  id TEXT PRIMARY KEY,
  server_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  allowed_roles TEXT NOT NULL, -- JSON array
  requires_consent INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (server_id) REFERENCES mcp_servers(id) ON DELETE CASCADE
);

-- Audit Logs (append-only, tamper-proof)
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details TEXT NOT NULL, -- JSON
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- RBAC Policies
CREATE TABLE rbac_policies (
  id TEXT PRIMARY KEY,
  role TEXT UNIQUE NOT NULL,
  permissions TEXT NOT NULL, -- JSON array
  mcp_server_access TEXT NOT NULL, -- JSON array
  features TEXT NOT NULL -- JSON object
);

-- Indexes for performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

### 4.3 Data Encryption Strategy

**Encryption at Rest:**
- **Database:** SQLCipher with AES-256 encryption
  - Encryption key derived from user's SSO credentials + machine ID
  - Key stored in OS keychain (Keychain on macOS, Credential Manager on Windows, Secret Service on Linux)
- **Sensitive Fields:** Double encryption for credentials in `mcp_servers.config`
  - Database-level encryption (SQLCipher)
  - Field-level encryption using AES-256-GCM

**Encryption in Transit:**
- All network communication uses TLS 1.3
- LLM API calls: HTTPS with certificate pinning
- MCP servers: TLS for SSE, stdio uses local process (no network)

**Key Management:**
- User-specific encryption keys never leave the device
- Admin cannot decrypt user data without user's presence
- Key rotation supported (re-encrypt on key change)

---

## 5. Security Architecture

### 5.1 Defense in Depth Layers

**Layer 1: Authentication & Authorization**
- SSO/SAML with MFA support
- Session management with automatic timeout
- RBAC enforcement at every API call

**Layer 2: MCP-Defender (Real-Time Threat Detection)**
- Intercepts all MCP traffic
- Signature-based scanning for known attack patterns
- Heuristic analysis for anomalies
- User consent workflow for sensitive operations

**Layer 3: Data Protection**
- AES-256 encryption at rest (SQLCipher)
- TLS 1.3 for all network traffic
- PII detection and masking (95% accuracy target)

**Layer 4: Audit & Compliance**
- Comprehensive logging of all actions
- Tamper-proof audit trail (append-only logs)
- Compliance reporting (SOC2, HIPAA, GDPR)

**Layer 5: Network Security**
- Corporate proxy support
- Custom CA certificate validation
- VPN compatibility

### 5.2 MCP-Defender Architecture

```
┌───────────────────────────────────────────────────────┐
│              MCP-Defender Proxy                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │         Threat Detection Engine                 │ │
│  │  ┌──────────────┐ ┌───────────┐ ┌───────────┐  │ │
│  │  │  Signature   │ │ Heuristic │ │   Rules   │  │ │
│  │  │   Scanner    │ │  Analysis │ │  Engine   │  │ │
│  │  └──────────────┘ └───────────┘ └───────────┘  │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │         Consent Manager                         │ │
│  │  • User approval workflow                       │ │
│  │  • Sensitive operation detection                │ │
│  │  • Risk scoring                                 │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │         Traffic Inspector & Logger              │ │
│  │  • Log all MCP interactions                     │ │
│  │  • PII detection and masking                    │ │
│  │  • Performance metrics                          │ │
│  └─────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

**Threat Detection Rules:**
1. **SQL Injection:** Detect SQL keywords in MCP tool arguments
2. **Path Traversal:** Detect `../` or absolute paths in file operations
3. **Command Injection:** Detect shell metacharacters in system calls
4. **Data Exfiltration:** Detect large data reads (>10MB in single call)
5. **Credential Access:** Block access to `/etc/passwd`, `.env`, credential files
6. **Suspicious Patterns:** Regex-based detection of known attack signatures

**Consent Workflow:**
- **Automatic Approval:** Low-risk operations (read-only, small data)
- **User Consent Required:** Medium-risk operations (write, moderate data access)
- **Admin Pre-Approval Required:** High-risk operations (delete, system changes)
- **Always Block:** Critical operations (credential access, system file modification)

### 5.3 RBAC Implementation

**Role Hierarchy:**
```
EndUser (Default)
├─ Read own conversations
├─ Chat with approved models
├─ Connect to approved MCP servers
└─ View own audit logs

PowerUser (Extended)
├─ All EndUser permissions
├─ Connect to additional MCP servers
├─ Configure custom MCP tools
└─ Export own data

Admin (Management)
├─ All PowerUser permissions
├─ Manage users and roles
├─ Approve MCP servers
├─ View usage analytics
├─ Configure organization settings
└─ Activate emergency kill switch

SecurityOfficer (Security)
├─ All EndUser permissions
├─ View all audit logs
├─ Configure security policies
├─ View security events
└─ Investigate incidents

ComplianceOfficer (Compliance)
├─ All EndUser permissions
├─ Generate compliance reports
├─ Configure retention policies
└─ Audit system activity
```

### 5.4 PII Detection & Masking

**PII Types Detected:**
- Social Security Numbers (SSN): `XXX-XX-1234`
- Credit Card Numbers: `****-****-****-1234`
- Email Addresses: `u***@example.com`
- Phone Numbers: `(XXX) XXX-1234`
- IP Addresses: `192.168.XXX.XXX`
- API Keys/Tokens: `sk-***...***abc`

**Detection Engine:**
- Regex-based pattern matching
- ML-based entity recognition (optional, for higher accuracy)
- Configurable sensitivity levels
- False positive handling (whitelist patterns)

**Masking Strategy:**
- **Audit Logs:** Always masked (show last 4 digits for reference)
- **UI Display:** Configurable (admin can choose to show or mask)
- **Exports:** Always masked unless explicit compliance officer approval

---

## 6. Integration Architecture

### 6.1 LLM Integration

**Multi-Provider Strategy:**
```typescript
interface LLMProvider {
  name: 'gemini' | 'openai';
  models: string[];
  apiKey: string; // Encrypted, stored in keychain
  endpoint: string;
  maxTokens: number;
  timeout: number;
}

class LLMService {
  async chat(
    provider: LLMProvider,
    messages: Message[],
    stream: boolean = true
  ): Promise<StreamingResponse | Response> {
    // Route to appropriate SDK
    if (provider.name === 'gemini') {
      return this.callGemini(provider, messages, stream);
    } else if (provider.name === 'openai') {
      return this.callOpenAI(provider, messages, stream);
    }
  }

  async callGemini(/* ... */) {
    // Use @google/generative-ai SDK
    // Handle streaming with Server-Sent Events
    // Implement retry logic and error handling
  }

  async callOpenAI(/* ... */) {
    // Use openai SDK
    // Handle streaming
    // Implement retry logic and error handling
  }
}
```

**Failover Strategy:**
- Primary model fails → Try alternative model (GPT-4 → GPT-3.5)
- All cloud models fail → Fallback to local LLM (offline mode)
- Rate limit hit → Queue request and retry with exponential backoff

### 6.2 MCP Integration

**MCPToolset Architecture:**
```typescript
class MCPService {
  private connections: Map<string, MCPConnection> = new Map();

  async connectToServer(config: MCPServer): Promise<MCPConnection> {
    if (config.type === 'stdio') {
      return new StdioMCPConnection(config.config);
    } else if (config.type === 'sse') {
      return new SSEMCPConnection(config.config);
    }
  }

  async callTool(
    serverId: string,
    toolName: string,
    args: Record<string, any>,
    context: { userId: string; userRole: UserRole }
  ): Promise<MCPToolResult> {
    // 1. Check RBAC permissions
    if (!this.hasPermission(context, serverId, toolName)) {
      throw new UnauthorizedError();
    }

    // 2. Pass through MCP-Defender
    const approved = await this.mcpDefender.checkThreat(
      serverId, toolName, args, context
    );
    if (!approved.allowed) {
      // Log blocked attempt
      await this.audit.log({
        action: 'MCP_CALL_BLOCKED',
        details: { serverId, toolName, reason: approved.reason }
      });
      throw new BlockedError(approved.reason);
    }

    // 3. Check if consent required
    if (approved.requiresConsent) {
      const consent = await this.requestUserConsent(
        serverId, toolName, args
      );
      if (!consent.granted) {
        await this.audit.log({
          action: 'USER_CONSENT_DENIED',
          details: { serverId, toolName }
        });
        throw new ConsentDeniedError();
      }
    }

    // 4. Execute MCP tool call
    const connection = this.connections.get(serverId);
    const result = await connection.callTool(toolName, args);

    // 5. Log successful call
    await this.audit.log({
      action: 'MCP_CALL_COMPLETED',
      resource: `${serverId}/${toolName}`,
      details: {
        outcome: 'success',
        executionTimeMs: result.executionTimeMs
      }
    });

    return result;
  }
}
```

**MCP Server Health Monitoring:**
- Periodic health checks (every 30 seconds)
- Connection status: Connected, Disconnected, Error
- Tool availability status
- Response time metrics
- Error rate tracking

### 6.3 SSO/SAML Integration

**Authentication Flow:**
```
User Opens App
    ↓
Check Local Session
    ├─ Valid → Load App
    └─ Invalid/Expired → Redirect to SSO
        ↓
SSO Provider (Okta/Azure/Google)
    ↓
SAML Response
    ↓
Validate SAML Assertion
    ├─ Invalid → Show Error
    └─ Valid → Create Session
        ↓
Store Tokens in Keychain
    ↓
Load App
```

**Implementation:**
```typescript
class AuthService {
  async initiateSSO(provider: SSOProvider): Promise<void> {
    // Generate SAML request
    const samlRequest = this.generateSAMLRequest(provider);

    // Open system browser for SSO login
    await shell.open(provider.loginUrl + '?SAMLRequest=' + samlRequest);

    // Listen for callback (deep link)
    this.registerDeepLinkHandler();
  }

  async handleSAMLResponse(samlResponse: string): Promise<Session> {
    // Validate SAML assertion
    const assertion = this.validateSAML(samlResponse);

    // Extract user info
    const userInfo = this.extractUserInfo(assertion);

    // Create or update user
    const user = await this.upsertUser(userInfo);

    // Generate session tokens
    const session = await this.createSession(user);

    // Store in keychain
    await keychain.setPassword(
      'dive-app',
      'session',
      JSON.stringify(session)
    );

    return session;
  }

  async refreshToken(session: Session): Promise<Session> {
    // Call SSO provider to refresh token
    // Update session in keychain
    // Return new session
  }
}
```

### 6.4 Offline Mode Architecture

**Local LLM Integration:**
```typescript
class LocalLLMService {
  private model: LocalModel;

  async initialize(): Promise<void> {
    // Load local model (Llama, Mistral, etc.)
    // Models bundled with app or downloaded separately
    this.model = await loadModel('llama-3-8b-instruct');
  }

  async chat(messages: Message[]): Promise<string> {
    // Run inference locally
    const response = await this.model.generate({
      prompt: this.formatMessages(messages),
      maxTokens: 2048,
      temperature: 0.7
    });

    return response.text;
  }
}
```

**Offline Queue:**
- Queue operations when offline
- Sync when connection restored
- Priority queue (critical operations first)
- Conflict resolution for concurrent edits

---

## 7. Performance Architecture

### 7.1 Performance Targets

**Response Times:**
- Chat message submission: <100ms (UI responsiveness)
- LLM first token: <2s (network dependent)
- MCP tool call: <5s (server dependent)
- Database queries: <50ms (local SQLite)
- UI rendering: 60 FPS (smooth scrolling)

**Resource Usage:**
- Memory: <500MB typical usage
- Disk: <150MB installer, <500MB data storage typical
- CPU: <10% idle, <30% during LLM streaming
- Network: Minimal (only LLM API calls and MCP SSE)

### 7.2 Optimization Strategies

**Frontend Optimizations:**
- Virtual scrolling for long conversation history
- Lazy loading for admin dashboard charts
- Code splitting for faster initial load
- Memoization for expensive React components
- Debounced search and filtering

**Backend Optimizations:**
- Connection pooling for MCP servers (stdio reuse)
- LLM response streaming (don't wait for full response)
- Database query optimization (proper indexes)
- Caching frequently accessed data (RBAC policies, MCP server configs)

**Database Optimizations:**
- SQLite WAL mode for better concurrency
- Periodic VACUUM to reclaim space
- Prepared statements for SQL injection prevention + performance
- Batched writes for audit logs

### 7.3 Scalability Considerations

**Local Scalability:**
- Support 10,000+ messages per conversation
- Support 1,000+ conversations per user
- Handle 1M+ audit log entries (with archiving)

**Horizontal Scalability (Future):**
- Architecture supports transition to client-server model
- ADK backend can be deployed as separate service
- Database can migrate to PostgreSQL for multi-tenancy

---

## 8. Deployment Architecture

### 8.1 Desktop Application Packaging

**Windows:**
- MSI installer (Windows Installer)
- Silent install support: `msiexec /i DIVE.msi /quiet`
- SCCM/Intune deployment compatible
- Code signing with EV certificate

**macOS:**
- DMG installer with drag-and-drop
- PKG installer for command-line deployment
- Notarized and code signed (Apple Developer ID)
- Jamf Pro compatible

**Linux:**
- DEB package (Debian/Ubuntu)
- RPM package (Red Hat/Fedora)
- AppImage for universal compatibility
- Snap package (optional)

### 8.2 Installation Flow

```
User Runs Installer
    ↓
Accept License Agreement
    ↓
Choose Installation Location
    ↓
Install Application Files
    ↓
Create Desktop Shortcut
    ↓
Register Deep Link Handler (dive://)
    ↓
First Launch
    ↓
SSO Authentication
    ↓
Download Organization Config
    ↓
Initialize Local Database
    ↓
Ready to Use
```

### 8.3 Auto-Update Mechanism

**Update Strategy:**
- Check for updates on startup (configurable interval)
- Download updates in background
- Notify user when update ready
- Restart to apply update (delta patches for smaller downloads)

**Admin Controls:**
- Disable auto-update (for controlled deployments)
- Specify update channel (stable, beta, canary)
- Rollback to previous version if update fails

### 8.4 Centralized Configuration Management

**Configuration Sync:**
```typescript
interface OrganizationConfig {
  version: string;
  mcpServers: MCPServer[];
  rbacPolicies: RBACPolicy[];
  securitySettings: {
    sessionTimeout: number;
    mfaRequired: boolean;
    allowedModels: string[];
    mcpDefenderRules: DefenderRule[];
  };
  features: {
    offlineMode: boolean;
    localLLM: boolean;
    complianceReporting: boolean;
  };
}

class ConfigService {
  async syncConfig(): Promise<void> {
    // Fetch latest config from admin server
    const config = await fetch(
      'https://admin.company.com/api/config',
      { headers: { 'Authorization': 'Bearer ' + session.token } }
    );

    // Validate config signature
    if (!this.validateSignature(config)) {
      throw new Error('Config signature invalid');
    }

    // Apply config
    await this.applyConfig(config);

    // Restart services if needed
    if (config.requiresRestart) {
      await this.restartServices();
    }
  }
}
```

---

## 9. Monitoring & Observability

### 9.1 Logging Strategy

**Log Levels:**
- ERROR: Critical errors requiring immediate attention
- WARN: Potential issues, degraded performance
- INFO: Normal operations, state changes
- DEBUG: Detailed diagnostic information

**Log Destinations:**
- **Local File:** Rolling log files (max 10MB, keep 5 files)
- **System Log:** OS-specific (Event Viewer on Windows, syslog on Linux/macOS)
- **Audit Log:** Separate tamper-proof database table

**Log Format:**
```json
{
  "timestamp": "2025-12-29T10:15:30.000Z",
  "level": "INFO",
  "component": "MCPService",
  "message": "MCP tool call completed",
  "metadata": {
    "userId": "user-123",
    "serverId": "server-456",
    "toolName": "database_query",
    "executionTimeMs": 234
  }
}
```

### 9.2 Metrics Collection

**Application Metrics:**
- LLM API latency (p50, p95, p99)
- MCP call latency
- Database query performance
- Memory and CPU usage
- Crash rate

**Business Metrics:**
- Active users (DAU, MAU)
- Conversations per user
- Messages per conversation
- MCP tools most frequently used
- Error rates by component

### 9.3 Error Tracking

**Error Reporting:**
- Crash reports with stack traces
- User-initiated bug reports
- Automatic error submission (with user consent)
- PII scrubbing before sending

**Error Aggregation:**
- Group similar errors
- Track error frequency
- Identify error trends
- Alert on critical errors

---

## 10. Testing Strategy

### 10.1 Testing Pyramid

```
           ┌─────────────┐
           │     E2E     │  (10% - Critical user flows)
           └─────────────┘
         ┌─────────────────┐
         │   Integration   │  (30% - Component integration)
         └─────────────────┘
     ┌─────────────────────────┐
     │        Unit Tests       │  (60% - Individual functions)
     └─────────────────────────┘
```

### 10.2 Unit Testing

**Frontend (React):**
```typescript
// Component test example
describe('ChatInterface', () => {
  it('should render messages correctly', () => {
    const messages = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi there!' }
    ];

    const { getByText } = render(<ChatInterface messages={messages} />);

    expect(getByText('Hello')).toBeInTheDocument();
    expect(getByText('Hi there!')).toBeInTheDocument();
  });
});
```

**Backend (Python):**
```python
# Service test example
def test_mcp_service_call_tool():
    service = MCPService()
    result = service.call_tool(
        server_id='test-server',
        tool_name='test-tool',
        args={'param': 'value'},
        context={'userId': 'user-123', 'userRole': 'EndUser'}
    )

    assert result.status == 'success'
    assert result.execution_time_ms < 5000
```

### 10.3 Integration Testing

**MCP Integration Tests:**
- Mock MCP servers with test data
- Test stdio and SSE transports
- Test error handling and retries
- Test MCP-Defender integration

**LLM Integration Tests:**
- Mock LLM responses
- Test streaming responses
- Test failover to alternative models
- Test offline mode fallback

### 10.4 E2E Testing (Playwright)

```typescript
test('User can chat with AI and use MCP tools', async ({ page }) => {
  // Login
  await page.goto('dive://app');
  await page.click('button:has-text("Login with SSO")');
  // ... handle SSO login ...

  // Start conversation
  await page.click('button:has-text("New Conversation")');
  await page.fill('textarea[placeholder="Type a message..."]',
    'Query the database for user count');
  await page.press('textarea', 'Enter');

  // Wait for MCP tool call
  await page.waitForSelector('text=Calling database_query...');

  // Verify response
  await page.waitForSelector('text=There are 1,234 users in the database');

  // Check audit log
  await page.click('text=Settings');
  await page.click('text=Audit Log');
  await page.waitForSelector('text=MCP_CALL_COMPLETED');
});
```

### 10.5 Security Testing

**Automated Security Scans:**
- OWASP ZAP for vulnerability scanning
- npm audit / pip audit for dependency vulnerabilities
- Static code analysis (ESLint security rules, Bandit for Python)

**Manual Security Testing:**
- Penetration testing by security team
- MCP-Defender bypass attempts
- SQL injection in MCP tool arguments
- Path traversal in file operations
- Credential leakage tests

**Compliance Testing:**
- SOC2 controls validation
- HIPAA compliance checks
- GDPR data handling verification

---

## 11. Development Workflow

### 11.1 Repository Structure

```
dive-app/
├── src/
│   ├── frontend/          # React/TypeScript UI
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   ├── backend/           # ADK Backend
│   │   ├── agents/        # ADK agents
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data models
│   │   ├── database/      # DB migrations and schemas
│   │   └── utils/
│   ├── mcp-defender/      # Security layer
│   │   ├── detector/
│   │   ├── consent/
│   │   └── logger/
│   └── tauri/             # Rust Tauri backend
│       ├── src/
│       └── Cargo.toml
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/               # Build and deployment scripts
├── docs/                  # Architecture and PRD
├── .github/
│   └── workflows/         # CI/CD pipelines
├── package.json
├── pyproject.toml
└── README.md
```

### 11.2 Development Environment Setup

**Prerequisites:**
- Node.js 20+ (for frontend)
- Python 3.11+ (for backend)
- Rust 1.70+ (for Tauri)
- SQLite 3.40+

**Setup Steps:**
```bash
# Clone repository
git clone https://github.com/company/dive-app.git
cd dive-app

# Install frontend dependencies
npm install

# Install backend dependencies
cd src/backend
pip install -e ".[dev]"

# Run development mode
npm run tauri dev
```

### 11.3 CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          npm ci
          pip install -e ".[dev]"

      - name: Run linters
        run: |
          npm run lint
          black --check src/backend

      - name: Run unit tests
        run: |
          npm test
          pytest tests/unit

      - name: Run integration tests
        run: pytest tests/integration

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Security scan
        run: |
          npm audit
          pip-audit

  build:
    needs: test
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - uses: actions/checkout@v3

      - name: Build application
        run: npm run tauri build

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dive-app-${{ matrix.os }}
          path: src-tauri/target/release/bundle/
```

---

## 12. Migration & Rollout Strategy

### 12.1 Phased Rollout

**Phase 1: Internal Pilot (Weeks 1-4)**
- Deploy to 10-15 internal users
- Gather feedback and fix critical bugs
- Validate SSO integration with company's Okta

**Phase 2: Design Partners (Weeks 5-12)**
- Deploy to 5 design partner companies
- Provide white-glove onboarding
- Iterate based on enterprise feedback

**Phase 3: Limited Availability (Weeks 13-24)**
- Deploy to 50-100 early adopter customers
- Establish support processes
- SOC2 Type I certification

**Phase 4: General Availability (Week 25+)**
- Full market release
- Marketing campaign
- Scale support team

### 12.2 Data Migration

**For Brownfield Scenarios (if migrating from existing system):**
- Export data from legacy system
- Transform to DIVE schema
- Import into SQLite database
- Validate data integrity

**For Greenfield (new installation):**
- No migration needed
- Fresh database initialized on first launch

---

## 13. Disaster Recovery & Business Continuity

### 13.1 Backup Strategy

**User Data Backup:**
- Users responsible for backing up their own device
- Conversation export feature (JSON, markdown)
- Settings export/import

**Organization Config Backup:**
- Admin server maintains config versions
- Point-in-time recovery for config changes

### 13.2 Failure Scenarios & Recovery

**Scenario 1: Database Corruption**
- Detection: SQLite integrity check on startup
- Recovery: Restore from user's OS backup or conversation export
- Mitigation: Regular integrity checks, SQLite WAL mode

**Scenario 2: SSO Provider Outage**
- Detection: SSO login fails
- Recovery: Use cached session if not expired, local auth fallback (admin only)
- Mitigation: Session refresh grace period

**Scenario 3: LLM API Outage**
- Detection: API call timeout or error
- Recovery: Failover to alternative model, then local LLM
- Mitigation: Circuit breaker pattern, retry with exponential backoff

**Scenario 4: MCP Server Unavailable**
- Detection: Health check failure
- Recovery: Display error to user, queue operations if temporary
- Mitigation: Clear error messages, retry logic

---

## 14. Future Architectural Considerations

### 14.1 Cloud Sync (Post-v1.0)

**Architecture Evolution:**
- Central sync server for conversation history
- End-to-end encryption (user's device ↔ cloud)
- Conflict resolution for concurrent edits across devices

### 14.2 Multi-Tenancy (Post-v1.0)

**Isolation Strategy:**
- Separate databases per organization
- Shared MCP-Defender instance with tenant ID filtering
- Centralized admin portal for IT teams

### 14.3 Mobile Support (Post-v1.0)

**Mobile Architecture:**
- React Native for iOS/Android
- Shared backend logic (ADK can run on mobile)
- Simplified UI for smaller screens
- Mobile-specific features (voice input, camera integration)

### 14.4 API Access (Post-v1.0)

**Public API:**
- REST API for automation
- Webhook support for integrations
- API key management
- Rate limiting and quota management

---

## 15. Appendices

### 15.1 Technology Decision Log

| Decision | Alternatives Considered | Rationale |
|----------|-------------------------|-----------|
| Tauri over Electron | Electron, Flutter Desktop | Smaller binary, better security, lower memory usage |
| SQLite over PostgreSQL | PostgreSQL, MongoDB | Embedded, zero-config, perfect for desktop app |
| React over Vue/Angular | Vue, Angular, Svelte | Mature ecosystem, Tauri has excellent React support |
| Google ADK over LangChain | LangChain, custom solution | Built for agents, multi-agent workflows, Google support |
| Zustand over Redux | Redux, MobX, Jotai | Minimal boilerplate, good TypeScript support |

### 15.2 Glossary

- **ADK:** Agent Development Kit (Google)
- **MCP:** Model Context Protocol
- **MCP-Defender:** Security layer for MCP traffic inspection
- **RBAC:** Role-Based Access Control
- **SSO:** Single Sign-On
- **SAML:** Security Assertion Markup Language
- **DLP:** Data Loss Prevention
- **PII:** Personally Identifiable Information
- **SOC2:** Service Organization Control 2 (compliance standard)

### 15.3 References

- [Tauri Documentation](https://tauri.app)
- [Google ADK Documentation](https://cloud.google.com/adk)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [MCP-Defender Repository](https://github.com/mcpdefender/mcpdefender)
- [SQLCipher Documentation](https://www.zetetic.net/sqlcipher/)

---

## Document Approval

| Role | Name | Date |
|------|------|------|
| Lead Architect | Winston | 2025-12-29 |
| CTO | [Pending] | |
| VP Engineering | [Pending] | |

---

**Document History:**
- v1.0 (2025-12-29): Initial architecture document
