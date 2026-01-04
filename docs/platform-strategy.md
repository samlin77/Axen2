# Platform Strategy: macOS First

**Version:** 1.0
**Date:** 2025-12-29
**Decision:** macOS First, Windows/Linux Later

---

## Strategy Overview

**Phase 1: macOS Only (v1.0)** - Q3 2025
- Single platform focus for faster iteration
- Universal binary (Intel + Apple Silicon)
- Code signed and notarized
- Target: macOS 12+ (Monterey and later)

**Phase 2: Windows Support (v1.1)** - Q4 2025
- Add Windows 10/11 support
- MSI installer with silent install
- Windows-specific features (Credential Manager, etc.)

**Phase 3: Linux Support (v1.2+)** - 2026
- Add Ubuntu 20.04+ support
- DEB/RPM packages
- Other distros as needed

---

## Rationale

### Why macOS First?

**1. Faster Time to Market**
- Single platform = faster development
- Easier testing and debugging
- Immediate value to design partners
- Learn and iterate quickly

**2. Developer Efficiency**
- No cross-platform compatibility issues to solve upfront
- Focus on features, not platform quirks
- Simpler CI/CD pipeline
- Less testing surface area

**3. Target Market Alignment**
- Many enterprise users (executives, analysts) use macOS
- Design partners likely on macOS
- Premium market segment
- Good for initial traction

**4. Technical Benefits**
- Native macOS Keychain integration (secure by default)
- Better performance on single platform
- Easier to optimize
- Can leverage macOS-specific features

---

## What This Means

### Development Priorities

**✅ Focus On:**
- macOS-specific optimizations
- Native macOS integrations (Keychain, menu bar, notifications)
- Universal binary support (Intel + Apple Silicon)
- Apple code signing and notarization
- macOS UI/UX conventions

**❌ Defer Until Later:**
- Windows Credential Manager integration
- Linux Secret Service integration
- Cross-platform installer formats (MSI, DEB, RPM)
- Platform-specific UI variations
- Windows/Linux testing infrastructure

### Architecture Implications

**Single Platform Simplifications:**
- Use macOS Keychain directly (not abstraction layer)
- Tauri config focused on macOS only
- CI/CD uses macOS runners only
- Documentation targets macOS users

**Future-Proofing:**
- Code structure allows adding platforms later
- Avoid macOS-only APIs where possible
- Use Tauri's cross-platform abstractions when available
- Document platform-specific code clearly

---

## Milestone Updates

All milestones (M0-M4) target macOS only:

**M0 (Week 0-2):** macOS "Hello World" App
- DMG installer
- Code signed & notarized
- Universal binary

**M1 (Week 3-8):** macOS Chat with SSO
**M2 (Week 9-16):** macOS MCP Integration
**M3 (Week 17-20):** macOS Full Feature Set
**M4 (Week 21-24):** macOS v1.0 GA Launch

---

## Epic Updates

**Epic 1:** macOS Desktop Foundation
- Story 1.1 updated for macOS-only bootstrap
- Code signing and notarization requirements
- macOS Keychain integration

**All Other Epics:** Built on macOS foundation

---

## Windows/Linux Roadmap

### Phase 2: Windows (v1.1) - Q4 2025

**New Requirements:**
- Windows 10/11 support
- MSI installer with silent install
- Windows Credential Manager integration
- Windows-specific proxy configuration
- SCCM/Intune deployment support

**Estimated Effort:** 4-6 weeks
- 2 weeks: Core platform support
- 2 weeks: Windows-specific features
- 1 week: Testing and bug fixes
- 1 week: Deployment and documentation

### Phase 3: Linux (v1.2+) - 2026

**New Requirements:**
- Ubuntu 20.04+ support
- DEB/RPM packages
- Secret Service integration
- Desktop environment compatibility (GNOME, KDE)

**Estimated Effort:** 4-6 weeks

---

## Migration Path

### From macOS to Multi-Platform

**Step 1: Abstraction Layer**
- Create platform abstraction interfaces
- Wrap macOS-specific code
- Prepare for platform variations

**Step 2: Windows Implementation**
- Implement Windows platform adapter
- Windows-specific UI tweaks
- Windows testing

**Step 3: Linux Implementation**
- Implement Linux platform adapter
- Linux-specific UI tweaks
- Linux testing

**Step 4: Unified Build**
- Single CI/CD pipeline for all platforms
- Platform-specific installers
- Cross-platform testing matrix

---

## Communication

### Stakeholder Message

*"We're launching on macOS first to deliver value faster. This allows us to iterate quickly with design partners and establish product-market fit. Windows and Linux support will follow in subsequent releases based on customer demand."*

### Customer FAQ

**Q: Will Windows/Linux be supported?**
A: Yes! macOS is our v1.0 launch platform. Windows support is planned for Q4 2025 (v1.1), and Linux support for 2026 (v1.2+).

**Q: Why macOS first?**
A: Single platform focus allows us to iterate faster, deliver higher quality, and incorporate early customer feedback before expanding to other platforms.

**Q: What about Intel vs Apple Silicon?**
A: We support both! Our macOS app is a universal binary that runs natively on both Intel and Apple Silicon Macs.

---

## Success Criteria

**v1.0 (macOS) Success:**
- ✅ 100+ macOS enterprise customers
- ✅ 5,000+ macOS licensed users
- ✅ 50+ NPS score
- ✅ <10% churn
- ✅ Customer demand for Windows validated

**Criteria to Add Windows:**
- 50+ customer requests for Windows support
- Proven product-market fit on macOS
- Stable feature set on macOS
- Engineering capacity available

---

## Risks & Mitigation

**Risk 1: Windows Customers Want Access Now**
- **Probability:** Medium
- **Impact:** Medium (potential revenue loss)
- **Mitigation:**
  - Clear roadmap communication
  - Windows beta program signup
  - Focus on macOS value proposition
  - Prioritize Windows based on demand

**Risk 2: Platform-Specific Code Hard to Port**
- **Probability:** Low
- **Impact:** High (delays Windows/Linux)
- **Mitigation:**
  - Use Tauri abstractions where possible
  - Document platform-specific code
  - Regular architecture reviews
  - Plan abstraction layer in v1.0

---

## Updated Documents

**Documents Reflecting macOS-First:**
- ✅ [milestones.md](milestones.md) - Updated all milestones for macOS
- ✅ [epic-1-foundation-authentication.md](epic-1-foundation-authentication.md) - Story 1.1 updated for macOS
- ✅ [platform-strategy.md](platform-strategy.md) - This document

**Documents Needing Future Updates:**
- PRD requirements (platform-specific notes)
- Architecture (Windows/Linux sections marked as future)
- Tech stack (macOS focus, Windows/Linux deferred)

---

**Approved By:** Winston (Architect)
**Date:** 2025-12-29
