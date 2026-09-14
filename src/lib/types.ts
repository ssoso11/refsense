/** 업로드 대상 버켓. 마이그레이션의 버켓 id 와 일치해야 합니다. */
export const REFERENCES_BUCKET = 'references-images'

/** Phase 1 은 Digital Marketing(DA) 만 다룹니다. */
export const PHASE1_CATEGORY = 'digital_marketing'
export const PHASE1_SOURCE_TYPE = 'internal'

/*
 * 선택지 목록.
 *
 * visual_focus / layout / copy_density 는 DB 상 enum 이 아니라 자유 text 이고,
 * style / color_tone 은 text[] 입니다. 즉 DB 가 값을 검증해 주지 않으므로
 * 아래 목록이 사실상의 유일한 제약입니다. 라벨을 그대로 저장합니다.
 */
export const VISUAL_FOCUS_OPTIONS = [
  'Product',
  'Person',
  'Typography',
  'Illustration',
  'Brand',
] as const

export const LAYOUT_OPTIONS = [
  'Center',
  'Left',
  'Right',
  'Split',
  'Grid',
  'Full Image',
] as const

export const COPY_DENSITY_OPTIONS = ['Low', 'Medium', 'High'] as const

export const STYLE_OPTIONS = [
  'Minimal',
  'Premium',
  'Bold',
  'Pop',
  'Tech',
  'Luxury',
  'Casual',
  'Natural',
  'Retro',
] as const

export const COLOR_TONE_OPTIONS = [
  'Bright',
  'Dark',
  'Pastel',
  'Monochrome',
  'Vivid',
  'Neutral',
] as const

export const AD_FORMAT_OPTIONS = ['Banner', 'Native Ad', 'Rich Media'] as const

export const PLATFORM_OPTIONS = [
  'Naver',
  'Kakao',
  'Google GDN',
  'Meta',
  'Owned Site',
] as const

export const FUNNEL_STAGE_OPTIONS = [
  'Awareness',
  'Consideration',
  'Conversion',
] as const

export const ANIMATION_OPTIONS = ['Static', 'Animated'] as const

/**
 * DA 의 category_metadata 형태.
 *
 * design_references 에는 chk_da_metadata_shape CHECK 제약이 걸려 있습니다.
 * 빈 객체 {} 는 거부되지만 5개 키를 null 값으로 채우면 통과합니다. 그래서
 * 저장 시에는 항상 아래 5개 키를 모두 실어 보냅니다.
 */
export type DaCategoryMetadata = {
  ad_format: string | null
  ad_size: string | null
  platform: string | null
  funnel_stage: string | null
  animation: string | null
}

export const EMPTY_DA_METADATA: DaCategoryMetadata = {
  ad_format: null,
  ad_size: null,
  platform: null,
  funnel_stage: null,
  animation: null,
}

/** 그리드와 편집 폼이 함께 쓰는 행 모양. */
export type DesignReference = {
  id: string
  image_url: string
  created_at: string
  brand: string | null
  headline: string | null
  benefit: string | null
  cta: string | null
  visual_focus: string | null
  layout: string | null
  copy_density: string | null
  style: string[] | null
  color_tone: string[] | null
  category_metadata: DaCategoryMetadata | null
}

/** 사람이 직접 입력하는 값들. 폼 상태이자 저장 페이로드의 원본입니다. */
export type ReferenceFormValues = {
  headline: string
  benefit: string
  cta: string
  visual_focus: string
  layout: string
  copy_density: string
  style: string[]
  color_tone: string[]
  ad_format: string
  ad_size: string
  platform: string
  funnel_stage: string
  animation: string
}

/**
 * 카드 배지 판정.
 *
 * 별도의 상태 컬럼이 없어서, 분류의 핵심인 단일선택 3개가 모두 채워졌을 때
 * '입력 완료' 로 봅니다. 하나라도 비어 있으면 '분석 대기' 입니다.
 */
export function isMetadataComplete(ref: DesignReference): boolean {
  return Boolean(ref.visual_focus && ref.layout && ref.copy_density)
}

/** 행 -> 폼 초기값. 이미 입력된 값이 있으면 그대로 보여줍니다. */
export function toFormValues(ref: DesignReference): ReferenceFormValues {
  const meta = ref.category_metadata
  return {
    headline: ref.headline ?? '',
    benefit: ref.benefit ?? '',
    cta: ref.cta ?? '',
    visual_focus: ref.visual_focus ?? '',
    layout: ref.layout ?? '',
    copy_density: ref.copy_density ?? '',
    style: ref.style ?? [],
    color_tone: ref.color_tone ?? [],
    ad_format: meta?.ad_format ?? '',
    ad_size: meta?.ad_size ?? '',
    platform: meta?.platform ?? '',
    funnel_stage: meta?.funnel_stage ?? '',
    animation: meta?.animation ?? '',
  }
}

/** 한 파일의 업로드 진행 상태. */
export type UploadItem = {
  id: string
  file: File
  previewUrl: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}
