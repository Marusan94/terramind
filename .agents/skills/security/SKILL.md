---
name: security
description: Audits code for credential exposure, SQL injection in PostGIS spatial queries, prompt injection in agent workflows, and data sanitization for Terramind.
---

# 🛡️ Security Engineer Skill — Terramind

## Role Overview
The Security Engineer skill protects the platform from common vulnerabilities, credential leakage, malicious GIS payload injection, and agent subversion.

## Security Checklists
1. **Credentials & Secrets**:
   - Zero hardcoded tokens in commits.
   - Access tokens (OpenRouter, Mapbox, Copernicus) loaded strictly from environment variables.
2. **Spatial SQL Sanitization**:
   - Never use f-strings or manual string formatting to build PostGIS queries from user inputs.
   - Use SQLAlchemy parameterized queries or GeoAlchemy2 functions to bind spatial parameters safely.
3. **GeoJSON & Coordinate Boundary Validation**:
   - Validate that incoming coordinates fall within realistic boundaries (-180 to 180 longitude, -90 to 90 latitude).
   - Set request size limits on uploaded GeoJSON files to avoid memory exhaustion attacks.
4. **Agent Prompt Hardening**:
   - Delimit untrusted user inputs when providing context to LLMs.
   - Guard against instructions attempting to override scientific safety guidelines or bypass spatial filters.
