import { redirect } from 'next/navigation'

// 홈은 아직 별도 화면이 없어 업로드로 보냅니다. 나중에 랜딩이 생기면
// 이 파일을 실제 페이지로 되돌리면 됩니다.
export default function Home() {
  redirect('/upload')
}
