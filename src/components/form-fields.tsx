'use client'

const labelClass =
  'block text-xs font-medium text-neutral-700 dark:text-neutral-300'
const inputClass =
  'mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100'

export function TextField({
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

export function SelectField({
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
  // 이 컬럼들은 DB 가 값을 검증하지 않아 목록 밖 값이 들어 있을 수 있습니다.
  // 그대로 두면 select 가 빈 값으로 보이다가 저장 시 지워지므로 선택지로 살려둡니다.
  const unlisted = value !== '' && !options.includes(value)

  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        <option value="">선택 안 함</option>
        {unlisted && <option value={value}>{value} (목록 외)</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

export function MultiSelectField({
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
