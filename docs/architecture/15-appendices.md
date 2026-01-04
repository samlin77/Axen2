# 15. Appendices

## 15.1 Technology Decision Log

| Decision | Alternatives Considered | Rationale |
|----------|-------------------------|-----------|
| Tauri over Electron | Electron, Flutter Desktop | Smaller binary, better security, lower memory usage |
| SQLite over PostgreSQL | PostgreSQL, MongoDB | Embedded, zero-config, perfect for desktop app |
| React over Vue/Angular | Vue, Angular, Svelte | Mature ecosystem, Tauri has excellent React support |
| Google ADK over LangChain | LangChain, custom solution | Built for agents, multi-agent workflows, Google support |
| Zustand over Redux | Redux, MobX, Jotai | Minimal boilerplate, good TypeScript support |

## 15.2 Glossary

- **ADK:** Agent Development Kit (Google)
- **MCP:** Model Context Protocol
- **MCP-Defender:** Security layer for MCP traffic inspection
- **RBAC:** Role-Based Access Control
- **SSO:** Single Sign-On
- **SAML:** Security Assertion Markup Language
- **DLP:** Data Loss Prevention
- **PII:** Personally Identifiable Information
- **SOC2:** Service Organization Control 2 (compliance standard)

## 15.3 References

- [Tauri Documentation](https://tauri.app)
- [Google ADK Documentation](https://cloud.google.com/adk)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [MCP-Defender Repository](https://github.com/mcpdefender/mcpdefender)
- [SQLCipher Documentation](https://www.zetetic.net/sqlcipher/)

---
