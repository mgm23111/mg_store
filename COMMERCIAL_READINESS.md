# MG Store - Commercial Readiness (Mar 10, 2026)

## Current Assessment

The platform is feature-rich and close to production, but it was not yet "100% commercial" due to security and operational gaps.

## Improvements Applied in This Pass

- Removed insecure password hash endpoint from auth controller.
- Tightened public route surface in security configuration.
- Migrated public order confirmation flow from internal `orderId` to `orderNumber`.
- Added public shipping-tracking endpoint by `orderNumber`.
- Removed hardcoded payment keys from default/dev properties (now environment-driven).
- Removed insecure default key fallback from `CulqiService`.
- Replaced `System.out`/`printStackTrace` patterns with structured logging in critical backend services.
- Added Spring Boot Actuator + Prometheus registry dependencies for monitoring readiness.
- Added CI pipeline (`.github/workflows/ci.yml`) with backend and frontend jobs.
- Removed hardcoded admin test credentials from login page.
- Fixed frontend TypeScript issue in payment component.
- Added in-memory rate limiting for login/checkout/card payment endpoints.
- Added API security headers filter.
- Added admin write-operation audit log filter.
- Added unit tests for rate limiting logic.
- Added legal pages (terms/privacy/cookies) and cookie consent banner with local traceability.
- Added Playwright E2E suite skeleton (legal flows and admin auth guard).
- Added optional monitoring stack in Docker Compose (`Prometheus + Grafana`) with initial alert rules.

## Validation Performed

- Frontend TypeScript check: `npm exec tsc -- --noEmit` -> PASS.
- Backend Maven compile/test could not be executed in this sandbox because Maven is forced to use a non-writable global local repository path.

## Remaining Work to Reach Full Commercial Grade

- Security hardening:
  - Add WAF/reverse-proxy security headers at edge.
  - Add secrets rotation policy and centralized secret manager.
- Quality:
  - Run full backend test suite in CI and add integration tests for payments/shipping workflows.
  - Expand E2E to checkout success/failure and full admin order lifecycle.
- Operations:
  - Add error monitoring (Sentry or equivalent).
  - Define production dashboards and alert routing (email/Slack/PagerDuty).
  - Add backup/restore drills for PostgreSQL.
- Compliance/business:
  - Persist legal acceptance evidence in backend (DB) for auditable consent history.
  - PCI scope confirmation (tokenization boundary with Culqi).
  - Incident response and audit logging policy.

## Conclusion

The system is now more secure and production-aligned. It is significantly closer to commercial deployment, but still needs operational, compliance, and full CI test execution closure to claim "100% commercial" with low risk.
