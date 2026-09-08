---
name: qa
description: Implements automated test suites, PostGIS spatial query validation, API integration tests, and frontend UI tests for Terramind.
---

# 🧪 QA Engineer Skill — Terramind

## Role Overview
The QA Engineer skill verifies the correctness, stability, and spatial accuracy of Terramind through automated test suites, property-based tests, and integration assertions.

## Testing Standards
1. **Backend Tests (`tests/` & `apps/api/tests/`)**:
   - Framework: `pytest`, `pytest-asyncio`, `httpx`.
   - Spatial tests: Assert that sample points inside a known polygon return `True` for `ST_Contains` and points outside return `False`.
   - Ensure mocking of external LLM API calls and satellite image download endpoints in unit test suites.
2. **Frontend Tests (`apps/web/`)**:
   - Framework: Vitest / React Testing Library.
   - Assert map viewport initialization and proper state dispatch when layers are toggled.
3. **CI/CD Pipeline Validation**:
   - Run linter checks (Ruff, ESLint).
   - Enforce minimum test coverage before merging pull requests.
