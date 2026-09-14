'use client'

import { useEffect, useState } from 'react'
import { ReferenceDetailModal } from '@/components/reference-detail-modal'
import { ReferenceGrid } from '@/components/reference-grid'
import { SearchFilterPanel } from '@/components/search-filters'
import {
  EMPTY_FILTERS,
  hasAnyFilter,
  searchReferences,
  type SearchFilters,
} from '@/lib/search'
import type { DesignReference } from '@/lib/types'

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS)
  const [results, setResults] = useState<DesignReference[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = results.find((r) => r.id === selectedId) ?? null

  // 키워드는 입력이 멎은 뒤에 질의합니다. 필터 변경은 즉시 반영됩니다.
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(
      () => {
        setLoading(true)
        searchReferences(filters)
          .then((rows) => {
            if (!cancelled) {
              setResults(rows)
              setError(null)
            }
          })
          .catch((e: Error) => {
            if (!cancelled) setError(e.message)
          })
          .finally(() => {
            if (!cancelled) setLoading(false)
          })
      },
      filters.keyword.trim() === '' ? 0 : 250,
    )

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [filters])

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Promotion Page 레퍼런스 검색
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          키워드는 headline · benefit · cta · brand · campaign_name 에서 부분
          일치로 찾고, 아래 필터와 함께 모두 만족하는 결과만 보여줍니다.
        </p>
      </header>

      <input
        type="search"
        value={filters.keyword}
        onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        placeholder="키워드로 검색"
        aria-label="키워드 검색"
        className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100"
      />

      <div className="mt-5">
        <SearchFilterPanel
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
          showReset={hasAnyFilter(filters)}
        />
      </div>

      <section className="mt-8" aria-live="polite">
        <h2 className="mb-4 text-sm font-medium text-neutral-900 dark:text-neutral-100">
          검색 결과{' '}
          <span className="text-neutral-400">
            ({loading ? '…' : results.length})
          </span>
        </h2>

        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        ) : loading ? (
          <p className="rounded-lg border border-neutral-200 px-4 py-10 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            검색 중…
          </p>
        ) : results.length === 0 ? (
          <p className="rounded-lg border border-neutral-200 px-4 py-10 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            검색 결과가 없습니다
          </p>
        ) : (
          <ReferenceGrid
            items={results}
            onSelect={(r) => setSelectedId(r.id)}
            showTemplateAction
          />
        )}
      </section>

      {selected && (
        <ReferenceDetailModal
          key={selected.id}
          reference={selected}
          onClose={() => setSelectedId(null)}
          onSaved={(updated) =>
            setResults((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r)),
            )
          }
        />
      )}
    </main>
  )
}
