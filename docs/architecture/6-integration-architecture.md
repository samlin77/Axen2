# 6. Integration Architecture

## 6.1 LLM Integration

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

## 6.2 MCP Integration

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

## 6.3 SSO/SAML Integration

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

## 6.4 Offline Mode Architecture

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
