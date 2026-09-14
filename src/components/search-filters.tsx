'use client'

import { MultiSelectField, SelectField } from '@/components/form-fields'
import {
  COLOR_TONE_OPTIONS,
  FUNNEL_STAGE_OPTIONS,
  INDUSTRY_OPTIONS,
  PAGE_TYPE_OPTIONS,
  STYLE_OPTIONS,
} from '@/lib/types'
import type { SearchFilters } from '@/lib/search'

type Props = {
  filters: SearchFilters
  onChange: (next: SearchFilters) => void
  onReset: () => void
  showReset: boolean
}

export function SearchFilterPanel({
  filters,
  onChange,
  onReset,
  showReset,
}: Props) {
  function set<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <section className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
          필터
        </h2>
        {showReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            초기화
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <SelectField
          label="Industry"
          value={filters.industry}
          options={INDUSTRY_OPTIONS}
          onChange={(v) => set('industry', v)}
        />
        <SelectField
          label="Page Type"
          value={filters.page_type}
          options={PAGE_TYPE_OPTIONS}
          onChange={(v) => set('page_type', v)}
        />
        <SelectField
          label="Funnel Stage"
          value={filters.funnel_stage}
          options={FUNNEL_STAGE_OPTIONS}
          onChange={(v) => set('funnel_stage', v)}
        />
      </div>

      <div className="mt-5 space-y-5">
        <MultiSelectField
          label="Style (하나라도 포함)"
          values={filters.style}
          options={STYLE_OPTIONS}
          onChange={(v) => set('style', v)}
        />
        <MultiSelectField
          label="Color Tone (하나라도 포함)"
          values={filters.color_tone}
          options={COLOR_TONE_OPTIONS}
          onChange={(v) => set('color_tone', v)}
        />
      </div>
    </section>
  )
}
