# MVP Scope Definition

**Version:** 1.0
**Date:** 2025-12-29
**Status:** Approved
**Philosophy:** Ship something users can touch in 2-4 weeks

---

## MVP Reality Check

### Current Scope (Too Large!)
- 7 Epics
- 31 User Stories
- ~24 weeks of development
- Enterprise features (SSO, RBAC, MCP-Defender, Compliance)
- **Problem:** Takes 6 months to get feedback!

### True MVP Scope (Right-Sized)
- 1-2 Epics
- 5-8 User Stories
- ~2-4 weeks of development
- Core value proposition only
- **Benefit:** Get real feedback in weeks, not months!

---

## The One Core Question

**What is the ABSOLUTE MINIMUM users need to get value?**

**Answer:** Chat with AI that can access their data securely.

**That's it.** Everything else is enhancement.

---

## MVP Feature Set

### ✅ MUST HAVE (MVP v0.1)

**1. macOS Desktop App**
- Tauri app that launches
- Simple, clean UI
- No installer needed (just run the .app)
- No code signing yet (development mode)

**2. Basic Chat with ONE LLM**
- Chat interface (text input + message history)
- Integration with ONE LLM (start with Gemini OR ChatGPT, not both)
- Streaming responses
- That's it - no conversation persistence yet!

**3. Simple MCP Integration**
- Connect to ONE MCP server (stdio only, not SSE)
- Hardcoded configuration (no UI yet)
- Call tools from chat
- Show results to user

**Total Stories:** ~4-5 stories
**Timeline:** 2-3 weeks

---

## ❌ CUT FROM MVP (Add Later!)

**Cut from Epic 1:**
- ❌ SSO/SAML authentication (use hardcoded user for MVP)
- ❌ Session management
- ❌ Database persistence
- ❌ Code signing & notarization
- ❌ DMG installer (just .app file)

**Cut from Epic 2:**
- ❌ Multiple LLMs (pick ONE: Gemini or ChatGPT)
- ❌ Model selection UI
- ❌ Conversation persistence (no database)
- ❌ Conversation history (just current session)
- ❌ Search conversations

**Cut from Epic 3:**
- ❌ MCP server catalog
- ❌ IT admin approval workflow
- ❌ SSE transport (stdio only)
- ❌ MCP server configuration UI (hardcode it)
- ❌ Health monitoring
- ❌ Multiple MCP servers (ONE server only)

**Cut from Epic 4-7:**
- ❌ ALL of Epic 4: Security (MCP-Defender, RBAC, PII, Consent, Encryption)
- ❌ ALL of Epic 5: Audit logging & compliance
- ❌ ALL of Epic 6: Admin dashboard
- ❌ ALL of Epic 7: Offline mode, proxy, certificates, auto-update

---

## MVP User Stories (v0.1)

### Story MVP-1: Hello World macOS App
**As a** developer
**I want** a Tauri app that launches on macOS
**so that** I have a foundation

**Acceptance Criteria:**
1. Tauri + React app runs on macOS
2. Window opens with basic UI
3. No installer needed (just double-click .app)
4. Memory < 200MB

**Effort:** 1 day

---

### Story MVP-2: Chat Interface UI
**As a** user
**I want** a chat interface
**so that** I can type messages

**Acceptance Criteria:**
1. Text input at bottom
2. Message display area above
3. Messages show user vs AI distinction
4. Enter key sends message
5. Simple, clean design

**Effort:** 1 day

---

### Story MVP-3: Gemini Integration
**As a** user
**I want** to chat with Gemini
**so that** I can get AI responses

**Acceptance Criteria:**
1. User types message → Sent to Gemini API
2. Response streams back in real-time
3. API key from environment variable (no UI)
4. Error handling (show error message if API fails)

**Effort:** 2 days

---

### Story MVP-4: MCP Client Foundation
**As a** developer
**I want** MCP client that can call tools
**so that** AI can access data

**Acceptance Criteria:**
1. MCPToolset integrated
2. Connects to ONE stdio MCP server (hardcoded config)
3. Can discover tools
4. Can call tools and get results

**Effort:** 2 days

---

### Story MVP-5: MCP Integration in Chat
**As a** user
**I want** AI to call MCP tools automatically
**so that** I can access my data through chat

**Acceptance Criteria:**
1. User asks question needing data
2. AI (ADK) detects need for MCP tool
3. Tool called automatically
4. Results returned to AI
5. AI response includes data
6. Simple indicator showing "Calling tool..."

**Effort:** 2-3 days

---

## MVP Milestones

For detailed demo planning and week-by-week execution, see [mvp-milestones.md](mvp-milestones.md).

