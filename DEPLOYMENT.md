# GitHub + Vercel 배포

GitHub 저장소를 Vercel에서 Import하면 루트의 vercel.json 설정으로 배포합니다.
- Framework: Other (자동 설정)
- Root Directory: 저장소 루트
- Build: node scripts/build-vercel.mjs
- Output: dist-vercel
- 별도 환경 변수나 설치 명령 불필요

화면 소스는 experience/에 있습니다. 기존 Sites/Cloudflare 실행 구성도 유지합니다.
Vercel의 api/whispers.js는 기존 공개 Sites 대화 API로 서버에서 중계합니다.
기존 로그인 없는 대화, 서버 금칙어 검사와 D1 저장소를 그대로 이용합니다.
기존 Sites 서비스를 중단하면 Vercel의 대화도 중단됩니다.
중계 서버를 거치므로 기존 IP 기반 5초 전송 제한이 여러 이용자에게 함께 적용될 수 있습니다.
독립 서비스로 전환할 때에는 저장소와 분산 전송 제한을 Vercel용으로 이전해야 합니다.

로컬 화면 확인: python3 -m http.server 8791 --directory experience
로컬 정적 서버에는 /api/whispers가 없으므로 대화는 배포 환경에서 확인합니다.
검사: node tests/moderation.test.mjs
