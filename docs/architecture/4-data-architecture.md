# 4. Data Architecture

## 4.1 Data Models

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

## 4.2 Database Schema (SQLite)

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

## 4.3 Data Encryption Strategy

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
