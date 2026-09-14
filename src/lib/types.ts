/** 업로드 대상 버켓. 마이그레이션의 버켓 id 와 일치해야 합니다. */
export const REFERENCES_BUCKET = 'references-images'

/**
 * Phase 1 개발 대상 카테고리.
 *
 * 2026-09-14 부터 Digital Marketing(DA) -> Promotion Page 로 전환했습니다.
 * DA 는 잠정 보류이며, 이미 쌓인 DA 데이터와 아래 DA 관련 정의는 지우지 않고
 * 그대로 둡니다. 새로 업로드되는 행만 promotion_page 로 들어갑니다.
 */
export const PHASE1_CATEGORY = 'promotion_page'
export const PHASE1_SOURCE_TYPE = 'internal'

/** 잠정 보류된 DA 카테고리 값. 기존 데이터 조회용으로 남겨둡니다. */
export const DA_CATEGORY = 'digital_marketing'

/*
 * 선택지 목록.
 *
 * visual_focus / layout / copy_density 는 DB 상 enum 이 아니라 자유 text 이고,
 * style / color_tone 은 text[] 입니다. 즉 DB 가 값을 검증해 주지 않으므로
 * 아래 목록이 사실상의 유일한 제약입니다. 라벨을 그대로 저장합니다.
 *
 * 이 코어 필드들은 카테고리와 무관하게 공통입니다.
 */
export const INDUSTRY_OPTIONS = [
  '금융',
  '게임',
  '뷰티',
  '패션',
  '식품/음료',
  '가전/생활가전',
  '이커머스/리테일',
  'IT/테크',
  '자동차',
  '교육',
  '헬스케어',
  '여행',
  '엔터테인먼트',
  '공공기관',
  '기타',
] as const

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

/** funnel_stage 는 DA 와 Promotion Page 가 같은 값을 씁니다. */
export const FUNNEL_STAGE_OPTIONS = [
  'Awareness',
  'Consideration',
  'Conversion',
] as const

/* --- Promotion Page 전용 (Phase 1 현행) --------------------------------- */

export const PAGE_TYPE_OPTIONS = [
  'Event',
  'Product Launch',
  'Sale',
  'Pre-order',
  'Membership',
  'Brand Campaign',
] as const

export const STRUCTURE_OPTIONS = [
  'Single Page',
  'Multi Section',
  'Multi Step',
] as const

export const VIDEO_USED_OPTIONS = ['Static', 'Video Included', 'Animated'] as const

export const CTA_STYLE_OPTIONS = [
  'Sticky Button',
  'Inline Button',
  'Popup',
] as const

/* --- Digital Marketing 전용 (잠정 보류) ---------------------------------- */
/* 폼에서는 더 이상 쓰지 않지만, DA 재개 시 그대로 다시 쓰려고 남겨둡니다. */

export const AD_FORMAT_OPTIONS = ['Banner', 'Native Ad', 'Rich Media'] as const

export const PLATFORM_OPTIONS = [
  'Naver',
  'Kakao',
  'Google GDN',
  'Meta',
  'Owned Site',
] as const

export const ANIMATION_OPTIONS = ['Static', 'Animated'] as const

/**
 * Promotion Page 의 category_metadata 형태. Phase 1 현행.
 *
 * 주의: DA 에는 chk_da_metadata_shape CHECK 제약이 걸려 있지만, 확인해 보니
 * 그 제약은 category = 'digital_marketing' 인 행에만 적용됩니다.
 * promotion_page 행에는 대응하는 제약이 없어서 빈 객체도 통과합니다. 즉 이
 * 형태를 지켜 주는 것은 DB 가 아니라 아래 타입과 저장 로직뿐입니다.
 */
export type PpCategoryMetadata = {
  page_type: string | null
  structure: string | null
  video_used: string | null
  cta_style: string | null
  funnel_stage: string | null
}

export const EMPTY_PP_METADATA: PpCategoryMetadata = {
  page_type: null,
  structure: null,
  video_used: null,
  cta_style: null,
  funnel_stage: null,
}

/**
 * DA 의 category_metadata 형태. 잠정 보류이지만 기존 데이터가 이 모양이고,
 * DA 재개 시 다시 쓰므로 남겨둡니다.
 *
 * chk_da_metadata_shape 는 빈 객체 {} 를 거부하고 5개 키가 null 이면 통과합니다.
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
  industry: string | null
  headline: string | null
  benefit: string | null
  cta: string | null
  visual_focus: string | null
  layout: string | null
  copy_density: string | null
  style: string[] | null
  color_tone: string[] | null
  category_metadata: PpCategoryMetadata | null
}

/** 사람이 직접 입력하는 값들. 폼 상태이자 저장 페이로드의 원본입니다. */
export type ReferenceFormValues = {
  brand: string
  industry: string
  headline: string
  benefit: string
  cta: string
  visual_focus: string
  layout: string
  copy_density: string
  style: string[]
  color_tone: string[]
  page_type: string
  structure: string
  video_used: string
  cta_style: string
  funnel_stage: string
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
    brand: ref.brand ?? '',
    industry: ref.industry ?? '',
    headline: ref.headline ?? '',
    benefit: ref.benefit ?? '',
    cta: ref.cta ?? '',
    visual_focus: ref.visual_focus ?? '',
    layout: ref.layout ?? '',
    copy_density: ref.copy_density ?? '',
    style: ref.style ?? [],
    color_tone: ref.color_tone ?? [],
    page_type: meta?.page_type ?? '',
    structure: meta?.structure ?? '',
    video_used: meta?.video_used ?? '',
    cta_style: meta?.cta_style ?? '',
    funnel_stage: meta?.funnel_stage ?? '',
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
