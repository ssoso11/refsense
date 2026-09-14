import Image from 'next/image'
import { isMetadataComplete, type DesignReference } from '@/lib/types'

type Props = {
  items: DesignReference[]
  onSelect: (reference: DesignReference) => void
}

export function ReferenceGrid({ items, onSelect }: Props) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-neutral-200 px-4 py-10 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        아직 업로드된 레퍼런스가 없습니다.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const complete = isMetadataComplete(item)
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="w-full overflow-hidden rounded-lg border border-neutral-200 text-left transition-colors hover:border-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-600 dark:focus-visible:ring-neutral-100"
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
                  {item.headline ?? new Date(item.created_at).toLocaleString('ko-KR')}
                </p>
                <p
                  className={[
                    'mt-1 inline-block rounded-full px-2 py-0.5 text-[11px]',
                    complete
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400',
                  ].join(' ')}
                >
                  {complete ? '입력 완료' : '분석 대기'}
                </p>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
