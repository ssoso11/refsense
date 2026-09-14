# Project

Design Reference Intelligence — Phase 1 (DA-first)

## Goal

Build a design-reference intelligence service for the agency's full design department.
The long-term architecture supports 11 design categories (Website, Promotion Page,
Campaign KV, Print Design, Digital Marketing, OOH Advertising, Offline Event,
Package Design, Video Graphics, Branding, AI Generated Visual), but Phase 1
development targets **only Digital Marketing (DA)** — banner, native ad, and rich
media assets. Product detail pages are explicitly excluded from DA.

The Phase 1 product must allow users to:

1. Upload DA reference images (internal + external)
2. Automatically analyze images using Claude (DA-specific metadata schema)
3. Search DA references using natural language
4. Find similar DA references
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
- DA's `category_metadata` shape: `ad_format`, `ad_size`, `platform`,
  `funnel_stage`, `animation`. See `da_image_analysis_prompt.md`.

## Principles

- Keep architecture simple.
- Do not over-engineer.
- Do not add features that were not requested.
- Do not introduce another framework without approval.
- Use Supabase for database, authentication and storage.
- All database changes must use migrations.
- Never hard-code API keys.
- Keep Phase 2 features out of Phase 1.
- Do not implement categories other than Digital Marketing (DA) in Phase 1,
  even though the schema supports them.
- Before modifying multiple files, explain the proposed changes.
- After implementation, run the relevant checks.
- Fix errors before declaring the task complete.

## Phase 1 Out of Scope

- Any design category other than Digital Marketing (DA)
- Product detail page assets (excluded from DA)
- AI image generation
- Canvas editor
- Design generation / Copy generation
- Fine tuning
- User preference learning

## UX Principle

Search → Explore → Understand → Save

Never make the interface more complicated than necessary.