**Quick Overview:**
- **MVP-M0 (Week 1):** Hello World + AI Chat - 3 min demo
- **MVP-M1 (Week 2-3):** AI Accessing Real Data via MCP - 5 min demo
- **MVP-M2 (Week 4):** Feedback & Decision Point - 10 min demo + Q&A

Each milestone includes detailed demo scripts, success criteria, and feedback questions to ensure we're building the right thing.

---

## MVP Demo Script (v0.1)

**Duration:** 3 minutes

**Setup:**
- MCP server running locally (sample database with 10 users)
- Gemini API key in .env file

**Demo Flow:**

1. **Launch App** (10 sec)
   - Double-click app
   - Window opens
   - Simple chat interface visible

2. **Basic Chat** (30 sec)
   - Type: "What is machine learning?"
   - Gemini responds with explanation
   - Response streams in real-time

3. **MCP Tool Call** (60 sec)
   - Type: "How many users are in the database?"
   - Show indicator: "Calling database_query..."
   - AI responds: "There are 10 users in the database"
   - Type: "List the first 3 users"
   - AI calls tool again
   - Shows: "1. John (john@example.com), 2. Sarah (sarah@example.com), 3. Mike..."

4. **Show It's Real** (30 sec)
   - Open terminal, show MCP server logs
   - Show actual tool calls happening
   - Show it's not fake/hardcoded

**Stakeholder Takeaway:**
*"This works! We can chat with AI and it accesses real data through MCP. Now let's add security and make it production-ready."*

**Note:** This is a simplified version. For complete demo scripts with multiple milestones, see [mvp-milestones.md](mvp-milestones.md).

---

## MVP Success Criteria

**Technical:**
- ✅ App launches and runs on macOS
- ✅ Can chat with Gemini
- ✅ Can call MCP tools
- ✅ Response time < 3 seconds
- ✅ No crashes during demo

**Product:**
- ✅ Users understand the value (AI + data access)
- ✅ Identifies critical pain points to fix
- ✅ Validates MCP is valuable
- ✅ Gets us to next conversation with stakeholders

**Business:**
- ✅ Demo to 3-5 internal users
- ✅ Collect feedback on what's missing
- ✅ Decide: build more features OR pivot
- ✅ Timeline: 2-3 weeks from start to demo

---

## Post-MVP Roadmap (v0.2+)

**After validating MVP, add in priority order:**

**v0.2 (Week 4-5):** Make it Usable
- Conversation persistence (SQLite)
- Multiple conversations
- Basic error handling improvements

**v0.3 (Week 6-7):** Security Basics
- Simple auth (password-based, not SSO yet)
- Encrypted database
- Basic RBAC (2 roles: user, admin)

**v0.4 (Week 8-10):** Enterprise Features
- SSO/SAML (Okta)
- MCP server configuration UI
- Multiple MCP servers

**v0.5 (Week 11-14):** Advanced Security
- MCP-Defender integration
- PII detection
- Audit logging

**v1.0 (Week 15-24):** Production Ready
- All enterprise features
- Code signing & notarization
- Compliance reporting
- Full testing & documentation

---

## MVP Architecture (Simplified)

### What We Build:

```
┌─────────────────────────────────┐
│   Tauri macOS App               │
│  ┌─────────────────────────┐   │
│  │  React Chat UI          │   │
│  │  - Message input        │   │
│  │  - Message display      │   │
│  └─────────────────────────┘   │
│           ↕                     │
│  ┌─────────────────────────┐   │
│  │  Simple Backend         │   │
│  │  - Gemini API client    │   │
│  │  - MCP client (stdio)   │   │
│  │  - Basic orchestration  │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
           ↕
    ┌─────────────┐
    │ MCP Server  │
    │ (stdio)     │
    └─────────────┘
```

**What We Skip:**
- ❌ No authentication
- ❌ No database
- ❌ No MCP-Defender
- ❌ No admin dashboard
- ❌ No audit logging
- ❌ No encryption
- ❌ No installer/signing

---

## MVP Technology Stack (Minimal)

**Frontend:**
- Tauri 2.0+
- React 18+
- TypeScript
- TailwindCSS (basic styling)
- No state management library yet (use React state)

**Backend:**
- Node.js 20 (simpler than Python for MVP)
- Gemini SDK (official Google library)
- MCPToolset (stdio only)
- No database (in-memory only)

**MCP:**
- ONE stdio server (example: filesystem or database)
- Hardcoded configuration in code

**Dev Tools:**
- Vite (bundler)
- ESLint (linting)
- No testing yet (add after MVP)

---

## MVP File Structure (Simplified)

