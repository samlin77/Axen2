# 11. Development Workflow

## 11.1 Repository Structure

```
dive-app/
├── src/
│   ├── frontend/          # React/TypeScript UI
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   ├── backend/           # ADK Backend
│   │   ├── agents/        # ADK agents
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data models
│   │   ├── database/      # DB migrations and schemas
│   │   └── utils/
│   ├── mcp-defender/      # Security layer
│   │   ├── detector/
│   │   ├── consent/
│   │   └── logger/
│   └── tauri/             # Rust Tauri backend
│       ├── src/
│       └── Cargo.toml
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/               # Build and deployment scripts
├── docs/                  # Architecture and PRD
├── .github/
│   └── workflows/         # CI/CD pipelines
├── package.json
├── pyproject.toml
└── README.md
```

## 11.2 Development Environment Setup

**Prerequisites:**
- Node.js 20+ (for frontend)
- Python 3.11+ (for backend)
- Rust 1.70+ (for Tauri)
- SQLite 3.40+

**Setup Steps:**
```bash
# Clone repository
git clone https://github.com/company/dive-app.git
cd dive-app

# Install frontend dependencies
npm install

# Install backend dependencies
cd src/backend
pip install -e ".[dev]"

# Run development mode
npm run tauri dev
```

## 11.3 CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          npm ci
          pip install -e ".[dev]"

      - name: Run linters
        run: |
          npm run lint
          black --check src/backend

      - name: Run unit tests
        run: |
          npm test
          pytest tests/unit

      - name: Run integration tests
        run: pytest tests/integration

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Security scan
        run: |
          npm audit
          pip-audit

  build:
    needs: test
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - uses: actions/checkout@v3

      - name: Build application
        run: npm run tauri build

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dive-app-${{ matrix.os }}
          path: src-tauri/target/release/bundle/
```

---
