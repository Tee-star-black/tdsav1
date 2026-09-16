# TeleDoctorSA Blog CMS

A self-contained workspace for the TeleDoctorSA Blog & Insights publishing experience.

## Goal

Give non-technical TeleDoctorSA staff a calm, polished workflow to create, review, schedule, publish and manage website content without editing production HTML or using Git.

## Current milestone

Phase 1 establishes the visual publishing studio and domain structure inside the existing `tdsav1` repository. It is intentionally isolated from the live website until the CMS and deployment gates are connected.

## Workspace

- `prototype/` — interactive dashboard/editor prototype
- `schemas/` — content model documentation and eventual Sanity schemas
- `scripts/` — publication/generation tooling
- `docs/` — implementation notes and operational decisions

## Product principles

1. Writing comes first. The interface should feel editorial, not like an enterprise database.
2. Draft is not live. Published in the CMS is not considered live until production verification succeeds.
3. Clinical content carries reviewer/source metadata.
4. Public pages remain static and resilient.
5. Existing TeleMedia content and URLs are preserved during migration.
6. The workspace must not modify the current production site until integration is explicitly enabled.

## Local prototype

Open `prototype/index.html` directly in a browser. No dependencies are required for the first visual milestone.

## Next integration

The production implementation will connect this workspace to Sanity Studio/Content Lake, generated static blog pages, signed publication events and the existing TeleDoctor deployment path.