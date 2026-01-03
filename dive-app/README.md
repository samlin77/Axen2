# Dive AI Agent Platform - MVP v0.1

Enterprise AI Agent Platform with Secure MCP Integration

## Overview

This is the MVP (v0.1) implementation focusing on core functionality:
- macOS Desktop Application (Tauri + React + TypeScript)
- Basic Chat Interface
- Single LLM Integration (Gemini)
- Simple MCP Protocol Support

## Project Structure

```
dive-app/
├── src/                # React frontend
├── src-tauri/          # Tauri Rust backend
├── docs/              # Documentation (in parent directory)
└── package.json
```

## Prerequisites

- Node.js 20+ LTS
- Rust 1.70+ (for Tauri)
- macOS 12+ (Monterey or later)
- Xcode Command Line Tools

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Mode

```bash
npm run tauri:dev
```

This will:
- Start Vite dev server (React frontend)
- Launch Tauri app window
- Enable hot module replacement (HMR)

### 3. Build for Production

```bash
npm run tauri:build
```

This creates a `.app` bundle in `src-tauri/target/release/bundle/`

## MVP Stories

Following [mvp-scope.md](../docs/mvp-scope.md):

- [x] **MVP-1:** Hello World macOS App ← Current
- [ ] **MVP-2:** Chat Interface UI
- [ ] **MVP-3:** Gemini Integration
- [ ] **MVP-4:** MCP Client Foundation
- [ ] **MVP-5:** MCP Integration in Chat

## Technology Stack

- **Frontend:** React 19+, TypeScript 5+, Vite
- **Desktop:** Tauri 2.0+
- **Backend:** Node.js (to be added)
- **LLM:** Gemini SDK (to be added)
- **MCP:** MCPToolset (to be added)

## Documentation

See [docs/](../docs/) directory for:
- [mvp-scope.md](../docs/mvp-scope.md) - MVP scope definition
- [mvp-milestones.md](../docs/mvp-milestones.md) - Demo milestones
- [architecture/](../docs/architecture/) - Technical architecture

## Development Timeline

**Week 1:** Foundation + Chat UI (Stories MVP-1, MVP-2)
**Week 2:** LLM + MCP Integration (Stories MVP-3, MVP-4)
**Week 3:** Polish & Testing (Story MVP-5)
**Week 4:** Demo & Feedback

## License

ISC
