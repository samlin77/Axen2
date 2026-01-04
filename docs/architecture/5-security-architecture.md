# 5. Security Architecture

## 5.1 Defense in Depth Layers

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

## 5.2 MCP-Defender Architecture

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

## 5.3 RBAC Implementation

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

## 5.4 PII Detection & Masking

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
