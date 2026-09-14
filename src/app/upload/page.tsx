'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { ReferenceDetailModal } from '@/components/reference-detail-modal'
import { ReferenceGrid } from '@/components/reference-grid'
import { UploadDropzone } from '@/components/upload-dropzone'
import {
  fetchReferenceById,
  fetchReferences,
  uploadReference,
} from '@/lib/upload'
import { toFormValues } from '@/lib/types'
import type {
  DesignReference,
  ReferenceFormValues,
  UploadItem,
} from '@/lib/types'

// useSearchParams 는 Suspense 경계 안에서만 쓸 수 있습니다.
export default function UploadPage() {
  return (
    <Suspense fallback={null}>
      <UploadPageContent />
    </Suspense>
  )
}

function UploadPageContent() {
  const [references, setReferences] = useState<DesignReference[]>([])
  const [queue, setQueue] = useState<UploadItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // '이 스타일로 새로 시작' 으로 넘어온 경우, 원본에서 복사한 폼 초기값.
  const templateId = useSearchParams().get('from')
  const [template, setTemplate] = useState<ReferenceFormValues | null>(null)
  const [templateSource, setTemplateSource] = useState<DesignReference | null>(
    null,
  )
  const [templateError, setTemplateError] = useState<string | null>(null)

  // 템플릿이 걸린 동안 올린 행들. 이 행들의 모달만 복사값으로 엽니다.
  const [templatedIds, setTemplatedIds] = useState<Set<string>>(new Set())

  // 저장 후 갱신된 행이 모달에 그대로 반영되도록 id 로 찾아 씁니다.
  const selected = references.find((r) => r.id === selectedId) ?? null

  useEffect(() => {
    fetchReferences()
      .then(setReferences)
      .catch((e: Error) => setLoadError(e.message))
  }, [])

  useEffect(() => {
    if (!templateId) {
      setTemplate(null)
      setTemplateSource(null)
      setTemplateError(null)
      return
    }
    let cancelled = false
    fetchReferenceById(templateId)
      .then((ref) => {
        if (cancelled) return
        if (!ref) {
          setTemplateError('원본 레퍼런스를 찾을 수 없습니다.')
          return
        }
        setTemplateSource(ref)
        setTemplate(toFormValues(ref))
        setTemplateError(null)
      })
      .catch((e: Error) => {
        if (!cancelled) setTemplateError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [templateId])

  // 큐의 objectURL 정리
  useEffect(() => {
    return () => {
      queue.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFiles = useCallback(
    async (files: File[]) => {
      const items: UploadItem[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending',
      }))

      setQueue((prev) => [...prev, ...items])
      setUploading(true)

      const createdIds: string[] = []

      // 한 장씩 순차 업로드. 한 장이 실패해도 나머지는 계속 진행합니다.
      for (const item of items) {
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading' } : q)),
        )
        try {
          const created = await uploadReference(item.file)
          createdIds.push(created.id)
          setReferences((prev) => [created, ...prev])
          setQueue((prev) =>
            prev.map((q) => (q.id === item.id ? { ...q, status: 'done' } : q)),
          )
        } catch (e) {
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? { ...q, status: 'error', error: (e as Error).message }
                : q,
            ),
          )
        }
      }

      setUploading(false)

      // 템플릿이 걸려 있으면 이번에 올린 행들을 기록하고, 첫 장의 폼을
      // 복사값이 채워진 채로 바로 엽니다.
      if (template && createdIds.length > 0) {
        setTemplatedIds((prev) => new Set([...prev, ...createdIds]))
        setSelectedId(createdIds[0])
      }
    },
    [template],
  )

  const failed = queue.filter((q) => q.status === 'error')
  const succeeded = queue.filter((q) => q.status === 'done').length

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Promotion Page 레퍼런스 업로드
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Promotion Page · 내부 레퍼런스. 업로드하면 메타데이터는 비어 있는
          상태로 저장되고, 카드를 클릭해 직접 입력할 수 있습니다.
        </p>
      </header>

      {templateError && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
          {templateError} 값 복사 없이 일반 업로드로 진행됩니다.
        </p>
      )}

      {templateSource && (
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-neutral-700 dark:text-neutral-200">
            <span className="font-medium">
              {templateSource.headline ??
                templateSource.brand ??
                '선택한 레퍼런스'}
            </span>
            의 값을 복사해 시작합니다. 업로드하면 입력 폼이 채워진 채로 열립니다.
          </span>
          <Link
            href="/upload"
            className="text-neutral-500 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            값 복사 없이 시작
          </Link>
        </div>
      )}

      <UploadDropzone onFiles={handleFiles} disabled={uploading} />

      {queue.length > 0 && (
        <section className="mt-6" aria-live="polite">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            {uploading
              ? `업로드 중… ${succeeded}/${queue.length}`
              : `업로드 완료 ${succeeded}/${queue.length}`}
          </p>

          {failed.length > 0 && (
            <ul className="mt-3 space-y-1">
              {failed.map((item) => (
                <li
                  key={item.id}
                  className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300"
                >
                  <span className="font-medium">{item.file.name}</span> —{' '}
                  {item.error}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-4 text-sm font-medium text-neutral-900 dark:text-neutral-100">
          업로드된 레퍼런스{' '}
          <span className="text-neutral-400">({references.length})</span>
        </h2>

        {loadError ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
            {loadError}
          </p>
        ) : (
          <ReferenceGrid items={references} onSelect={(r) => setSelectedId(r.id)} />
        )}
      </section>

      {selected && (
        <ReferenceDetailModal
          key={selected.id}
          reference={selected}
          initialValues={
            template && templatedIds.has(selected.id) ? template : undefined
          }
          onClose={() => setSelectedId(null)}
          onSaved={(updated) =>
            setReferences((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r)),
            )
          }
        />
      )}
    </main>
  )
}
