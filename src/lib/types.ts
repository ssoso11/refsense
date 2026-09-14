/** 업로드 대상 버켓. 마이그레이션의 버켓 id 와 일치해야 합니다. */
export const REFERENCES_BUCKET = 'references-images'

/** Phase 1 은 Digital Marketing(DA) 만 다룹니다. */
export const PHASE1_CATEGORY = 'digital_marketing'
export const PHASE1_SOURCE_TYPE = 'internal'

/**
 * DA 의 category_metadata 형태.
 *
 * design_references 에는 chk_da_metadata_shape CHECK 제약이 걸려 있어서
 * category = 'digital_marketing' 인 행은 아래 5개 키를 모두 가지고 있어야
 * 합니다. 값은 null 이어도 되지만 키가 빠지면 insert 가 거부됩니다.
 * 업로드 시점에는 전부 null 로 넣고, 다음 단계의 AI 분석이 채웁니다.
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

/** 그리드에 그리는 데 필요한 최소 필드만. */
export type DesignReference = {
  id: string
  image_url: string
  created_at: string
  brand: string | null
  headline: string | null
}

/** 한 파일의 업로드 진행 상태. */
export type UploadItem = {
  id: string
  file: File
  previewUrl: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}
