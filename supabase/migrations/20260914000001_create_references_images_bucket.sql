-- references-images 스토리지 버켓 + 접근 정책
--
-- Phase 1 (DA) 레퍼런스 이미지 원본을 보관하는 버켓입니다.
-- design_references.image_url 에는 이 버켓의 public URL 이 저장됩니다.
--
-- 적용: Supabase Dashboard > SQL Editor 에 붙여넣고 실행.

-- 1) 버켓 생성 (public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'references-images',
  'references-images',
  true,
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 2) 접근 정책
--
-- 주의: Phase 1 에는 아직 인증이 붙어 있지 않습니다. 아래 정책은 anon 롤에
-- 업로드를 허용하므로, publishable key 를 아는 누구나 이 버켓에 쓸 수 있습니다.
-- 사내 도구 개발 단계 전제입니다. Auth 도입 시 anon -> authenticated 로 좁히세요.
--
-- DELETE 정책은 일부러 만들지 않았습니다. 인증이 없는 상태에서 anon DELETE 를
-- 열면 키를 아는 누구나 버켓 전체를 지울 수 있어, 고아 파일이 남는 쪽보다
-- 위험이 큽니다. 그 대신 업로드 후 insert 가 실패하면 앱이 삭제를 시도했다가
-- 실패하고, 남은 파일 경로를 에러로 알려줍니다(수동 정리). Auth 도입 시
-- owner 범위 DELETE 정책을 추가하면 자동 롤백이 동작합니다.
--
-- 버켓 메타데이터 조회(GET /storage/v1/bucket/<id>)는 storage.buckets 에 대한
-- select 정책이 없어 anon 에게 404 로 보입니다. 업로드/다운로드에는 영향이
-- 없으므로 그대로 둡니다.

drop policy if exists "references_images_read"   on storage.objects;
drop policy if exists "references_images_insert" on storage.objects;

create policy "references_images_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'references-images');

create policy "references_images_insert"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'references-images');
