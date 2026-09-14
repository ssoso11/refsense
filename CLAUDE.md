# Project

Design Reference Intelligence — Phase 1 (Promotion Page)

## Goal

Build a design-reference intelligence service for the agency's full design department.
The long-term architecture supports 11 design categories (Website, Promotion Page,
Campaign KV, Print Design, Digital Marketing, OOH Advertising, Offline Event,
Package Design, Video Graphics, Branding, AI Generated Visual), but Phase 1
development targets **only Promotion Page** (`promotion_page`).

**Digital Marketing (DA) is on hold (잠정 보류) as of 2026-09-14.** Phase 1
originally targeted DA; the target changed to Promotion Page. DA data already in
`design_references` and DA-related code (option lists, `DaCategoryMetadata`,
`chk_da_metadata_shape`) are **kept, not deleted**, so DA can resume later.
Only newly uploaded rows use `category = 'promotion_page'`.

The Phase 1 product must allow users to:

1. Upload Promotion Page reference images (internal + external)
2. Fill in reference metadata — currently by hand; Claude-based automatic
   analysis is the next step
3. Search Promotion Page references using natural language
4. Find similar Promotion Page references
5. Save references into project boards

## Primary User

Promotion/DA designers working in an advertising agency.

## Tech Stack

- Next.js
- TypeScript
- Supabase (Postgres, Auth, Storage, pgvector)
- Anthropic API (Claude — image analysis)
- Voyage Multimodal Embeddings
- Vercel

## Data Model Principle

- The main table is named `design_references` (NOT `references` — that word is
  a reserved keyword in PostgreSQL and cannot be used as a table name).
- The `design_references` table is category-agnostic at its core (brand, industry,
  visual_focus, layout, style, copy_density, color_tone, headline, benefit, cta).
- Category-specific fields live in the `category_metadata` JSONB column.
- The `category` enum already contains all 11 categories so future phases don't
  require a schema migration to add a new category — only a new
  `category_metadata` shape and a new Claude analysis prompt.
- Promotion Page's `category_metadata` shape (Phase 1 current): `page_type`,
  `structure`, `video_used`, `cta_style`, `funnel_stage`.
- DA's `category_metadata` shape (on hold): `ad_format`, `ad_size`, `platform`,
  `funnel_stage`, `animation`. See `da_image_analysis_prompt.md`.
- Constraint asymmetry to be aware of: `chk_da_metadata_shape` applies **only**
  to rows with `category = 'digital_marketing'`. There is no equivalent CHECK for
  `promotion_page`, so an empty or malformed `category_metadata` will be accepted
  by the database. Until such a constraint exists, the shape is enforced only by
  `PpCategoryMetadata` and `updateReference()` in the application.

## Principles

- Keep architecture simple.
- Do not over-engineer.
- Do not add features that were not requested.
- Do not introduce another framework without approval.
- Use Supabase for database, authentication and storage.
- All database changes must use migrations.
- Never hard-code API keys.
- Keep Phase 2 features out of Phase 1.
- Do not implement categories other than Promotion Page in Phase 1, even though
  the schema supports them.
- Do not delete DA data or DA code while DA is on hold.
- Before modifying multiple files, explain the proposed changes.
- After implementation, run the relevant checks.
- Fix errors before declaring the task complete.

## Phase 1 Out of Scope

- Any design category other than Promotion Page
- Digital Marketing (DA) — on hold, existing data and code retained
- AI image generation
- Canvas editor
- Design generation / Copy generation
- Fine tuning
- User preference learning

## UX Principle

Search → Explore → Understand → Save

Never make the interface more complicated than necessary.
