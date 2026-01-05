# Epic 8: Google Workspace MCP & Agentic Flow

**Version:** 1.0
**Date:** 2026-01-05
**Status:** ✅ COMPLETE (Foundation)
**Target Version:** v0.2 - v0.3
**Priority:** HIGH
**Strategic Value:** Platform Differentiation - True Agent Autonomy

---

## 🎉 Implementation Status

### ✅ Completed (Phase 1-2)
- **Story 8.1:** Multi-MCP Architecture ✅
- **Story 8.2-8.5:** Google Workspace Integration ✅
- **Story 8.6:** Agent Reasoning Loop ✅
- **Story 8.7:** Tool Chain Orchestration ✅
- **Story 8.8:** Self-Correction & Retry Logic ✅
- **Story 8.9:** Agent UI Components ✅

### 📋 Next Steps
- Integrate agent-flow service into Chat.tsx
- Test with real Google Workspace OAuth credentials
- Build workflow templates for common tasks
- Performance optimization and error handling refinement

---

## Epic Goal

Transform Axen from a "chat with tools" interface into a **true agentic platform** that can autonomously orchestrate multi-step workflows across Google Workspace (Calendar, Docs, Gmail, Sheets) using reasoning loops, tool chaining, and self-correction.

**Why This Matters:**
- **Market Differentiation:** Most AI assistants just call tools - we enable autonomous workflows
- **Google Workspace = Daily Use:** Calendar/Gmail/Docs are used by millions daily
- **Future-Proof:** Agentic architecture enables future agent-to-agent collaboration
- **Enterprise Value:** Autonomous task completion (not just Q&A) = productivity multiplier

---

## Success Metrics

**Adoption:**
- 80% of users connect at least 2 Google Workspace MCP servers
- 50% of users complete multi-step agentic workflows weekly

**Technical:**
- Support 5+ simultaneous MCP connections
- Agent reasoning loops complete <30 seconds for typical tasks
- 95% accuracy in tool selection and orchestration
- <5% failure rate in agentic workflows

**Business:**
- "Autonomous agent" becomes top differentiator in sales conversations
- 3x increase in daily active usage (vs. simple chat)

---

## User Stories

### Phase 1: Multi-MCP Foundation (Week 4)

---

#### Story 8.1: Multiple MCP Server Architecture

**As a** developer
**I want** to support multiple simultaneous MCP server connections
**so that** users can access multiple data sources in one conversation

