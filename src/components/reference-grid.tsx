import Image from 'next/image'
import type { DesignReference } from '@/lib/types'

export function ReferenceGrid({ items }: { items: DesignReference[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-neutral-200 px-4 py-10 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        아직 업로드된 레퍼런스가 없습니다.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <li
          key={item.id}
          className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800"
        >
          <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-900">
            <Image
              src={item.image_url}
              alt={item.headline ?? item.brand ?? '업로드된 DA 레퍼런스'}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain"
            />
          </div>
          <div className="px-3 py-2">
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {new Date(item.created_at).toLocaleString('ko-KR')}
            </p>
            <p className="mt-0.5 truncate text-xs text-neutral-400 dark:text-neutral-500">
              분석 대기
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
