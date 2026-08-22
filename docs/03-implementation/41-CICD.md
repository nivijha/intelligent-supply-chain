# CI/CD

---

## 36. CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Run lint
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: docker-compose build

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Render
        run: |
          # Deploy backend
          # Deploy ML service
          # Deploy frontend to Vercel
```

### Pipeline Steps

1. **Git Push** to main/develop branch
2. **Test** - Unit tests, integration tests
3. **Lint** - Code formatting checks
4. **Build** - Docker image build
5. **Deploy** - Push to production (main branch only)

### Environments

| Environment | Branch | Purpose |
|-------------|--------|---------|
| Development | develop | Active development |
| Staging | main (PR) | Pre-production testing |
| Production | main (merge) | Live deployment |
