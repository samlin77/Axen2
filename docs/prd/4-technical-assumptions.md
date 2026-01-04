# 4. Technical Assumptions

## Repository Structure
**Monorepo** - Single repository containing all application components

## Service Architecture
**Desktop Monolith with Local Services** - Tauri-based desktop application with embedded agent orchestration (Google ADK), local LLM support, and remote API integrations for cloud LLMs

## Technology Stack
- **Frontend:** Tauri + React/TypeScript
- **Backend/Agent:** Google ADK (Python/TypeScript)
- **LLM Integration:** Native APIs (Gemini, OpenAI)
- **MCP Protocol:** MCPToolset (stdio & SSE)
- **Security:** MCP-Defender (enhanced fork)
- **Storage:** SQLite (local), encrypted at rest
- **Auth:** OAuth2/SAML integration libraries

## Testing Requirements
**Full Testing Pyramid** - Unit tests, integration tests, E2E tests for critical user flows, security testing, compliance validation

## Additional Assumptions
- Must support air-gapped deployment for government/regulated industries
- Custom CA certificate support required
- Network proxy auto-configuration needed
- VPN compatibility essential
- Local data storage only (no cloud sync in v1.0)
- SOC2 Type I certification before GA launch

---
