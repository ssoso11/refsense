import type { NextConfig } from 'next'

// Supabase Storage 의 public URL 을 next/image 가 최적화할 수 있게 허용합니다.
// 프로젝트 ref 를 하드코딩하지 않고 환경변수에서 호스트만 뽑아 씁니다.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: 'https',
            hostname: supabaseHost,
            pathname: '/storage/v1/object/public/**',
          },
        ]
      : [],
  },
}

export default nextConfig
