# Axen - Enterprise AI Agent Platform

**Axen Desktop** is an enterprise-grade AI agent platform that enables secure interactions with AI models (Gemini, ChatGPT) while accessing corporate data through the Model Context Protocol (MCP). Built with Tauri, React, and Rust for security, performance, and cross-platform compatibility.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)](https://tauri.app)

---

## Features

### 🤖 Multi-LLM Chat Interface
- Seamless integration with Google Gemini and OpenAI ChatGPT
- Real-time streaming responses with conversation history
- Context-aware interactions powered by MCP

### 🔌 MCP Server Integration
- **Pre-configured MCP Servers:**
  - **Google Workspace** (Calendar, Gmail, Drive, Docs, Sheets)
  - **Filesystem** - Local file access and manipulation
  - **GitHub** - Repository management and code interactions
- Support for stdio and SSE transport protocols
- Easy server registration and management
- Real-time tool discovery and execution

### 🔐 Secure Authentication
- OAuth 2.0 integration for Google Workspace services
- Secure token management via MCP server backend
- Browser-based authentication flow

### 🛠️ Interactive Tool Tester
- Test MCP tools directly from the UI
- Auto-generated argument schemas with examples
- Real-time tool execution and response visualization
- Support for all connected MCP servers

### 🎨 Modern Desktop UI
- Clean, professional interface with warm beige/brown color scheme
- Collapsible sidebar with conversation management
- Real-time server status indicators
- Bulk operations (connect all, disconnect all, health checks)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Axen Desktop (Tauri)                      │
│  ┌────────────────────┐         ┌─────────────────────────┐ │
│  │   React Frontend   │◄────────►│    Rust Backend         │ │
│  │  - UI Components   │         │  - MCP Process Manager  │ │
│  │  - MCP Service     │         │  - OAuth Handler        │ │
│  │  - Agent Flow      │         │  - IPC Bridge           │ │
│  └────────────────────┘         └─────────────────────────┘ │
│           │                                │                 │
└───────────┼────────────────────────────────┼─────────────────┘
            │                                │
            ▼                                ▼
  ┌──────────────────┐            ┌──────────────────┐
  │   Gemini API     │            │  MCP Servers     │
  │   (Google AI)    │            │  - workspace-mcp │
  └──────────────────┘            │  - filesystem    │
                                  │  - github        │
                                  └──────────────────┘
```

### Key Components

- **Frontend (React + TypeScript):**
  - `MCPServers.tsx` - Server management UI with bulk operations
  - `ToolTester.tsx` - Interactive MCP tool testing interface
  - `mcp.ts` - MCP client service with OAuth auto-detection
  - `agent-flow.ts` - Agentic reasoning loops (Thought → Action → Observation)

- **Backend (Rust):**
  - `main.rs` - Tauri application entry point
  - `mcp_process.rs` - MCP server process spawning and management
  - OAuth credential injection from environment variables

- **MCP Protocol:**
  - stdio transport for local process communication
  - SSE transport for network-based servers
  - Tool and resource discovery
  - Automatic OAuth flow initiation

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Rust** 1.70+ (install via [rustup](https://rustup.rs/))
- **Python 3.8+** with `uv` or `uvx` for Google Workspace MCP
- **Tauri CLI** (installed automatically via npm)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/axen.git
   cd axen
   ```

2. **Install dependencies:**
   ```bash
   cd dive-app
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the `dive-app/` directory:
   ```bash
   # Gemini API Key
   # Get your key from: https://aistudio.google.com/app/apikey
   VITE_GEMINI_API_KEY=your_gemini_api_key_here

   # Google OAuth Credentials (for Workspace MCP servers)
   # Create at: https://console.cloud.google.com/apis/credentials
   VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id.apps.googleusercontent.com
   VITE_GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret

   # GitHub Token (optional)
   VITE_GITHUB_TOKEN=your_github_token_here
   ```

4. **Run the development build:**
   ```bash
   npm run tauri:dev
   ```

   **Note:** MCP servers require the Tauri desktop app. Always use `npm run tauri:dev` instead of `npm run dev` for MCP functionality.

### Production Build

```bash
npm run tauri:build
```

The installer will be generated in `dive-app/src-tauri/target/release/bundle/`.

---

## Google Workspace OAuth Setup

To use Google Workspace MCP servers (Calendar, Gmail, Drive, Docs, Sheets), you need to set up OAuth credentials:

### 1. Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
4. Configure OAuth consent screen if prompted
5. Choose **"Desktop app"** as application type
6. Download the credentials JSON

### 2. Enable Required APIs

Enable these Google APIs in your project:
- Google Calendar API
- Gmail API
- Google Drive API
- Google Docs API
- Google Sheets API

### 3. Add Credentials to .env

Copy the Client ID and Client Secret to your `.env` file:
```bash
VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id.apps.googleusercontent.com
VITE_GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-your_client_secret
```

### 4. Test OAuth Flow

1. Launch Axen: `npm run tauri:dev`
2. Navigate to **MCP Servers** tab
3. Click **"Connect"** on any Google Workspace server (e.g., Google Calendar)
4. Use the Tool Tester to execute any Google Workspace tool
5. Follow the OAuth authentication flow in your browser
6. Grant the requested permissions
7. Complete the authentication process

---

## MCP Server Configuration

### Registering Custom MCP Servers

Edit `dive-app/src/services/mcp.ts` to register new servers:

```typescript
mcpService.registerServer({
  id: 'my-custom-server',
  name: 'My Custom Server',
  description: 'Description of what this server does',
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-custom'],
  env: {
    API_KEY: import.meta.env.VITE_CUSTOM_API_KEY,
  },
});
```

### Available MCP Servers

- **@modelcontextprotocol/server-filesystem** - File operations
- **@modelcontextprotocol/server-github** - GitHub integration
- **workspace-mcp** - Google Workspace (via `uvx`)
- **Custom MCP servers** - Any MCP-compliant server

---

## Development Guide

### Project Structure

```
axen/
├── dive-app/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── MCPServers.tsx
│   │   │   ├── ToolTester.tsx
│   │   │   └── ...
│   │   ├── services/         # Business logic
│   │   │   ├── mcp.ts        # MCP service
│   │   │   ├── agent-flow.ts # Agent reasoning
│   │   │   └── gemini.ts     # Gemini API
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # React entry point
│   ├── src-tauri/
│   │   ├── src/
│   │   │   ├── main.rs       # Tauri main
│   │   │   └── mcp_process.rs # MCP process manager
│   │   ├── Cargo.toml        # Rust dependencies
│   │   └── tauri.conf.json   # Tauri config
│   ├── package.json
│   └── .env                  # Environment variables
└── docs/                     # Documentation
    ├── prd.md                # Product requirements
    └── google-workspace-setup.md
```

### Key Technologies

- **Frontend:** React 19, TypeScript, Vite
- **Backend:** Rust, Tauri 2.x
- **AI:** Google Gemini API, MCP SDK
- **Styling:** CSS with warm beige/brown theme
- **State Management:** React hooks

### Running Tests

```bash
# Frontend linting
npm run lint

# Build type checking
npm run build
```

---

## Agentic Flow Engine

Axen includes a sophisticated agentic reasoning engine with:

- **Thought → Action → Observation → Evaluation → Decision** pattern
- Self-correction with exponential backoff retry (up to 3 attempts)
- Tool chain orchestration with parallel execution support
- Confirmation gates for sensitive operations
- Real-time progress visualization

See [agent-flow.ts](dive-app/src/services/agent-flow.ts) for implementation details.

---

## Troubleshooting

### Common Issues

**Problem:** "MCP servers require running the Tauri desktop app"
- **Solution:** Use `npm run tauri:dev` instead of `npm run dev`

**Problem:** "Port 8000 is already in use" (OAuth callback)
- **Solution:** Kill the process: `lsof -ti:8000 | xargs kill`

**Problem:** OAuth callback error "Invalid or expired state parameter"
- **Solution:** Restart the MCP server connection and retry authentication.

**Problem:** Google Workspace tools fail with authentication error
- **Solution:** Verify `.env` has correct OAuth credentials and APIs are enabled in Google Cloud Console

---

## Roadmap

### MVP-4 (Current - Q1 2025)
- [x] Basic MCP server integration
- [x] Google Workspace OAuth automation
- [x] Multi-MCP architecture
- [x] Agentic flow foundation
- [ ] SSO/SAML authentication

### MVP-5 (Q2 2025)
- [ ] MCP-Defender security layer
- [ ] RBAC implementation
- [ ] Audit logging system
- [ ] PII detection and masking

### Production (Q3 2025)
- [ ] Enterprise admin dashboard
- [ ] Compliance report generation
- [ ] Offline mode with local LLM
- [ ] Multi-tenant support

See [PRD](docs/prd.md) for complete product roadmap.

---

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "feat: Add my feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

### Commit Message Convention

We use conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [Tauri](https://tauri.app/) for cross-platform desktop apps
- Powered by [Google Gemini](https://ai.google.dev/) for AI capabilities
- MCP integration via [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Google Workspace integration via [workspace-mcp](https://github.com/modelcontextprotocol/servers)

---

## Support

For questions, issues, or feature requests:
- Open an issue on [GitHub](https://github.com/yourusername/axen/issues)
- Email: support@axen.ai (placeholder)
- Documentation: [docs.axen.ai](https://docs.axen.ai) (placeholder)

---

**Made with ❤️ by the Axen team**