**Acceptance Criteria:**
1. Support 5+ MCP servers running simultaneously
2. Connection pooling and lifecycle management
3. Server failures are isolated (don't cascade)
4. UI displays all connected servers with status indicators
5. Enable/disable servers without app restart
6. Server configurations persisted to localStorage
7. Health checks run every 30 seconds for all servers

**Technical Design:**
```typescript
// services/mcp-multi.ts
interface MCPServerInstance {
  id: string;
  config: MCPServerConfig;
  client: MCPClient | null;
  status: 'connected' | 'disconnected' | 'error';
  tools: MCPTool[];
  lastHealthCheck: Date;
  error?: string;
}

class MCPMultiService {
  private servers: Map<string, MCPServerInstance>;

  async connectServer(config: MCPServerConfig): Promise<void>;
  async disconnectServer(serverId: string): Promise<void>;
  async getAllTools(): Promise<Array<{serverId: string, tools: MCPTool[]}>>;
  async callTool(serverId: string, toolName: string, args: any): Promise<any>;
  async healthCheckAll(): Promise<Map<string, ServerHealth>>;
}
```

**Effort:** 3-4 days
**Dependencies:** None (refactor of existing mcp.ts)

---

#### Story 8.2: Google Calendar MCP Integration

**As a** user
**I want** to connect to Google Calendar via MCP
**so that** AI can read/create/update my calendar events

**Acceptance Criteria:**
1. OAuth2 authentication flow with Google
2. MCP server connects to user's Google Calendar
3. Available tools:
   - `list_events` - List calendar events (with date range filter)
   - `create_event` - Create new calendar event
   - `update_event` - Modify existing event
   - `delete_event` - Remove event
   - `search_events` - Search by title/attendee
4. Access token stored securely in OS keychain
5. Auto-refresh of expired tokens
6. Test connection button in MCP Servers UI
7. Handle rate limits gracefully (429 errors)

**Example Usage:**
```
User: "What meetings do I have tomorrow?"
Agent: Calls list_events(start: "2026-01-06", end: "2026-01-07")
       Returns: 3 meetings found
```

**Effort:** 2-3 days
**Dependencies:** Story 8.1 (Multi-MCP)

---

#### Story 8.3: Gmail MCP Integration

**As a** user
**I want** to connect to Gmail via MCP
**so that** AI can read/send/search my emails

**Acceptance Criteria:**
1. OAuth2 authentication with Gmail API scopes
2. Available tools:
   - `list_emails` - List recent emails (inbox/sent/all)
   - `read_email` - Read specific email by ID
   - `send_email` - Send new email
   - `reply_email` - Reply to existing thread
   - `search_emails` - Full-text search with filters
3. Email content rendered safely (no script injection)
4. Attachment handling (list, download)
5. Draft support (save, send draft)
6. Rate limiting and quota management

**Safety:**
- `send_email` ALWAYS requires user confirmation
- Show preview before sending

**Effort:** 2-3 days
**Dependencies:** Story 8.1

---

#### Story 8.4: Google Docs MCP Integration

**As a** user
**I want** to connect to Google Docs via MCP
**so that** AI can read/create/edit documents

**Acceptance Criteria:**
1. OAuth2 with Google Docs API
2. Available tools:
   - `list_documents` - List user's documents
   - `read_document` - Read full document content
   - `create_document` - Create new Google Doc
   - `update_document` - Append/modify content
   - `search_documents` - Search by title/content
3. Document formatting preserved (headings, lists, bold)
4. Share permissions handling
5. Revision history access

**Effort:** 2-3 days
**Dependencies:** Story 8.1

---

#### Story 8.5: Google Sheets MCP Integration

**As a** user
**I want** to connect to Google Sheets via MCP
**so that** AI can read/update spreadsheet data

**Acceptance Criteria:**
1. OAuth2 with Google Sheets API
2. Available tools:
   - `list_spreadsheets` - List user's sheets
   - `read_sheet` - Read specific sheet/range
   - `update_cells` - Update cell values
   - `create_sheet` - Create new spreadsheet
   - `append_rows` - Add rows to sheet
3. Formula handling (read formulas, update values)
4. Multiple sheets per spreadsheet support
5. Named ranges support

**Use Case:**
```
User: "Add today's sales numbers to the Q4 tracker"
Agent: 1. search_sheets("Q4 tracker")
       2. read_sheet(find "Sales" tab)
       3. append_row(date=today, amount=$50k)
```

**Effort:** 2-3 days
**Dependencies:** Story 8.1

---

### Phase 2: Agentic Flow Architecture (Weeks 5-6)

---

#### Story 8.6: Agent Reasoning Loop

**As a** user
**I want** the AI agent to reason through multi-step tasks autonomously
**so that** complex workflows complete without constant prompting

**Acceptance Criteria:**
1. Agent implements reasoning loop pattern:
   ```
   LOOP (max 10 iterations):
     1. Thought - Reason about current state and next action
     2. Action - Execute tool call or final response
     3. Observation - Receive result from tool
     4. Evaluation - Assess if goal achieved
     5. Decision - Continue or Done
   ```
2. Each reasoning step visible in UI (expandable)
3. User can pause/cancel reasoning loop at any time
4. Timeout after 10 iterations (prevent infinite loops)
5. Agent explains reasoning in natural language
6. Context preserved across loop iterations
7. Error recovery (if tool fails, try alternative approach)

**Example Flow:**
```
User: "Schedule a meeting with Sarah tomorrow at 2pm for 30 minutes"

Iteration 1:
  Thought: "I need to check if Sarah is available at 2pm tomorrow"
  Action: list_events(calendar="sarah@company.com", date="tomorrow", time="2pm")
  Observation: [conflict: meeting 1:30-3pm]
  Evaluation: "Sarah is busy 2pm-3pm, need to find another time"

Iteration 2:
  Thought: "Let me check 3pm instead"
  Action: list_events(calendar="sarah@company.com", date="tomorrow", time="3pm")
  Observation: [free]
  Evaluation: "3pm is available for both of us"

Iteration 3:
  Thought: "Now I can create the meeting"
  Action: create_event(title="Meeting with Sarah", start="tomorrow 3pm", duration=30)
  Observation: {success: true, event_id: "abc123"}
  Evaluation: "Meeting created successfully"

Iteration 4:
  Thought: "Task complete"
  Action: DONE
  Final Response: "I've scheduled a 30-minute meeting with Sarah tomorrow at 3pm (2pm was not available)."
```

**Technical Architecture:**
```typescript
// services/agent-flow.ts
interface AgentTask {
  id: string;
  goal: string;
  steps: AgentStep[];
  status: 'planning' | 'executing' | 'evaluating' | 'complete' | 'failed';
  maxIterations: number;
  currentIteration: number;
}

interface AgentStep {
  iteration: number;
  thought: string;          // Reasoning
  action: ToolCall | 'DONE'; // What to do
  observation: any;          // Tool result
  evaluation: string;        // Assessment
  timestamp: Date;
}

class AgentFlowService {
  async executeTask(goal: string, context: ConversationContext): Promise<AgentTask>;
  async reasonNextStep(task: AgentTask): Promise<AgentStep>;
  async shouldContinue(task: AgentTask): Promise<boolean>;
  async evaluateResult(step: AgentStep): Promise<string>;
}
```

**Effort:** 4-5 days
**Dependencies:** Phase 1 complete (Multi-MCP + Google Workspace)

---

#### Story 8.7: Tool Chain Orchestration

**As a** user
**I want** the agent to orchestrate multiple tools in sequence
**so that** complex multi-step workflows complete automatically

**Acceptance Criteria:**
1. Agent can chain tool calls (output of tool A → input of tool B)
2. Support for sequential and parallel tool execution
3. Dependency resolution (tool B waits for tool A result)
4. Error handling in chains (retry, fallback, abort)
5. Show tool chain progress in UI (pipeline view)
6. Maximum 5 tools per chain (prevent complexity)
7. Chain execution completes within 60 seconds

**Example Use Cases:**

**Use Case 1: Email → Calendar Workflow**
```
User: "Find emails from John about 'project kickoff' and schedule a meeting"

Tool Chain:
1. search_emails(from="john@company.com", subject="project kickoff")
   → Result: [email with proposed times]
2. extract_text(email content)
   → Result: "How about Tuesday 3pm?"
3. list_events(calendar="my", date="next Tuesday", time="3pm")
   → Result: [free]
4. create_event(title="Project Kickoff", attendees=["john@company.com"], time="next Tuesday 3pm")
   → Result: {success: true}
```

**Use Case 2: Docs → Sheets → Email**
```
User: "Summarize Q4 goals doc and update the tracker spreadsheet, then email the team"

Tool Chain:
1. search_documents(title="Q4 goals")
   → Result: {doc_id: "abc123"}
2. read_document(doc_id="abc123")
   → Result: {content: "..."}
3. summarize_with_ai(content)
   → Result: "5 key goals: ..."
4. search_sheets(title="Q4 tracker")
   → Result: {sheet_id: "xyz789"}
5. update_cells(sheet_id, range="A1", value=summary)
   → Result: {success: true}
6. send_email(to="team@company.com", subject="Q4 Goals Updated", body=summary)
   → Result: {success: true}
```

**Technical Implementation:**
```typescript
interface ToolChain {
  id: string;
  steps: ToolChainStep[];
  status: 'pending' | 'running' | 'complete' | 'failed';
}

interface ToolChainStep {
  stepNumber: number;
  toolCall: ToolCall;
  dependsOn?: number[]; // Step numbers this depends on
  status: 'pending' | 'running' | 'complete' | 'failed';
  result?: any;
  error?: string;
}

class ToolChainOrchestrator {
  async executeChain(chain: ToolChain): Promise<void>;
  async executeStep(step: ToolChainStep, context: Map<number, any>): Promise<any>;
  canExecuteStep(step: ToolChainStep, completedSteps: Set<number>): boolean;
}
```

**Effort:** 3-4 days
**Dependencies:** Story 8.6 (Reasoning Loop)

---

#### Story 8.8: Result Evaluation & Self-Correction

**As a** user
**I want** the agent to evaluate results and self-correct when needed
**so that** workflows are resilient and autonomous

**Acceptance Criteria:**
1. Agent evaluates each tool call result for success/failure
2. Detects common failure patterns:
   - Tool returned error
   - Result is empty/null
   - Result doesn't match expected format
   - Result indicates wrong assumption
3. Self-correction strategies:
   - Retry with modified arguments
   - Try alternative tool
   - Ask user for clarification
   - Abandon task with explanation
4. Confidence scoring for each action (0-100%)
5. Learning from failures within session
6. Maximum 3 retry attempts per tool call

**Self-Correction Example:**
```
User: "Email the Q4 report to the team"

Attempt 1:
  Action: search_emails(query="Q4 report")
  Observation: [0 results]
  Evaluation: "No emails found. Maybe it's a document instead?"
  Confidence: 30%
  Decision: Try alternative approach

Attempt 2:
  Action: search_documents(query="Q4 report")
  Observation: [{title: "Q4_Report_Final.gdoc", id: "abc123"}]
  Evaluation: "Found the document! This is likely what user meant"
  Confidence: 90%
  Decision: Continue

Attempt 3:
  Action: send_email(
    to: "team@company.com",
    subject: "Q4 Report",
    body: "Here's the Q4 report: [link]"
  )
  Observation: {success: true, message_id: "xyz789"}
  Evaluation: "Email sent successfully"
  Confidence: 100%
  Decision: DONE
```

**Technical Implementation:**
```typescript
interface EvaluationResult {
  success: boolean;
  confidence: number;  // 0-100
  issues: string[];
  suggestion?: {
    action: 'retry' | 'alternative' | 'clarify' | 'abort';
    reason: string;
    nextAction?: ToolCall;
  };
}

class ResultEvaluator {
  evaluate(toolCall: ToolCall, result: any): EvaluationResult;
  suggestCorrection(evaluation: EvaluationResult): CorrectionStrategy;
  shouldRetry(attempt: number, evaluation: EvaluationResult): boolean;
}
```

**Effort:** 3-4 days
**Dependencies:** Story 8.6, 8.7

---

### Phase 3: Agent UI & UX (Week 7)

---

#### Story 8.9: Agent Task Viewer UI

**As a** user
**I want** to see the agent's thinking process in the UI
**so that** I understand what it's doing and can trust it

**Acceptance Criteria:**
1. Expandable "Agent Task" panel in chat interface
2. Shows each reasoning step with:
   - Thought (what agent is thinking)
   - Action (tool being called)
   - Observation (result received)
   - Evaluation (assessment of result)
3. Visual progress indicator (Step 1/5)
4. Current step highlighted/animated
5. Completed steps collapsible
6. Failed steps marked with error icon
7. Timeline view showing duration of each step
8. Ability to export task log (for debugging)

**UI Mockup:**
```
┌────────────────────────────────────────────────┐
│ 🤖 Agent Task: Schedule meeting with Sarah    │
├────────────────────────────────────────────────┤
│                                                │
│ ✅ Step 1 of 4 (completed in 2.3s)           │
│    💭 Thought: "Check Sarah's availability"   │
│    🔧 Action: list_events(calendar="sarah")   │
│    👁  Observation: [conflict at 2pm]         │
│    ✅ Evaluation: "2pm busy, try 3pm"         │
│    [Show Details ▼]                           │
│                                                │
│ ⏳ Step 2 of 4 (in progress...)               │
│    💭 Thought: "Check 3pm instead"            │
│    🔧 Action: list_events(time="3pm")         │
│    ⏳ Waiting for result...                   │
│                                                │
│ ⏸  Step 3 of 4 (pending)                     │
│    Create calendar event                      │
│                                                │
│ ⏸  Step 4 of 4 (pending)                     │
│    Send confirmation                           │
│                                                │
│ [⏸ Pause] [❌ Cancel] [📥 Export Log]        │
└────────────────────────────────────────────────┘
```

**Effort:** 3-4 days
**Dependencies:** Story 8.6 (Reasoning Loop)

---

#### Story 8.10: Agent Confirmation Gates (Safety)

**As a** user
**I want** to approve sensitive agent actions before they execute
**so that** I maintain control over critical operations

**Acceptance Criteria:**
1. Agent pauses and requests confirmation for:
   - Sending emails
   - Creating/modifying calendar events
   - Sharing documents
   - Deleting data
   - Any action marked as "destructive"
2. Confirmation dialog shows:
   - What action will be performed
   - Preview of changes (email body, event details, etc.)
   - Consequences of action
3. User can:
   - Approve (proceed)
   - Reject (cancel)
   - Edit (modify action before approval)
4. "Auto-approve" option for trusted actions
5. Timeout (30 seconds) → defaults to reject
6. Confirmation history logged in audit trail

**Confirmation Dialog UI:**
```
┌───────────────────────────────────────────────┐
│ Agent needs your approval                    │
├───────────────────────────────────────────────┤
│                                               │
│ 📧 Send Email                                │
│                                               │
│ To: team@company.com                         │
│ Cc: manager@company.com                      │
│ Subject: Q4 Report Update                    │
│                                               │
│ Body:                                         │
│ ┌─────────────────────────────────────────┐ │
│ │ Hi team,                                │ │
│ │                                         │ │
│ │ The Q4 report has been updated with    │ │
│ │ latest numbers. Please review:         │ │
│ │ [link to Google Doc]                   │ │
│ │                                         │ │
│ │ Thanks!                                 │ │
│ └─────────────────────────────────────────┘ │
│                                               │
│ ⚠️ This will send email to 15 recipients    │
│                                               │
│ [✅ Approve] [✏️ Edit] [❌ Reject]           │
│                                               │
│ ☐ Auto-approve similar emails in future      │
│                                               │
│ ⏱️ Auto-reject in 30s if no response         │
└───────────────────────────────────────────────┘
```

**Technical Implementation:**
```typescript
interface ConfirmationRequest {
  id: string;
  action: ToolCall;
  category: 'email' | 'calendar' | 'document' | 'destructive';
  preview: {
    title: string;
    details: Record<string, any>;
    consequences: string[];
  };
  timeout: number; // seconds
  autoApprove?: boolean;
}

class ConfirmationGate {
  async requestConfirmation(request: ConfirmationRequest): Promise<'approved' | 'rejected' | 'timeout'>;
  shouldAutoApprove(action: ToolCall): boolean;
  logDecision(request: ConfirmationRequest, decision: string): void;
}
```

**Effort:** 2-3 days
**Dependencies:** Story 8.6, 8.9

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────┐
│           Axen Frontend (React)             │
├─────────────────────────────────────────────┤
│  - Chat Interface                           │
│  - Agent Task Viewer (NEW)                  │
│  - MCP Server Manager (Multi-server)        │
│  - Confirmation Dialogs (NEW)               │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│      Agent Orchestration Layer (NEW)        │
├─────────────────────────────────────────────┤
│  - AgentFlowService (Reasoning Loop)        │
│  - ToolChainOrchestrator (Multi-tool)       │
│  - ResultEvaluator (Self-correction)        │
│  - ConfirmationGate (Safety)                │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│         MCP Multi-Service (NEW)             │
├─────────────────────────────────────────────┤
│  - Connection Management (5+ servers)       │
│  - Tool Registry (All available tools)      │
│  - Health Monitoring                        │
└─────────────────────────────────────────────┘
                    ↕
┌──────────┬──────────┬──────────┬────────────┐
│ Calendar │   Docs   │  Gmail   │   Sheets   │
│   MCP    │   MCP    │   MCP    │    MCP     │
└──────────┴──────────┴──────────┴────────────┘
         (Google Workspace MCP Servers)
```

### Data Flow: Agentic Workflow

```
1. User: "Schedule meeting with Sarah tomorrow"
   ↓
2. AgentFlowService.executeTask()
   ↓
3. Reasoning Loop:
   ├─ Iteration 1: Check Sarah's calendar
   │  └─ MCPMultiService.callTool("calendar", "list_events")
   ├─ Iteration 2: Find available time
   │  └─ ResultEvaluator.evaluate() → "2pm busy, try 3pm"
   ├─ Iteration 3: Create event (needs confirmation)
   │  └─ ConfirmationGate.requestConfirmation()
   │     └─ User approves
   │        └─ MCPMultiService.callTool("calendar", "create_event")
   └─ Iteration 4: DONE
   ↓
4. Final Response: "Meeting scheduled for 3pm"
```

---

## Dependencies & Risks

### External Dependencies
1. **Google Workspace MCP Servers** - Must be available and maintained
   - Mitigation: Use official `@modelcontextprotocol/server-google-*` packages
   - Fallback: Build custom MCP servers if needed

2. **OAuth2 Flow** - Google API authentication
   - Mitigation: Use well-tested OAuth libraries (Tauri OAuth plugin)
   - Risk: Token refresh failures → require re-auth

3. **Google API Rate Limits** - Calendar/Gmail/Docs APIs have quotas
   - Mitigation: Implement exponential backoff, show clear errors to users
   - Monitor: Track API usage in admin dashboard

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Reasoning loops infinite/slow | Medium | High | Max 10 iterations, 60s timeout |
| Multiple MCP servers cause conflicts | Medium | Medium | Isolate connections, namespace tools |
| OAuth token management complex | High | Medium | Use proven libraries, test thoroughly |
| Agent makes wrong decisions | Medium | High | Confirmation gates for sensitive actions |
| Tool chaining creates unexpected results | Medium | Medium | Extensive testing, user feedback loops |

---

## Timeline & Milestones

**Phase 1: Multi-MCP + Google Workspace** (Week 4)
- Days 1-4: Multi-MCP architecture (Story 8.1)
- Days 5-10: Google Workspace integration (Stories 8.2-8.5)
- Milestone: Can connect 4 Google Workspace MCP servers

**Phase 2: Agentic Flow** (Weeks 5-6)
- Week 5: Reasoning loop & tool orchestration (Stories 8.6-8.7)
- Week 6: Self-correction & evaluation (Story 8.8)
- Milestone: Agent completes multi-step tasks autonomously

**Phase 3: Agent UX** (Week 7)
- Days 1-4: Agent Task Viewer (Story 8.9)
- Days 5-7: Confirmation gates (Story 8.10)
- Milestone: Users can see & control agent workflows

**Total Timeline: 6-7 weeks to v0.2 completion**

---

## Success Criteria (Definition of Done)

**Phase 1 Done When:**
- ✅ 4 Google Workspace MCP servers connect successfully
- ✅ All tools discoverable and callable
- ✅ OAuth2 flow works end-to-end
- ✅ Can demonstrate basic tool usage (read calendar, list emails)

**Phase 2 Done When:**
- ✅ Agent completes 3-step workflow without user input
- ✅ Agent self-corrects when tool fails
- ✅ Tool chains execute successfully (3+ tools)
- ✅ Reasoning steps logged and visible

**Phase 3 Done When:**
- ✅ Users can see agent thinking process in UI
- ✅ Confirmation gates block sensitive actions
- ✅ Users can pause/cancel agent workflows
- ✅ 5 power users successfully complete complex workflows

**Demo-Ready When:**
- ✅ Can demonstrate: "Schedule a meeting based on email discussion"
- ✅ Can demonstrate: "Summarize docs and email team"
- ✅ Can demonstrate: "Update spreadsheet from calendar data"
- ✅ No critical bugs in happy path scenarios

---

## Out of Scope (Post-v0.2)

**Deferred to v0.3+:**
- ❌ Agent-to-agent communication
- ❌ Workflow templates (save/reuse agentic workflows)
- ❌ Advanced analytics (agent performance metrics)
- ❌ Custom tool development kit
- ❌ Webhook triggers for automated workflows
- ❌ Multi-user collaboration on workflows

**Deferred to v0.4+:**
- ❌ Enterprise governance (IT-approved workflows)
- ❌ Audit logging of all agent decisions
- ❌ RBAC for agentic capabilities
- ❌ Compliance controls (GDPR, SOC2 for agent actions)

---

## Open Questions

1. **Gemini Context Window:** Can Gemini maintain context across 10 reasoning iterations?
   - Answer: Test with Gemini 2.0 Flash (1M token context)

2. **Google Workspace Quotas:** What are actual rate limits?
   - Action: Research Google API quotas, implement monitoring

3. **User Confirmation Fatigue:** Will users get annoyed by confirmation dialogs?
   - Action: A/B test auto-approve vs. always-confirm

4. **Tool Naming Conflicts:** What if 2 MCP servers have same tool name?
   - Solution: Namespace tools by server ID (`calendar:list_events`)

5. **Agent Decision Transparency:** How much reasoning detail to show users?
   - Action: User testing with different verbosity levels

---

**Prepared By:** John (PM)
**Date:** 2026-01-05
**Status:** Ready for Development
**Next Step:** User approval → Begin Story 8.1 (Multi-MCP Architecture)
