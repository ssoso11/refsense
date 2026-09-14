import { supabase } from '@/lib/supabase/client'
import {
  EMPTY_PP_METADATA,
  PHASE1_CATEGORY,
  PHASE1_SOURCE_TYPE,
  REFERENCES_BUCKET,
  type DesignReference,
  type ReferenceFormValues,
} from '@/lib/types'

const SELECT_COLUMNS =
  'id, image_url, created_at, brand, headline, benefit, cta, visual_focus, layout, copy_density, style, color_tone, category_metadata'

/** 빈 문자열은 저장하지 않고 null 로 눕힙니다. */
function orNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function extensionFor(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]{1,5}$/.test(fromName)) return fromName
  return file.type.split('/')[1] ?? 'bin'
}

/**
 * 이미지 한 장을 스토리지에 올리고 design_references 행을 하나 만듭니다.
 *
 * 업로드는 됐는데 insert 가 실패하면 올린 파일을 되돌려 지우려 시도합니다.
 * 다만 현재 버켓에는 anon DELETE 정책이 없어서(임의 삭제를 막기 위해 일부러
 * 열어두지 않았습니다) 이 삭제는 403 으로 실패합니다. 그 경우 파일은 행 없는
 * 고아 상태로 남으므로, 에러 메시지에 경로를 실어 보내 수동 정리가 가능하게
 * 합니다. Auth 도입 후 owner 범위의 DELETE 정책을 추가하면 자동 정리됩니다.
 */
export async function uploadReference(file: File): Promise<DesignReference> {
  const path = `${PHASE1_CATEGORY}/${crypto.randomUUID()}.${extensionFor(file)}`

  const { error: uploadError } = await supabase.storage
    .from(REFERENCES_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) {
    throw new Error(`스토리지 업로드 실패: ${uploadError.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(REFERENCES_BUCKET).getPublicUrl(path)

  const { data, error: insertError } = await supabase
    .from('design_references')
    .insert({
      category: PHASE1_CATEGORY,
      source_type: PHASE1_SOURCE_TYPE,
      image_url: publicUrl,
      category_metadata: EMPTY_PP_METADATA,
    })
    .select(SELECT_COLUMNS)
    .single()

  if (insertError || !data) {
    const { error: removeError } = await supabase.storage
      .from(REFERENCES_BUCKET)
      .remove([path])

    const reason = insertError?.message ?? '알 수 없는 오류'
    if (removeError) {
      throw new Error(
        `DB 저장 실패: ${reason} (업로드된 파일 ${path} 을 되돌리지 못했습니다: ${removeError.message})`,
      )
    }
    throw new Error(`DB 저장 실패: ${reason}`)
  }

  return data as DesignReference
}

/** 그리드 초기 표시용. 최신 업로드부터. */
export async function fetchReferences(limit = 60): Promise<DesignReference[]> {
  const { data, error } = await supabase
    .from('design_references')
    .select(SELECT_COLUMNS)
    .eq('category', PHASE1_CATEGORY)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`목록 조회 실패: ${error.message}`)
  return (data ?? []) as DesignReference[]
}

/**
 * 사람이 입력한 메타데이터를 한 행에 저장합니다.
 *
 * category_metadata 는 부분 갱신이 아니라 5개 키를 모두 담아 통째로 덮어씁니다.
 * promotion_page 에는 DA 와 달리 형태를 강제하는 CHECK 제약이 없으므로,
 * 키를 빠짐없이 채우는 책임은 전적으로 이 함수에 있습니다.
 */
export async function updateReference(
  id: string,
  values: ReferenceFormValues,
): Promise<DesignReference> {
  const { data, error } = await supabase
    .from('design_references')
    .update({
      headline: orNull(values.headline),
      benefit: orNull(values.benefit),
      cta: orNull(values.cta),
      visual_focus: orNull(values.visual_focus),
      layout: orNull(values.layout),
      copy_density: orNull(values.copy_density),
      style: values.style.length > 0 ? values.style : null,
      color_tone: values.color_tone.length > 0 ? values.color_tone : null,
      category_metadata: {
        ...EMPTY_PP_METADATA,
        page_type: orNull(values.page_type),
        structure: orNull(values.structure),
        video_used: orNull(values.video_used),
        cta_style: orNull(values.cta_style),
        funnel_stage: orNull(values.funnel_stage),
      },
    })
    .eq('id', id)
    .select(SELECT_COLUMNS)
    .single()

  if (error || !data) {
    throw new Error(`저장 실패: ${error?.message ?? '알 수 없는 오류'}`)
  }

  return data as DesignReference
}
