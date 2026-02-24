<!-- 
Sync Impact Report
- Version change: none -> 1.0.0
- List of modified principles:
  - PRINCIPLE_1: High Code Quality
  - PRINCIPLE_2: Rigorous Testing Standards
  - PRINCIPLE_3: UX Consistency & Premium Aesthetics
  - PRINCIPLE_4: Performance Excellence
- Added sections: Core Principles, Governance
- Templates requiring updates: ✅ updated
- Follow-up TODOs: none
-->

# gamasa-properties Constitution

## Core Principles

### I. High Code Quality
Technical debt is treated as a priority bug. All code MUST be readable, maintainable, and follow semantic naming conventions. Modularity is key—functions should do one thing well. Avoid hardcoded values; use configuration or environment variables. Document complex logic inline and maintain clear API boundaries.

### II. Rigorous Testing Standards
No feature is considered "done" without associated tests. Unit tests MUST cover all business logic and edge cases. Critical paths and inter-service communications (especially Supabase integrations) SHOULD include integration tests. Red-Green-Refactor is the preferred development cycle.

### III. UX Consistency & Premium Aesthetics
The user experience MUST feel premium, modern, and fluid. We prioritize vibrant color palettes, dark mode support, and glassmorphism-inspired components. Micro-animations and smooth transitions MUST be used to enhance interaction. UI components SHOULD be reusable and consistent across all pages.

### IV. Performance Excellence
Fast page load times and snappy interactions are non-negotiable. Images MUST be optimized and lazy-loaded. Database queries MUST be efficient and utilize proper indexing. Minimize client-side bundle size by using vanilla HTML, CSS, and JavaScript where possible, avoiding unnecessary heavy libraries.

### V. Security-First Architecture & Data Integrity
User data protection is paramount. Row Level Security (RLS) MUST be strictly enforced on all Supabase tables. Sensitive information (especially passwords and PII) MUST NOT be stored in plaintext or leaked to the client. Authentication checks MUST be performed on all protected routes. Hardcoded "Mock Modes" are prohibited in production; environment-based configuration is mandatory. SQL injection risks MUST be mitigated by using parameterized queries or Supabase client helpers.

All development decisions MUST reference the project's canonical documentation located in `docs/` following this strict priority:

1. **Primary Authority:** `docs/SOURCE-OF-TRUTH.pdf`
2. **Booking State Changes:** `docs/architecture/state-machine.pdf`
3. **Database Rules:** `docs/db/business-rules.pdf`
4. **Schema & Logic:** `docs/db/schema-and-state-machine.md`
5. **System Flow:** `docs/architecture/flow-diagram.pdf`
6. **Detailed Analysis:** `docs/decisions/unified-analysis.md`

When there is any conflict between implementation and documentation, the documentation ranking above is the ultimate authority.

## Governance

The Project Constitution serves as the ultimate authority for development quality and standards. All implementations MUST align with these principles.

### Amendment Procedure
1. Propose changes to the constitution via the `specify` CLI.
2. Review the impact on existing specifications and task lists.
3. Update versioning and ratify the new version.

### Compliance Review
Every Task and Implementation plan must include a "Constitution Compliance" check. Deviations from the constitution MUST be explicitly justified and documented.

**Version**: 1.0.0 | **Ratified**: 2026-02-24 | **Last Amended**: 2026-02-24
