import { supabase } from '@/lib/supabase/client'
import { PHASE1_CATEGORY, type DesignReference } from '@/lib/types'

/** 키워드가 걸리는 컬럼들. 전부 부분 일치(ilike). */
const KEYWORD_COLUMNS = [
  'headline',
  'benefit',
  'cta',
  'brand',
  'campaign_name',
] as const

const SELECT_COLUMNS =
  'id, image_url, created_at, brand, industry, headline, benefit, cta, visual_focus, layout, copy_density, style, color_tone, category_metadata'

export type SearchFilters = {
  keyword: string
  industry: string
  page_type: string
  funnel_stage: string
  style: string[]
  color_tone: string[]
}

export const EMPTY_FILTERS: SearchFilters = {
  keyword: '',
  industry: '',
  page_type: '',
  funnel_stage: '',
  style: [],
  color_tone: [],
}

export function hasAnyFilter(f: SearchFilters): boolean {
  return (
    f.keyword.trim() !== '' ||
    f.industry !== '' ||
    f.page_type !== '' ||
    f.funnel_stage !== '' ||
    f.style.length > 0 ||
    f.color_tone.length > 0
  )
}

/**
 * PostgREST 의 or= 문법은 쉼표로 조건을 구분하고 괄호로 묶습니다. 키워드에
 * 쉼표나 괄호가 들어가면 "failed to parse logic tree" 로 깨지므로, 패턴 전체를
 * 큰따옴표로 감쌉니다. 그 안에서는 큰따옴표와 역슬래시만 이스케이프하면 됩니다.
 */
function toQuotedPattern(keyword: string): string {
  const escaped = keyword.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `"*${escaped}*"`
}

/**
 * 키워드와 필터를 모두 AND 로 겹쳐 검색합니다.
 *
 * 다중선택(style, color_tone)은 선택한 값 중 하나라도 포함하면 매칭입니다
 * (배열 overlaps). 서로 다른 필터끼리는 AND 입니다.
 */
export async function searchReferences(
  filters: SearchFilters,
  limit = 60,
): Promise<DesignReference[]> {
  let query = supabase
    .from('design_references')
    .select(SELECT_COLUMNS)
    .eq('category', PHASE1_CATEGORY)

  const keyword = filters.keyword.trim()
  if (keyword !== '') {
    const pattern = toQuotedPattern(keyword)
    query = query.or(
      KEYWORD_COLUMNS.map((c) => `${c}.ilike.${pattern}`).join(','),
    )
  }

  if (filters.industry !== '') {
    query = query.eq('industry', filters.industry)
  }

  // page_type 과 funnel_stage 는 category_metadata JSONB 안에 있습니다.
  if (filters.page_type !== '') {
    query = query.eq('category_metadata->>page_type', filters.page_type)
  }
  if (filters.funnel_stage !== '') {
    query = query.eq('category_metadata->>funnel_stage', filters.funnel_stage)
  }

  if (filters.style.length > 0) {
    query = query.overlaps('style', filters.style)
  }
  if (filters.color_tone.length > 0) {
    query = query.overlaps('color_tone', filters.color_tone)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`검색 실패: ${error.message}`)
  return (data ?? []) as DesignReference[]
}
