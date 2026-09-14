# Tasks — Phase 1 (Promotion Page)

Phase 1 개발 대상은 **Promotion Page (`promotion_page`)** 입니다.
Digital Marketing(DA)는 **잠정 보류**이며, 기존 DA 데이터와 코드는 지우지 않고
그대로 둡니다. 자세한 범위와 원칙은 `CLAUDE.md` 를 따릅니다.

## 상태 표기

- `[x]` 완료 · `[ ]` 미착수 · `[~]` 진행 중 · `[보류]` 잠정 보류

---

## 완료

- [x] Next.js 16 + TypeScript + Tailwind CSS v4 프로젝트 셋업 (App Router)
- [x] Supabase 연결 (`@supabase/supabase-js`, `.env.local`)
- [x] `references-images` 스토리지 버켓 + 접근 정책
      (`supabase/migrations/20260914000001_create_references_images_bucket.sql`)
- [x] `/upload` — 드래그앤드롭 / 클릭 선택 다중 이미지 업로드
- [x] 업로드 시 `design_references` 행 생성 (`source_type = internal`)
- [x] 업로드된 레퍼런스 그리드
- [x] 카드 클릭 → 상세 모달에서 메타데이터 수동 입력 / 수정
- [x] Phase 1 대상을 DA → Promotion Page 로 전환

## 진행 중

- [~] Promotion Page 메타데이터 입력 운영
      - 코어: `headline`, `benefit`, `cta`, `visual_focus`, `layout`,
        `copy_density`, `style[]`, `color_tone[]`
      - `category_metadata`: `page_type`, `structure`, `video_used`,
        `cta_style`, `funnel_stage`

## 다음

- [ ] `promotion_page` 용 `category_metadata` 형태 CHECK 제약 추가
      (마이그레이션). 현재 DB 는 PP 행의 메타데이터 형태를 검증하지 않고,
      `chk_da_metadata_shape` 는 DA 행에만 적용됩니다.
- [ ] Claude 기반 이미지 자동 분석 (수동 입력 대체 / 보조)
- [ ] Voyage Multimodal 임베딩 생성 후 `embedding` 컬럼 채우기
- [ ] 자연어 검색
- [ ] 유사 레퍼런스 찾기
- [ ] 프로젝트 보드에 저장
- [ ] Supabase Auth 도입
      - 스토리지 정책을 `anon` → `authenticated` 로 좁히기
      - owner 범위 DELETE 정책 추가 → 업로드 실패 시 자동 롤백 복구

## 잠정 보류

- [보류] Digital Marketing (DA)
  - 기존 DA 행 3건은 `design_references` 에 그대로 남아 있습니다.
  - DA 코드는 삭제하지 않았습니다: `DA_CATEGORY`, `DaCategoryMetadata`,
    `EMPTY_DA_METADATA`, `AD_FORMAT_OPTIONS`, `PLATFORM_OPTIONS`,
    `ANIMATION_OPTIONS` (`src/lib/types.ts`).
  - `/upload` 그리드는 `category = promotion_page` 만 조회하므로 DA 행은
    화면에 나오지 않습니다. 데이터는 보존됩니다.
  - 재개 시: `PHASE1_CATEGORY` 를 되돌리고 모달의 `category_metadata`
    필드셋을 DA 5개 필드로 교체하면 됩니다.

## 알려진 이슈 / 결정 사항

- **`입력 완료` 배지 기준**: 상태 컬럼이 없어 `visual_focus`, `layout`,
  `copy_density` 세 개가 모두 채워졌는지로 판정합니다. 확정된 기준이 아니며
  변경 가능합니다.
- **인증 없음**: `anon` 롤에 스토리지 read/insert 와 테이블 read/insert/update
  가 열려 있습니다. publishable key 를 아는 누구나 쓸 수 있는 상태이며,
  사내 도구 개발 단계 전제입니다.
- **고아 파일 가능성**: 스토리지 업로드 후 DB insert 가 실패하면 롤백 삭제가
  403 으로 실패합니다(의도적으로 anon DELETE 정책을 열지 않음). 이 경우 남은
  파일 경로를 에러 메시지로 알려 수동 정리하게 되어 있습니다.
- **미검증 참조**: `CLAUDE.md` 가 언급하는 `da_image_analysis_prompt.md` 는
  아직 저장소에 없습니다.
