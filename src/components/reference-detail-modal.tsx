'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import {
  COLOR_TONE_OPTIONS,
  COPY_DENSITY_OPTIONS,
  CTA_STYLE_OPTIONS,
  FUNNEL_STAGE_OPTIONS,
  LAYOUT_OPTIONS,
  PAGE_TYPE_OPTIONS,
  STRUCTURE_OPTIONS,
  STYLE_OPTIONS,
  VIDEO_USED_OPTIONS,
  VISUAL_FOCUS_OPTIONS,
  toFormValues,
  type DesignReference,
  type ReferenceFormValues,
} from '@/lib/types'
import { updateReference } from '@/lib/upload'

const labelClass =
  'block text-xs font-medium text-neutral-700 dark:text-neutral-300'
const inputClass =
  'mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100'

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        <option value="">선택 안 함</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

function MultiSelectField({
  label,
  values,
  options,
  onChange,
}: {
  label: string
  values: string[]
  options: readonly string[]
  onChange: (v: string[]) => void
}) {
  function toggle(option: string) {
    onChange(
      values.includes(option)
        ? values.filter((v) => v !== option)
        : [...values, option],
    )
  }

  return (
    <fieldset>
      <legend className={labelClass}>{label}</legend>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const selected = values.includes(option)
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(option)}
              className={[
                'rounded-full border px-3 py-1 text-xs transition-colors',
                selected
                  ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
                  : 'border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600',
              ].join(' ')}
            >
              {option}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

type Props = {
  reference: DesignReference
  onClose: () => void
  onSaved: (updated: DesignReference) => void
}

export function ReferenceDetailModal({ reference, onClose, onSaved }: Props) {
  // 폼 초기값은 마운트 시 한 번만 잡습니다. 다른 카드를 열면 호출부에서
  // key={reference.id} 로 리마운트되므로 effect 로 동기화할 필요가 없습니다.
  const [values, setValues] = useState<ReferenceFormValues>(() =>
    toFormValues(reference),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Esc 로 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  function set<K extends keyof ReferenceFormValues>(
    key: K,
    value: ReferenceFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      onSaved(await updateReference(reference.id, values))
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reference-detail-title"
        className="w-full max-w-3xl rounded-xl bg-white shadow-xl dark:bg-neutral-950"
      >
        <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <h2
            id="reference-detail-title"
            className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
          >
            레퍼런스 메타데이터 입력
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
          >
            닫기
          </button>
        </header>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
              <Image
                src={reference.image_url}
                alt="선택한 Promotion Page 레퍼런스"
                fill
                sizes="200px"
                className="object-contain"
              />
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Brand"
                  value={values.brand}
                  onChange={(v) => set('brand', v)}
                  placeholder="브랜드 / 클라이언트명"
                />
                <TextField
                  label="Industry"
                  value={values.industry}
                  onChange={(v) => set('industry', v)}
                  placeholder="업종명"
                />
              </div>
              <TextField
                label="Headline"
                value={values.headline}
                onChange={(v) => set('headline', v)}
                placeholder="광고 헤드라인"
              />
              <TextField
                label="Benefit"
                value={values.benefit}
                onChange={(v) => set('benefit', v)}
                placeholder="소구 혜택"
              />
              <TextField
                label="CTA"
                value={values.cta}
                onChange={(v) => set('cta', v)}
                placeholder="예: 지금 신청하기"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <SelectField
              label="Visual Focus"
              value={values.visual_focus}
              options={VISUAL_FOCUS_OPTIONS}
              onChange={(v) => set('visual_focus', v)}
            />
            <SelectField
              label="Layout"
              value={values.layout}
              options={LAYOUT_OPTIONS}
              onChange={(v) => set('layout', v)}
            />
            <SelectField
              label="Copy Density"
              value={values.copy_density}
              options={COPY_DENSITY_OPTIONS}
              onChange={(v) => set('copy_density', v)}
            />
          </div>

          <div className="mt-6 space-y-5">
            <MultiSelectField
              label="Style (다중선택)"
              values={values.style}
              options={STYLE_OPTIONS}
              onChange={(v) => set('style', v)}
            />
            <MultiSelectField
              label="Color Tone (다중선택)"
              values={values.color_tone}
              options={COLOR_TONE_OPTIONS}
              onChange={(v) => set('color_tone', v)}
            />
          </div>

          <fieldset className="mt-7 border-t border-neutral-200 pt-5 dark:border-neutral-800">
            <legend className="px-0 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              Promotion Page 상세 (category_metadata)
            </legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <SelectField
                label="Page Type"
                value={values.page_type}
                options={PAGE_TYPE_OPTIONS}
                onChange={(v) => set('page_type', v)}
              />
              <SelectField
                label="Structure"
                value={values.structure}
                options={STRUCTURE_OPTIONS}
                onChange={(v) => set('structure', v)}
              />
              <SelectField
                label="Video Used"
                value={values.video_used}
                options={VIDEO_USED_OPTIONS}
                onChange={(v) => set('video_used', v)}
              />
              <SelectField
                label="CTA Style"
                value={values.cta_style}
                options={CTA_STYLE_OPTIONS}
                onChange={(v) => set('cta_style', v)}
              />
              <SelectField
                label="Funnel Stage"
                value={values.funnel_stage}
                options={FUNNEL_STAGE_OPTIONS}
                onChange={(v) => set('funnel_stage', v)}
              />
            </div>
          </fieldset>

          {error && (
            <p className="mt-5 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}

          <div className="mt-7 flex justify-end gap-2 border-t border-neutral-200 pt-5 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {saving ? '저장 중…' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
