'use client'

import { useCallback, useEffect, useState } from 'react'
import { ReferenceDetailModal } from '@/components/reference-detail-modal'
import { ReferenceGrid } from '@/components/reference-grid'
import { UploadDropzone } from '@/components/upload-dropzone'
import { fetchReferences, uploadReference } from '@/lib/upload'
import type { DesignReference, UploadItem } from '@/lib/types'

export default function UploadPage() {
  const [references, setReferences] = useState<DesignReference[]>([])
  const [queue, setQueue] = useState<UploadItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // 저장 후 갱신된 행이 모달에 그대로 반영되도록 id 로 찾아 씁니다.
  const selected = references.find((r) => r.id === selectedId) ?? null

  useEffect(() => {
    fetchReferences()
      .then(setReferences)
      .catch((e: Error) => setLoadError(e.message))
  }, [])

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

      // 한 장씩 순차 업로드. 한 장이 실패해도 나머지는 계속 진행합니다.
      for (const item of items) {
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading' } : q)),
        )
        try {
          const created = await uploadReference(item.file)
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
    },
    [],
  )

  const failed = queue.filter((q) => q.status === 'error')
  const succeeded = queue.filter((q) => q.status === 'done').length

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          DA 레퍼런스 업로드
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Digital Marketing · 내부 레퍼런스. 업로드하면 메타데이터는 비어 있는
          상태로 저장되고, 이후 AI 분석 단계에서 채워집니다.
        </p>
      </header>

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
