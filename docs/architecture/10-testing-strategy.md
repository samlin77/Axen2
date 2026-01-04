# 10. Testing Strategy

## 10.1 Testing Pyramid

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

## 10.2 Unit Testing

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

## 10.3 Integration Testing

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

## 10.4 E2E Testing (Playwright)

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

## 10.5 Security Testing

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
