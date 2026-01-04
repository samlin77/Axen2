# 3. System Architecture

## 3.1 Component Architecture

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

## 3.2 Process Architecture

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