```
dive-mvp/
├── src/
│   ├── frontend/
│   │   ├── App.tsx           # Main app
│   │   ├── Chat.tsx          # Chat interface
│   │   └── main.tsx          # Entry
│   │
│   ├── backend/
│   │   ├── gemini.ts         # Gemini client
│   │   ├── mcp.ts            # MCP client
│   │   └── orchestrator.ts   # Connect Gemini + MCP
│   │
│   └── tauri/
│       └── main.rs           # Tauri backend
│
├── mcp-server/               # Sample MCP server
│   └── database-server.js    # Example stdio server
│
├── .env.example              # API keys template
├── package.json
└── README.md
```

**Total Files:** ~10-15 files
**Lines of Code:** ~1,000-1,500 LOC

---

## MVP Development Plan

### Week 1: Foundation
**Days 1-2:** Story MVP-1 (Hello World App)
**Days 3-4:** Story MVP-2 (Chat Interface UI)
**Day 5:** Story MVP-3 (Gemini Integration) - start

### Week 2: Integration
**Days 1-2:** Story MVP-3 (Gemini Integration) - finish
**Days 3-4:** Story MVP-4 (MCP Client)
**Day 5:** Story MVP-5 (MCP in Chat) - start

### Week 3: Polish & Demo
**Days 1-2:** Story MVP-5 (MCP in Chat) - finish
**Days 3-4:** Bug fixes, basic error handling
**Day 5:** Internal demo, collect feedback

### Week 4: Decision Point
**Review feedback:**
- Is this valuable? → Continue building
- Missing critical feature? → Add it to v0.2
- Wrong direction? → Pivot

**Note:** This is aligned with [mvp-milestones.md](mvp-milestones.md) which provides detailed demo scripts and success criteria for each week.

---

## Comparison: MVP vs Full Scope

| Aspect | MVP (v0.1) | Full Scope (v1.0) |
|--------|------------|-------------------|
| **Timeline** | 2-3 weeks | 24 weeks |
| **Stories** | 5 | 31 |
| **Features** | 3 core | 20+ features |
| **Code** | ~1,500 LOC | ~15,000+ LOC |
| **Platform** | macOS dev mode | macOS production |
| **Auth** | None | SSO/SAML |
| **Security** | None | Full stack |
| **Demo** | 3 minutes | 30 minutes |
| **Value** | Prove concept | Production ready |
| **Risk** | Low | Medium |

---

## Why This MVP Works

**1. Validates Core Hypothesis**
- "Can AI + MCP provide value?"
- Answer in 3 weeks, not 6 months

**2. Fast Feedback Loop**
- Show real users quickly
- Learn what matters most
- Avoid building wrong features

**3. Reduces Risk**
- Small investment
- Easy to pivot
- Fail fast if needed

**4. Maintains Momentum**
- Team sees progress quickly
- Stakeholders see tangible results
- Builds confidence

**5. Focuses Team**
- Clear, simple goal
- No scope creep
- Easy to test and debug

---

## MVP Demo Prep Checklist

**Before Demo:**
- [ ] App launches successfully
- [ ] Gemini API key configured
- [ ] MCP server running with sample data
- [ ] 3-5 test questions prepared
- [ ] Backup plan if API fails (video recording)
- [ ] Rehearse 3x minimum

**Demo Environment:**
- MacBook (your development machine is fine)
- Local MCP server with realistic data
- Internet connection for Gemini API
- Clean desktop (close other apps)

---

## Next Steps

**Immediate Action (This Week):**
1. **Approve MVP scope** - Confirm we're building v0.1, not v1.0
2. **Set up development environment** - Tauri, Node.js, Gemini API key
3. **Start Story MVP-1** - Hello World macOS app
4. **Create sample MCP server** - Simple database or filesystem server

**Success Metrics:**
- Week 1: App launches, chat UI works
- Week 2: Gemini responds, MCP calls work
- Week 3: Demo to internal users, get feedback
- Week 4: Decide on v0.2 features

---

## FAQ

**Q: Is this too simple?**
A: It's a deliberate MVP. We validate the core concept, then add features based on real feedback.

**Q: What about security?**
A: MVP runs in development mode for internal demo. Security comes in v0.3+.

**Q: What if stakeholders want more features?**
A: Show them this document. Explain we'll add features incrementally based on their feedback.

**Q: Can we skip even more?**
A: Possibly! If you want even faster, we could start with just Gemini chat (no MCP) and add MCP in v0.2.

---

**Approved By:** Winston (Architect) + John (PM)
**Date:** 2025-12-29
**Status:** Ready to Build MVP! 🚀
