# Epic 1: Foundation & Authentication Infrastructure

**Epic ID:** EPIC-1
**Status:** Not Started
**Priority:** P0 (Critical)
**Target Release:** v1.0 (macOS)
**Platform:** macOS 12+ (Monterey and later) - Intel & Apple Silicon
**Owner:** Development Team

---

## Platform Strategy

**v1.0:** macOS Only
- Universal binary (Intel + Apple Silicon)
- Code signed with Apple Developer ID
- Notarized by Apple
- Native macOS integration (Keychain, menu bar, etc.)

**v1.1+:** Windows and Linux (post-v1.0 roadmap)

---

## Epic Goal

Establish secure macOS desktop application foundation with enterprise authentication, enabling users to safely log in and maintain sessions while laying groundwork for all future functionality.

---

## Business Value

- Provides the foundational macOS platform for all subsequent features
- Enables enterprise-grade authentication required for security compliance
- Establishes secure session management using macOS Keychain
- Supports all major enterprise SSO providers (Okta, Azure Entra ID, Google Workspace)
- Faster time to market by focusing on single platform

---

## Technical Context

**Architecture References:**
- [System Architecture](architecture/3-system-architecture.md)
- [Security Architecture](architecture/5-security-architecture.md)
- [Integration Architecture - SSO/SAML](architecture/6-integration-architecture.md#63-ssosaml-integration)

**Technology Stack (macOS):**
- Tauri 2.0+ (macOS desktop framework)
- React 18+ with TypeScript
- SQLite with SQLCipher (encrypted storage)
- macOS Keychain integration via keytar
- passport-saml or python-saml (SSO integration)
- Apple Developer ID for code signing
- Apple Notarization for Gatekeeper

---

## User Stories

### Story 1.1: macOS Desktop Application Bootstrap

**As a** developer
**I want** a working Tauri macOS application shell with basic window management
**so that** we have a foundation to build features upon

**Story Points:** 5
**Priority:** P0
**Platform:** macOS only

**Acceptance Criteria:**
1. Tauri application builds and runs on macOS (Intel & Apple Silicon)
2. Application window opens with splash screen or placeholder content
3. Native macOS menu structure exists (File, Edit, Window, Help)
4. Universal binary DMG installer generated
5. Application is code signed with Apple Developer ID
6. Application is notarized by Apple (no Gatekeeper warnings)
7. CI/CD pipeline builds and tests on macOS runners (GitHub Actions)

**Technical Notes:**
- Initialize Tauri project with React template for macOS
- Set up monorepo structure (frontend, backend, mcp-defender)
- Configure Tauri for universal binary (x86_64 + aarch64)
- Set up GitHub Actions with macOS runner
- Configure code signing in Tauri config
- Set up Apple notarization workflow
- DMG installer size must be <150MB (NFR6)
- Memory footprint target: <200MB on launch

**macOS-Specific:**
- Use macOS Keychain for secure storage
- Native macOS menu bar integration
- Support macOS 12+ (Monterey and later)
- DMG drag-to-Applications installer
- Proper app bundle structure

**Dependencies:**
- Apple Developer ID Certificate (for code signing)
- Apple Notarization credentials
- None (first story)

---

### Story 1.2: SSO/SAML Authentication Integration

**As an** enterprise user
**I want** to log in using my company's SSO provider
**so that** I can access the application with my existing credentials

**Story Points:** 13
**Priority:** P0

**Acceptance Criteria:**
1. Users can initiate login via SSO/SAML
2. Integration supports Okta, Azure Entra ID, and Google Workspace
3. Successful authentication creates secure session
4. MFA is supported if configured by identity provider
5. Authentication tokens are stored securely in OS keychain
6. Session expiration after configured timeout (default 8 hours)

**Technical Notes:**
- Implement SAML authentication flow (see Architecture 6.3)
- Use deep link handler (dive://) for SSO callback
- Store tokens in OS keychain (keytar library)
- Support multiple SSO providers with configurable endpoints
- Token encryption: AES-256 in keychain
- Session timeout configurable (NFR9: default 8 hours)

**Dependencies:**
- Story 1.1 (Desktop Application Bootstrap)

**Security Considerations:**
- SAML assertion validation is critical
- Never store credentials in plaintext
- Implement CSRF protection for auth flow
- Log all authentication events for audit

---

### Story 1.3: User Session Management

**As a** user
**I want** my session to persist between application restarts
**so that** I don't need to re-authenticate constantly

**Story Points:** 8
**Priority:** P0

**Acceptance Criteria:**
1. User session state persists locally (encrypted)
2. Application auto-refreshes authentication tokens before expiry
3. User can manually log out, clearing all session data
4. Expired sessions redirect to login screen
5. Session data stored in encrypted local database

**Technical Notes:**
- Implement SQLite database with SQLCipher encryption
- Create `users` and `sessions` tables (see Architecture 4.2)
- Auto-refresh tokens 5 minutes before expiry
- Clear session data on logout (keychain + database)
- Handle session expiry gracefully (redirect to login)

**Dependencies:**
- Story 1.2 (SSO/SAML Authentication Integration)

**Database Schema:**
```sql
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
```

---

## Definition of Done

- [ ] All 3 stories completed with acceptance criteria met
- [ ] Desktop app runs on Windows, macOS, and Linux
- [ ] SSO authentication works with Okta (minimum)
- [ ] Sessions persist across app restarts
- [ ] Unit tests pass (>80% coverage for auth code)
- [ ] Integration tests pass (SSO flow E2E)
- [ ] Security review completed (no critical/high vulnerabilities)
- [ ] Documentation updated (architecture, setup guide)
- [ ] Code reviewed and merged to main branch

---

## Success Metrics

- **Time to First Login:** <2 minutes from app install
- **Authentication Success Rate:** >99%
- **Session Persistence:** 100% across app restarts
- **Platform Support:** Works on Windows 10/11, macOS 12+, Linux Ubuntu 20.04+
- **Security:** Zero authentication bypass vulnerabilities

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| SSO provider integration complexity | Medium | High | Start with Okta (most common), add others iteratively |
| Cross-platform keychain differences | Medium | Medium | Use keytar library (handles OS differences) |
| SAML validation vulnerabilities | Low | Critical | Use well-tested library, security review |
| Session token leakage | Low | Critical | Encrypt all tokens, never log sensitive data |

---

## Out of Scope (Future Epics)

- Local authentication fallback (admin only)
- Biometric authentication (Touch ID, Windows Hello)
- Remember device feature
- Advanced session analytics

---

## Related Requirements

**Functional Requirements:**
- FR1: SSO/SAML authentication (Okta, Azure Entra ID, Google Workspace)
- FR4: Role-Based Access Control (RBAC) - partial (user roles established)

**Non-Functional Requirements:**
- NFR2: AES-256 encryption at rest, TLS 1.3 in transit
- NFR8: Platform support: Windows 10/11, macOS 12+, Linux Ubuntu 20.04+
- NFR9: Configurable session timeout (default 8 hours)
- NFR15: System must integrate with OS keychain for secure credential storage

---

## Notes

- This epic is foundational - all other epics depend on it
- Focus on security from day one (defense in depth)
- Keep UX simple: "Login with SSO" button should be primary action
- Consider design partner feedback on SSO provider priority
